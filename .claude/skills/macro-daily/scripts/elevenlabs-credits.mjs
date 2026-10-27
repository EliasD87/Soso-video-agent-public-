// Prints ElevenLabs character-credit status for the main key and, when set, the
// backup key (ELEVENLABS_API_KEY / ELEVENLABS_API_KEY_BACKUP in the workspace
// root .env; pass the .env path as argv[2], defaults to ../.env relative to
// cwd). Also says whether each account's plan can voice Asher, since the backup
// only takes the read if it can. Requires the "user_read" permission on each key —
// if one lacks it, prints a hint instead of failing the run.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.argv[2] ?? "../.env");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const KEYS = [
  ["main", env.ELEVENLABS_API_KEY],
  ["backup", env.ELEVENLABS_API_KEY_BACKUP],
].filter(([, key]) => key);

for (const [label, key] of KEYS) {
  const res = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
    headers: { "xi-api-key": key },
  });

  let status;
  let asher = "";
  if (res.status === 401) {
    status =
      "balance unavailable — API key lacks the 'user_read' permission (enable it at elevenlabs.io → API Keys)";
  } else if (!res.ok) {
    status = `balance check failed (HTTP ${res.status})`;
  } else {
    const d = await res.json();
    const left = d.character_limit - d.character_count;
    const reset = d.next_character_count_reset_unix
      ? ` · resets ${new Date(d.next_character_count_reset_unix * 1000).toDateString()}`
      : "";
    status = `${d.tier}: ${left.toLocaleString()} characters left of ${d.character_limit.toLocaleString()} (${d.character_count.toLocaleString()} used)${reset}`;
    // Asher is a library voice: the API refuses it on the free plan with
    // paid_plan_required (upgrade, or add $5 of credits, to unlock it).
    asher =
      d.tier === "free"
        ? " · Asher BLOCKED on the free plan (upgrade or add $5 of credits)"
        : " · Asher ok";
  }

  console.log(`ElevenLabs ${label} (${status})${asher}`);
}
