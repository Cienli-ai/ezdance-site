// 拍拍（PaiPai）吉祥物產生器：執行 `node mascot/build.mjs` 會重畫 mascot/svg/ 內所有圖檔。
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'svg');
mkdirSync(out, { recursive: true });

export const PALETTES = {
  coral: { body: '#e94560', shade: '#c9304b', belly: '#ffd3da', blush: '#ff9fb0', ink: '#1a1a2e', shoe: '#ffffff', stripe: '#4fd8c8' },
  mint:  { body: '#4fd8c8', shade: '#2fb5a6', belly: '#d9fbf5', blush: '#a8f0e6', ink: '#1a1a2e', shoe: '#ffffff', stripe: '#e94560' },
};
const SPARK = '#ffc94d';
const OUT = 7; // 外框線粗細

const BODY = 'M200,86 C236,86 258,112 274,146 C292,184 312,214 324,246 C340,290 314,320 266,320 L134,320 C86,320 60,290 76,246 C88,214 108,184 126,146 C142,112 164,86 200,86 Z';

// 有外框的粗線（手、腳、頭上的循環捲毛都用這招）
const limb = (d, w, fill, ink) =>
  `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${w + OUT * 2}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

const arm = (side, [hx, hy], p, bend = 0) => {
  const sx = side === 'L' ? 104 : 296, sy = 238;
  const mx = (sx + hx) / 2 + (side === 'L' ? -bend : bend), my = (sy + hy) / 2 + Math.abs(bend) * 0.4;
  return limb(`M${sx},${sy} Q${mx},${my} ${hx},${hy}`, 24, p.body, p.ink);
};

const shoe = (x, y, dir, p, rot = 0) =>
  `<g transform="translate(${x},${y}) rotate(${rot}) scale(${dir},1)">` +
  `<path d="M-17,-9 h12 c20,0 37,7 37,19 c0,7 -4,10 -10,10 h-35 c-7,0 -11,-4 -11,-11 v-11 c0,-5 3,-7 7,-7 Z" fill="${p.shoe}" stroke="${p.ink}" stroke-width="${OUT}" stroke-linejoin="round"/>` +
  `<path d="M-1,-6 l6,14" stroke="${p.stripe}" stroke-width="6" stroke-linecap="round"/>` +
  `<path d="M-20,13 h50" stroke="${p.ink}" stroke-width="5" stroke-linecap="round"/></g>`;

const leg = (side, [fx, fy], p, rot = 0) => {
  const hx = side === 'L' ? 166 : 234;
  return limb(`M${hx},306 L${fx},${fy - 6}`, 18, p.shade, p.ink) + shoe(fx, fy, side === 'L' ? -1 : 1, p, rot);
};

const eyeOpen = (x, y, ink) =>
  `<ellipse cx="${x}" cy="${y}" rx="11" ry="14.5" fill="${ink}"/><circle cx="${x + 4}" cy="${y - 5}" r="4.4" fill="#fff"/><circle cx="${x - 4}" cy="${y + 6}" r="2" fill="#fff" opacity=".7"/>`;
const eyeArc = (x, y, ink, up = true) =>
  `<path d="M${x - 12},${y + (up ? 5 : -3)} Q${x},${y + (up ? -12 : 10)} ${x + 12},${y + (up ? 5 : -3)}" fill="none" stroke="${ink}" stroke-width="6.5" stroke-linecap="round"/>`;
const eyeHalf = (x, y, ink) =>
  `<path d="M${x - 12},${y - 2} h24 a12,13 0 0 1 -24,0 Z" fill="${ink}"/><path d="M${x - 14},${y - 3} h28" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`;
const eyeLine = (x, y, ink) => `<path d="M${x - 11},${y} h22" stroke="${ink}" stroke-width="6.5" stroke-linecap="round"/>`;

const FACES = {
  happy: (p) => eyeOpen(168, 200, p.ink) + eyeOpen(232, 200, p.ink) +
    `<path d="M188,222 Q200,236 212,222" fill="none" stroke="${p.ink}" stroke-width="6" stroke-linecap="round"/>`,
  cheer: (p) => eyeArc(168, 200, p.ink) + eyeArc(232, 200, p.ink) +
    `<path d="M184,218 h32 a16,18 0 0 1 -32,0 Z" fill="${p.ink}" stroke="${p.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M191,231 a10,7 0 0 1 18,0 a14,12 0 0 1 -18,0 Z" fill="#ff7a8f"/>`,
  wink: (p) => eyeOpen(168, 200, p.ink) + eyeArc(232, 200, p.ink) +
    `<path d="M186,220 Q200,238 214,220" fill="none" stroke="${p.ink}" stroke-width="6" stroke-linecap="round"/>`,
  slow: (p) => eyeHalf(168, 200, p.ink) + eyeHalf(232, 200, p.ink) +
    `<ellipse cx="200" cy="228" rx="6" ry="7" fill="${p.ink}"/>`,
  focus: (p) => eyeOpen(168, 202, p.ink) + eyeOpen(232, 202, p.ink) +
    `<path d="M152,180 l26,7 M248,180 l-26,7" stroke="${p.ink}" stroke-width="6" stroke-linecap="round"/>` +
    `<path d="M190,228 h20" stroke="${p.ink}" stroke-width="6" stroke-linecap="round"/>`,
  care: (p) => eyeOpen(168, 202, p.ink) + eyeOpen(232, 202, p.ink) +
    `<path d="M152,184 l24,-6 M248,184 l-24,-6" stroke="${p.ink}" stroke-width="5.5" stroke-linecap="round"/>` +
    `<path d="M190,226 Q200,233 210,226" fill="none" stroke="${p.ink}" stroke-width="6" stroke-linecap="round"/>`,
  rest: (p) => eyeArc(168, 202, p.ink, false) + eyeArc(232, 202, p.ink, false) +
    `<path d="M189,222 Q200,232 211,222" fill="none" stroke="${p.ink}" stroke-width="6" stroke-linecap="round"/>`,
  oops: (p) => eyeLine(168, 202, p.ink) + eyeLine(232, 202, p.ink) +
    `<path d="M188,228 q6,-7 12,0 t12,0" fill="none" stroke="${p.ink}" stroke-width="5.5" stroke-linecap="round"/>`,
};

const star = (x, y, s, c = SPARK) =>
  `<path transform="translate(${x},${y}) scale(${s})" d="M0,-14 C2,-4 4,-2 14,0 C4,2 2,4 0,14 C-2,4 -4,2 -14,0 C-4,-2 -2,-4 0,-14 Z" fill="${c}"/>`;

/** 畫一隻拍拍。回傳 <g>，座標以 400×400 畫布為準。 */
export function paipai(o = {}) {
  const p = PALETTES[o.palette || 'coral'];
  const { face = 'happy', armL = [62, 288], armR = [338, 288], bendL = 0, bendR = 0,
    footL = [160, 352], footR = [240, 352], rotL = 0, rotR = 0, tilt = 0, lift = 0, squash = 1, shadow = true, legs = true, extra = '', back = '' } = o;
  const curl = 'M200,90 C198,58 224,36 244,50 C262,63 248,88 230,82 C219,78 218,66 226,61';
  const top =
    arm('L', armL, p, bendL) + arm('R', armR, p, bendR) +
    limb(curl, 9, p.body, p.ink) +
    `<path d="${BODY}" fill="${p.body}" stroke="${p.ink}" stroke-width="${OUT}" stroke-linejoin="round"/>` +
    `<path d="M106,250 C92,284 104,306 134,308 L190,308 C140,300 112,280 106,250 Z" fill="${p.shade}" opacity=".55"/>` +
    `<ellipse cx="200" cy="274" rx="50" ry="27" fill="${p.belly}"/>` +
    `<path d="M178,262 l-10,16 M194,258 l-8,13" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"/>` +
    `<path d="M150,128 C160,112 172,104 184,101" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".45"/>` +
    `<ellipse cx="143" cy="222" rx="13" ry="8.5" fill="${p.blush}"/><ellipse cx="257" cy="222" rx="13" ry="8.5" fill="${p.blush}"/>` +
    FACES[face](p) + extra;
  const sw = 92 - lift * 0.9;
  return `<g>` +
    (shadow ? `<ellipse cx="200" cy="376" rx="${sw}" ry="${9 - lift * 0.08}" fill="#1a1a2e" opacity=".14"/>` : '') +
    back +
    `<g transform="translate(0,${-lift})">` +
    (legs ? leg('L', footL, p, rotL) + leg('R', footR, p, rotR) : '') +
    `<g transform="rotate(${tilt},200,320) translate(200,320) scale(${2 - squash},${squash}) translate(-200,-320)">${top}</g>` +
    `</g></g>`;
}

