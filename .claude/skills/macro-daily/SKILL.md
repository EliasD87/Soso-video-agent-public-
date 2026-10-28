---
name: macro-daily
description: >-
  Produce the SoSoValue "Macro Trading Desk" daily video in Remotion (1920x1080, 30fps, under 1:30)
  in the v3 house style set by `runs-hot/` (warm newsprint, Fraunces/Anton/Plex Mono/Permanent
  Marker, vermilion, halftone scraps, marker notes, per-scene camera, designed transitions) with
  only small changes per day — one Asher voice take cut by word alignment, a simple cover, live
  captions, and the fixed SoDEX signature ending (real sodex.com screens, push-in per market, QR). Use whenever the user pastes a daily brief,
  asks for "today's video", "the daily", "another one", or wants the cover, scenes, voice, captions
  or motion of a daily in this folder changed.
---

# Macro Trading Desk — daily video (v3)

**The house style is `runs-hot/` (Oct 17); `fed-split/` shows the right amount of creativity in it.**
Scaffold every daily from the latest house-style daily. The user's direction, in order:
"i want the first video style with fewer changes — not completely different looking videos", then
(after `wednesday-test/` stuck too closely to the template) "have creativity while the theme is similar…
the magazine shot was a great one… use it occasionally… do not stick to magazine".

So: same theme every day (ground, fonts, palette, halftone, hand kit, transitions), but each scene is
an invented idea for its story, not a copy of an earlier layout. Use the magazine shot (a tilted
newspaper page in 3D perspective with shallow focus, read by the camera — runs-hot S1, fed-split S1
and S7) in one or two scenes, never all.

`split-on-ai/` (photocopy wall) and `proof-week/` (case file on a desk) were looks that strayed
from the theme — do not use them unless asked ("way too much creativity", "looked cheap").

## 1 · What stays and what changes

**Stays every day (the runs-hot look):** warm newsprint ground (`Paper`, `PrintFinish`, `InkDefs`),
type system (Fraunces 900 / Anton / IBM Plex Mono / Permanent Marker / UnifrakturMaguntia),
vermilion `#ff3d1c` spot on ink `#191714`, halftone image treatment (`halftone.py`, one full-colour
hero object), the hand kit (`MarkerLoop`, `Scrawl`, `Handwrite`, `Highlight`, `BrushPaint`,
`Tape`, `InkPath`), type moves (`Stamp`, `CueWords`, `Letters`, `TypeOn`, `CountUp`), the
per-scene `Camera` with eased keys, the transition set (brush, ink flood, tear, whip, drop, grid),
captions, the cover layout, the SoDEX ending, the sound effects (§7b).

**Changes every day (be creative here):** an idea per scene that acts out its story with paper
and print — fed-split examples: the front page tears in two on "split"; Iran's barrels struck out
one by one to ZERO; Brent rolled up on number wheels; SELL stamped again and again for "keeps
flashing"; the US-stocks bar cut with scissors and falling away; the coin rocking for "wobbles";
prices cut out of newspapers as ransom letters; tills printing the ETF flows; the $50B clipping
doubled by a copy sliding out from under it; the thesis as an equation of paper tiles; dollar scraps
piling into a box marked BIG TECH. New halftone images each day, a full-colour hero object or two,
the cover headline + image, the transition order. No new fonts, palettes or grounds.

**Never:** a section tracker, "WHAT'S NEW 01/05", page numbers or date furniture; continuous slow
drift/push on a held page (text visibly creeps — the user flagged it); 3D page-turn transitions;
`RubberStamp` labels (user, Oct 19: the patchy stamp ink is hard to read over photos and ink). Write
labels on by hand instead with `Handwrite` (oil-and-ai `design/Hand.tsx`): marker words written left to
right in vermilion with a thin paper halo (`halo={null}` on the dark page), `underline` for the big
ones — e.g. HALT!, NET OUTFLOWS, UNCHANGED, BY 2028. No stamp sound on a written label.

## 2 · Script (8 lines, ~200 words)

Same shape: lines 1–5 the news (merge if more), 6–7 the trade setup (thesis, then what to watch),
8 the sign-off. The user found the dense v1 scripts hard to follow:
- One idea per sentence. At most one or two numbers per sentence.
- Spoken numbers simple: "a third of a percent", "eighty cents on the dollar", "one in three",
  "above a hundred and four". The screen carries exact figures (0.335%, $104.54).
