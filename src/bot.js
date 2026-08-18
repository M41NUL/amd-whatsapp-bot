import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { exec } from 'child_process';
import qrcode from 'qrcode-terminal';
import { printBanner, printDevInfo, printSupportedPlatforms } from './devinfo.js';
import { c, bold, dim, clearScreen, spinner, box, printBox } from './ui.js';
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

let wakeLockEnabled = false;
function enableWakeLock() {
  if (wakeLockEnabled) return;
  exec('termux-wake-lock', (err) => {
    if (!err) {
      wakeLockEnabled = true;
    }
  });
}

function disableWakeLock() {
  if (!wakeLockEnabled) return;
  exec('termux-wake-unlock', () => {});
  wakeLockEnabled = false;
}

const seenUsers = new Set();

let downloadCount = 0;
let currentSock = null;
let menuActive = false;
let reconnecting = false;
let hasConnectedBefore = false;

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
  printBox(
    [
      bold(c('Login Method', 'yellow')),
      '__DIVIDER__',
      c('1.', 'yellow') + ' Pairing Code',
      c('2.', 'yellow') + ' QR Code',
    ],
    'yellow'
  );
  const choice = await ask('\n' + c('  Select an option (1 or 2): ', 'green'));
  return choice.trim() === '2' ? 'qr' : 'pairing';
}

function renderMainMenu() {
  return box(
    [
      bold(c('AMD Control Menu', 'cyan')),
      '__DIVIDER__',
      c('1.', 'cyan') + ' View Bot Status',
      c('2.', 'cyan') + ' View Download Logs',
      c('3.', 'cyan') + ' Clear Download Logs',
      c('4.', 'cyan') + ' Reconnect Bot',
      c('0.', 'cyan') + ' Disconnect and Exit',
    ],
    'cyan'
  );
}

function printStatus() {
  console.log('');
  printBox(
    [
      bold(c('Bot Status', 'green')),
      '__DIVIDER__',
      `${dim('Connection')}  ${c('Online', 'green')}`,
      `${dim('Account')}     ${currentSock?.user?.id || 'Unknown'}`,
      `${dim('Downloads')}   ${downloadCount}`,
    ],
    'green'
  );
}

function printLogs() {
  const logs = getLogs();
  console.log('');
  if (logs.length === 0) {
    printBox([bold(c('Download Logs', 'blue')), '__DIVIDER__', dim('No downloads yet.')], 'blue');
    return;
  }
  const lines = [bold(c('Download Logs', 'blue')), '__DIVIDER__'];
  logs.slice(0, 15).forEach((entry, i) => {
    lines.push(`${i + 1}. [${entry.time}] ${entry.platform} - ${entry.status}`);
  });
  printBox(lines, 'blue');
}

async function runMenuLoop() {
  if (menuActive) return;
  menuActive = true;

  while (true) {
    console.log('');
    console.log(renderMainMenu());
    const choice = (await ask('\n' + c('  Select an option: ', 'green'))).trim();

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
      disableWakeLock();
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
    clearScreen();
  }

  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
  });

  currentSock = sock;
  reconnecting = false;

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && isFreshLogin && loginMethod === 'qr') {
      console.log(c('  Scan the QR code below using WhatsApp > Linked Devices.', 'yellow'));
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      await spinner('Establishing secure connection', 600);
      clearScreen();
      console.log('');
      printBox(
        [
          bold(c('Connected Successfully', 'green')),
          '__DIVIDER__',
          `Account  ${sock.user?.id || 'Unknown'}`,
        ],
        'green'
      );
      hasConnectedBefore = true;
      enableWakeLock();
      runMenuLoop();
    } else if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        if (!reconnecting) {
          reconnecting = true;
          menuActive = false;
          console.log('');
          console.log(c('  Connection lost. Reconnecting...', 'yellow'));
          startBot();
        }
      } else {
        console.log('');
        console.log(c('  Session ended. Delete the session folder to log in again.', 'red'));
        disableWakeLock();
        process.exit(0);
      }
    }
  });

  if (isFreshLogin && loginMethod === 'pairing' && !sock.authState.creds.registered) {
    printBox([bold(c('Pairing Code Login', 'cyan')), '__DIVIDER__', dim('Example: 8801XXXXXXXXX')], 'cyan');
    let phoneNumber = await ask('\n' + c('  Enter WhatsApp number: ', 'green'));
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (phoneNumber.length < 8) {
      console.log(c('  Invalid number.', 'red'));
      rl.close();
      process.exit(1);
    }

    try {
      const code = await sock.requestPairingCode(phoneNumber);
      clearScreen();
      console.log('');
      printBox(
        [
          bold(c('Pairing Code', 'cyan')),
          '__DIVIDER__',
          bold(c(code, 'white')),
          '',
          dim('Enter this code in WhatsApp:'),
          dim('Linked Devices > Link with phone number'),
        ],
        'cyan'
      );
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
