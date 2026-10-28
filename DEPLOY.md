# Deploy your own SoSo Video Agent

The short version, for a team running its own copy with its own server, Claude, ElevenLabs, Magnific and Lark. It takes about an hour. The [README](README.md) has the full detail and troubleshooting.

## 1. Pick a server

Ubuntu 24.04 LTS (or 22.04), x86_64, with root access. No GPU needed: Remotion renders on the CPU, so cores decide the speed.

| Server | `BOT_MEMORY` | `BOT_CPUS` | `RENDER_CONCURRENCY` | 90-second 1080p render |
|---|---|---|---|---|
| 2 vCPU, 4 GB RAM, 40 GB SSD (minimum) | `3G` | `2` | `2` | about 32 min (measured, 1.4 GB peak) |
| **4 vCPU, 8 GB RAM, 80 GB SSD (recommended)** | `7G` | `4` | `4` | about 15-20 min (estimate) |
| 8 vCPU, 16 GB RAM, 100 GB SSD (fast) | `15G` | `8` | `8` | about 8-12 min (estimate) |

`BOT_MEMORY` and `BOT_CPUS` are hard caps on everything the bot runs. On a server dedicated to the bot, use the RAM minus 1 GB and all the cores. On a shared server, give it only what you can spare. `RENDER_CONCURRENCY` should equal `BOT_CPUS`.

## 2. Have ready

- A Claude API key, an ElevenLabs API key and a Magnific API key.
- A Lark custom app in **your own** organization. Use a **new** app: one Lark app should be connected to one server only.
- A PC with Git. On Windows, install "Git for Windows" and run step 3 in **Git Bash**.

## 3. Prepare the server (on your PC)

```bash
git clone https://github.com/EliasD87/Soso-video-agent-public-.git soso
cd soso
ssh-keygen -t ed25519 -N "" -C videobot -f ~/.ssh/videobot_vps
BOT_MEMORY=7G BOT_CPUS=4 bash lark-bot/vps/run-setup.sh root@YOUR_SERVER_IP
```

It asks for the root password once. It creates a `videobot` user with those caps and installs what rendering needs.

## 4. Put the code on the server

```bash
ssh -i ~/.ssh/videobot_vps videobot@YOUR_SERVER_IP
git clone https://github.com/EliasD87/Soso-video-agent-public-.git ~/Soso-Video
```

## 5. Lark app, part 1 ([open.larksuite.com/app](https://open.larksuite.com/app))

1. **Create Custom App**.
2. **Features → Bot → Add**.
3. **Permissions & Scopes**: add `im:message.group_at_msg:readonly`, `im:message.p2p_msg:readonly`, `im:message:send_as_bot` and `im:resource`.
4. **Credentials & Basic Info**: copy the App ID and App Secret.

## 6. Add the keys (on the server, as videobot)

```bash
cp ~/Soso-Video/.env.example ~/Soso-Video/.env
nano ~/Soso-Video/.env
```

Fill in the Claude, ElevenLabs and Magnific keys, `LARK_APP_ID` and `LARK_APP_SECRET`, and set `RENDER_CONCURRENCY` to your `BOT_CPUS`. `MAX_USD_PER_JOB=0` means no spending cap. Leave the `PARTNER_` lines empty. To save in nano, press **Ctrl+O**, **Enter**, then **Ctrl+X**. Then:

```bash
chmod 600 ~/Soso-Video/.env
```

## 7. Start the bot

```bash
bash ~/Soso-Video/lark-bot/vps/deploy.sh
journalctl --user -u lark-bot -n 20 -o cat
```

You should see `lark bot online` and `ws client ready`. The bot runs as a service: it restarts itself if it crashes, and starts again after a reboot.

## 8. Lark app, part 2 (only once step 7 shows "online")

1. **Events & Callbacks → Event Configuration**: set Subscription mode to **Receive events through persistent connection**, then save.
2. On the same page, **Add Events → Message received**.
3. **Version Management & Release → Create a version**: set Availability to your team, then **Submit for release**. Your Lark admin approves it.
4. In Lark, open a group → **Settings → Bots → Add Bot**.

## 9. Test

In the group, send `@YourBot hi, what can you do?`. It replies in a thread. Keep replying in that thread to continue the conversation; start a new message for each new video.

## Everyday commands (on the server, as videobot)

| | |
|---|---|
| Update to the latest version | `bash ~/Soso-Video/lark-bot/vps/deploy.sh` |
| Live log | `journalctl --user -u lark-bot -f -o cat` |
| Restart | `systemctl --user restart lark-bot` |
| Change the caps later (as root) | `systemctl set-property user-$(id -u videobot).slice MemoryMax=7G CPUQuota=400%` |

Costs go to your own API accounts. A chat reply costs about $0.10 in Claude usage, and a full video about $6-11.
