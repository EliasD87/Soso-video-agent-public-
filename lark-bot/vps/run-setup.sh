#!/usr/bin/env bash
# Runs setup-root.sh on the VPS in ONE root login (one password prompt): the script is streamed
# over the ssh connection, so no separate copy step that can time out.
#   bash lark-bot/vps/run-setup.sh root@<your-server> [path to the bot key's .pub]
# From PowerShell: & "C:\Program Files\Git\bin\bash.exe" lark-bot/vps/run-setup.sh root@<your-server>
HOST="${1:?usage: bash lark-bot/vps/run-setup.sh root@<your-server> [~/.ssh/videobot_vps.pub]}"
KEY_FILE="${2:-$HOME/.ssh/videobot_vps.pub}"
[ -f "$KEY_FILE" ] || { echo "no $KEY_FILE: create it with  ssh-keygen -t ed25519 -N \"\" -f ~/.ssh/videobot_vps"; exit 1; }
KEY="$(cat "$KEY_FILE")"
cd "$(dirname "$0")"
ssh -o ServerAliveInterval=30 "$HOST" "bash -s -- '$KEY'" < setup-root.sh
