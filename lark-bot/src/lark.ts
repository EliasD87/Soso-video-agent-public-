// Lark side: one connection per Lark app (one app per organization), each with its API client, its
// long-connection event stream, and the few calls the bot makes.
import * as Lark from "@larksuiteoapi/node-sdk";
import { openSync, readFileSync, readSync, closeSync, renameSync, statSync } from "node:fs";
import { basename, extname } from "node:path";
import type { LarkApp } from "./config.ts";

export type MessageEvent = {
  sender?: { sender_id?: { open_id?: string }; sender_type?: string };
  message: {
    message_id: string;
    root_id?: string;
    thread_id?: string;
    chat_id: string;
    chat_type: string; // "p2p" or "group"
    message_type: string;
    content: string; // JSON string; shape depends on message_type
    mentions?: { key: string; id?: { open_id?: string }; name: string }[];
  };
};

const FILE_LIMIT = 30 * 1024 * 1024; // Lark: chat files up to 30 MB
const IMAGE_LIMIT = 10 * 1024 * 1024; // Lark: chat images up to 10 MB
const FILE_TYPES = ["mp4", "pdf", "doc", "xls", "ppt", "opus"] as const;

export type LarkConnection = ReturnType<typeof connect>;
const connections = new Map<string, LarkConnection>();

/** The connection a conversation came through (records from before multi-app support are "main"). */
export function larkFor(appName = "main"): LarkConnection {
  const lark = connections.get(appName);
  if (!lark) throw new Error(`Lark app "${appName}" is not configured in .env`);
  return lark;
}

export function connect(app: LarkApp) {
  const base = { appId: app.appId, appSecret: app.appSecret, domain: app.feishu ? Lark.Domain.Feishu : Lark.Domain.Lark };
  const client = new Lark.Client(base);

  /** Replies under a message. In a group, inThread opens (or continues) its thread; returns the thread_id. */
  async function reply(messageId: string, msgType: string, content: object, inThread = true): Promise<string | undefined> {
    const res = await client.im.message.reply({
      path: { message_id: messageId },
      data: { msg_type: msgType, content: JSON.stringify(content), reply_in_thread: inThread },
    });
    if (res.code) throw new Error(`Lark reply failed (${res.code}): ${res.msg}`);
    return res.data?.thread_id;
  }

  const lark = {
    app,
    reply,

    /** Lark wants the handler back within 3 seconds, so onMessage must only queue work. */
    start(onMessage: (event: MessageEvent) => void): void {
      const ws = new Lark.WSClient({ ...base, loggerLevel: Lark.LoggerLevel.info, autoReconnect: true });
      ws.start({
        eventDispatcher: new Lark.EventDispatcher({}).register({
          "im.message.receive_v1": async (data) => {
            onMessage(data as unknown as MessageEvent);
          },
        }),
      });
    },

    /** The bot's own open_id, to tell "@bot" apart from other @mentions in a group. */
    async botOpenId(): Promise<string | undefined> {
      try {
        const res = (await client.request({ method: "GET", url: "/open-apis/bot/v3/info" })) as { bot?: { open_id?: string } };
        return res.bot?.open_id;
      } catch (err) {
        console.error(`[${app.name}] could not read bot info; treating every @mention as @bot`, err);
        return undefined;
      }
    },

    /** Uploads a file for a chat message and returns its file_key. */
    async uploadFile(path: string): Promise<string> {
      const size = statSync(path).size;
      if (size > FILE_LIMIT) {
        const mb = (size / 1048576).toFixed(1);
        throw new Error(`${basename(path)} is ${mb} MB; Lark chat files must be under 30 MB. Send a smaller copy.`);
      }
      const ext = extname(path).slice(1).toLowerCase();
      const fileType = (FILE_TYPES as readonly string[]).includes(ext) ? (ext as (typeof FILE_TYPES)[number]) : "stream";
      const up = await client.im.file.create({
        data: { file_type: fileType, file_name: basename(path), file: readFileSync(path) },
      });
      if (!up?.file_key) throw new Error("Lark file upload returned no file_key");
      return up.file_key;
    },

    /** Uploads an image for a chat message and returns its image_key. */
    async uploadImage(path: string): Promise<string> {
      if (statSync(path).size > IMAGE_LIMIT) {
        throw new Error(`${basename(path)} is over 10 MB; Lark chat images must be smaller. Send a smaller copy.`);
      }
      const up = await client.im.image.create({ data: { image_type: "message", image: readFileSync(path) } });
      if (!up?.image_key) throw new Error("Lark image upload returned no image_key");
      return up.image_key;
    },

    /** Saves a file or image someone attached; images get their real extension from their first bytes. */
    async download(messageId: string, key: string, type: "image" | "file", dest: string): Promise<string> {
      const res = await client.im.messageResource.get({ params: { type }, path: { message_id: messageId, file_key: key } });
      await res.writeFile(dest);
      if (type !== "image") return dest;
      const named = `${dest}.${imageExt(dest)}`;
      renameSync(dest, named);
      return named;
    },
  };
  connections.set(app.name, lark);
  return lark;
}

function imageExt(path: string): string {
  const head = Buffer.alloc(12);
  const fd = openSync(path, "r");
  readSync(fd, head, 0, 12, 0);
  closeSync(fd);
  if (head[0] === 0x89 && head[1] === 0x50) return "png";
  if (head[0] === 0xff && head[1] === 0xd8) return "jpg";
  if (head.toString("ascii", 0, 3) === "GIF") return "gif";
  if (head.toString("ascii", 8, 12) === "WEBP") return "webp";
  return "img";
}
