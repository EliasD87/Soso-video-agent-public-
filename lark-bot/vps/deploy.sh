#!/usr/bin/env bash
# Pull the latest workspace from GitHub and (re)start the Lark bot. Run on the VPS as videobot:
#   bash ~/Soso-Video/lark-bot/vps/deploy.sh
# The keys file (~/Soso-Video/.env) is copied from the PC separately; it never goes through GitHub.
set -euo pipefail
export PATH="$HOME/.local/node/bin:$PATH"
cd "$HOME/Soso-Video"

git pull --ff-only
npm install --no-audit --no-fund                      # Remotion, shared by every daily
(cd lark-bot && npm ci --no-audit --no-fund)          # the bot's own packages
[ -f .env ] || { echo "missing ~/Soso-Video/.env (copy it from the PC first)"; exit 1; }
chmod 600 .env

mkdir -p "$HOME/.config/systemd/user"
cp lark-bot/vps/lark-bot.service "$HOME/.config/systemd/user/"
systemctl --user daemon-reload
systemctl --user enable lark-bot >/dev/null 2>&1
systemctl --user restart lark-bot
sleep 5
systemctl --user --no-pager --lines=15 status lark-bot || true
