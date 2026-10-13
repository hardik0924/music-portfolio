/**
 * Zero-dependency Chrome DevTools Protocol capture tool.
 *
 * Launches headless Chrome, drives a page with real wheel input (so
 * scroll-driven behaviour such as Lenis/ScrollTrigger actually runs), and
 * writes full-page plus per-viewport screenshots.
 *
 * Usage:
 *   node scripts/capture.mjs --url https://example.com --out docs/research/x \
 *     --width 1440 --height 900 [--mobile] [--label desktop] \
 *     [--shots hero,mid,footer] [--settle 2500]
 */

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

const args = parseArgs(process.argv);
const url = args.url;
const outDir = resolve(args.out ?? "docs/captures");
const width = Number(args.width ?? 1440);
const height = Number(args.height ?? 900);
const mobile = Boolean(args.mobile);
const label = String(args.label ?? "desktop");
const settle = Number(args.settle ?? 2500);
const shots = args.shots
  ? String(args.shots).split(",").filter(Boolean)
  : ["hero"];
const port = Number(args.port ?? 9333);

if (!url) {
  console.error("Missing --url");
  process.exit(1);
}

const chromePath = CHROME_CANDIDATES.find((p) => existsSync(p));

if (!chromePath) {
  console.error("No Chrome/Edge binary found");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const profileDir = join(tmpdir(), `ag-live-capture-${process.pid}`);

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-background-networking",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--autoplay-policy=no-user-gesture-required",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForDevtools() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return await res.json();
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

async function main() {
  await waitForDevtools();

  const created = await fetch(
    `http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`,
    { method: "PUT" },
  );
  const target = await created.json();

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, reject) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  const cdp = new Cdp(ws);

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height,
  });
  if (mobile) {
    await cdp.send("Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: 5,
    });
  }
  await cdp.send("Emulation.setUserAgentOverride", {
    userAgent: mobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  });

  const loaded = new Promise((res) => cdp.on("Page.loadEventFired", res));
  await cdp.send("Page.navigate", { url });
  await Promise.race([loaded, sleep(30000)]);
  await sleep(settle);

  // Drive real wheel input top -> bottom so lazy media and scroll triggers run.
  // `--noSweep` skips this when `--actions` already scrolls to what matters
  // (useful when a timing-dependent widget such as an autoplaying carousel
  // needs to be inspected before its first tick).
  const total = args.noSweep
    ? 0
    : (await cdp.send("Runtime.evaluate", {
        expression: "document.documentElement.scrollHeight",
        returnByValue: true,
      })).result.value ?? 0;
  const step = Math.max(120, Math.round(height * 0.6));
  for (let y = 0; y < total + step; y += step) {
    await cdp.send("Input.dispatchMouseEvent", {
      type: "mouseWheel",
      x: Math.round(width / 2),
      y: Math.round(height / 2),
      deltaX: 0,
      deltaY: step,
    });
    await sleep(120);
  }
  await sleep(900);

  // Back to the top with reverse wheel so reverse scroll states settle too.
  for (let y = total; y > -step && !args.noSweep; y -= step * 2) {
    await cdp.send("Input.dispatchMouseEvent", {
      type: "mouseWheel",
      x: Math.round(width / 2),
      y: Math.round(height / 2),
      deltaX: 0,
      deltaY: -step * 2,
    });
    await sleep(80);
  }
  await sleep(1200);

  /**
   * `--actions "scroll:<sel>,hover:<sel>,click:<sel>"` drives the page with real
   * pointer input before the shots are taken, so interactive states (paused
   * carousels, open tabs, hovered cells) are captured deterministically instead
   * of depending on autoplay timing.
   */
  const centerOf = async (selector) => {
    const res = await cdp.send("Runtime.evaluate", {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { x: b.left + b.width / 2, y: b.top + b.height / 2, top: b.top };
      })()`,
      returnByValue: true,
    });
    return res.result.value;
  };

  const wheel = async (delta) => {
    await cdp.send("Input.dispatchMouseEvent", {
      type: "mouseWheel",
      x: Math.round(width / 2),
      y: Math.round(height / 2),
      deltaX: 0,
      deltaY: delta,
    });
    await sleep(90);
  };

  const moveTo = async (x, y) => {
    await cdp.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: Math.round(x),
      y: Math.round(y),
      button: "none",
      clickCount: 0,
    });
    await sleep(140);
  };

  if (args.actions) {
    for (const action of String(args.actions).split(",").filter(Boolean)) {
      const index = action.indexOf(":");
      const kind = action.slice(0, index).trim();
      const selector = action.slice(index + 1).trim();

      // `eval:<js>` runs script in the page. Used only to pin timing-dependent
      // widgets (an autoplaying carousel) that pointer clicks cannot reliably
      // target; the real click paths are verified separately.
      if (kind === "eval") {
        const res = await cdp.send("Runtime.evaluate", {
          expression: selector,
          returnByValue: true,
        });
        console.log(
          `[action] eval ${res.exceptionDetails ? "ERROR" : JSON.stringify(res.result.value)}`,
        );
        await sleep(700);
        continue;
      }

      const point = await centerOf(selector);
      if (!point) {
        console.log(`[action] skipped, no match: ${action}`);
        continue;
      }

      if (kind === "scroll") {
        let guard = 0;
        let current = point;
        while (current.top > 8 && guard < 400) {
          await wheel(Math.max(-600, Math.min(600, Math.round(current.top - 8))));
          current = await centerOf(selector);
          guard += 1;
        }
        await sleep(900);
      } else {
        await moveTo(point.x, point.y);
        if (kind === "click") {
          // Centre the target first so the click can never land on a stale
          // coordinate after a carousel or accordion resized.
          let guard = 0;
          let target = await centerOf(selector);
          const offCentre = Math.round(height * 0.35);
          while (guard < 40 && Math.abs(target.top - offCentre) > 6) {
            await wheel(Math.max(-400, Math.min(400, Math.round(target.top - offCentre))));
            target = await centerOf(selector);
            guard += 1;
          }
          await moveTo(target.x, target.y);
          await cdp.send("Input.dispatchMouseEvent", {
            type: "mousePressed",
            x: Math.round(target.x),
            y: Math.round(target.y),
            button: "left",
            buttons: 1,
            clickCount: 1,
          });
          await cdp.send("Input.dispatchMouseEvent", {
            type: "mouseReleased",
            x: Math.round(target.x),
            y: Math.round(target.y),
            button: "left",
            buttons: 0,
            clickCount: 1,
          });
          await sleep(600);
        }
      }
      console.log(`[action] ${action}`);
    }
  }

  // `--eval "expr"` (or `--evalFile path`) dumps a diagnostic JSON blob measured
// at this viewport. Prefer --evalFile: shell quoting of inline JS is fragile.
  const evalSource = args.evalFile
    ? readFileSync(resolve(String(args.evalFile)), "utf8")
    : args.eval;

  const runProbe = async () => {
    if (!evalSource) return;
    const probe = await cdp.send("Runtime.evaluate", {
      expression: `(() => { const __r = (${evalSource}); return JSON.stringify(typeof __r === "function" ? __r() : __r); })()`,
      returnByValue: true,
    });
    if (probe.exceptionDetails) {
      console.log(`[eval] ERROR ${JSON.stringify(probe.exceptionDetails)}`);
    } else {
      console.log(`[eval] ${probe.result.value}`);
    }
  };

  await runProbe();

  // `--pin "<js>"` is re-evaluated immediately before every section shot. Scrolling
// a shot into view can move the pointer off a hover-paused widget and restart it,
// so the pin restores the same state each time and keeps runs comparable.
  const pin = args.pin ? String(args.pin) : null;
  if (pin) {
    const res = await cdp.send("Runtime.evaluate", {
      expression: pin,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      console.log(`[pin] ERROR ${JSON.stringify(res.exceptionDetails)}`);
    }
    await sleep(500);
  }

  // Section shots run before the full-page capture: `captureBeyondViewport`
  // briefly resizes the viewport, which fires pointer leave events and would
  // resume any autoplaying widget the `--actions` step had frozen.
  for (const shot of shots) {
    if (pin) {
      await cdp.send("Runtime.evaluate", { expression: pin, returnByValue: true });
      await sleep(350);
    }
    // A smooth-scroll library can still be animating toward its previous
    // target, so re-issue the jump until the position actually sticks.
    let target = 0;
    let settled = false;
    for (let attempt = 0; attempt < 6 && !settled; attempt += 1) {
      const res = await cdp.send("Runtime.evaluate", {
        expression: `(() => {
          const el = ${shot === "hero" ? "null" : `document.getElementById(${JSON.stringify(shot)})`};
          const top = el ? el.getBoundingClientRect().top + window.scrollY : 0;
          window.scrollTo({ top, behavior: "instant" });
          return { top, now: window.scrollY };
        })()`,
        returnByValue: true,
      });
      target = res.result.value.top;
      await sleep(700);
      const check = await cdp.send("Runtime.evaluate", {
        expression: `(() => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          return { y: window.scrollY, want: Math.min(target, Math.max(0, max)) };
        })()`.replace("target", String(target)),
        returnByValue: true,
      });
      settled =
        Math.abs(check.result.value.y - check.result.value.want) <= 2;
    }
    if (!settled) console.log(`[capture] scroll did not settle for "${shot}"`);

    const res = await cdp.send("Page.captureScreenshot", {
      format: "png",
    });
    const p = join(outDir, `${label}-${shot}.png`);
    writeFileSync(p, Buffer.from(res.data, "base64"));
    console.log(`[capture] wrote ${p}`);
  }

  const info = await cdp.send("Runtime.evaluate", {
    expression: `JSON.stringify({
      height: document.documentElement.scrollHeight,
      width: window.innerWidth,
      dpr: window.devicePixelRatio,
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
      scrollWidth: document.documentElement.scrollWidth,
      sections: [...document.querySelectorAll('section, #ticker, #footer')].map(s => ({
        id: s.id,
        top: Math.round(s.getBoundingClientRect().top + window.scrollY),
        h: Math.round(s.getBoundingClientRect().height),
      }))
    })`,
    returnByValue: true,
  });
  console.log(`[capture] ${url} @ ${width}x${height} mobile=${mobile}`);
  console.log(`[capture] ${info.result.value}`);

  const full = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
  });
  const fullPath = join(outDir, `${label}-full.png`);
  writeFileSync(fullPath, Buffer.from(full.data, "base64"));
  console.log(`[capture] wrote ${fullPath}`);

  ws.close();
  chrome.kill();
  try {
    rmSync(profileDir, { recursive: true, force: true });
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