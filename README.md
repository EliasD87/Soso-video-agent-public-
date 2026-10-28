# SoSo Video Agent

A Lark (Feishu) bot that makes short videos with Claude. People chat with it in Lark. Each thread is one Claude session that can talk through an idea, write the script, make the voice and images, render the video with Remotion on a small Linux VPS, and post previews and the finished MP4 back into the thread.

This guide sets up the whole thing from scratch. It takes about an hour, most of it waiting for the first test render. **In a hurry? [DEPLOY.md](DEPLOY.md) is the short version, with server sizes.**

## How it works

```
Lark chat  ──(persistent connection: the bot dials out, no public URL needed)──►  VPS
                                                                                   │
   lark-bot/ (Node 24): each Lark thread = one Claude Agent SDK session            │
   one job at a time, so a render gets the whole 4 GB / 2-core budget              │
                                                                                   ▼
   Claude reads AGENTS.md + .claude/skills/, writes Remotion scenes, calls ElevenLabs
   (voice) and Magnific (images), renders, and posts progress, stills and the MP4
   back into the same thread
```

- A message that **@mentions the bot** (or any direct message) starts a conversation. Claude's first reply opens a Lark thread, and **replies in that thread continue the same session**.
- Not every message is a job. The bot chats and answers questions, and it asks before paid steps (voice, image generation) and before the 30-40 minute render.
- One bot process can serve **several Lark apps, one per organization**. A Lark custom app only works inside the organization that created it, so people in another org use their own app (see [Another organization](#adding-another-organization)).

## What you need

| | |
|---|---|
| **VPS** | Ubuntu 22.04 or 24.04, x86_64, with root access once. The bot gets its own user with hard caps on RAM and CPU (default **4 GB and 2 cores**), so the server can keep running other work. About 40 GB free disk; 4 vCPU / 8 GB is the comfortable size (see [DEPLOY.md](DEPLOY.md#1-pick-a-server)). |
| **Claude API key** | [console.anthropic.com](https://console.anthropic.com), billed per use (see [Costs](#costs-and-speed)). The Agent SDK needs an API key, not a Claude subscription. |
| **ElevenLabs API key** | With Text to Speech access. |
| **Magnific API key** | REST API access (magnific.com → API keys). |
| **Lark** | Lark (international) or Feishu, and permission to create a custom app in your organization, or an admin who does it. |
| **Your PC** | `git` and `ssh`. On Windows, install Git for Windows; it includes Git Bash. |

## Setup

Replace `YOUR_SERVER` with your VPS address and `YOU/YOUR-REPO` with your GitHub repo.

### 1. Your own copy of this repo

Fork or copy this repo into **your own private repo**. The VPS will pull from it. Keys never go in it: `.env` is git-ignored.

> Move code to the VPS through GitHub, not with `scp`. The VPS downloads everything big (Node, Chrome, packages) over its own connection. If your PC's link to the VPS is slow, this is the only thing that stays fast.

### 2. A login key for the bot user (on your PC)

```bash
ssh-keygen -t ed25519 -N "" -C videobot -f ~/.ssh/videobot_vps
```

### 3. One-time root setup of the VPS

From the repo folder on your PC (it asks for the root password once):

```bash
BOT_MEMORY=4G BOT_CPUS=2 bash lark-bot/vps/run-setup.sh root@YOUR_SERVER ~/.ssh/videobot_vps.pub
```

Or copy `lark-bot/vps/setup-root.sh` to the server and run `sudo bash setup-root.sh "<the line in videobot_vps.pub>"`.

What [setup-root.sh](lark-bot/vps/setup-root.sh) does:
- creates a user **`videobot`** with no sudo rights, which logs in only with your key;
- caps **everything that user runs** at `BOT_MEMORY` RAM (no swap) and `BOT_CPUS` cores, so the bot can never take more. If it goes over, only the bot's process is stopped. Set `RENDER_CONCURRENCY` in `.env` to the same number of cores;
- installs the libraries headless Chrome needs, fonts, and Python imaging libs;
- turns on "linger", so the bot's service keeps running after you log out and starts on boot.

It doesn't touch system Node, Docker, the firewall, other users or other services.

Check that the key login works:

```bash
ssh -i ~/.ssh/videobot_vps videobot@YOUR_SERVER
```

### 4. Get the code onto the VPS

On the VPS as `videobot`, give it a **read-only** key for your private repo:

```bash
ssh-keygen -t ed25519 -N "" -C videobot-deploy -f ~/.ssh/github_deploy
printf 'Host github.com\n  IdentityFile ~/.ssh/github_deploy\n  IdentitiesOnly yes\n' >> ~/.ssh/config
ssh-keyscan -t ed25519 github.com >> ~/.ssh/known_hosts
cat ~/.ssh/github_deploy.pub
```

On GitHub, open your repo → **Settings → Deploy keys → Add deploy key**, paste that line, and **leave "Allow write access" off**. Then clone:

```bash
git clone git@github.com:YOU/YOUR-REPO.git ~/Soso-Video
```

The scripts expect the checkout at `~/Soso-Video`.

### 5. Test render (optional, recommended)

```bash
nohup bash ~/Soso-Video/lark-bot/vps/test-render.sh > ~/test.log 2>&1 &
tail -f ~/test.log
```

This installs Node 24 into `~/.local/node` (only for this user), the packages, and Chrome for Remotion. It then renders the `paris-unrest` daily with 2 workers and prints the render time, peak memory and any out-of-memory kills. `nohup` keeps it running if your SSH connection drops.

Reference result, on the 4 GB / 2-core cap: an 86-second 1080p video in **32 minutes**, **1.4 GB** peak memory, **0** kills.

### 6. Lark app, part 1

1. Go to **https://open.larksuite.com/app** (Feishu: open.feishu.cn/app) and click **Create Custom App**. Give it a name (e.g. "SoSo Video Agent"), a description and an icon.
2. **Credentials & Basic Info**: copy the **App ID** (`cli_...`) and the **App Secret**. They go into `.env` in the next step.
3. **Features** (or "Add Features") → **Bot** → **Add**. Turn on nothing else.
4. **Permissions & Scopes** → **Add permission scopes to app**. Tick these four:

   | Scope | Why |
   |---|---|
   | `im:message.group_at_msg:readonly` | read group messages that @mention the bot |
   | `im:message.p2p_msg:readonly` | read direct messages to the bot |
   | `im:message:send_as_bot` | reply as the bot |
   | `im:resource` | send videos and images, and read files people attach |

   Optional: `im:message.group_msg` lets people reply in a thread without @-ing the bot each time. It's marked "sensitive", so an admin may need to approve it. Leave everything else off.

### 7. Keys

On the VPS:

```bash
cp ~/Soso-Video/.env.example ~/Soso-Video/.env
nano ~/Soso-Video/.env        # fill in the keys and the Lark App ID / Secret
chmod 600 ~/Soso-Video/.env
```

Or fill it in on your PC and copy the small file over: `scp .env videobot@YOUR_SERVER:Soso-Video/.env`. See [.env.example](.env.example) for every setting. `MAX_USD_PER_JOB=0` means no spending cap. `CLAUDE_MODEL` is optional and defaults to `claude-opus-5-5`.

### 8. Start the bot

```bash
bash ~/Soso-Video/lark-bot/vps/deploy.sh
```

[deploy.sh](lark-bot/vps/deploy.sh) does the following:
- pulls the latest code;
- installs Node if it's missing;
- installs Remotion at the repo root and the bot's packages;
- installs the systemd user service **`lark-bot`** and starts it. The service restarts itself if it crashes and starts again after a reboot.

Check the log:

```bash
journalctl --user -u lark-bot -n 20 -o cat
```

You should see `lark bot online for app "main"` and `ws client ready`.

### 9. Lark app, part 2 (the bot must be online)

1. **Events & Callbacks → Event Configuration**: click the pencil next to **Subscription mode**, choose **Receive events through persistent connection**, then **Save**. Lark only accepts this while the bot is connected.
2. On the same page, click **Add Events**, search **Message received** (`im.message.receive_v1`), and add it. Leave Request URL, Encrypt Key and Verification Token empty, and skip "Callback Configuration".
3. **Version Management & Release → Create a version**. Version `1.0.0`. Set **Availability** to the people who will use the bot. Save, then click **Submit for release**. Your Lark admin approves it in the Lark Admin Console.
4. In Lark, open a group → **Settings → Bots → Add Bot**, and choose your app.

If you change permissions later, create and release a new version for the change to take effect.

### 10. Try it

In the group, send `@SoSo Video Agent hi, what can you do?`. It answers in a thread; reply inside that thread to keep talking. Then send a brief to make a video. It will:
1. share a plan or script and wait for your go-ahead;
2. post preview stills;
3. warn you about the 30-40 minute render;
4. post the MP4 in the thread.

Lark only takes files under 30 MB, so it sends a compressed share copy when the render is bigger.

## Adding another organization

A Lark custom app can't be used by people in another organization. They need **their own custom app** in their org; the same bot serves both.

1. Someone in the other organization does [part 1](#6-lark-app-part-1) in **their** developer console and sends you their App ID and App Secret. Use a fresh app, not one another program already uses: switching an app to persistent connection would break that program.
2. Add them to `.env` (the prefix names the app; one word, capitals):
   ```
   PARTNER_LARK_APP_ID=cli_...
   PARTNER_LARK_APP_SECRET=...
   PARTNER_LARK_DOMAIN=lark
   ```
3. Restart: `systemctl --user restart lark-bot`. The log should now also show `lark bot online for app "partner"` and a second `ws client ready`.
4. They do [part 2](#9-lark-app-part-2-the-bot-must-be-online) in their console.

All organizations share one job queue and your API keys, so their usage is billed to you.

## Day to day

| Task | Command (on the VPS as `videobot`) |
|---|---|
| Live log | `journalctl --user -u lark-bot -f -o cat` |
| Restart | `systemctl --user restart lark-bot` |
| Update after pushing to GitHub | `bash ~/Soso-Video/lark-bot/vps/deploy.sh` |
| Status | `systemctl --user status lark-bot` |

In the log, every finished step prints a line like `[omt_...] success, $0.11 (thread $0.11)`. `msg:...` means the first message of a new conversation, and `omt_...` means a reply inside a thread.

Where things live:

| What | Where |
|---|---|
| Which Lark thread maps to which Claude session | `~/bot-data/threads.json` |
| Files people attach in Lark | `~/Soso-Video/lark-jobs/` |
| Videos the bot makes | a new folder per video in `~/Soso-Video/`, git-ignored |
| Claude's session history | `~/.claude/projects/` |

## Costs and speed

These are estimates from 22 daily videos priced at Claude Opus 5.5 API rates ($4 in / $20 out / $0.20 cache read per million tokens):

| | Claude cost |
|---|---|
| A chat reply | about $0.10 |
| A typical daily video | about $6 (range $4-17) |
| A daily with a new idea in every scene | about $11 |

ElevenLabs and Magnific are billed on their own accounts. A full render takes 30-40 minutes on the 2-core cap. The thread shows the cost of any step that cost $1 or more, and `MAX_USD_PER_JOB` caps one request.

## Troubleshooting

| Problem | Fix |
|---|---|
| Lark won't save "persistent connection" | The bot isn't connected. Check the log for `ws client ready` and that the App ID and Secret in `.env` are right. |
| No reply in a group | Mention the bot (unless you added `im:message.group_msg`), check the version is released and approved, the bot is in the group, and the person is in the app's Availability. If nothing shows in the log, Lark isn't delivering, so check part 2. |
| People in another org can't use it | Expected: see [Another organization](#adding-another-organization). |
| `--max-budget-usd must be a positive number` | Update the bot (`deploy.sh`). `MAX_USD_PER_JOB=0` now means no cap. |
| "file must be under 30 MB" | Lark's chat limit. The bot is told to send a compressed share copy; ask it again if it forgot. |
| Bot stopped mid-render | Check `systemctl --user status lark-bot` and `cat /sys/fs/cgroup/user.slice/user-$(id -u).slice/memory.events` (oom_kill). The cap is 4 GB. |
| SSH to the VPS is very slow | Usually the route between your PC and the VPS. Move code through GitHub, and let the bot deliver files in Lark. |

## Security notes

- Keys live only in `.env` (git-ignored, `chmod 600`). Never commit or paste them.
- The bot runs shell commands as `videobot`, a user with no sudo and hard memory and CPU caps. Limit who can talk to it with the Lark app's **Availability**.
- Anyone who can message the bot can spend your API credits. Keep Availability to people you trust, and set `MAX_USD_PER_JOB` if you want a ceiling.

## Repo layout

```
lark-bot/
  src/             the bot (Node 24 runs the .ts files directly, no build step)
    index.ts       Lark events → conversations; one connection per Lark app
    agent.ts       one Claude Agent SDK session per thread; the bot's instructions
    lark.ts        Lark API calls: reply, upload, download
    thread.ts      posting into a thread (the first reply opens it)
    store.ts       thread ↔ session records     queue.ts  one job at a time
    config.ts      reads .env
  vps/
    run-setup.sh   runs setup-root.sh on the VPS from your PC (one root login)
    setup-root.sh  one-time root setup: bot user, caps, libraries
    install-node.sh, test-render.sh, deploy.sh, lark-bot.service
.claude/skills/macro-daily/   the video playbook Claude follows (house style, scenes, voice, ending)
AGENTS.md                     project rules Claude reads first
anthropic-files/, paris-unrest/   example dailies; new ones start from the latest
shared-assets/                music bed and brand files
.env.example                  every setting, with where to get each key
```

The macro-daily skill also describes a Windows workflow (PowerShell, `render-final.sh` with loudness mastering). The bot runs the Linux equivalents and skips the loudness step.
