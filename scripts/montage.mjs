/**
 * Builds side-by-side source/clone comparison images.
 *
 * Renders a two-up HTML page in headless Chrome and screenshots it, so the
 * montage needs no image library of its own.
 *
 * Usage:
 *   node scripts/montage.mjs --out docs/research/ag-live/montage \
 *     --pair desktop-hero=docs/.../source-desktop-hero.png,docs/.../clone-desktop-hero.png
 *     [--pair name=a.png,b.png ...]
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { tmpdir } from "node:os";

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArgs(argv) {
  const out = { pairs: [] };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--pair") {
      out.pairs.push(argv[i + 1]);
      i += 1;
    } else if (arg.startsWith("--")) {
      out[arg.slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return out;
}

const args = parseArgs(process.argv);
const outDir = resolve(args.out ?? "docs/research/ag-live/montage");
const port = Number(args.port ?? 9404);

if (!args.pairs.length) {
  console.error("No --pair name=left.png,right.png supplied");
  process.exit(1);
}

const chromePath = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chromePath) {
  console.error("No Chrome/Edge binary found");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const profileDir = join(tmpdir(), `ag-live-montage-${process.pid}`);
const workDir = join(tmpdir(), `ag-live-montage-html-${process.pid}`);
mkdirSync(workDir, { recursive: true });

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "about:blank",
  ],
  { stdio: "ignore" },
);

async function waitForDevtools() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  throw new Error("Chrome DevTools endpoint never became ready");
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve: res, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else res(msg.result);
      } else if (msg.method) {
        (this.listeners.get(msg.method) ?? []).forEach((fn) => fn(msg.params));
      }
    });
  }

  on(method, fn) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(fn);
  }

  send(method, params = {}) {
    this.id += 1;
    const id = this.id;
    return new Promise((res, reject) => {
      this.pending.set(id, { resolve: res, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

/** Reads intrinsic dimensions straight from the PNG IHDR chunk. */
function pngSize(path) {
  const buffer = readFileSync(path);
  if (buffer.readUInt32BE(12) !== 0x49484452) {
    throw new Error(`${path} is not a PNG`);
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function pageHtml(title, left, right, leftLabel, rightLabel) {
  const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #1b1b1b; font: 12px/1.4 "Segoe UI", system-ui, sans-serif; color: #e6e6e6; }
  header { display: flex; align-items: center; gap: 16px; padding: 14px 20px; background: #111; border-bottom: 1px solid #333; }
  header h1 { font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
  header .url { color: #9a9a9a; }
  .grid { display: flex; gap: 12px; padding: 12px; align-items: flex-start; }
  figure { background: #000; border: 1px solid #333; }
  figcaption { padding: 8px 10px; background: #111; border-bottom: 1px solid #333; letter-spacing: .1em; text-transform: uppercase; font-size: 10px; color: #b9a06a; }
  img { display: block; }
</style></head>
<body>
  <header><h1>${escape(title)}</h1><span class="url">${escape(leftLabel)} &nbsp;|&nbsp; ${escape(rightLabel)}</span></header>
  <div class="grid">
    <figure><figcaption>SOURCE &mdash; ${escape(leftLabel)}</figcaption><img src="${left}"></figure>
    <figure><figcaption>CLONE &mdash; ${escape(rightLabel)}</figcaption><img src="${right}"></figure>
  </div>
</body></html>`;
}

async function main() {
  await waitForDevtools();
  const created = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {
    method: "PUT",
  });
  const target = await created.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, reject) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  const cdp = new Cdp(ws);
  await cdp.send("Page.enable");

  for (const pair of args.pairs) {
    const eq = pair.indexOf("=");
    const name = pair.slice(0, eq).trim();
    const [leftRaw, rightRaw] = pair.slice(eq + 1).split(",").map((s) => s.trim());

    const leftPath = resolve(leftRaw);
    const rightPath = resolve(rightRaw);
    for (const p of [leftPath, rightPath]) {
      if (!existsSync(p)) {
        console.error(`[montage] missing ${p}`);
        continue;
      }
    }

    const left = pngSize(leftPath);
    const right = pngSize(rightPath);
    const gap = 12;
    const headerH = 44;
    const captionH = 29;
    const width = left.width + right.width + gap * 3;
    const height = Math.max(left.height, right.height) + headerH + captionH + gap * 2;

    const html = pageHtml(
      name,
      `file:///${leftPath.replace(/\\/g, "/")}`,
      `file:///${rightPath.replace(/\\/g, "/")}`,
      basename(leftPath),
      basename(rightPath),
    );
    const htmlPath = join(workDir, `${name}.html`);
    writeFileSync(htmlPath, html, "utf8");

    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    const loaded = new Promise((res) => cdp.on("Page.loadEventFired", res));
    await cdp.send("Page.navigate", { url: `file:///${htmlPath.replace(/\\/g, "/")}` });
    await Promise.race([loaded, sleep(15000)]);
    await sleep(400);

    const shot = await cdp.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
    });
    const outPath = join(outDir, `${name}.png`);
    writeFileSync(outPath, Buffer.from(shot.data, "base64"));
    console.log(`[montage] ${outPath} (${width}x${height})`);
  }

  ws.close();
  chrome.kill();
  try {
    rmSync(profileDir, { recursive: true, force: true });
    rmSync(workDir, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    chrome.kill();
    process.exit(1);
  });