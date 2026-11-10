// 把拍拍輸出成 App 圖示與貼圖用的 PNG：執行 `node mascot/export.mjs`，檔案會放在 mascot/export/。
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { POSES, avatar, paipai } from './build.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const here = dirname(fileURLToPath(import.meta.url));
const dir = (...p) => { const d = join(here, 'export', ...p); mkdirSync(d, { recursive: true }); return d; };

const browser = await chromium.launch();
const page = await browser.newPage();
async function png(file, w, h, body, transparent = true) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<body style="margin:0;width:${w}px;height:${h}px;overflow:hidden">${body}</body>`);
  writeFileSync(file, await page.screenshot({ omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } }));
}

// ── App 圖示：正方形滿版、不透明、不自己做圓角（iOS 會自動裁圓角）
const ICONS = { main: '#1a1a2e', 'alt-pink': '#ffd3da' };
for (const [name, bg] of Object.entries(ICONS)) {
  const svg = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 400 400">${avatar(bg, 0)}</svg>`;
  const sizes = name === 'main' ? [1024, 180, 167, 152, 120, 87, 80, 60, 58, 40, 29] : [1024];
  for (const s of sizes) await png(join(dir('app-icon'), `icon-${name}-${s}.png`), s, s, svg(s), false);
}

// ── 貼圖：透明背景、去掉地上的影子、加白色貼紙邊
const noShadow = (s) => s.replace(/<ellipse cx="200" cy="376"[^>]*opacity=".14"\/>/g, '');
const sticker = (inner, vb, W, H, pad) => {
  const [, , vw, vh] = vb.split(' ').map(Number);
  const m = 14; // 預留白邊的空間（以原圖座標計）
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W - pad * 2}" height="${H - pad * 2}" style="position:absolute;left:${pad}px;top:${pad}px" viewBox="${-m} ${-m} ${vw + m * 2} ${vh + m * 2}" preserveAspectRatio="xMidYMid meet">` +
    `<defs><filter id="edge" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="dilate" radius="9"/><feGaussianBlur stdDeviation="1"/><feComponentTransfer><feFuncA type="linear" slope="8"/></feComponentTransfer><feFlood flood-color="#fff"/><feComposite operator="in" in2="SourceGraphic" result="x"/></filter>` +
    `<filter id="rim"><feMorphology in="SourceAlpha" operator="dilate" radius="9"/><feGaussianBlur stdDeviation="1" result="b"/><feComponentTransfer in="b" result="a"><feFuncA type="linear" slope="8"/></feComponentTransfer><feFlood flood-color="#fff"/><feComposite operator="in" in2="a"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>` +
    `<g filter="url(#rim)">${noShadow(inner)}</g></svg>`;
};
const SETS = { line: [370, 320, 10], imessage: [408, 408, 8], universal: [512, 512, 8] };
const ids = Object.keys(POSES);
for (const [set, [W, H, pad]] of Object.entries(SETS)) {
  for (const [i, id] of ids.entries()) {
    const p = POSES[id];
    await png(join(dir('stickers', set), `${String(i + 1).padStart(2, '0')}-${id}.png`), W, H, sticker(p.svg(), p.vb || '0 0 400 400', W, H, pad));
  }
}
// LINE 上架另外要的兩張：主要圖片 240×240、聊天室分頁圖 96×74
await png(join(dir('stickers', 'line'), 'main.png'), 240, 240, sticker(POSES.hello.svg(), '0 0 400 400', 240, 240, 6));
await png(join(dir('stickers', 'line'), 'tab.png'), 96, 74, sticker(`<g transform="translate(-60,-30) scale(1.3)">${paipai({ shadow: false, legs: false, armL: [104, 250], armR: [296, 250] })}</g>`, '0 0 400 400', 96, 74, 2));
await browser.close();
console.log('已輸出到 mascot/export/');
