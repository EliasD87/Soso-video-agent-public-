// Thread → Claude session records in one JSON file, so a restart picks every open thread back up.
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "./config.ts";

export type ThreadRecord = {
  // "msg:<message_id>" until the bot's first reply opens the Lark thread, then its thread_id (omt_...);
  // "chat:<chat_id>" where the chat has no threads.
  key: string;
  app?: string; // which Lark app (organization) the conversation came through; missing = "main"
  chatId: string;
  rootMessageId: string; // replies go under this message, which keeps them in the thread
  sessionId?: string; // Claude session, set by the first run
  jobDir: string; // where this thread's attachments are saved
  spentUsd: number;
  createdAt: string;
};

type Data = { threads: Record<string, ThreadRecord>; seen: string[] };

mkdirSync(config.dataDir, { recursive: true });
const file = resolve(config.dataDir, "threads.json");
const data: Data = load();

function load(): Data {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return { threads: {}, seen: [] };
  }
}

function save(): void {
  writeFileSync(file + ".tmp", JSON.stringify(data, null, 2));
  renameSync(file + ".tmp", file);
}

export function getThread(key: string): ThreadRecord | undefined {
  return data.threads[key];
}

export function putThread(thread: ThreadRecord): void {
  data.threads[thread.key] = thread;
  save();
}

export function rekeyThread(thread: ThreadRecord, key: string): void {
  delete data.threads[thread.key];
  thread.key = key;
  data.threads[key] = thread;
  save();
}

export function dropThread(key: string): void {
  delete data.threads[key];
  save();
}

/** Lark can deliver the same event twice; its docs say to dedupe on message_id. */
export function firstTime(messageId: string): boolean {
  if (data.seen.includes(messageId)) return false;
  data.seen.push(messageId);
  if (data.seen.length > 1000) data.seen.splice(0, data.seen.length - 1000);
  save();
  return true;
}
