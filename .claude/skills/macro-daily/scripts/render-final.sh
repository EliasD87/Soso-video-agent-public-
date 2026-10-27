#!/usr/bin/env bash
# Render a composition and master it to standard loudness (-14 LUFS) in one step.
#   bash .claude/skills/macro-daily/scripts/render-final.sh <project-folder> <CompositionId> <OutName>
# e.g. bash .claude/skills/macro-daily/scripts/render-final.sh fed-split FedSplit-Full FedSplit
# Writes <project>/out/<OutName>-raw.mp4 (Remotion's mix, ~-21 LUFS) and the deliverable
# <project>/out/<OutName>.mp4 (-14 LUFS, true peak ~-1 dBTP).
set -e
DIR="${1:?project folder}"; COMP="${2:?composition id}"; NAME="${3:?output name}"
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT/$DIR"
npx remotion render src/index.ts "$COMP" "out/$NAME-raw.mp4"
cd "$ROOT"
python -I .claude/skills/macro-daily/scripts/loudnorm.py "$DIR/out/$NAME-raw.mp4" "$DIR/out/$NAME.mp4"
