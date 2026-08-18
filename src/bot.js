import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { exec } from 'child_process';
import qrcode from 'qrcode-terminal';
import { printBanner, printDevInfo, printSupportedPlatforms } from './devinfo.js';
import { c, bold, dim, line, spinner, clearScreen } from './ui.js';
import { addLog, getLogs, clearLogs } from './logger.js';

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

function enableWakeLock() {
  exec('termux-wake-lock', (err) => {
    if (!err) {
      console.log(c('  Termux wake lock enabled. Bot will keep running in the background.', 'green'));
    }
  });
}

const seenUsers = new Set();

let downloadCount = 0;
let currentSock = null;
let menuActive = false;

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
  console.log('');
  console.log(c('  Login Method', 'yellow'));
  line('-', 46, 'yellow');
  console.log('  1. Pairing Code');
  console.log('  2. QR Code');
  line('-', 46, 'yellow');
  const choice = await ask(c('  Select an option (1 or 2): ', 'green'));
  return choice.trim() === '2' ? 'qr' : 'pairing';
}

function printMainMenu() {
  console.log('');
  line('=', 46, 'cyan');
  console.log(bold(c('  AMD Control Menu', 'cyan')));
  line('=', 46, 'cyan');
  console.log('  1. View Bot Status');
  console.log('  2. View Download Logs');
  console.log('  3. Clear Download Logs');
  console.log('  4. Reconnect Bot');
  console.log('  0. Disconnect and Exit');
  line('-', 46, 'cyan');
}

function printStatus() {
  console.log('');
  console.log(c('  Bot Status', 'green'));
  line('-', 46, 'green');
  console.log(`  Connection   : ${c('Online', 'green')}`);
  console.log(`  Account      : ${currentSock?.user?.id || 'Unknown'}`);
  console.log(`  Downloads    : ${downloadCount}`);
  line('-', 46, 'green');
}

function printLogs() {
  const logs = getLogs();
  console.log('');
  console.log(c('  Download Logs', 'blue'));
  line('-', 46, 'blue');
  if (logs.length === 0) {
    console.log(dim('  No downloads yet.'));
  } else {
    logs.forEach((entry, i) => {
      console.log(`  ${i + 1}. [${entry.time}] ${entry.platform} - ${entry.status} - ${entry.user}`);
    });
  }
  line('-', 46, 'blue');
}

async function runMenuLoop() {
  if (menuActive) return;
  menuActive = true;

  while (true) {
    printMainMenu();
    const choice = (await ask(c('  Select an option: ', 'green'))).trim();

    if (choice === '1') {
      printStatus();
    } else if (choice === '2') {
      printLogs();
    } else if (choice === '3') {
      clearLogs();
      console.log(c('  Logs cleared.', 'yellow'));
    } else if (choice === '4') {
      console.log(c('  Reconnecting bot...', 'yellow'));
      menuActive = false;
      if (currentSock) {
        try {
          currentSock.end(undefined);
        } catch (e) {}
      }
      return;
    } else if (choice === '0') {
      console.log(c('  Disconnecting...', 'red'));
      if (currentSock) {
        try {
          await currentSock.logout();
        } catch (e) {}
      }
      exec('termux-wake-unlock', () => {});
      console.log(c('  Bot disconnected. Goodbye.', 'red'));
      process.exit(0);
    } else {
      console.log(c('  Invalid option. Choose 0-4.', 'red'));
    }
  }
}

async function startBot() {
  const isFreshLogin = fs.readdirSync(authDir).filter(f => f.endsWith('.json')).length === 0;
  let loginMethod = 'pairing';

  if (isFreshLogin) {
    await printBanner();
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

  currentSock = sock;

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && isFreshLogin && loginMethod === 'qr') {
      console.log(c('  Scan the QR code below using WhatsApp > Linked Devices.', 'yellow'));
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      await spinner('Establishing secure connection', 700);
      console.log('');
      line('=', 46, 'green');
      console.log(bold(c('  Connected Successfully', 'green')));
      console.log(`  Account : ${c(sock.user?.id || 'Unknown', 'white')}`);
      line('=', 46, 'green');
      enableWakeLock();
      runMenuLoop();
    } else if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log('');
        console.log(c('  Connection lost. Reconnecting...', 'yellow'));
        startBot();
      } else {
        console.log('');
        console.log(c('  Session ended. Delete the session folder to log in again.', 'red'));
        process.exit(0);
      }
    }
  });

  if (isFreshLogin && loginMethod === 'pairing' && !sock.authState.creds.registered) {
    console.log(dim('  Example: 8801XXXXXXXXX'));
    let phoneNumber = await ask(c('  Enter WhatsApp number with country code, no plus sign: ', 'green'));
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (phoneNumber.length < 8) {
      console.log(c('  Invalid number.', 'red'));
      rl.close();
      process.exit(1);
    }

    try {
      const code = await sock.requestPairingCode(phoneNumber);
      console.log('');
      console.log(c(`  Pairing Code: ${bold(code)}`, 'cyan'));
      console.log(dim('  Enter this code in WhatsApp > Linked Devices > Link with phone number.'));
    } catch (err) {
      console.log(c('  Failed to get pairing code:', 'red'), err.message || err);
      rl.close();
      process.exit(1);
    }
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

    if (!url) {
      if (!seenUsers.has(jid)) {
        seenUsers.add(jid);
        await sock.sendMessage(
          jid,
          {
            text:
              `Welcome to AMD - All Media Downloader Bot.\n\n` +
              `Send a TikTok, Instagram, or Facebook video link and I will download it for you.`,
          },
          { quoted: msg }
        );
      } else {
        await sock.sendMessage(
          jid,
          { text: 'Please send a video link only.' },
          { quoted: msg }
        );
      }
      return;
    }

    seenUsers.add(jid);

    const platform = detectPlatform(url);
    if (!platform) {
      await sock.sendMessage(
        jid,
        { text: 'This link is not supported. Send a TikTok, Instagram, or Facebook video link.' },
        { quoted: msg }
      );
      return;
    }

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
        data.caption ? `Caption: ${data.caption}` : '',
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

      downloadCount++;
      addLog({ platform, status: 'Success', user: jid });
      console.log(c(`  Sent: ${platform} to ${jid}`, 'green'));
    } catch (err) {
      addLog({ platform, status: 'Failed', user: jid });
      console.log(c(`  Error (${platform}): ${err.message || err}`, 'red'));
      await sock.sendMessage(
        jid,
        { text: `Download failed. Reason: ${err.message || 'Unknown error'}` },
        { quoted: msg }
      );
    }
  });
}

startBot().catch((err) => {
  console.error(c('Startup failed:', 'red'), err);
  process.exit(1);
});
