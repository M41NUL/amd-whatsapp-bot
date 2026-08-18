<div align="center">

# AMD - All Media Downloader Bot

WhatsApp bot for downloading TikTok, Instagram, and Facebook videos.

[![Owner](https://img.shields.io/badge/Owner-CODEX--M41NUL-black?style=for-the-badge)](https://github.com/M41NUL)
[![Author](https://img.shields.io/badge/Author-Md.%20Mainul%20Islam-black?style=for-the-badge)](https://github.com/M41NUL)
[![Platform](https://img.shields.io/badge/Platform-WhatsApp-black?style=for-the-badge&logo=whatsapp&logoColor=white)](#)
[![Runtime](https://img.shields.io/badge/Runtime-Node.js-black?style=for-the-badge&logo=node.js&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-MIT-black?style=for-the-badge)](#)

[![GitHub](https://img.shields.io/badge/GitHub-M41NUL-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/M41NUL)
[![Telegram Channel](https://img.shields.io/badge/Telegram-Channel-26A5E4?style=flat-square&logo=telegram&logoColor=white)](https://t.me/codexm41nul)
[![Telegram Group](https://img.shields.io/badge/Telegram-Group-26A5E4?style=flat-square&logo=telegram&logoColor=white)](https://t.me/codex_m41nul)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Contact-25D366?style=flat-square&logo=whatsapp&logoColor=white)](https://wa.me/8801308850528)
[![Email](https://img.shields.io/badge/Email-Contact-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:devmainulislam@gmail.com)
[![YouTube](https://img.shields.io/badge/YouTube-Subscribe-FF0000?style=flat-square&logo=youtube&logoColor=white)](https://youtube.com/@codexm41nul)

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

Once connected, send any TikTok, Instagram, or Facebook video link to the bot on WhatsApp. The bot will detect the platform, fetch the video through the API, and reply with the video file and caption.

## Project Structure

```
amd-bot/
├── bot.js         Main bot logic and message handling
├── devinfo.js     Banner, menu, and developer information
├── package.json   Dependencies and project metadata
└── session/       Auth session data, created after first login
```

## API Reference

This bot uses the CODEX-M41NUL All Media Downloader API.

Base URL: `https://all-media-downloader-api.onrender.com`

| Endpoint | Description |
|---|---|
| `/api/download` | Auto-detects platform from URL |
| `/api/tiktok` | TikTok links only |
| `/api/instagram` | Instagram links only |
| `/api/facebook` | Facebook links only |
| `/api/proxy-video` | Streams TikTok video bytes using a proxy token |

---

<div align="center">

## Developer Information

| | |
|---|---|
| **Author** | Md. Mainul Islam |
| **Owner** | CODEX-M41NUL |
| **GitHub** | [M41NUL](https://github.com/M41NUL) |
| **WhatsApp** | [+8801308850528](https://wa.me/8801308850528) |
| **Telegram** | [t.me/mdmainulislaminfo](https://t.me/mdmainulislaminfo) |
| **Telegram Channel** | [t.me/codexm41nul](https://t.me/codexm41nul) |
| **Telegram Group** | [t.me/codex_m41nul](https://t.me/codex_m41nul) |
| **Email** | [devmainulislam@gmail.com](mailto:devmainulislam@gmail.com) |
| **YouTube** | [@codexm41nul](https://youtube.com/@codexm41nul) |

Copyright 2026 CODEX-M41NUL. All Rights Reserved.

</div>
