// Posting into a conversation's Lark thread. The bot's first post opens the thread (so its first words
// are Claude's own answer, not a canned line); Lark's thread_id then becomes the conversation's key.
import { larkFor } from "./lark.ts";
import { rekeyThread } from "./store.ts";
import type { ThreadRecord } from "./store.ts";

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

export async function postFile(thread: ThreadRecord, path: string): Promise<void> {
  await post(thread, "file", { file_key: await larkFor(thread.app).uploadFile(path) });
}
