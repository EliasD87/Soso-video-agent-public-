---
name: macro-daily
description: >-
  Produce the SoSoValue "Macro Trading Desk" daily video in Remotion (1920x1080,
  30fps, under 1:30): condense the day's brief into an 8-scene table, generate
  ONE ElevenLabs voiceover take, derive the cut from its word alignment, build
  eight motion-graphics scenes + cover + SoDEX end card, verify with contact
  and motion sheets. Use whenever the user pastes a daily brief, asks for
  "today's video", "the daily", "another one", or wants scenes, cover,
  voiceover, subtitles or motion changed in a daily in this folder.
---

# Macro Trading Desk — daily video

Working reference: **`hot-by-a-hair/`** (Sep 25 2026). Every rule below is
implemented there. Scaffold from it, read its scenes before writing new ones,
and copy its `src/scenes/shared.tsx` motion kit forward.

Folder layout (this workspace root):

```
package.json + node_modules/   Remotion installed ONCE here (4.0.486, all pinned)
.env                           ELEVENLABS_API_KEY (+ _BACKUP), MAGNIFIC_API_KEY, OPENAI_API_KEY
shared-assets/music/           macro-dynamics-explainer.mp3 — THE music bed
shared-assets/plates/          51 photo plates, 2048x1152 (reuse before generating)
shared-assets/brand/           SoDEX logo, QR, product screenshot, SoSoValue logos
<slug>/                        one folder per daily, NO node_modules of its own
.claude/launch.json            one studio entry per daily
```

## 0 · Before anything

- Report credits in one short block: Magnific `account_balance` MCP tool
  (text-to-image 75 credits) and ElevenLabs:
  `node .claude/skills/macro-daily/scripts/elevenlabs-credits.mjs "<root>/.env"`
  (prints the main and backup keys, and whether each plan can voice Asher).
- The voiceover script tries `ELEVENLABS_API_KEY` first and sends the same take
  to `ELEVENLABS_API_KEY_BACKUP` only on `quota_exceeded` (a refused take costs
  nothing). Asher is a library voice: a free-plan account gets HTTP 402
  `paid_plan_required` for him, so the backup needs a paid plan or $5 of credits.
  One take is ~1,500 characters, so check the balance before you generate.
- Never publish anything built from a brief marked SYNTHETIC. Its market
  prices on the end card must still be real.

## 1 · Scene table (condense the brief)

Fixed shape — **8 scenes**, hard ceiling **1:30**:

| # | Act | |
|---|---|---|
| 1-4 | WHAT'S NEW | one news item each, merge if the brief has more |
| 5-7 | TRADE SETUP | the interpretation, ending on what to watch |
| 8 | SoDEX end card | outside both acts, the only watchlist in the film |

Table columns: `# · act · composition · title ANCHOR · signature device ·
voice line · ground (plate name or paper)`.

- **Voice lines — ~30 words each, ~240 words total.** The one-take read runs
  **2.9-3.2 words/sec**, so 240 words -> about 1:17-1:25. Quote a range.
  Runtime ≈ words / 3.0 + 2.4s. Check it is under 90s before generating.
