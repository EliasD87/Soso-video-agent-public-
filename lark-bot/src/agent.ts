// One Lark thread = one Claude session. Each new message in the thread resumes that session.
import { createSdkMcpServer, query, tool } from "@anthropic-ai/claude-agent-sdk";
import type { SDKResultMessage } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { WORKSPACE, config } from "./config.ts";
import { putThread } from "./store.ts";
import type { ThreadRecord } from "./store.ts";
import { postFile, postImage, postText } from "./thread.ts";

const LARK_TOOLS = ["mcp__lark__send_message", "mcp__lark__send_image", "mcp__lark__send_file"];
const SHOW_COST_FROM_USD = 1; // cheap chat replies stay clean; real work shows what it cost

function instructions(thread: ThreadRecord): string {
  return `You are SoSo Video Agent, the SoSoValue team's video maker, chatting with people in Lark. Talk like a helpful teammate: natural, warm and brief, in plain text (Lark shows markdown symbols raw). Not every message is a job. Answer greetings and questions directly, talk through ideas, and only start making a video when someone asks for one. Each Lark thread is one conversation with you, and replies in it continue where you left off.

People see only what you post. Your final reply is posted to the thread automatically. Before that, use the lark tools: send_message for progress notes or a draft to approve, send_image for covers and preview stills, send_file for finished videos.

What you make: the SoSoValue Macro Trading Desk daily (the macro-daily skill), and other short videos (explainers, product and promo shorts, claim shorts) with Remotion, an ElevenLabs voice, and Magnific images or video clips.

When you make a video:
- Workspace: ${WORKSPACE} on a Linux VPS (4 GB RAM, 2 CPU cores, no GPU). Read AGENTS.md first, then use the matching skill in .claude/skills/. Remotion is installed at the workspace root; node and npx are on PATH. Put each new video in its own folder at the workspace root, as the skill says. Files people attached in this thread are saved in ${thread.jobDir}.
- Share the plan or the draft script and wait for a go-ahead before paid steps (voice, image or video generation) and before the full render. A full render takes about 30-40 minutes here, so say so.
- Post short progress notes at each stage, and 2-4 preview stills (npx remotion still) before the full render.
- Render with npx remotion render ... --concurrency=2. Skip the loudness step (loudnorm.py, render-final.sh): deliver Remotion's own mix.
- Lark only takes files under 30 MB. If the render is bigger, make a share copy with Remotion's bundled ffmpeg (npx remotion ffmpeg -i in.mp4 -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 160k out-share.mp4) and send that, plus the cover PNG.
- Keys are in ${WORKSPACE}/.env and in your environment (ELEVENLABS_API_KEY, MAGNIFIC_API_KEY). Never print, post or commit them.
- Magnific: REST API at https://api.magnific.com with header "x-magnific-api-key: $MAGNIFIC_API_KEY" (docs index: https://docs.magnific.com/llms.txt). Jobs are async: the POST returns a task_id; poll GET .../{task-id} until COMPLETED and download the outputs at once (links expire after 30 minutes). Check the price before any non-routine generation and say it in the thread.
- Windows-only notes in the skill (PowerShell, C:\\ paths, chrome.exe, cygpath) don't apply here; use the Linux equivalents.
- If a request is unclear, ask one short question instead of guessing.`;
}

function ok(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function failed(err: unknown) {
  console.error("lark tool failed", err);
  return { content: [{ type: "text" as const, text: String(err instanceof Error ? err.message : err) }], isError: true };
}

/** The lark tools post into this thread only. */
function larkServer(thread: ThreadRecord) {
  const run = (send: () => Promise<void>) => send().then(() => ok("posted"), failed);
  return createSdkMcpServer({
    name: "lark",
    version: "1.0.0",
    alwaysLoad: true,
    tools: [
      tool("send_message", "Post a short plain-text message in this Lark thread: progress, a question, a draft for approval.", { text: z.string() }, async ({ text }) => run(() => postText(thread, text))),
      tool("send_image", "Post an image (PNG/JPG/WEBP under 10 MB) in this Lark thread, e.g. a cover or preview stills.", { path: z.string().describe("absolute path to the image") }, async ({ path }) => run(() => postImage(thread, path))),
      tool("send_file", "Post a file under 30 MB in this Lark thread. An MP4 shows as a video that plays in the chat (cover frame added automatically); other files as attachments.", { path: z.string().describe("absolute path to the file") }, async ({ path }) => run(() => postFile(thread, path))),
    ],
  });
}

/** Runs one user message through the thread's session and posts the outcome. */
export async function runTurn(thread: ThreadRecord, prompt: string): Promise<void> {
  let result: SDKResultMessage | undefined;
  try {
    const run = query({
      prompt,
      options: {
        cwd: WORKSPACE,
        model: config.model,
        ...(thread.sessionId ? { resume: thread.sessionId } : {}),
        settingSources: ["project"],
        systemPrompt: { type: "preset", preset: "claude_code", append: instructions(thread) },
        mcpServers: { lark: larkServer(thread) },
        allowedTools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "WebFetch", "WebSearch", "Skill", "TodoWrite", ...LARK_TOOLS],
        permissionMode: "dontAsk",
        ...(config.maxUsdPerTurn > 0 ? { maxBudgetUsd: config.maxUsdPerTurn } : {}),
        maxTurns: 300,
        env: { ...process.env, CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1" },
        stderr: (line: string) => console.error(`[claude ${thread.key}] ${line.trimEnd()}`),
      },
    });
    for await (const message of run) {
      if (message.type === "system" && message.subtype === "init" && message.session_id !== thread.sessionId) {
        thread.sessionId = message.session_id;
        putThread(thread);
      }
      if (message.type === "result") result = message;
    }
  } catch (err) {
    // A single query() throws after yielding an error result; without a result it really failed.
    if (!result) {
      console.error(`[${thread.key}] run failed`, err);
      await postText(thread, `Sorry, something broke on my side before I could answer: ${err instanceof Error ? err.message : err}`);
      return;
    }
  }
  if (!result) return;

  thread.sessionId = result.session_id;
  thread.spentUsd += result.total_cost_usd;
  putThread(thread);
  console.log(`[${thread.key}] ${result.subtype}, $${result.total_cost_usd.toFixed(2)} (thread $${thread.spentUsd.toFixed(2)})`);
  const cost =
    result.total_cost_usd >= SHOW_COST_FROM_USD
      ? `\n(this step cost $${result.total_cost_usd.toFixed(2)}; this thread so far $${thread.spentUsd.toFixed(2)})`
      : "";

  if (result.subtype === "success") {
    if (result.result.trim()) await postText(thread, result.result.trim() + cost);
  } else if (result.subtype === "error_max_budget_usd") {
    await postText(thread, `I paused here: this step reached the $${config.maxUsdPerTurn} limit. Say "continue" and I'll keep going.${cost}`);
  } else if (result.subtype === "error_max_turns") {
    await postText(thread, `I paused after a long stretch of work. Say "continue" and I'll pick it up.${cost}`);
  } else {
    await postText(thread, `I ran into an error: ${result.errors.join("; ").slice(0, 1500)}${cost}`);
  }
}