- Natural connectives, not a counted list. No "Good morning". Line 8:
  "That's the desk. <optional watch item>, track the US tech index, crude, gold and Bitcoin on SoDEX."
- Facts only from the brief; hedge what the brief hedges ("could", "may").
- 195–205 words. Previous takes: 200 words → 82.7s, 205 words → 86.2s raw.

## 3 · Voice + timing

`generate-voiceover-full.mjs` (copy; set `SLUG`, `LINES`): Asher `tMvyQtpCVQ0DkixuYm6J`,
`eleven_multilingual_v2`, `{stability 0.5, similarity_boost 0.75, style 0.35, speed 1.07}`, one
request, primed `previous_text`, `/with-timestamps`. Writes `public/voiceover/<slug>/full.mp3`,
`src/voTiming.json`, `src/voWords.json`. Check credits first:
`node .claude/skills/macro-daily/scripts/elevenlabs-credits.mjs "<root>/.env"` (main key only; the
backup is a free account that cannot voice Asher).

`src/timeline.ts` (from split-on-ai): plays the take line by line so gaps are capped at 1.0s and the
act turn before line 6 can breathe (1.7s). `CUTS[i]` = scene i's cut, 12 frames before its line;
`NARR` = when narration starts (cover holds before it). Print the totals before building — must
be < 2700 frames (aim 86–89s).

`src/cues.ts`: `cue(line, word, nth, offset)` returns the scene-relative frame of a spoken word
(line starts at 12). **Cue every beat with `cue()`, never a hard-coded frame**, so a re-rolled
take re-times the whole film. Repeated words: pass `nth`.

Voice in the master: runs-hot plays `full.mp3` once from `NARR` (cuts from the raw line starts).
If a take has long gaps, the segmented player in split-on-ai `Video.tsx` (`Voice`) can cap them.

## 4 · Images

Fresh images every film (no plate bank). Magnific MCP:
- Photos/objects/textures: `images_generate` mode `seedream-5-pro` 2k (~100 credits). Objects
  "isolated on a pure flat white background" → `images_remove_background` (3 credits).
- Real landmarks: `stock_search` + `stock_download` (premium 150 credits) — e.g. the Fed building.
- Never generate text, charts or numbers as images. Never illustrate a figure of speech.
- Treat every image in the film's print language with the scripts:
  `halftone.py` (newsprint dots, torn edges), `xerox.py` (1-bit toner, copied paper edge;
  `--color` for riso ink), `sticker.py` (die-cut colour sticker). One hero object per film may stay
  in full colour (runs-hot: the chip; split-on-ai: the Wall St sign).
- Paper/ground textures: generate a blank scan ("flat scan of a single blank sheet of …").

## 5 · Cover (thumbnail) — `covers/` project, cover v2

The user's reference (2026-10-18): a clear cinematic photo, big serif headline, key words in white
on the vermilion brush, logo top-left, "— MACRO TRADING DESK" at the bottom. No date, nothing else.
Build it in `covers/src/Root.tsx`: add one entry to `COVERS` (`photo`, `line1`, `line2`, `shift`)
and render `npx remotion still src/index.ts <Id> out/<Id>.png` from `covers/`.
- Photo: Magnific `seedream-5-pro` 16:9 2k — "cinematic wide photograph of <subject> at golden hour,
  the subject in the right half of the frame… the left half of the frame is open, bright, hazy sky
  fading to warm white. Clean, minimal, sharp, no text." Real landmarks: pass a stock photo as an
  `image` reference. Make 2, pick the one with the emptiest left half.
- `shift` pushes the photo right (it fades into cream on the left) until the subject clears the
  headline: ~60-150 if the photo already leaves the left empty, ~300-400 if not. Check the render.
- The brush is sized from the white words' own box (`Brushed`), so the paint always covers them —
  never place a fixed-size brush behind text.
- Line 1 = subject (ink), line 2 = what happened (white on brush), each 1-3 short words.
- The film opens on the same cover (user, Oct 18: "i want this cover, not the one on local host"):
  `scenes/Cover.tsx` is cover v2 with the same photo (copied to `public/cover/`) and props; the
  `PrintFinish` in `Video.tsx` fades in only after the cover. See `oil-shock/`.

## 6 · SoDEX signature ending — the same in every video

