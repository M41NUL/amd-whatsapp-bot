import { c, bold, dim, line, sleep, clearScreen } from './ui.js';

export const AUTHOR = "Md. Mainul Islam";
export const OWNER = "CODEX-M41NUL";
export const GITHUB = "M41NUL";
export const GITHUB_URL = "https://github.com/M41NUL";

export const WHATSAPP = "+8801308850528";

export const EMAIL = "devmainulislam@gmail.com";

export const YEAR = new Date().getFullYear();
export const COPYRIGHT = `Copyright ${YEAR} CODEX-M41NUL. All Rights Reserved.`;

const BANNER_LINES = [
  "   █████╗ ███╗   ███╗██████╗ ",
  "  ██╔══██╗████╗ ████║██╔══██╗",
  "  ███████║██╔████╔██║██║  ██║",
  "  ██╔══██║██║╚██╔╝██║██║  ██║",
  "  ██║  ██║██║ ╚═╝ ██║██████╔╝",
  "  ╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝ ",
];

const BANNER_COLORS = ['cyan', 'blue', 'magenta', 'magenta', 'blue', 'cyan'];

export async function printBanner() {
  clearScreen();
  console.log('');
  for (let i = 0; i < BANNER_LINES.length; i++) {
    console.log(c(BANNER_LINES[i], BANNER_COLORS[i]));
    await sleep(60);
  }
  console.log('');
  console.log(bold(c(`  ${OWNER}`, 'green')));
  console.log(c('  All Media Downloader Bot', 'white'));
  line('=', 46, 'cyan');
}

export function printSupportedPlatforms() {
  title('Supported Platforms', 'yellow');
  console.log(c('  1. ', 'yellow') + 'TikTok');
  console.log(c('  2. ', 'yellow') + 'Instagram');
  console.log(c('  3. ', 'yellow') + 'Facebook');
  line('-', 46, 'yellow');
}

export function printDevInfo() {
  title('Developer Information', 'magenta');
  console.log(`  ${dim('Author')}      : ${c(AUTHOR, 'white')}`);
  console.log(`  ${dim('Owner')}       : ${c(OWNER, 'white')}`);
  console.log(`  ${dim('GitHub')}      : ${c(GITHUB, 'cyan')} ${dim(`(${GITHUB_URL})`)}`);
  console.log(`  ${dim('WhatsApp')}    : ${c(WHATSAPP, 'green')}`);
  console.log(`  ${dim('Email')}       : ${c(EMAIL, 'green')}`);
  line('-', 46, 'magenta');
  console.log(dim(`  ${COPYRIGHT}`));
  line('-', 46, 'magenta');
}

function title(text, color) {
  console.log('');
  console.log(c(`  ${text}`, color));
  line('-', 46, color);
}
