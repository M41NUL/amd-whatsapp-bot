import { c, bold, dim, clearScreen, sleep, box } from './ui.js';

export const AUTHOR = "Md. Mainul Islam";
export const OWNER = "CODEX-M41NUL";
export const GITHUB = "M41NUL";
export const GITHUB_URL = "https://github.com/M41NUL";

export const WHATSAPP = "+8801308850528";

export const EMAIL = "devmainulislam@gmail.com";

export const YEAR = new Date().getFullYear();
export const COPYRIGHT = `Copyright ${YEAR} CODEX-M41NUL. All Rights Reserved.`;

const BANNER_LINES = [
  " █████╗ ███╗   ███╗██████╗ ",
  "██╔══██╗████╗ ████║██╔══██╗",
  "███████║██╔████╔██║██║  ██║",
  "██╔══██║██║╚██╔╝██║██║  ██║",
  "██║  ██║██║ ╚═╝ ██║██████╔╝",
  "╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝ ",
];

const BANNER_COLORS = ['cyan', 'blue', 'magenta', 'magenta', 'blue', 'cyan'];

export async function printBanner() {
  clearScreen();
  console.log('');
  for (let i = 0; i < BANNER_LINES.length; i++) {
    console.log('  ' + c(BANNER_LINES[i], BANNER_COLORS[i]));
    await sleep(50);
  }
  console.log('');
  console.log(box(
    [
      bold(c('AMD - All Media Downloader Bot', 'white')),
      c(`Owner: ${OWNER}`, 'green'),
    ],
    'cyan'
  ));
}

export function printSupportedPlatforms() {
  console.log('');
  console.log(box(
    [
      bold(c('Supported Platforms', 'yellow')),
      '__DIVIDER__',
      c('1.', 'yellow') + ' TikTok',
      c('2.', 'yellow') + ' Instagram',
      c('3.', 'yellow') + ' Facebook',
    ],
    'yellow'
  ));
}

export function printDevInfo() {
  console.log('');
  console.log(box(
    [
      bold(c('Developer Information', 'magenta')),
      '__DIVIDER__',
      `${dim('Author')}    ${c(AUTHOR, 'white')}`,
      `${dim('Owner')}     ${c(OWNER, 'white')}`,
      `${dim('GitHub')}    ${c(GITHUB, 'cyan')}`,
      `${dim('WhatsApp')}  ${c(WHATSAPP, 'green')}`,
      `${dim('Email')}     ${c(EMAIL, 'green')}`,
      '__DIVIDER__',
      dim(COPYRIGHT),
    ],
    'magenta'
  ));
}