- **Connective narration**: line 1 announces the count ("Four things
  moved."), lines count off (First / Second / Third / And fourth), line 5 turns
  out loud ("So how does that trade?"), setup lines hand off (Next / And …).
- Spell numbers as words in the voice ("zero point three percent"). Tickers as
  plain uppercase (QQQ, PCE).
- **No "Good morning", no sign-off.** End card line = plain summary + CTA:
  "That's the desk for Friday. Watch …, and track the US tech index, crude,
  gold and Bitcoin on SoDEX."
- **Variety is a hard requirement.** Composition and device are separate
  axes; varying only the device still reads as one template. Give every scene
  a named composition (asymmetric thirds, tall instrument + text, diagonal
  axis, frame-in-frame, board, diptych, figure-left/title-right, centred
  hero…) AND a title anchor (top-left / top-right / top-centre / middle-left /
  centre). **No two adjacent scenes share a composition or an anchor**, and at
  most two scenes in the film share an anchor. Invent ≥2 devices the previous
  daily did not use.
- About half the scenes sit on a photo plate, half on the paper ground.
- The user normally gives creative freedom; show the table in the reply, but
  if they have said "go"/"do it", proceed without waiting.

## 2 · Scaffold

```
cp -r hot-by-a-hair <slug>     # then delete <slug>/out and <slug>/public/voiceover/*
```

Then, in the new folder:
1. `package.json` → just `{ "name": "<slug>", "private": true }`. **Never**
   `npm install` inside a daily.
2. Rename the composition in `Video.tsx` / `Root.tsx` (`<Pascal>-Full`).
3. Slug in TWO places: `generate-voiceover-full.mjs` `SLUG`, and
   `src/components/NarrationTrack.tsx` audio path.
4. **Rewrite `Subtitles.tsx` CHUNKS** — the copy carries the previous film's
   lines. (This shipped wrong once.)
5. Scene 1 `<Watermarks date="Month D" />`, cover date chip, end card
   "FOR <WEEKDAY>" and its watch line.
6. Plates: copy from `shared-assets/plates/` to
   `public/scenes/sceneN/plate.jpg`. Music: `public/audio/bg-music.mp3` is the
   bed already. End card assets already sit in `public/scenes/scene8/`.
7. Add a studio entry to `.claude/launch.json` on a fresh port, e.g.
   `{"name":"<slug>-studio","runtimeExecutable":"npx","runtimeArgs":["remotion","studio","--port","32xx"],"cwd":"<slug>","port":32xx}`.
8. `node fetch-market-data.mjs` (real prices → `src/marketData.json`), and
   again right before any final render.

**Plates — measure luminance before choosing.** Mean luminance band that
prints well: **45-85/255**. Under ~35 prints black whatever the lift, unless
the bright subject sits exactly where the frame shows it (gold-vault-bullion
works this way). `python -c "from PIL import Image,ImageStat;print(ImageStat.Stat(Image.open(P).convert('L')).mean[0])"`.
Look at every candidate (contact sheet) — filenames lie.

**Magnific is for images only, never audio.** Reuse the plate bank first;
budget 0-4 new generations per daily. Charts, numbers and any text are never
AI images — Mystic garbles type. Inspect every generated image.

## 3 · Voiceover — ONE take, before building scenes

`node generate-voiceover-full.mjs` after editing its `LINES`:
- Voice **Asher `tMvyQtpCVQ0DkixuYm6J`**, `eleven_multilingual_v2`,
  `{stability 0.5, similarity_boost 0.75, style 0.35, speed 1.15}`.
- The whole script in ONE request, lines joined with
  `<break time="0.7s" />`, primed with a never-spoken `previous_text` lead-in
  (otherwise it opens on a hummed "mmm"). Never per-scene clips.
- It POSTs to `/with-timestamps`, asserts the alignment echoes the text, and
  writes `public/voiceover/<slug>/full.mp3`, `src/voTiming.json` (line spans)
  and **`src/voWords.json`** — every word's frame RELATIVE TO ITS SCENE
  (the line begins at frame 12). Print it and cue every beat on a word.

Derive the cut — never estimate:

```
cut[i]  = 6 + round(start[i] * 30)            # 12 frames before each line
dur[i]  = cut[i+1] - cut[i]
dur[7]  = 12 + 6 + round(end[7] * 30) + 54 - cut[7]
total   = 6 + sum(dur)                         # must be < 2700
```

Paste `dur` into `SCENE_DURATIONS` in `Video.tsx`. Re-rolling the take means
re-deriving these and re-reading voWords.json.

**Subtitles**: CHUNKS are `[on-screen text, spoken word it starts on]`,
timed from voWords.json (search forward, so repeated words resolve to the
right occurrence). Numerals on screen, one line per chunk, never wrapping.
Verify every anchor resolves before building.

## 4 · Build the scenes (all eight in one pass, inline — never one-and-wait)

### Frame furniture (claimed areas — keep content out)
- Top band y < 120: SoSoValue logo (top-left) and "MACRO TRADING DESK" + date
  chip (top-right) — `Watermarks`.
- Bottom-right x > 1580, y > 860: the **ArcCounter** (section wheel, trimmed
  small by user request). Mounted in `Video.tsx` above the TransitionSeries —
  never in a scene.
- Bottom y > 1000: subtitle bar.
- Content lives in y 140-960.

### Look (locked house design)
- Ground: dark charcoal grid paper (`PaperStage`) or a full-bleed plate via
  `PlateGround` (duotone, slow push, raked scrims, multiply halftone). Plates
  print warm (`PAPER_TONE #ecdfc2`); a `tone` prop can tint one scene (gold
  scene used `GOLD_TONE`).
- Ink: cream `#ece7d8`, accent amber `#e6a23c`, muted cream, green `#3fb950`
  / red `#e5534b` only for price direction.
- Type: **Inter 800** display, letter-spacing ≈ -3.5%; **JetBrains Mono 800**
  kickers (22px, tracked 4.4). Titles 96-120px as a two-line stack: cream line,
  then the key phrase as ink-on-amber `Highlight` (marker swipe).
- Marks (`Marks.tsx`): RingMark, UnderlineMark, ArrowMark, StrikeMark,
  BracketMark — hand-drawn, pen-on. A flat bracket reads as two ticks; draw a
  span rule with end ticks instead.
- Numbers: every figure animates, and adjacent scenes use different
  animations — `SlamNumber`, `DigitRoll`, `CountUp`, `WipeNumber`, or a live
  readout computed from the device.

### Motion (the bar the user set — "better motion graphics")
Plain fades and linear draw-ons read as a slide deck. Use the motion kit in
`src/scenes/shared.tsx`:
- `pop(frame, at, damping, stiffness)` — spring with overshoot; things LAND.
- `partial(points, t)` + `toPath()` — draw a polyline to progress t and get
  its head point; lead every drawn line with `HeadDot` (glowing, breathing).
- `Ripple` on landings/moments; `glow(color)` for lit strokes.
Patterns from the reference film: a live value tag riding a line's head with
its number computed from position; mechanisms animated, not just drawn (rails
squeezing in, springing apart); a zoom inset that lifts off its source and
magnifies in flight; liquid gauge (summed springs, velocity-driven surface,
hatched afterimage); cards flipping up in 3D; tick rows springing up as a
playhead passes; a slow camera push on a chart. Each device draws/moves on
the spoken word, then holds.

### Content rules
- **On-screen text echoes the narration** — lift contiguous phrases from the
  line, never paraphrase. Labels use the spoken noun.
- **Never illustrate a figure of speech** (no bleeding tank for "cash burn").
  Devices show the real mechanism or data.
- No display words in stamp/label boxes. No floating UI cards.
- At most ~2 scenes carry a real chart; the rest are type + devices.
- 1-2 figures per scene at scale beat a panel of rows.

### Master cut (`Video.tsx`)
Cover 6 frames (0.2s) → scenes with **plain 12-frame crossfades only** (each
non-final scene gets +12 tail frames) → end card. `NarrationTrack`,
`Subtitles`, `FilmOverlay`, `ArcCounter` all mounted once at master level.
Music bed at 0.12, fade in 24f, out 40f. **Zero sound effects.**

### Cover (`Cover.tsx`, also the `Cover` still / thumbnail)
Logo, date chip, **two plain factual headlines** (what happened today — not a
cryptic thesis), one image. **No small text** — no captions, rulers, labels.

### End card (scene 8)
Amber paper stage, taped SoDEX product sheet, "THAT'S THE DESK / FOR
<DAY>", the watch line, pinned real-price watchlist (`marketData.json`),
handwritten "on SoDEX", QR. Copy from the reference and change the words.

## 5 · Verify (studio first, stills for review)

- `npx tsc --noEmit` from the daily folder after every wiring pass.
- Studio: `preview_start` the launch entry; scrub each scene.
- Render the review sheets (fonts are fetched at render time — a
  `NetworkError` is transient, just retry):
  - `npx remotion still src/index.ts SceneSheet out/sheet.png --scale=0.5`
    — cover + 8 finished frames: check layout repetition, collisions,
    anchors, plate exposure, text clipping.
  - `npx remotion still src/index.ts MotionSheet out/motion.png --scale=0.5`
    — 16 MID-animation frames; update its frame list per film. This is how to
    judge the motion.
  - One frame of `<Pascal>-Full` to check subtitles + counter in context.
- Look at the sheets, fix, re-render. Send the sheets to the user.
- **Render the mp4 only when the user asks:**
  `npx remotion render src/index.ts <Pascal>-Full out/<Pascal>.mp4`.
  While the user renders from the studio, make no file edits.

## Standing rules at a glance

1 one take · 2 cut from alignment · 3 8 scenes < 1:30 · 4 two acts + end card
· 5 crossfades only · 6 no SFX · 7 real prices · 8 text echoes voice · 9 no
metaphor art · 10 no small text on cover · 11 springs, heads, ripples, live
tags · 12 verify with SceneSheet + MotionSheet · 13 render only when asked.
