# SoSoValue Macro Trading Desk — daily videos (v3)

The full playbook is **`.claude/skills/macro-daily/SKILL.md`**. Read it first.

- House style: `runs-hot/` (warm newsprint, halftone, Fraunces/Anton, vermilion, marker notes).
  `fed-split/` is the target balance: the same theme, with a new idea acted out in every scene and
  the magazine shot (tilted page, shallow focus) used once or twice. Scaffold each daily from the
  latest house-style daily. `split-on-ai/` and `proof-week/` were off-theme experiments.
- The SoDEX ending is the same in every daily (real sodex.com screens, push-in per market, QR).
- Remotion is installed ONCE at this root. Daily folders never get their own `node_modules`.
- Shared resources: `shared-assets/music/macro-dynamics-explainer.mp3` (the bed),
  `shared-assets/brand/`. The old `shared-assets/plates/` bank is retired.
- Keys live in `.env` at this root.
- `side-videos/` holds one-offs that are NOT dailies (e.g. `sousdc-claim/`, the treasure-box claim
  short). The daily house style and SKILL rules don't apply there; each has its own SCRIPT.md.
- Every final MP4 (dailies AND side videos) is mastered to standard loudness, -14 LUFS:
  `bash .claude/skills/macro-daily/scripts/render-final.sh <folder> <CompositionId> <OutName>`, or
  `python -I .claude/skills/macro-daily/scripts/loudnorm.py <raw.mp4> <final.mp4>` on an existing render.
  Raw Remotion mixes are ~7 dB quieter than other videos.
