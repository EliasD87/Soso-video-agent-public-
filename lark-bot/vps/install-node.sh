#!/usr/bin/env bash
# Installs Node 24 for the current user into ~/.local/node (system Node is left alone). Safe to re-run.
#   bash ~/Soso-Video/lark-bot/vps/install-node.sh
set -euo pipefail
NODE="$HOME/.local/node"
if [ -x "$NODE/bin/node" ]; then
  echo "node $("$NODE/bin/node" -v) already in $NODE"
  exit 0
fi
mkdir -p "$NODE"
base=https://nodejs.org/dist/latest-v24.x
sums=$(curl -fsSL "$base/SHASUMS256.txt")
file=$(awk '/linux-x64\.tar\.xz$/ {print $2}' <<<"$sums")
curl -fsSLo "$HOME/$file" "$base/$file"
(cd "$HOME" && grep " $file\$" <<<"$sums" | sha256sum -c -)
tar -xJf "$HOME/$file" -C "$NODE" --strip-components=1
rm "$HOME/$file"
echo "node $("$NODE/bin/node" -v) installed in $NODE"
