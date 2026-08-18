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
- Startup banner with tool name, supported platforms, and developer information

## Requirements

- Node.js 18 or higher
- npm
- Termux (for Android) or any Linux/macOS/Windows environment

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

### Step 4: Create a project folder inside Termux home

Do not run this from `/storage/emulated/0/...`. Always use the Termux home directory.

```bash
mkdir -p ~/amd-bot
cd ~/amd-bot
```

### Step 5: Copy the bot files into this folder

Move `bot.js`, `devinfo.js`, and `package.json` into `~/amd-bot`. If the files are in your phone's Download folder:

```bash
cp ~/storage/downloads/bot.js ~/storage/downloads/devinfo.js ~/storage/downloads/package.json ~/amd-bot/
```

### Step 6: Install dependencies

```bash
npm install
```

### Step 7: Run the bot

```bash
node bot.js
```

### Step 8: Choose a login method

On first run, the banner and menu will appear, followed by a login method prompt:

```
1. Pairing Code
2. QR Code
```

**Pairing Code**: Enter your WhatsApp number with country code, no plus sign, e.g. `8801XXXXXXXXX`. A pairing code will be shown. Enter it in WhatsApp under Linked Devices > Link with phone number.

**QR Code**: A QR code will be shown directly in the terminal. Scan it in WhatsApp under Linked Devices.

### Step 9: Session persistence

After a successful login, session data is saved in the `session/` folder. Future runs will connect automatically without asking for a login method again.

To log in again from scratch, delete the `session/` folder and restart the bot.

```bash
rm -rf session
node bot.js
```

---

## Usage

Once connected, send any TikTok, Instagram, or Facebook video link to the bot on WhatsApp. The bot detects the platform, fetches the video through the API, and replies with the video file and caption.

## Command List

| Command | Description |
|---|---|
| `node bot.js` | Start the bot |
| `npm install` | Install all dependencies |
| `rm -rf session` | Clear saved login session |
| `pkg install nodejs git -y` | Install Node.js and git in Termux |
| `termux-setup-storage` | Grant Termux access to phone storage |

## Project Structure

```
amd-bot/
├── bot.js         Main bot logic and message handling
├── devinfo.js     Banner, menu, and developer information
├── package.json   Dependencies and project metadata
└── session/       Auth session data, created after first login
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

| | |
|---|---|
| **Author** | Md. Mainul Islam |
| **Owner** | CODEX-M41NUL |
| **GitHub** | [M41NUL](https://github.com/M41NUL) |
| **Repository** | [amd-whatsapp-bot](https://github.com/M41NUL/amd-whatsapp-bot) |
| **WhatsApp** | [+8801308850528](https://wa.me/8801308850528) |
| **Telegram** | [t.me/mdmainulislaminfo](https://t.me/mdmainulislaminfo) |
| **Telegram Channel** | [t.me/codexm41nul](https://t.me/codexm41nul) |
| **Telegram Group** | [t.me/codex_m41nul](https://t.me/codex_m41nul) |
| **Email** | [devmainulislam@gmail.com](mailto:devmainulislam@gmail.com) |
| **YouTube** | [@codexm41nul](https://youtube.com/@codexm41nul) |

<div align="center">

Copyright 2026 CODEX-M41NUL. All Rights Reserved.

</div>
