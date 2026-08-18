import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import qrcode from 'qrcode-terminal';
import { printBanner, printDevInfo, printSupportedPlatforms } from './devinfo.js';

const API_BASE = 'https://all-media-downloader-api.onrender.com';
const API_KEY = 'm41nul';

const authDir = path.join(process.cwd(), 'session');

if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function detectPlatform(url) {
  if (/tiktok\.com/i.test(url)) return 'tiktok';
  if (/instagram\.com/i.test(url)) return 'instagram';
  if (/facebook\.com|fb\.watch/i.test(url)) return 'facebook';
  return null;
}

function extractUrl(text) {
  const match = text.match(/https?:\/\/[^\s]+/i);
  return match ? match[0] : null;
}

async function fetchMediaInfo(url) {
  const platform = detectPlatform(url);
  const endpoint = platform ? `/api/${platform}` : '/api/download';

  const res = await fetch(`${API_BASE}${endpoint}?url=${encodeURIComponent(url)}`, {
    headers: { 'x-api-key': API_KEY },
  });

  if (!res.ok) {
    throw new Error(`API status ${res.status}`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

async function fetchProxyVideo(proxyToken) {
  const res = await fetch(`${API_BASE}/api/proxy-video?proxy_token=${proxyToken}`, {
    headers: { 'x-api-key': API_KEY },
  });
  if (!res.ok) {
    throw new Error(`Proxy video fetch status ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function fetchDirectVideo(videoUrl) {
  const res = await fetch(videoUrl);
  if (!res.ok) {
    throw new Error(`Direct video fetch status ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function selectLoginMethod() {
  console.log("  Login Method");
  console.log("  --------------------------------------------");
  console.log("  1. Pairing Code");
  console.log("  2. QR Code");
  console.log("  --------------------------------------------");
  const choice = await ask("  Select an option (1 or 2): ");
  return choice.trim() === "2" ? "qr" : "pairing";
}

async function startBot() {
  const isFreshLogin = fs.readdirSync(authDir).filter(f => f.endsWith('.json')).length === 0;
  let loginMethod = "pairing";

  if (isFreshLogin) {
    printBanner();
    printSupportedPlatforms();
    printDevInfo();
    loginMethod = await selectLoginMethod();
  }

  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && isFreshLogin && loginMethod === "qr") {
      console.log("Scan the QR code below using WhatsApp > Linked Devices.");
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log('Connected');
      console.log(`User: ${sock.user?.id || 'Unknown'}`);
    } else if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log('Reconnecting');
        startBot();
      } else {
        console.log('Logged out. Delete session folder and restart.');
        process.exit(0);
      }
    }
  });

  if (isFreshLogin && loginMethod === "pairing" && !sock.authState.creds.registered) {
    let phoneNumber = await ask('Enter WhatsApp number with country code, no plus sign: ');
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (phoneNumber.length < 8) {
      console.log('Invalid number.');
      rl.close();
      process.exit(1);
    }

    try {
      const code = await sock.requestPairingCode(phoneNumber);
      console.log(`Pairing code: ${code}`);
    } catch (err) {
      console.log('Failed to get pairing code:', err.message || err);
      rl.close();
      process.exit(1);
    }
    rl.close();
  } else if (isFreshLogin && loginMethod === "qr") {
    rl.close();
  }

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const jid = msg.key.remoteJid;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      '';

    if (!text) return;

    const url = extractUrl(text);
    if (!url) return;

    const platform = detectPlatform(url);
    if (!platform) return;

    try {
      await sock.sendMessage(jid, { text: 'Downloading, please wait.' }, { quoted: msg });

      const data = await fetchMediaInfo(url);

      let videoBuffer;
      if (platform === 'tiktok' && data.proxy_token) {
        videoBuffer = await fetchProxyVideo(data.proxy_token);
      } else {
        videoBuffer = await fetchDirectVideo(data.video_url);
      }

      const captionText = [
        data.caption ? data.caption : '',
        '',
        `Platform: ${data.platform}`,
        `Size: ${data.size || 'N/A'}`,
        `Duration: ${data.duration || 'N/A'}`,
      ].join('\n').trim();

      await sock.sendMessage(
        jid,
        {
          video: videoBuffer,
          caption: captionText,
          mimetype: 'video/mp4',
        },
        { quoted: msg }
      );

      console.log(`Sent: ${platform} to ${jid}`);
    } catch (err) {
      console.log(`Error (${platform}):`, err.message || err);
      await sock.sendMessage(
        jid,
        { text: `Download failed. Reason: ${err.message || 'Unknown error'}` },
        { quoted: msg }
      );
    }
  });
}

startBot().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
