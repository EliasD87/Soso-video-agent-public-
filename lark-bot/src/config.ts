// Bot settings, read once from the workspace .env (the same file the daily voice scripts read).
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const BOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const WORKSPACE = resolve(BOT_DIR, "..");
const ENV_FILE = resolve(WORKSPACE, ".env");

process.loadEnvFile(ENV_FILE);

function need(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is missing in ${ENV_FILE}`);
  return value;
}

need("ANTHROPIC_API_KEY"); // read by the Agent SDK itself

export type LarkApp = { name: string; appId: string; appSecret: string; feishu: boolean };

/** The main Lark app (LARK_*), plus one per other organization: <NAME>_LARK_APP_ID, _APP_SECRET, _DOMAIN. */
function larkApps(): LarkApp[] {
  const prefixes = [""];
  for (const key of Object.keys(process.env)) {
    const extra = /^([A-Z0-9]+)_LARK_APP_ID$/.exec(key);
    if (!extra || !process.env[key]?.trim()) continue;
    // A half-filled extra app must not take the main one down with it.
    if (process.env[`${extra[1]}_LARK_APP_SECRET`]?.trim()) prefixes.push(`${extra[1]}_`);
    else console.error(`${extra[1]}_LARK_APP_SECRET is empty in ${ENV_FILE}; skipping that Lark app`);
  }
  return prefixes.map((p) => ({
    name: p ? p.slice(0, -1).toLowerCase() : "main",
    appId: need(`${p}LARK_APP_ID`),
    appSecret: need(`${p}LARK_APP_SECRET`),
    feishu: (process.env[`${p}LARK_DOMAIN`] ?? "lark").trim().toLowerCase() === "feishu",
  }));
}

export const config = {
  larkApps: larkApps(),
  // Cap for one request in a thread (one user message and everything Claude does for it); 0 = no cap.
  maxUsdPerTurn: Math.max(0, Number(process.env.MAX_USD_PER_JOB) || 0),
  model: process.env.CLAUDE_MODEL?.trim() || "claude-opus-5-5",
  // Thread records live outside the repo so a git pull never touches them.
  dataDir: resolve(WORKSPACE, "..", "bot-data"),
  // Attachments people send land here, inside the workspace so Claude's tools can reach them.
  jobsDir: resolve(WORKSPACE, "lark-jobs"),
};
