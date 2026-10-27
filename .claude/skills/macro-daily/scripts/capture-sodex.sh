#!/usr/bin/env bash
# Capture the live SoDEX futures pages used by the signature ending.
#   bash .claude/skills/macro-daily/scripts/capture-sodex.sh <daily-folder>/public/sodex
# Writes ustech.png, cl.png, xaut.png, btc.png (1920x1080 @2x = 3840x2160). Run on the day.
# Windows Chrome needs Windows paths: cygpath -m gives C:/... form (Git Bash).
# Linux (the bot's VPS) uses google-chrome or chromium from PATH. CHROME=<path> overrides either.
OUT="${1:?usage: capture-sodex.sh <out-dir>}"
mkdir -p "$OUT"
if command -v cygpath >/dev/null 2>&1; then
  OUTM="$(cygpath -m "$(cd "$OUT" && pwd)")"
  PROFILEM="$(cygpath -m "${TEMP:-$HOME}")/sodex-chrome-profile"
  CH="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
else
  OUTM="$(cd "$OUT" && pwd)"
  PROFILEM="${TMPDIR:-/tmp}/sodex-chrome-profile"
  CH="${CHROME:-$(command -v google-chrome || command -v chromium || command -v chromium-browser)}"
fi
[ -n "$CH" ] || { echo "no Chrome found: set CHROME=<path to chrome>"; exit 1; }
for pair in "ustech:USTECH100-USD" "cl:CL-USD" "xaut:XAUT-USD" "btc:BTC-USD"; do
  n="${pair%%:*}"; sym="${pair#*:}"
  timeout 90 "$CH" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
    --user-data-dir="$PROFILEM" --window-size=1920,1080 --force-device-scale-factor=2 \
    --virtual-time-budget=20000 --screenshot="$OUTM/$n.png" \
    "https://sodex.com/trade/futures/$sym" >/dev/null 2>&1
  if [ -s "$OUT/$n.png" ]; then echo "saved $n.png ($sym)"; else echo "FAILED $sym"; fi
done
