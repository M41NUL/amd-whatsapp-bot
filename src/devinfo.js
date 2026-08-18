export const AUTHOR = "Md. Mainul Islam";
export const OWNER = "CODEX-M41NUL";
export const GITHUB = "M41NUL";
export const GITHUB_URL = "https://github.com/M41NUL";

export const WHATSAPP = "+8801308850528";

export const TELEGRAM = "t.me/mdmainulislaminfo";
export const TELEGRAM_CHANNEL = "https://t.me/codexm41nul";
export const TELEGRAM_GROUP = "https://t.me/codex_m41nul";

export const EMAIL = "devmainulislam@gmail.com";

export const YOUTUBE = "https://youtube.com/@codexm41nul";

export const YEAR = new Date().getFullYear();
export const COPYRIGHT = `Copyright ${YEAR} CODEX-M41NUL. All Rights Reserved.`;

const BANNER = `
   █████╗ ███╗   ███╗██████╗
  ██╔══██╗████╗ ████║██╔══██╗
  ███████║██╔████╔██║██║  ██║
  ██╔══██║██║╚██╔╝██║██║  ██║
  ██║  ██║██║ ╚═╝ ██║██████╔╝
  ╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝
`;

export function printBanner() {
  console.log(BANNER);
  console.log(`  ${OWNER}`);
  console.log("  All Media Downloader Bot");
  console.log("  --------------------------------------------");
}

export function printDevInfo() {
  console.log("  Developer Information");
  console.log("  --------------------------------------------");
  console.log(`  Author      : ${AUTHOR}`);
  console.log(`  Owner       : ${OWNER}`);
  console.log(`  GitHub      : ${GITHUB} (${GITHUB_URL})`);
  console.log(`  WhatsApp    : ${WHATSAPP}`);
  console.log(`  Email       : ${EMAIL}`);
  console.log("  --------------------------------------------");
  console.log(`  ${COPYRIGHT}`);
  console.log("  --------------------------------------------");
}

export function printSupportedPlatforms() {
  console.log("  Supported Platforms");
  console.log("  --------------------------------------------");
  console.log("  1. TikTok");
  console.log("  2. Instagram");
  console.log("  3. Facebook");
  console.log("  --------------------------------------------");
}
