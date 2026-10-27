#!/usr/bin/env bash
# Step-1 test, run on the VPS as the videobot user (capped at 4 GB / 2 cores by setup-root.sh).
# Node and the npm packages download ON the VPS, so nothing big comes over the PC's wifi.
# Renders one existing daily (paris-unrest), then reports render time, peak memory and whether
# the 4 GB cap ever killed anything.
#   bash ~/Soso-Video/lark-bot/vps/test-render.sh     (after cloning the repo to ~/Soso-Video)
set -euo pipefail
REPO="$HOME/Soso-Video"; W="$HOME/work"; NODE="$HOME/.local/node"
mkdir -p "$W" "$NODE"

if [ ! -x "$NODE/bin/node" ]; then
  echo "== installing Node 24 into $NODE (only for this user; system Node untouched)"
  base=https://nodejs.org/dist/latest-v24.x
  sums=$(curl -fsSL "$base/SHASUMS256.txt")
  file=$(awk '/linux-x64\.tar\.xz$/ {print $2}' <<<"$sums")
  curl -fsSLo "$HOME/$file" "$base/$file"
  (cd "$HOME" && grep " $file\$" <<<"$sums" | sha256sum -c -)
  tar -xJf "$HOME/$file" -C "$NODE" --strip-components=1
  rm "$HOME/$file"
fi
export PATH="$NODE/bin:$PATH"
echo "node $(node -v)"

cd "$REPO"
echo "== npm ci"
npm ci --no-audit --no-fund
cd paris-unrest
npx remotion browser ensure

CG="/sys/fs/cgroup/user.slice/user-$(id -u).slice"
echo "== cap in force: memory.max=$(cat "$CG/memory.max") cpu.max=$(cat "$CG/cpu.max")"
oom0=$(awk '/^oom_kill / {print $2}' "$CG/memory.events")
# Real memory = anon + shmem (Chrome's frames); file cache is left out because the kernel frees it on demand.
echo 0 > "$W/peak"
(
  peak=0
  while :; do
    m=$(awk '/^(anon|shmem) / {s += $2} END {print s}' "$CG/memory.stat")
    if [ "$m" -gt "$peak" ]; then peak=$m; echo "$peak" > "$W/peak"; fi
    sleep 1
  done
) &
SAMPLER=$!
trap 'kill $SAMPLER 2>/dev/null || true' EXIT

echo "== render (concurrency 2)"
t0=$(date +%s)
npx remotion render src/index.ts ParisUnrest-Full out/ParisUnrest.mp4 --concurrency=2
t1=$(date +%s)
kill $SAMPLER 2>/dev/null || true
cd "$REPO"

# Three small stills (~50 KB each) to check the render by eye without downloading the video.
FFDIR=$(dirname "$(ls node_modules/@remotion/compositor-*/ffmpeg | head -1)")
for s in 5 40 80; do
  LD_LIBRARY_PATH="$FFDIR" "$FFDIR/ffmpeg" -hide_banner -loglevel error -y -ss "$s" \
    -i paris-unrest/out/ParisUnrest.mp4 -frames:v 1 -vf scale=640:-1 "$W/still-$s.jpg"
done

oom1=$(awk '/^oom_kill / {print $2}' "$CG/memory.events")
echo
echo "== RESULT"
echo "render time:   $(( (t1 - t0) / 60 )) min $(( (t1 - t0) % 60 )) s"
echo "peak memory:   $(( $(cat "$W/peak") / 1048576 )) MB of 4096 MB cap"
echo "OOM kills:     $(( oom1 - oom0 ))"
echo "final video:   $(( $(stat -c %s paris-unrest/out/ParisUnrest.mp4) / 1048576 )) MB"
df -h "$HOME" | tail -1 | awk '{print "free disk:     " $4}'
echo "TEST DONE"