const wrap = (inner, vb = '0 0 400 400', title = '拍拍 PaiPai') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${title}"><title>${title}</title>${inner}</svg>\n`;

const badge = (x, y, text, bg, fg = '#fff', w = 78) =>
  `<g transform="translate(${x},${y})"><rect x="${-w / 2}" y="-19" width="${w}" height="38" rx="19" fill="${bg}" stroke="#1a1a2e" stroke-width="5"/>` +
  `<text x="0" y="8" text-anchor="middle" font-family="'Baloo 2','Nunito','PingFang TC',system-ui,sans-serif" font-weight="800" font-size="22" fill="${fg}">${text}</text></g>`;

export const POSES = {
  hello: { name: '嗨！開練', when: '開啟 App、空白練習庫', svg: () =>
    paipai({ face: 'happy', armL: [72, 292], armR: [338, 176], bendR: 10, tilt: 3 }) +
    `<path d="M352,148 q10,-6 16,-18 M366,172 q12,-2 22,-10" fill="none" stroke="${SPARK}" stroke-width="6" stroke-linecap="round"/>` },

  cheer: { name: '跳得好！', when: '完成練習、連續打卡、戰報發布', svg: () =>
    paipai({ face: 'cheer', armL: [58, 168], armR: [342, 168], bendL: 8, bendR: 8, lift: 26,
      footL: [148, 346], footR: [252, 346], rotL: 18, rotR: -18 }) +
    star(52, 96, 1.5) + star(350, 78, 1.1) + star(368, 250, 0.8, '#4fd8c8') + star(36, 236, 0.8, '#4fd8c8') },

  mirror: { name: '鏡像模式', when: '打開鏡像翻轉時', vb: '0 0 640 400', svg: () =>
    `<g transform="translate(-30,0)">${paipai({ face: 'wink', armL: [60, 180], armR: [336, 300], bendL: 8, tilt: -5, footL: [150, 352], footR: [246, 352] })}</g>` +
    `<g transform="translate(670,0) scale(-1,1)">${paipai({ palette: 'mint', face: 'wink', armL: [60, 180], armR: [336, 300], bendL: 8, tilt: -5, footL: [150, 352], footR: [246, 352] })}</g>` +
    `<path d="M320,40 V384" stroke="#1a1a2e" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 16" opacity=".55"/>` },

  slow: { name: '慢慢來', when: '0.25×–0.75× 慢速練習', svg: () => {
    const ghost = (dx, op) => `<g transform="translate(${dx},0)" opacity="${op}">${paipai({ face: 'slow', armL: [52, 232], armR: [348, 232], shadow: false, tilt: -4 })}</g>`;
    return ghost(-44, 0.16) + ghost(-22, 0.3) +
      paipai({ face: 'slow', armL: [52, 232], armR: [348, 232], tilt: -4 }) + badge(336, 70, '0.5×', '#4fd8c8', '#1a1a2e'); } },

  loop: { name: '再一次！', when: 'A-B 循環重播難段', svg: () =>
    paipai({ face: 'focus', armL: [64, 196], armR: [344, 262], bendR: -6, tilt: 6, footL: [152, 352], footR: [250, 350], rotR: -10 }) +
    `<g transform="translate(74,92)" fill="none" stroke="#4fd8c8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M-30,4 A30,30 0 0 1 22,-20"/><path d="M24,-38 v20 h-20"/><path d="M30,-4 A30,30 0 0 1 -22,20"/><path d="M-24,38 v-20 h20"/></g>` +
    badge(52, 262, 'A', '#fff', '#1a1a2e', 44) + badge(352, 150, 'B', '#fff', '#1a1a2e', 44) },

  rec: { name: '開拍囉', when: '錄影倒數、錄影中', svg: () =>
    `<path d="M40,84 V44 H80 M320,44 H360 V84 M360,316 V356 H320 M80,356 H40 V316" fill="none" stroke="#1a1a2e" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>` +
    paipai({ face: 'wink', armL: [70, 300], armR: [338, 186], bendR: 8, tilt: 4 }) +
    `<g transform="translate(86,74)"><circle r="11" fill="#e94560" stroke="#1a1a2e" stroke-width="5"/><text x="20" y="8" font-family="'Baloo 2','Nunito',system-ui,sans-serif" font-weight="800" font-size="22" fill="#1a1a2e">REC</text></g>` },

  pat: { name: '拍拍，沒事', when: '卡關、中斷連續紀錄、放棄錄影', svg: () =>
    paipai({ face: 'care', armL: [76, 294], armR: [352, 214], bendR: -8, tilt: 5 }) +
    `<path d="M366,178 q6,-10 2,-20 M384,196 q10,-6 12,-16" fill="none" stroke="#1a1a2e" stroke-width="6" stroke-linecap="round" opacity=".55"/>` +
    `<path transform="translate(60,120) scale(1.5)" d="M0,6 C-12,-4 -6,-14 0,-7 C6,-14 12,-4 0,6 Z" fill="#e94560" stroke="#1a1a2e" stroke-width="3" stroke-linejoin="round"/>` },

  rest: { name: '喝口水', when: '練太久的休息提醒', svg: () =>
    paipai({ face: 'rest', armL: [86, 300], armR: [314, 300], squash: 0.95,
      footL: [118, 362], footR: [282, 362], rotL: 0, rotR: 0,
      extra: `<path d="M128,150 C150,170 250,170 272,150" fill="none" stroke="#1a1a2e" stroke-width="32" stroke-linecap="round"/><path d="M128,150 C150,170 250,170 272,150" fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round"/>` +
        `<path d="M150,163 C180,171 220,171 250,163" fill="none" stroke="#4fd8c8" stroke-width="5" stroke-linecap="round"/>` }) +
    `<g transform="translate(352,318)"><rect x="-17" y="-34" width="34" height="62" rx="9" fill="#4fd8c8" stroke="#1a1a2e" stroke-width="6"/><rect x="-10" y="-50" width="20" height="16" rx="4" fill="#fff" stroke="#1a1a2e" stroke-width="6"/><path d="M-17,-8 h34" stroke="#1a1a2e" stroke-width="5"/></g>` +
    `<path transform="translate(292,128)" d="M0,-16 C9,-4 12,2 12,8 A12,12 0 0 1 -12,8 C-12,2 -9,-4 0,-16 Z" fill="#9be7ff" stroke="#1a1a2e" stroke-width="5" stroke-linejoin="round"/>` },
};

