#!/usr/bin/env bash
# Runs setup-root.sh on the VPS in ONE root login (one password prompt): the script is streamed
# over the ssh connection, so no separate copy step that can time out.
#   BOT_MEMORY=8G BOT_CPUS=4 bash lark-bot/vps/run-setup.sh root@<your-server> [path to the bot key's .pub]
# BOT_MEMORY / BOT_CPUS: what the bot may use (default 4G and 2). From PowerShell, run it in Git Bash.
HOST="${1:?usage: BOT_MEMORY=4G BOT_CPUS=2 bash lark-bot/vps/run-setup.sh root@<your-server> [~/.ssh/videobot_vps.pub]}"
KEY_FILE="${2:-$HOME/.ssh/videobot_vps.pub}"
[ -f "$KEY_FILE" ] || { echo "no $KEY_FILE: create it with  ssh-keygen -t ed25519 -N \"\" -f ~/.ssh/videobot_vps"; exit 1; }
KEY="$(cat "$KEY_FILE")"
cd "$(dirname "$0")"
ssh -o ServerAliveInterval=30 "$HOST" "BOT_MEMORY='${BOT_MEMORY:-4G}' BOT_CPUS='${BOT_CPUS:-2}' bash -s -- '$KEY'" < setup-root.sh
