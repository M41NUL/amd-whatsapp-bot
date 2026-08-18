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

export function line(char = '-', length = 46, color = 'cyan') {
  console.log(c(char.repeat(length), color));
}

export function title(text, color = 'cyan') {
  console.log('');
  console.log(c(`  ${text}`, color) + bold(''));
  line('-', 46, color);
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function typeEffect(text, delayMs = 12, color = 'green') {
  for (const ch of text) {
    process.stdout.write(c(ch, color));
    await sleep(delayMs);
  }
  process.stdout.write('\n');
}

export async function spinner(label, durationMs = 900) {
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

export function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[0f');
}

export { colors };