// App 圖示／頭貼用的大頭版
export const avatar = (bg = '#1a1a2e') =>
  `<rect width="400" height="400" rx="90" fill="${bg}"/>` +
  `<g transform="translate(-60,-30) scale(1.3)">${paipai({ face: 'happy', shadow: false, legs: false, armL: [104, 250], armR: [296, 250] })}</g>`;

const files = {};
for (const [id, pose] of Object.entries(POSES)) files[`paipai-${id}.svg`] = wrap(pose.svg(), pose.vb, `拍拍 PaiPai｜${pose.name}`);
files['paipai-avatar.svg'] = wrap(avatar(), '0 0 400 400', '拍拍 PaiPai 頭像');
files['paipai-main.svg'] = wrap(paipai({ face: 'happy' }), '0 0 400 400');
for (const [name, svg] of Object.entries(files)) writeFileSync(join(out, name), svg);
console.log(`已輸出 ${Object.keys(files).length} 個檔案到 ${out}`);

// ───────── 設計稿頁面（mascot/index.html）─────────
const inline = (inner, vb = '0 0 400 400', cls = '') => `<svg class="${cls}" viewBox="${vb}" role="img" aria-hidden="true">${inner}</svg>`;
const LINES = {
  hello: '嗨，今天想練哪一段？', cheer: '今天的份練完了，辛苦啦！', mirror: '鏡像開好了，跟著我的方向跳。',
  slow: '慢慢來，先把手的角度對好。', loop: '再一次！這八拍快黏住了。', rec: '三、二、一，開拍！',
  pat: '拍拍，卡住很正常。降到 0.5× 再試一次？', rest: '練 40 分鐘了，喝口水再回來。',
};
const poseCards = Object.entries(POSES).map(([id, p]) =>
  `<figure class="pose${p.vb ? ' wide' : ''}"><div class="stage">${inline(p.svg(), p.vb)}</div>` +
  `<figcaption><b>${p.name}</b><span class="when">${p.when}</span><span class="say">「${LINES[id]}」</span></figcaption></figure>`).join('\n');

