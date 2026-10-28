#!/usr/bin/env bash
# One-time VPS setup for the Lark video bot. Run once as root, from the PC with run-setup.sh
# (one login, the script is streamed over ssh), or on the server as root with:
#   BOT_MEMORY=4G BOT_CPUS=2 bash setup-root.sh "ssh-ed25519 AAAA... videobot"   (your bot key's .pub line)
# Safe on a server that also runs other important work:
#  - creates a separate user "videobot"; everything the bot does lives in /home/videobot
#  - hard-caps ALL of that user's processes at BOT_MEMORY RAM (no swap) and BOT_CPUS cores (default
#    4G and 2), so the bot can never take more; if it goes over, only the bot's process is killed
#  - installs only the shared libraries headless Chrome needs, fonts, and Python imaging libs;
#    it does not touch system Node, Docker, the firewall, other users or other services
set -euo pipefail
BOT=videobot
KEY="${1:?pass the bot SSH public key (the one line in your .pub file) as the first argument}"
case "$KEY" in ssh-*|ecdsa-*) ;; *) echo "that doesn't look like an SSH public key"; exit 1 ;; esac
MEM="${BOT_MEMORY:-4G}"
CPUS="${BOT_CPUS:-2}"
[[ "$MEM" =~ ^[0-9]+[MG]$ ]] || { echo "BOT_MEMORY must look like 4G or 8192M"; exit 1; }
[[ "$CPUS" =~ ^[1-9][0-9]*$ ]] || { echo "BOT_CPUS must be a whole number of cores"; exit 1; }

[ "$(id -u)" = 0 ] || { echo "run with sudo"; exit 1; }
[ -f /sys/fs/cgroup/cgroup.controllers ] || { echo "needs cgroup v2 (Ubuntu 22.04 or newer)"; exit 1; }

echo "== user $BOT (no sudo rights, login by SSH key only)"
id "$BOT" >/dev/null 2>&1 || useradd --create-home --shell /bin/bash "$BOT"
install -d -m 700 -o "$BOT" -g "$BOT" "/home/$BOT/.ssh"
touch "/home/$BOT/.ssh/authorized_keys"
grep -qxF "$KEY" "/home/$BOT/.ssh/authorized_keys" || echo "$KEY" >> "/home/$BOT/.ssh/authorized_keys"
chown "$BOT:$BOT" "/home/$BOT/.ssh/authorized_keys"
chmod 600 "/home/$BOT/.ssh/authorized_keys"

echo "== cap: $MEM RAM, no swap, $CPUS CPU cores for everything $BOT runs"
U=$(id -u "$BOT")
mkdir -p "/etc/systemd/system/user-$U.slice.d"
cat > "/etc/systemd/system/user-$U.slice.d/50-videobot-limits.conf" <<EOF
[Slice]
MemoryMax=$MEM
MemorySwapMax=0
CPUQuota=$((CPUS * 100))%
TasksMax=4096
EOF
systemctl daemon-reload
loginctl enable-linger "$BOT"  # the bot's own service keeps running after SSH logout (used from step 2)

echo "== libraries for Remotion's headless Chrome, fonts, Python imaging"
# apt reads from /dev/null: when streamed over ssh this script IS stdin, and apt must not eat it.
apt-get update -q </dev/null
pkgs="libnss3 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 libgbm1 libxrandr2 libxkbcommon0 libxfixes3
  libxcomposite1 libxdamage1 libpango-1.0-0 libcairo2 libcups2 fonts-liberation fonts-noto-color-emoji
  python3 python3-pil python3-numpy curl xz-utils"
for p in libasound2t64 libasound2; do  # renamed on Ubuntu 24.04
  if apt-cache show "$p" >/dev/null 2>&1; then pkgs="$pkgs $p"; break; fi
done
DEBIAN_FRONTEND=noninteractive apt-get install -y -q --no-install-recommends $pkgs </dev/null

echo
echo "done. $BOT: memory.max=$(systemctl show "user-$U.slice" -p MemoryMax --value) cpu quota=$(systemctl show "user-$U.slice" -p CPUQuotaPerSecUSec --value)/s"
df -h "/home/$BOT" | tail -1 | awk '{print "free disk for the bot: " $4}'
