// Lark video bot. A message that @mentions the bot (or any direct message) starts a conversation;
// Claude's first reply opens its Lark thread, and every later message there continues the same session.
// One process serves every configured Lark app (one per organization) through a single job queue.
//   node src/index.ts      (Node 24 runs the .ts files directly)
import { mkdirSync } from "node:fs";
import { basename, resolve } from "node:path";
import { config } from "./config.ts";
import { connect } from "./lark.ts";
import type { LarkConnection, MessageEvent } from "./lark.ts";
import { dropThread, firstTime, getThread, putThread } from "./store.ts";
import type { ThreadRecord } from "./store.ts";
import { runTurn } from "./agent.ts";
import { enqueue } from "./queue.ts";
import { postText } from "./thread.ts";

type Attachment = { key: string; type: "image" | "file"; name: string };

process.on("unhandledRejection", (err) => console.error("unhandled", err));

for (const app of config.larkApps) {
  const lark = connect(app);
  const botId = await lark.botOpenId();
  lark.start((event) => {
    handle(lark, botId, event).catch((err) => console.error(`[${app.name}] message handling failed`, err));
  });
  console.log(`lark bot online for app "${app.name}" (${app.feishu ? "Feishu" : "Lark"}, model ${config.model})`);
}

async function handle(lark: LarkConnection, botId: string | undefined, event: MessageEvent): Promise<void> {
  const m = event.message;
  if (event.sender?.sender_type && event.sender.sender_type !== "user") return;
  if (!firstTime(m.message_id)) return;

  const isDm = m.chat_type === "p2p";
  const { text, attachments } = parse(m, botId);
  let thread = m.thread_id ? getThread(m.thread_id) : isDm ? getThread(`chat:${m.chat_id}`) : undefined;

  if (thread && /^\/?(new|reset)$/i.test(text) && thread.key.startsWith("chat:")) {
    dropThread(thread.key);
    await lark.reply(m.message_id, "text", { text: "Fresh start. What are we making next?" }, false);
    return;
  }
  if (!thread) {
    const mentioned = (m.mentions ?? []).some((x) => !botId || x.id?.open_id === botId);
    if (!isDm && !mentioned) return; // group chat that isn't addressed to the bot
    thread = newThread(lark.app.name, m);
  }

  const saved: string[] = [];
  for (const a of attachments) {
    try {
      saved.push(await lark.download(m.message_id, a.key, a.type, resolve(thread.jobDir, a.name)));
    } catch (err) {
      console.error("attachment download failed", err);
      await postText(thread, `I couldn't open ${a.name}. Could you send it again?`);
    }
  }
  if (!text && !saved.length) return;

  const prompt = [text, saved.length ? `Attached in Lark (saved for you):\n${saved.join("\n")}` : ""].filter(Boolean).join("\n\n");
  const current = thread;
  const ahead = enqueue(() => runTurn(current, prompt));
  if (ahead > 0) {
    await postText(thread, `I'm in the middle of something else right now (${ahead} ahead of you). I'll get to this as soon as it's done.`);
  }
}

/** Records a new conversation. Nothing is posted yet: Claude's first reply opens the Lark thread. */
function newThread(app: string, m: MessageEvent["message"]): ThreadRecord {
  const thread: ThreadRecord = {
    key: `msg:${m.message_id}`,
    app,
    chatId: m.chat_id,
    rootMessageId: m.message_id,
    jobDir: resolve(config.jobsDir, m.message_id.replace(/[^A-Za-z0-9_-]/g, "_")),
    spentUsd: 0,
    createdAt: new Date().toISOString(),
  };
  mkdirSync(thread.jobDir, { recursive: true });
  putThread(thread);
  return thread;
}

/** Text and attachments from a Lark message (text, rich-text post, image, file, video, audio). */
function parse(m: MessageEvent["message"], botId: string | undefined): { text: string; attachments: Attachment[] } {
  let c: Record<string, any> = {};
  try {
    c = JSON.parse(m.content);
  } catch {}
  const attachments: Attachment[] = [];
  let text = "";

  if (m.message_type === "text") {
    text = c.text ?? "";
  } else if (m.message_type === "post") {
    const post = c.content ? c : (Object.values(c)[0] as Record<string, any>) ?? {};
    if (post.title) text += post.title + "\n";
    for (const line of post.content ?? []) {
      for (const el of line) {
        if (el.tag === "text" || el.tag === "md") text += el.text ?? "";
        if (el.tag === "a") text += `${el.text ?? ""} (${el.href})`;
        if (el.tag === "at") text += el.user_id ?? "";
        if (el.tag === "img") attachments.push({ key: el.image_key, type: "image", name: `image-${el.image_key.slice(-8)}` });
        if (el.tag === "media") attachments.push({ key: el.file_key, type: "file", name: `video-${el.file_key.slice(-8)}.mp4` });
      }
      text += "\n";
    }
  } else if (m.message_type === "image") {
    attachments.push({ key: c.image_key, type: "image", name: `image-${String(c.image_key).slice(-8)}` });
  } else if (m.message_type === "file" || m.message_type === "media" || m.message_type === "audio") {
    const fallback = m.message_type === "audio" ? "audio.opus" : m.message_type === "media" ? "video.mp4" : "file";
    attachments.push({ key: c.file_key, type: "file", name: basename(c.file_name ?? `${String(c.file_key).slice(-8)}-${fallback}`) });
  } else {
    text = `[a ${m.message_type} message the bot can't read]`;
  }

  // Lark writes @mentions as @_user_1 placeholders; drop the bot's own, name everyone else.
  for (const mention of m.mentions ?? []) {
    text = text.split(mention.key).join(botId && mention.id?.open_id !== botId ? `@${mention.name}` : "");
  }
  return { text: text.trim(), attachments };
}