const swatches = [
  ['珊瑚紅', '#e94560', '身體。沿用 EZDance 現有主色'], ['深夜藍', '#1a1a2e', '外框線、眼睛。沿用現有文字色'],
  ['鏡面薄荷', '#4fd8c8', '鏡中分身、鞋帶、提示小標（新增）'], ['聚光黃', '#ffc94d', '慶祝時的星星（新增）'],
  ['鏡子粉', '#ffd3da', '肚子上的小鏡子'], ['球鞋白', '#ffffff', '球鞋、高光'],
].map(([n, c, d]) => `<li><i style="background:${c}"></i><b>${n}</b><code>${c}</code><span>${d}</span></li>`).join('');

const css = `
/* 版面：左圖右文的角色介紹 → 姿勢牆 → 規格。色彩全部取自 EZDance 既有的珊瑚紅＋深夜藍，另加薄荷與黃 */
:root{--bg:#fafafc;--surface:#ffffff;--stage:#f3f1f6;--ink:#1a1a2e;--muted:#5c5c72;--line:#e6e4ee;--coral:#e94560;--coral-text:#c9304b;--mint:#4fd8c8;--mint-text:#12776c;--sun:#ffc94d;
--display:"Baloo 2","PingFang TC","Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif;--body:-apple-system,BlinkMacSystemFont,"PingFang TC","Noto Sans TC","Microsoft JhengHei","Segoe UI",sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#14142a;--surface:#1f1f3a;--stage:#34345a;--ink:#f4f2fa;--muted:#b3b1c8;--line:#34345a;--coral-text:#ff8097;--mint-text:#6fe6d8;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#14142a;--surface:#1f1f3a;--stage:#34345a;--ink:#f4f2fa;--muted:#b3b1c8;--line:#34345a;--coral-text:#ff8097;--mint-text:#6fe6d8;color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--body);font-size:16px;line-height:1.75}
.wrap{max-width:1040px;margin:0 auto;padding-block:40px 80px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));display:flex;flex-direction:column;gap:64px}
h1,h2,h3{font-family:var(--display);line-height:1.2;margin:0;text-wrap:balance}
h1{font-size:clamp(56px,12vw,104px);font-weight:800;letter-spacing:-.01em}
h1 small{display:block;font-size:.3em;font-weight:700;color:var(--coral-text);letter-spacing:.14em}
h2{font-size:30px;font-weight:800}
p{margin:0;max-width:34em}
.eyebrow{font-family:var(--display);font-weight:700;font-size:14px;letter-spacing:.14em;color:var(--coral-text)}
.muted{color:var(--muted)}
section{display:flex;flex-direction:column;gap:20px}
svg{display:block;width:100%;height:auto}
.hero{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:32px;align-items:center}
.hero .stage{border-radius:40px;padding:12px;position:relative}
.stage{background:var(--stage);border-radius:24px}
.hero-copy{display:flex;flex-direction:column;gap:18px;min-width:0}
.lede{font-size:19px}
.puns{display:flex;flex-wrap:wrap;gap:10px;list-style:none;padding:0;margin:0}
.puns li{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:10px 14px;display:flex;flex-direction:column;line-height:1.4;flex:1 1 150px}
.puns b{font-family:var(--display);font-size:20px}
.puns b em{font-style:normal;color:var(--coral-text)}
.puns span{font-size:14px;color:var(--muted)}
.bpm{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:14px;color:var(--muted)}
.bpm button{font:inherit;font-weight:700;color:var(--ink);background:var(--surface);border:2px solid var(--line);border-radius:999px;padding:4px 14px;cursor:pointer}
.bpm button[aria-pressed="true"]{background:var(--coral);border-color:var(--coral);color:#fff}
.bpm button:focus-visible{outline:3px solid var(--mint);outline-offset:2px}
.bop{transform-origin:50% 94%;animation:bop var(--beat,.5s) ease-in-out infinite alternate}
@keyframes bop{from{transform:scale(1.03,.96)}to{transform:scale(.98,1.03) translateY(-2.5%)}}
@media (prefers-reduced-motion:reduce){.bop{animation:none}}
.anatomy{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;list-style:none;padding:0;margin:0}
.anatomy li{border-top:3px solid var(--ink);padding-top:12px;display:flex;flex-direction:column;gap:4px;min-width:0}
.anatomy b{font-family:var(--display);font-size:20px}
.anatomy .maps{font-size:13px;font-weight:700;color:var(--mint-text);letter-spacing:.04em}
.anatomy span{color:var(--muted);font-size:15px}
.poses{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.pose{margin:0;display:flex;flex-direction:column;gap:10px;min-width:0}
.pose.wide{grid-column:span 2}
.pose.wide .stage svg{aspect-ratio:auto}
.pose figcaption{display:flex;flex-direction:column;gap:2px;line-height:1.5}
.pose b{font-family:var(--display);font-size:19px}
.when{font-size:13px;color:var(--muted)}
.say{font-size:14px}
.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px}
.rules{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}
.rules li{padding-left:28px;position:relative}
.rules li::before{content:"";position:absolute;left:0;top:.55em;width:14px;height:14px;border-radius:50%;background:var(--mint)}
.rules.no li::before{background:none;border:3px solid var(--coral);border-radius:3px;transform:rotate(45deg)}
.swatches{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px}
.swatches li{display:flex;flex-direction:column;gap:2px;font-size:14px;line-height:1.45;min-width:0}
.swatches i{height:64px;border-radius:14px;border:1px solid var(--line);margin-bottom:6px}
.swatches code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;color:var(--muted)}
.swatches span{color:var(--muted)}
.sizes{display:flex;flex-wrap:wrap;align-items:flex-end;gap:28px}
.sizes figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:13px;color:var(--muted)}
.tablewrap{overflow-x:auto}
table{border-collapse:collapse;width:100%;min-width:560px;font-size:15px}
th,td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-family:var(--display);font-size:14px;letter-spacing:.06em;color:var(--muted)}
@media (max-width:760px){.hero{grid-template-columns:1fr}.poses{grid-template-columns:repeat(2,minmax(0,1fr))}h2{font-size:26px}}
`;

