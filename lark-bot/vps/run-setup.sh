#!/usr/bin/env bash
# Runs setup-root.sh on the VPS in ONE root login (one password prompt): the script is streamed
# over the ssh connection, so no separate copy step that can time out.
#   bash lark-bot/vps/run-setup.sh root@<your-server>
# From PowerShell: & "C:\Program Files\Git\bin\bash.exe" lark-bot/vps/run-setup.sh root@<your-server>
HOST="${1:?usage: bash lark-bot/vps/run-setup.sh root@<your-server>}"
cd "$(dirname "$0")"
ssh -o ServerAliveInterval=30 "$HOST" 'bash -s' < setup-root.sh
