#!/usr/bin/env node
/**
 * Screenshot harness for the widget demo pages.
 *
 *   node tools/shoot.mjs --url http://127.0.0.1:8899/test.html \
 *        --w 1440 --h 900 --out screenshots/a.png [--open] [--eval "js"]
 *
 * Connects to the Chrome instance started by ~/.dsh/chrome/start-chrome.sh
 * (port 9335). --open calls the widget's open() method; --eval runs extra JS
 * right before the capture.
 */
import { writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const opt = { w: 1440, h: 900, out: 'shot.png', open: false, probe: false, eval: null, url: null, wait: 400 };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--url') opt.url = argv[++i];
  else if (a === '--w') opt.w = +argv[++i];
  else if (a === '--h') opt.h = +argv[++i];
  else if (a === '--out') opt.out = argv[++i];
  else if (a === '--wait') opt.wait = +argv[++i];
  else if (a === '--open') opt.open = true;
  else if (a === '--probe') opt.probe = true;
  else if (a === '--eval') opt.eval = argv[++i];
}
const BASE = 'http://127.0.0.1:9335';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let seq = 0;
  const pending = new Map();
  const listeners = new Map();
  const ready = new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', () => reject(new Error('cannot connect')), { once: true });
  });
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id !== undefined && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) for (const fn of listeners.get(msg.method) ?? []) fn(msg.params);
  });
  return {
    ready,
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++seq;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    },
    once(method, timeoutMs = 20000) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`timeout ${method}`)), timeoutMs);
        const fn = (params) => {
          clearTimeout(timer);
          listeners.set(method, (listeners.get(method) ?? []).filter((f) => f !== fn));
          resolve(params);
        };
        listeners.set(method, [...(listeners.get(method) ?? []), fn]);
      });
    },
    close: () => ws.close(),
  };
}

const evalJs = async (client, expression) => {
  const r = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
    userGesture: true,
  });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result?.value;
};

const pages = (await (await fetch(`${BASE}/json/list`)).json()).filter((t) => t.type === 'page');
if (!pages.length) throw new Error('no page target');
const client = connect(pages[0].webSocketDebuggerUrl);
await client.ready;
await client.send('Runtime.enable');
await client.send('Page.enable');

await client.send('Emulation.setDeviceMetricsOverride', {
  width: opt.w,
  height: opt.h,
  deviceScaleFactor: 2,
  mobile: opt.w < 641,
});

const loaded = client.once('Page.loadEventFired');
await client.send('Page.navigate', { url: opt.url });
await loaded.catch(() => {});
await sleep(opt.wait);

if (opt.open) {
  await evalJs(client, `(() => {
    const el = document.querySelector('sleekflow-whatsapp-widget');
    if (!el) return 'no widget';
    el.open();
    return 'opened';
  })()`);
  await sleep(300);
}
if (opt.eval) {
  const result = await evalJs(client, opt.eval);
  if (result !== undefined) console.log('eval: ' + JSON.stringify(result));
  await sleep(200);
}

if (opt.probe) {
  const info = await evalJs(
    client,
    `(() => {
      const h = document.querySelector('sleekflow-whatsapp-widget');
      if (!h) return null;
      const sr = h.shadowRoot;
      const r = (s) => {
        const el = sr.querySelector(s);
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { t: Math.round(b.top), b: Math.round(b.bottom), h: Math.round(b.height), w: Math.round(b.width) };
      };
      const host = h.getBoundingClientRect();
      return JSON.stringify({
        vw: innerWidth, vh: innerHeight,
        host: { t: Math.round(host.top), b: Math.round(host.bottom), h: Math.round(host.height), w: Math.round(host.width) },
        panel: r('.sf-panel'), header: r('.sf-header'), body: r('.sf-body'),
        bubble: r('.sf-bubble'), prefill: r('.sf-prefill-row'), footer: r('.sf-footer'),
        actions: r('.sf-actions'),
      });
    })()`,
  );
  console.log('probe ' + info);
}

const { data } = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
writeFileSync(opt.out, Buffer.from(data, 'base64'));
const size = await evalJs(client, `JSON.stringify({vw: innerWidth, vh: innerHeight})`);
console.log(`wrote ${opt.out} ${size}`);
client.close();
