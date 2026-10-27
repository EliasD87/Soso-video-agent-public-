/**
 * ONE-TAKE voiceover.
 *
 * The eight lines are read in a SINGLE ElevenLabs request and written as one
 * continuous `full.mp3`. Per-clip generation ended every scene on a trailing
 * breath or an "mmm" the model adds when a take stops — eight takes meant
 * eight of those. One take has one ending, and the intonation genuinely runs
 * across the cuts instead of being chained approximations of it.
 *
 * The lines are separated by an explicit <break>, which does two jobs: it
 * reads as a newsroom beat between items, and it gives each film cut a real
 * pause to land inside.
 *
 * The request goes to /with-timestamps, which returns character-level
 * alignment alongside the audio. That alignment is what replaces measure.mjs:
 * it says exactly when each line starts and ends inside the single file, so
 * SCENE_DURATIONS and the subtitle timings are read off the actual read rather
 * than estimated from clip lengths.
 *
 * Output:
 *   public/voiceover/<slug>/full.mp3
 *   src/voTiming.json   { lines: [{start, end}], total }  (seconds)
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SLUG = "paris-unrest";

const envPath = resolve(__dirname, "..", ".env");
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

// Main key first; the backup account only takes the read when the main one is
// out of characters. A free backup account is refused Asher (paid_plan_required).
const KEYS = [
  ["main", env.ELEVENLABS_API_KEY],
  ["backup", env.ELEVENLABS_API_KEY_BACKUP],
].filter(([, key]) => key);
// "Asher" — the male narrator. Standing voice.
const VOICE_ID = "tMvyQtpCVQ0DkixuYm6J";
if (!KEYS.length) throw new Error("ELEVENLABS_API_KEY missing in ../.env");

const LINES = [
  "Anti-government protests swept France. Paris stocks fell one and a half percent, and French ten-year yields jumped to nearly five percent. Contagion fears turned to Italy, lifting US yields.",
  "Houthi and Saudi forces clashed six times in two days. Brent climbed to near a hundred and ten. Putin proposed a Ukraine summit, and the US paused Russia sanctions.",
  "China's economy beat forecasts, growing four and a half percent. But investment fell almost ten percent, and property sank more than a quarter. The central bank re-anchored to a cheaper overnight rate.",
  "Anthropic plans to file for its IPO next week, with a listing by mid-November. OpenAI is reportedly racing to raise sovereign money before then.",
  "Bitcoin briefly touched eighty-three thousand and sits near eighty-two. Ether is near twenty-four hundred, and ether funds saw bigger outflows than Bitcoin funds.",
  "The thesis is unchanged. Yields are high but contained, and tech earnings are the catalyst.",
  "Watch the ten-year around five point one five, with jobless claims and Friday's PMI ahead. In chips, the question shifts from supply to returns, as Tesla, Meta and Nvidia take the stage Wednesday.",
  "That's the desk. With AI earnings ahead, track the US tech index, crude, gold and Bitcoin on SoDEX.",
];

// The beat between items. Long enough that a 12-frame crossfade has silence to
// sit in; short enough that the read still moves at daily pace.
const BREAK = ' <break time="0.85s" /> ';

// With nothing before it the model opens on a hummed "mmm" ahead of the first
// word, so the take is primed with a never-spoken lead-in.
const PRIMER =
  "Good morning. This is the SoSoValue macro trading desk, and here is what moved overnight.";

// Build the script and remember where every line sits inside it, so the
// returned alignment can be sliced back into per-line spans.
let text = "";
const spans = [];
LINES.forEach((line, i) => {
  if (i > 0) text += BREAK;
  spans.push({ from: text.length, to: text.length + line.length });
  text += line;
});

console.log(`one take: ${LINES.length} lines, ${text.length} characters`);

const tts = (key) =>
  fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`, {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      previous_text: PRIMER,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.35,
        speed: 1.07,
      },
    }),
  });

let res;
for (const [label, key] of KEYS) {
  res = await tts(key);
  if (res.ok) {
    console.log(`voiced on the ${label} key`);
    break;
  }
  const err = await res.text();
  // A take bigger than the remaining balance is refused whole and nothing is
  // charged, so the same take can go straight to the next account.
  if (err.includes("quota_exceeded") && label !== KEYS.at(-1)[0]) {
    console.log(`${label} key is out of characters, trying the backup`);
    continue;
  }
  if (label === "backup" && err.includes("paid_plan_required")) {
    console.log("backup account is on the free plan: upgrade it or add $5 of credits to use Asher");
  }
  throw new Error(`TTS failed on the ${label} key: ${res.status} ${err}`);
}

const body = await res.json();
const outDir = resolve(__dirname, "public", "voiceover", SLUG);
mkdirSync(outDir, { recursive: true });
const audio = Buffer.from(body.audio_base64, "base64");
writeFileSync(resolve(outDir, "full.mp3"), audio);
console.log(`full.mp3  (${audio.length} bytes)`);

const a = body.alignment ?? body.normalized_alignment;
if (!a) throw new Error("no alignment in response");
const chars = a.characters;
const starts = a.character_start_times_seconds;
const ends = a.character_end_times_seconds;

// The alignment should echo the submitted text one character per entry. If it
// does not, every span index below would be wrong, so fail loudly instead of
// writing silently-shifted timings.
const echoed = chars.join("");
if (echoed !== text) {
  console.log(`  submitted ${text.length} chars, aligned ${echoed.length}`);
  const i = [...echoed].findIndex((c, j) => c !== text[j]);
  console.log(`  first divergence at ${i}:`);
  console.log(`    submitted: ${JSON.stringify(text.slice(i - 20, i + 40))}`);
  console.log(`    aligned:   ${JSON.stringify(echoed.slice(i - 20, i + 40))}`);
  throw new Error("alignment does not echo the submitted text");
}

const lines = spans.map(({ from, to }, i) => {
  // Skip leading/trailing whitespace so a span starts on a spoken glyph.
  let s = from;
  while (s < to && /\s/.test(chars[s])) s++;
  let e = to - 1;
  while (e > s && /\s/.test(chars[e])) e--;
  const start = starts[s];
  const end = ends[e];
  console.log(
    `  line ${i + 1}: ${start.toFixed(2)}s -> ${end.toFixed(2)}s  ` +
      `(${(end - start).toFixed(2)}s, ${LINES[i].split(/\s+/).length} words, ` +
      `${(LINES[i].split(/\s+/).length / (end - start)).toFixed(2)} w/s)`,
  );
  return { start, end };
});

const total = ends[ends.length - 1];
for (let i = 1; i < lines.length; i++) {
  console.log(
    `  gap ${i}->${i + 1}: ${(lines[i].start - lines[i - 1].end).toFixed(2)}s ` +
      `(${Math.round((lines[i].start - lines[i - 1].end) * 30)} frames)`,
  );
}

writeFileSync(
  resolve(__dirname, "src", "voTiming.json"),
  JSON.stringify({ total, lines }, null, 2) + "\n",
);
console.log(
  `voTiming.json written — take runs ${total.toFixed(2)}s ` +
    `(${Math.round(total * 30)} frames), ` +
    `${(LINES.join(" ").split(/\s+/).length / total).toFixed(2)} w/s overall`,
);

// Word-level cue sheet: each word's frame RELATIVE TO ITS SCENE, where the
// line itself begins at frame 12 (the cut sits 12 frames before every line).
const words = spans.map(({ from, to }, i) => {
  const out = [];
  let j = from;
  while (j < to) {
    while (j < to && /\s/.test(chars[j])) j++;
    if (j >= to) break;
    let k = j;
    while (k < to && !/\s/.test(chars[k])) k++;
    out.push([chars.slice(j, k).join(""), 12 + Math.round((starts[j] - lines[i].start) * 30)]);
    j = k;
  }
  return out;
});
writeFileSync(
  resolve(__dirname, "src", "voWords.json"),
  JSON.stringify(words) + "\n",
);
