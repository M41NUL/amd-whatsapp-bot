<div align="center">

# AMD - All Media Downloader Bot

WhatsApp bot for downloading TikTok, Instagram, and Facebook videos.

[![Owner](https://img.shields.io/badge/Owner-CODEX--M41NUL-black?style=for-the-badge)](https://github.com/M41NUL)
[![Author](https://img.shields.io/badge/Author-Md.%20Mainul%20Islam-black?style=for-the-badge)](https://github.com/M41NUL)
[![Platform](https://img.shields.io/badge/Platform-WhatsApp-black?style=for-the-badge&logo=whatsapp&logoColor=white)](#)
[![Runtime](https://img.shields.io/badge/Runtime-Node.js-black?style=for-the-badge&logo=node.js&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-MIT-black?style=for-the-badge)](#)

</div>

---

## Overview

AMD is a WhatsApp bot that automatically detects video links from TikTok, Instagram, and Facebook sent in chat, resolves them through the CODEX-M41NUL All Media Downloader API, and replies with the downloaded video.

## Features

- Auto platform detection from a shared link
- TikTok, Instagram, and Facebook support
- Pairing code or QR code login, selectable at first run
- Session persistence, no repeated login after first connect
- Animated startup banner with tool name, supported platforms, and developer information
- Welcome reply on a user's first message, video link handling from every message after
- In-terminal control menu after connect: status, download logs, reconnect, disconnect

## Requirements

- Node.js 18 or higher
- npm
- Termux (for Android) or any Linux/macOS/Windows environment
- Termux:API app, only needed for running the bot in the background

---

## Quick Start (Termux)

Copy and run all commands below in order.

```bash
pkg update && pkg upgrade -y
pkg install nodejs git -y
termux-setup-storage
cd ~
git clone https://github.com/M41NUL/amd-whatsapp-bot.git
cd amd-whatsapp-bot
npm install
npm start
```

After `npm start`, the banner and menu will appear, then a login method prompt. Choose `1` for Pairing Code or `2` for QR Code and follow the on-screen instructions. See the full guide below for details.

---

## Termux Setup Guide

### Step 1: Update Termux packages

```bash
pkg update && pkg upgrade -y
```

### Step 2: Install Node.js and git

```bash
pkg install nodejs git -y
```

### Step 3: Grant storage permission

```bash
termux-setup-storage
```

Allow the permission when prompted.

### Step 4: Clone the repository inside Termux home

Do not run this from `/storage/emulated/0/...`. Always use the Termux home directory.

```bash
cd ~
git clone https://github.com/M41NUL/amd-whatsapp-bot.git
cd amd-whatsapp-bot
```

If you have the project as a downloaded zip instead of cloning, extract it into `~/amd-whatsapp-bot` and keep the `src/` folder structure intact.

### Step 5: Install dependencies

```bash
npm install
```

### Step 6: Run the bot

```bash
npm start
```

### Step 7: Choose a login method

On first run, the banner and menu will appear, followed by a login method prompt:

```
1. Pairing Code
2. QR Code
```

**Pairing Code**: Enter your WhatsApp number with country code, no plus sign, e.g. `8801XXXXXXXXX`. A pairing code will be shown. Enter it in WhatsApp under Linked Devices > Link with phone number.

**QR Code**: A QR code will be shown directly in the terminal. Scan it in WhatsApp under Linked Devices.

### Step 8: Session persistence

After a successful login, session data is saved in the `session/` folder. Future runs will connect automatically without asking for a login method again.

To log in again from scratch, delete the `session/` folder and restart the bot.

```bash
rm -rf session
npm start
```

---

## Usage

Once connected, send any TikTok, Instagram, or Facebook video link to the bot on WhatsApp. The bot detects the platform, fetches the video through the API, and replies with the video file and caption.

### Message Behavior

| User sends | Bot response |
|---|---|
| Any message, first time ever | Welcome message with instructions |
| A supported video link (TikTok, Instagram, Facebook) | Downloads and sends the video with caption |
| An unsupported or invalid link | "This link is not supported" message |
| Any other text, after the first message | "Please send a video link only" message |

## Command List

| Command | Description |
|---|---|
| `npm start` | Start the bot |
| `npm install` | Install all dependencies |
| `rm -rf session` | Clear saved login session |
| `cd ~ && rm -rf amd-whatsapp-bot` | Delete the entire project folder |
| `git clone https://github.com/M41NUL/amd-whatsapp-bot.git` | Clone the repository |
| `pkg install nodejs git -y` | Install Node.js and git in Termux |
| `termux-setup-storage` | Grant Termux access to phone storage |
| `nohup npm start > amd.log 2>&1 &` | Run the bot detached from the terminal |
| `tail -f amd.log` | View live background logs |
| `pkill -f "node src/bot.js"` | Stop the background bot |

## Project Structure

```
amd-whatsapp-bot/
├── src/
│   ├── bot.js         Main bot logic and message handling
│   ├── devinfo.js     Banner, menu, and developer information
│   ├── ui.js          Terminal colors, animation, and layout helpers
│   └── logger.js      In-memory download log tracker
├── package.json       Dependencies and project metadata
├── README.md          Documentation
└── session/           Auth session data, created after first login
```

## Control Menu

Once connected, an in-terminal control menu becomes available.

| Option | Action |
|---|---|
| `1` | View bot status |
| `2` | View download logs |
| `3` | Clear download logs |
| `4` | Reconnect the bot |
| `0` | Disconnect and exit |

Type the option number and press Enter. The menu reappears after each action, except reconnect and disconnect.

---

## Run in Background (Termux)

The bot automatically enables `termux-wake-lock` as soon as it connects to WhatsApp, so the phone screen can turn off without disconnecting the session. This requires the Termux:API app to be installed; if it is missing, the bot still runs normally, just without the wake lock.

The wake lock is released automatically when you disconnect from the control menu (option `0`).

To keep the bot running even after closing the Termux session, start it detached from the terminal:

```bash
nohup npm start > amd.log 2>&1 &
```

Note: the login menu and control menu need direct terminal input, so complete the first-time login normally before switching to detached mode.

### View live logs

```bash
tail -f amd.log
```

Press `Ctrl + C` to stop watching the log file. This does not stop the bot.

### Stop the background bot

```bash
pkill -f "node src/bot.js"
```

---

## API Reference

This bot uses the CODEX-M41NUL All Media Downloader API.

**Base URL**
```
https://all-media-downloader-api.onrender.com
```

**Authentication**

Every request requires an `x-api-key` header.

```
x-api-key: m41nul
```

### 1. Auto Detect Download

Detects the platform automatically from the given URL.

```
GET /api/download?url=<video_link>
```

### 2. TikTok Download

```
GET /api/tiktok?url=<video_link>
```

### 3. Instagram Download

```
GET /api/instagram?url=<video_link>
```

### 4. Facebook Download

```
GET /api/facebook?url=<video_link>
```

### 5. Proxy Video (TikTok only)

TikTok's CDN blocks direct fetches of `video_url` from anywhere other than this API server. Use this endpoint right after calling `/api/tiktok` or `/api/download` for a TikTok link, using the `proxy_token` from that response. The token is single-use and expires shortly after resolving.

```
GET /api/proxy-video?proxy_token=<token>
```

This streams the video file directly as `video/mp4` binary data, not JSON.

---

### Response Format — Facebook / Instagram

```json
{
  "success": true,
  "caption": "full caption text",
  "platform": "facebook",
  "format": "mp4",
  "size": "12.30 MB",
  "duration": "00:45",
  "video_url": "https://direct-video-link",
  "thumbnail_url": "https://thumbnail-link",
  "quality": "best",
  "proxy_token": null
}
```

`video_url` can be fetched directly for these two platforms.

### Response Format — TikTok

```json
{
  "success": true,
  "caption": "full caption text",
  "platform": "tiktok",
  "format": "mp4",
  "size": "1.62 MB",
  "duration": "00:15",
  "video_url": "https://v19-webapp-prime.us.tiktok.com/... (informational only)",
  "thumbnail_url": "https://thumbnail-link",
  "quality": "best",
  "proxy_token": "e262ea1e389042c7bd58e561381c2e09"
}
```

`video_url` is informational only for TikTok. Use `proxy_token` with `/api/proxy-video` to get the actual video bytes.

### Field Reference

| Field | Type | Description |
|---|---|---|
| `success` | boolean | Whether the request was resolved successfully |
| `caption` | string | Original post caption or description |
| `platform` | string | Detected platform: `tiktok`, `instagram`, or `facebook` |
| `format` | string | File format of the media, typically `mp4` |
| `size` | string | Approximate file size |
| `duration` | string | Video duration in `mm:ss` |
| `video_url` | string | Direct video link (informational only for TikTok) |
| `thumbnail_url` | string | Thumbnail image link |
| `quality` | string | Resolved video quality |
| `proxy_token` | string or null | Required for TikTok video byte retrieval, null for other platforms |

---

## Contact Information

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-M41NUL-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/M41NUL)
[![Repository](https://img.shields.io/badge/Repo-amd--whatsapp--bot-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/M41NUL/amd-whatsapp-bot)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Contact-25D366?style=flat-square&logo=whatsapp&logoColor=white)](https://wa.me/8801308850528)
[![Telegram](https://img.shields.io/badge/Telegram-Profile-26A5E4?style=flat-square&logo=telegram&logoColor=white)](https://t.me/mdmainulislaminfo)
[![Telegram Channel](https://img.shields.io/badge/Telegram-Channel-26A5E4?style=flat-square&logo=telegram&logoColor=white)](https://t.me/codexm41nul)
[![Telegram Group](https://img.shields.io/badge/Telegram-Group-26A5E4?style=flat-square&logo=telegram&logoColor=white)](https://t.me/codex_m41nul)
[![Email](https://img.shields.io/badge/Email-Contact-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:devmainulislam@gmail.com)
[![YouTube](https://img.shields.io/badge/YouTube-Subscribe-FF0000?style=flat-square&logo=youtube&logoColor=white)](https://youtube.com/@codexm41nul)

Md. Mainul Islam &nbsp;|&nbsp; CODEX-M41NUL

Copyright 2026 CODEX-M41NUL. All Rights Reserved.

</div>