const page = `<title>拍拍 PaiPai 吉祥物</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&display=swap">
<style>${css}</style>
<div class="wrap">
<header class="hero">
  <div class="stage">${inline(`<g class="bop">${paipai({ face: 'happy', armL: [72, 292], armR: [338, 176], bendR: 10 })}</g>`, '0 0 400 400')}</div>
  <div class="hero-copy">
    <span class="eyebrow">EZDANCE 練舞夥伴</span>
    <h1>拍拍<small>PAIPAI</small></h1>
    <p class="lede">住在練舞室鏡子裡的小拍子。你練舞，牠在旁邊跟著點頭數拍；你卡關，牠拍拍你，再陪你來一次。</p>
    <ul class="puns">
      <li><b>節<em>拍</em></b><span>跟著音樂數拍子</span></li>
      <li><b><em>拍</em>攝</b><span>幫你錄下練習</span></li>
      <li><b><em>拍拍</em>你</b><span>卡關時給你打氣</span></li>
    </ul>
    <div class="bpm" role="group" aria-label="拍拍點頭的速度">
      <span>讓拍拍跟拍：</span>
      <button type="button" id="bpm-60" data-bpm="60" aria-pressed="false">0.5× 慢速</button>
      <button type="button" id="bpm-120" data-bpm="120" aria-pressed="true">原速 120 BPM</button>
      <button type="button" id="bpm-170" data-bpm="170" aria-pressed="false">快歌 170 BPM</button>
    </div>
  </div>
</header>

<section>
  <h2>身上每個特徵，都對應一個功能</h2>
  <ul class="anatomy">
    <li><span class="maps">影片播放</span><b>播放鍵身體</b><span>圓圓的三角形，躺下來就是一顆播放鍵 ▶。縮到很小也認得出輪廓。</span></li>
    <li><span class="maps">A-B 循環</span><b>頭上的循環捲毛</b><span>一圈繞回來的捲毛，代表「這段再來一次」。循環播放時可以讓它轉圈。</span></li>
    <li><span class="maps">鏡像翻轉</span><b>肚子上的小鏡子</b><span>牠來自鏡子，所以開鏡像時會出現薄荷色的鏡中分身「鏡拍」。</span></li>
    <li><span class="maps">跳舞本人</span><b>白球鞋</b><span>永遠穿著練舞鞋，隨時準備開跳。鞋帶用薄荷色點綴。</span></li>
  </ul>
</section>

<section>
  <h2>八個表情，對應練舞的八個時刻</h2>
  <div class="poses">${poseCards}</div>
</section>

<section class="two">
  <div style="display:flex;flex-direction:column;gap:14px">
    <h2>個性</h2>
    <p>像一個比你早到練舞室的同學：熱情但不吵，專心時會皺眉，跳對了比你還開心。</p>
    <ul class="rules">
      <li>講話短、口語，一次只說一件事。</li>
      <li>稱讚具體的努力（「這段練了 12 次」），不評分、不拿別人比較。</li>
      <li>卡關時先安慰，再給一個做得到的下一步（降速、縮短循環）。</li>
    </ul>
  </div>
  <div style="display:flex;flex-direction:column;gap:14px">
    <h2>拍拍不做的事</h2>
    <p class="muted">這幾條是保護使用者練舞體驗的底線。</p>
    <ul class="rules no">
      <li>不擋畫面：播放、錄影、並排比對時，拍拍不出現在影片上。</li>
      <li>不情緒勒索：不用「你好久沒來，我好難過」這種通知催人回來。</li>
      <li>不自動蓋章：輸出的成品影片預設沒有拍拍，使用者自己選才加。</li>
    </ul>
  </div>
</section>

<section>
  <h2>出現在 App 的哪裡</h2>
  <div class="tablewrap"><table>
    <thead><tr><th>時刻</th><th>用哪個表情</th><th>拍拍說</th></tr></thead>
    <tbody>
      <tr><td>第一次開 App、練習庫還是空的</td><td>嗨！開練</td><td>「匯入一支想學的舞，我陪你拆開練。」</td></tr>
      <tr><td>把速度調到 0.75× 以下</td><td>慢慢來</td><td>「${LINES.slow}」</td></tr>
      <tr><td>同一段 A-B 循環超過 5 次</td><td>再一次！</td><td>「${LINES.loop}」</td></tr>
      <tr><td>錄影倒數</td><td>開拍囉</td><td>「${LINES.rec}」（開始錄就退場）</td></tr>
      <tr><td>刪掉剛錄的影片、中途放棄</td><td>拍拍，沒事</td><td>「${LINES.pat}」</td></tr>
      <tr><td>連續練習超過 40 分鐘</td><td>喝口水</td><td>「${LINES.rest}」</td></tr>
      <tr><td>完成當天練習、發布戰報</td><td>跳得好！</td><td>「${LINES.cheer}」</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <h2>顏色</h2>
  <ul class="swatches">${swatches}</ul>
</section>

<section>
  <h2>縮小測試</h2>
  <p class="muted">App 圖示、通知、分頁列用「大頭版」。下面是 120、60、29 像素的實際大小，29 是 iPhone 設定頁用的最小圖示尺寸。</p>
  <div class="sizes">
    ${[120, 60, 29].map((s) => `<figure><div style="width:${s}px">${inline(avatar(), '0 0 400 400')}</div>${s} px</figure>`).join('')}
    ${[120, 60, 29].map((s) => `<figure><div style="width:${s}px">${inline(avatar('#ffd3da'), '0 0 400 400')}</div>${s} px 淺底</figure>`).join('')}
  </div>
</section>
</div>
<script>
(function(){var root=document.querySelector('.bop');var btns=document.querySelectorAll('.bpm button');
function set(b){btns.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});if(root)root.style.setProperty('--beat',(60/Number(b.dataset.bpm))+'s');}
btns.forEach(function(b){b.addEventListener('click',function(){set(b)})});})();
</script>
`;
writeFileSync(join(here, 'index.html'), `<!DOCTYPE html>\n<html lang="zh-Hant-TW">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>\n<body>\n${page}</body>\n</html>\n`);
if (process.env.ARTIFACT_OUT) writeFileSync(process.env.ARTIFACT_OUT, page);