The user: "for the ending sodex (like the desktop screen thing with the zoom ins) we want that on
all videos". Copy `runs-hot/src/scenes/S8EndCard.tsx` and change only the words (watch note, cues).
- `bash .claude/skills/macro-daily/scripts/capture-sodex.sh <slug>/public/sodex` on the day →
  real sodex.com futures pages USTECH100-USD, CL-USD, XAUT-USD, BTC-USD at 1920×1080 @2x.
- Scene: title "That's the desk." on the film's ground; the real desktop screen rises onto it in
  3D; push into header + chart as the markets are named, each market's own page swapping in; pull
  back; QR tag lands with "on SoDEX" written by hand. Optional watch note that slides away before
  the push-in.
- Never hand-build the SoDEX UI, never draw circles/bars/marks over it, never use mobile shots.
- Hide the screen-space SoSoValue corner logo while zoomed in (it collides with SoDEX's logo).
- `node fetch-market-data.mjs` still writes real prices to `src/marketData.json` if a scene needs them.

## 7 · Build + verify

Scaffold from the house style (keep everything, then replace the stories):
`cd runs-hot && tar --exclude=./out --exclude=./public/voiceover -cf - . | (cd ../<slug> && tar -xf -)`
then: `package.json` = `{ "name": "<slug>", "private": true }`; set `SLUG`/`LINES` in
`generate-voiceover-full.mjs`; rename the composition and the voice path in `Video.tsx`/`Root.tsx`;
rewrite `Captions.tsx` CHUNKS; replace `public/scenes/*` with the day's images; recapture
`public/sodex/`; write new scene files (S1–S7) and change only the words in `S8EndCard.tsx`;
add the launch entry. Old scene files are a library of devices to copy from — not to keep as is.

Build all scenes in one pass. Each scene: a composition idea + devices driven by its own words.
Text on screen lifts phrases from the narration. Numbers animate (count, roll, print, stamp…).
Keep content inside the frame and clear of the caption band (y > 990) and the logo corner.

Verify with sheets, not the full render: a `Grid` composition that renders `<Freeze frame>` copies
of the whole film (see split-on-ai `Root.tsx`), rendered with
`npx remotion still src/index.ts <Sheet> out/x.png --frame=0 --scale=0.5`:
SceneSheet (cover + each scene's finished frame), MotionSheet (16 mid-animation frames),
TravelSheet/TransitionSheet (mid-transition frames), EndSheet (the SoDEX ending). Look at every
sheet, fix, re-render, send the sheets. **Then render the mp4 without being asked** (user, Oct 27: "from
now on you render it when you are done and send the video here with cover image"): render the thumbnail
from `covers/`, and once the mastered file exists, send both `<slug>/out/<Pascal>.mp4` and
`covers/out/<Pascal>.png` in chat. Always use the render-and-master script (from the workspace root;
in a PowerShell terminal call Git Bash by path, `& "C:\Program Files\Git\bin\bash.exe"`, bare `bash` is not on its PATH):
`bash .claude/skills/macro-daily/scripts/render-final.sh <slug> <Pascal>-Full <Pascal>`
(renders `out/<Pascal>-raw.mp4`, then masters it with `scripts/loudnorm.py` into `out/<Pascal>.mp4`)
→ -14 LUFS integrated, true peak ~-1 dBTP (YouTube/TikTok/X standard). Raw Remotion mixes come out
around -21 LUFS, about 7 dB quieter than other videos (the user noticed, 2026-10-21). Deliver only the
mastered file. Side videos get the same step.

Gotchas (all hit once):
- A `<Freeze>` inside a 1-frame `<Still>` clamps to frame 0 — make sheets `<Composition>`s, or drive scene clocks directly.
- Font modules: `@remotion/google-fonts/BigShoulders` (not BigShouldersDisplay) — check the package's typesVersions.
- Remotion's bundled ffmpeg is stripped (no fps/drawtext/tile filters) — extract frames with `-r`, tile with PIL.
- Duplicated text layers (misregistration) need the same width as the original or flex rows re-wrap.
- Display fonts may lack ≈ → use ~. Torn/split words need margin for the moving half.
- Yahoo day change: use the last two daily closes, not `chartPreviousClose` (that is a 5-day change).
- Magazine-shot DOF strips (`backdropFilter: blur`) show a mirrored ghost of the headline inside the
  tiled sheets only (scaled tile). Render the scene composition itself (`S2` etc.) to check; the film is clean.
- `InkPath` on a dead-straight horizontal or vertical line draws nothing: the `marker-rough` filter needs a non-zero box. Give the path a slight curve.
- Caption CHUNKS keyed on a repeated word ("and", "a", "the") take the FIRST occurrence unless given `nth`;
  a chunk keyed too early swallows the one before it (Oct 28: "a hundred and seventy-three" ate "Bitcoin
  hovers near…"). Check every line's chunk starts are strictly increasing before rendering.
- Dark objects (drone cut-outs) vanish over a dark halftone photo: run `sticker.py` on the halftone for a paper border.
- Repeated cue words in line 8: S8EndCard (`zout`, `tagAt`), `Video.tsx` Furniture (`z1`) and `Sfx.tsx` key "on SoDEX" with `cue(7, "on", 0, …)`. If the watch note itself says "on …" (Oct 21: "on November third"), pass nth 1 in all three or the QR lands seconds early.

## 7b · Sound effects (since 2026-10-18: "lower volume, perfect, not too much")

Reference: `fed-split/src/components/Sfx.tsx` + `fed-split/public/sfx/*.wav` — copy both.
- Kit (paper and print): brush, tear, stamp, snip, coin, till, tick, drop, whoosh, whoosh-soft, rise.
  Made with Magnific `audio_sfx_generate` (1-2 s, "close mic, dry", 2 variations), then
  `scripts/sfxprep.py` trims, fades and levels every file to the same loudness. Reuse the kit; only
  make a new sound when a scene needs one the kit lacks, and level it with the same script.
- Placement: one sound per transition, plus 1-3 per scene on its key physical moment (a tear, a
  stamp, a snip, a coin landing, the SoDEX screen rising). About 20-25 sounds in a film, never on
  every word, never on type animations.
- Each hit is cued with `cue()` and offset by the sound's PEAK_MS so its loudest point lands on the
  visual moment.
- Levels (files levelled first): transitions ~0.14-0.18 (they fall in pauses, a little over the
  music bed), foley ~0.15-0.26 (1-11 dB under the voice). The user found ~4 dB lower "a little low". Check by rendering
  `--codec=wav` with and without `<Sfx />` and comparing per event; mix peak must stay under -1 dBFS.

## 8 · Dailies in the house style

| daily | date | cover | notes |
|---|---|---|---|
| runs-hot | Oct 17 | "Inflation runs hot" + halftone Fed on brush | the reference |
| wednesday-test | Oct 17 | "Strikes spread" + halftone airport strike | stuck too close to the template |
| fed-split | Oct 17 | "The Fed splits on AI" + halftone Fed torn in two | the target: same theme, a new idea per scene, two magazine shots |
| oil-shock | Oct 18 | "Oil shock / meets the Fed" (cover v2 tanker photo) | drones shot down, vise on margins, spirit level, year flip-book; magazine shots S2 + S7 planner |
| oil-and-ai | Oct 19 | "Oil and AI / rattle markets" (cover v2 pumpjack + data center photo) | Hormuz chart with tankers hit on the lane, price-gun stickers on the red drum (hero), loan-note rate counter that needs a 2nd wheel for 10%, petition + punch press knocking tokens out of a share certificate, magazine shot S4 with a rack focus on "focus turns", label-maker prices, risk-off rocker switch held down by two weights, SCARCITY sticker peeled to PAYBACK; first daily with fed-split SFX |
| paris-unrest | Oct 20 | "Paris unrest / lifts yields" (cover v2 Arc de Triomphe + flare smoke) | protest placards carrying CAC/OAT numbers, red ink bleeding France→Italy on a Europe map (world-atlas topojson), tally of six clashes, tape measure for Brent, summit place cards, report card + sinking tower, anchor moved to the cheaper overnight berth, magazine shot S4 (S-1 sheet, date tiles, rack focus to OpenAI stopwatch), high striker ringing the $83K brass bell (hero), fat vs thin outflow arrows, yields sealed in a jar + TECH EARNINGS match, correction fluid SUPPLY→RETURNS, Wednesday playbill; new SFX bell + match |
| spacex-soars | Oct 21 | "SpaceX soars / Seoul slumps" (cover v2 rocket launch photo) | wire EXTRA struck through with DENIED + typed correction slip, oil barrel tips over on "tumbling" and is stood back up on "held", Pakistan door hanger flips to LEFT; colour rocket (hero) climbs a $B ruler past the dashed forecast line with the camera riding up, green-bar printout counts +830%; magazine shot S3 prints $2,000,000,000,000 digit by digit + loss bar snipped at $72B; Elice→KOSPI→Asia chips dominoes (each tile pushed by the one before, upright price tags above); coin + hand-filled deposit slip, 16-brick wall in front of the OKX × ICE sign; month tiles for payback, FRAGILE carton, crossed-out dashed "turning point"; 10Y sign leaning on its post, Iran's terms behind frosted glass, TSLA/META weights bowing the AI SPENDING STORY plank |
| hormuz-mined | Oct 22 | "Hormuz mined / Brent tops $110" (cover v2 tanker + smoke photo) | Notice to Mariners prints MINES IN THE STRAIT while halftone mines drop into the chart's lane and are ringed; burning-tanker clipping with the flames kept in colour (hero); telex strip; Brent as water rising past 110 on a tide gauge. Ukraine cut-out map (world-atlas 50m, Crimea from the recognised border) with a paper dial filling to 75%; tear-off calendar flying to NOV 10. Magazine shot S3 (Meta): revenue bar past the dashed ESTIMATES mark, empty OUTLOOK boxes with a blinking caret, "silent." written in. Tesla: −/+ sign tile flip, print-shop guillotine trims the 2026 CAPEX strip at $20B, Optimus/robotaxi cut-outs with "?", TSLA tag slipping on its pin. Coin hovering over its shadow, BTC IN / ETH OUT office trays, ticked STRUCTURE CHECK card. Dark thesis page with a brass loupe moving from the chip to "Pays off?". Book press (10Y plate) squeezing STOCKS/CRYPTO/CREDIT, heating-oil LOAN SLIP, sealed MSFT/AMZN envelopes |
| financing-lands | Oct 28 | "AI financing / lands $63B" (cover v2 data-center construction photo) | halftone crate + full-colour accelerator chip (hero) with a SHIP TO tag addressed "Anthropic", $63B count; Meta order cards stacking 1×→5× over a dashed OFFERED box (NVIDIA / AMD typed on two), CRWV/NBIS tickers hop on "jumped". Robinhood revenue bar stopping short of a dashed ESTIMATES line ("missed"), 11 of 20 crypto tiles falling away (−55%), after-hours HOOD card. YES/NO slips spiked 6× taller, colour Bitcoin coin bobbing across a ruled $80,000 line, stablecoin passbook rows shrinking. Knesset hemicycle of 120 dots stalling short of 61 ("deadlock"), repeat-vote memo, struck terminal clipping, BRENT $114.20 sprayed through a stencil on a halftone barrel. Magazine shot S5 (SK Hynix release: 104.62T / 83.33T "beat", 20T buyback, "at least" 30T). Dark thesis: importance set in type size (AI payoff line grows, "tight chip supply" shrinks), capex line flattening, oil slip → INFLATION. Pinned index cards (boosts / weak backdrop / resilient), GDP + CORE PCE tickets in a bulldog clip |
| war-risk | Oct 26 | "War risk / Brent hits $115" (cover v2 aircraft carrier photo) | wire slip TRUMP SIGNALS / MILITARY ACTION over a halftone carrier jet; Israel count card with equal tallies written DEADLOCK; split-flap board rattling to Brent $115.64 and 10Y 4.99%. Magazine shot S2 (flash PMI 57.6, a 2022-2026 ruler: bracket back 4.5 years for new orders, arrow back to Aug 2022 for input costs, "rate pause" in the margin). Dealer slate (discount struck for premium, +0.22%), bank withdrawal slips $635M/$111M, USDC/USDT stacks losing sheets. Solidigm prospectus (colour SSD hero) fed through a shredder while $150B counts up. Kimi vs closed-model coding tests ticked together with "=" and 1/5 cost bars; GPT-6 Astra sheet lifted off a carbon copy marked OPEN SOURCE. Dark thesis page: WEIGHING / CATALYST index cards, barrel feeding a marker loop "new global hiking cycle", tickets THE FED / WARSH'S SPEECH. "split" TearWord with AI payback? / Distillation? cards, data-center print + Meta loan note, watch notepad |
