// Posting into a conversation's Lark thread. The bot's first post opens the thread (so its first words
// are Claude's own answer, not a canned line); Lark's thread_id then becomes the conversation's key.
import { execFile } from "node:child_process";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, resolve } from "node:path";
import { promisify } from "node:util";
import { WORKSPACE } from "./config.ts";
import { larkFor } from "./lark.ts";
import { rekeyThread } from "./store.ts";
import type { ThreadRecord } from "./store.ts";

const run = promisify(execFile);

export async function post(thread: ThreadRecord, msgType: string, content: object): Promise<void> {
  const { reply } = larkFor(thread.app);
  if (!thread.key.startsWith("msg:")) {
    await reply(thread.rootMessageId, msgType, content, !thread.key.startsWith("chat:"));
    return;
  }
  let threadId: string | undefined;
  try {
    threadId = await reply(thread.rootMessageId, msgType, content, true);
  } catch (err) {
    console.error("threaded reply failed, replying plainly", err); // chats without thread support
    await reply(thread.rootMessageId, msgType, content, false);
  }
  rekeyThread(thread, threadId ?? `chat:${thread.chatId}`);
}

export async function postText(thread: ThreadRecord, text: string): Promise<void> {
  await post(thread, "text", { text: text.slice(0, 30000) });
}

export async function postImage(thread: ThreadRecord, path: string): Promise<void> {
  await post(thread, "image", { image_key: await larkFor(thread.app).uploadImage(path) });
}

/** An MP4 goes out as a Lark video (plays in the chat, needs a cover frame); anything else as a file. */
export async function postFile(thread: ThreadRecord, path: string): Promise<void> {
  const lark = larkFor(thread.app);
  if (extname(path).toLowerCase() === ".mp4") {
    const cover = resolve(tmpdir(), `cover-${Date.now()}.jpg`);
    try {
      const { ffmpeg, ffprobe, env } = remotionFfmpeg();
      for (const at of ["1", "0"]) {
        if (!existsSync(cover)) await run(ffmpeg, ["-y", "-loglevel", "error", "-ss", at, "-i", path, "-frames:v", "1", "-vf", "scale=1280:-2", cover], { env }).catch(() => {});
      }
      const probe = await run(ffprobe, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], { env }).catch(() => ({ stdout: "" }));
      const durationMs = Math.round(Number(probe.stdout.trim()) * 1000) || undefined;
      if (existsSync(cover)) {
        const fileKey = await lark.uploadFile(path, "mp4", durationMs);
        await post(thread, "media", { file_key: fileKey, image_key: await lark.uploadImage(cover) });
        return;
      }
      console.error(`could not grab a cover frame from ${path}; sending it as a plain file`);
    } finally {
      rmSync(cover, { force: true });
    }
  }
  await post(thread, "file", { file_key: await lark.uploadFile(path, "stream") });
}

/** Remotion ships ffmpeg/ffprobe with the shared libraries they load from their own folder. */
function remotionFfmpeg() {
  const remotion = resolve(WORKSPACE, "node_modules", "@remotion");
  const pkg = readdirSync(remotion).find((name) => name.startsWith("compositor-"));
  if (!pkg) throw new Error("Remotion's ffmpeg is missing (npm install at the workspace root)");
  const dir = resolve(remotion, pkg);
  return { ffmpeg: resolve(dir, "ffmpeg"), ffprobe: resolve(dir, "ffprobe"), env: { ...process.env, LD_LIBRARY_PATH: dir } };
}
