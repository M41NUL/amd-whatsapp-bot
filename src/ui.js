const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
};

export function c(text, color) {
  return `${colors[color] || ''}${text}${colors.reset}`;
}

export function bold(text) {
  return `${colors.bold}${text}${colors.reset}`;
}

export function dim(text) {
  return `${colors.dim}${text}${colors.reset}`;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[3J\x1b[H\x1bc');
}

const BOX = {
  tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│',
};

const termWidth = () => Math.min(process.stdout.columns || 60, 60);

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

export function box(lines, color = 'cyan', width = null) {
  const w = width || termWidth();
  const innerWidth = w - 2;
  const out = [];

  out.push(c(BOX.tl + BOX.h.repeat(innerWidth) + BOX.tr, color));

  for (const raw of lines) {
    if (raw === null) {
      out.push(c(BOX.v, color) + ' '.repeat(innerWidth) + c(BOX.v, color));
      continue;
    }
    if (raw === '__DIVIDER__') {
      out.push(c(BOX.v, color) + c(BOX.h.repeat(innerWidth), color) + c(BOX.v, color));
      continue;
    }
    const visibleLen = stripAnsi(raw).length;
    const padding = Math.max(innerWidth - visibleLen - 1, 0);
    out.push(c(BOX.v, color) + ' ' + raw + ' '.repeat(padding) + c(BOX.v, color));
  }

  out.push(c(BOX.bl + BOX.h.repeat(innerWidth) + BOX.br, color));
  return out.join('\n');
}

export function printBox(lines, color = 'cyan', width = null) {
  console.log(box(lines, color, width));
}

export async function typeLines(lines, delayMs = 40) {
  for (const l of lines) {
    console.log(l);
    await sleep(delayMs);
  }
}

export async function spinner(label, durationMs = 700) {
  const frames = ['|', '/', '-', '\\'];
  const start = Date.now();
  let i = 0;
  process.stdout.write('\n');
  while (Date.now() - start < durationMs) {
    process.stdout.write(`\r  ${c(frames[i % frames.length], 'cyan')} ${label}`);
    i++;
    await sleep(80);
  }
  process.stdout.write(`\r  ${c('OK', 'green')} ${label}\n`);
}

export { colors };
