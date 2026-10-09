// Sterownik przeglądarki do testów: uruchamia Edge/Chrome bez okna, łączy się przez Chrome DevTools Protocol
// i udostępnia proste API: ev (kod w stronie), tap/key (klawisze), mouse, shot (zrzut), sleep.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';

const CANDIDATES = [
  process.env.BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge'
];
export function findBrowser() {
  const b = CANDIDATES.find(p => p && existsSync(p));
  if (!b) throw new Error('Nie znaleziono Edge ani Chrome — ustaw zmienną BROWSER na ścieżkę do przeglądarki.');
  return b;
}

const KEYCODES = { Enter: 13, Escape: 27, Space: 32, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40 };
const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function openPage(url, { width = 1152, height = 672, outDir }) {
  const profile = path.resolve(outDir, 'profile-' + process.pid + '-' + Date.now());
  mkdirSync(profile, { recursive: true });
  const port = 9300 + Math.floor(Math.random() * 600);
  const proc = spawn(findBrowser(), ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    '--autoplay-policy=no-user-gesture-required', `--window-size=${width},${height}`, '--no-first-run',
    '--no-default-browser-check', '--disable-sync', 'about:blank'], { stdio: 'ignore' });
  let ws;
  for (let i = 0; i < 200 && !ws; i++) {
    try {
      await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
      const pg = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
      ws = new WebSocket(pg.webSocketDebuggerUrl);
      await new Promise((ok, bad) => { ws.onopen = ok; ws.onerror = bad; });
    } catch (e) { ws = null; await sleep(150); }
  }
  if (!ws) { proc.kill(); throw new Error('Nie udało się połączyć z przeglądarką.'); }
  let id = 0;
  const pending = new Map(), errors = [], logs = [];
  ws.onmessage = m => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
    else if (d.method === 'Runtime.exceptionThrown') {
      const x = d.params.exceptionDetails;
      errors.push(((x.exception && x.exception.description) || x.text || '').split('\n').slice(0, 5).join(' | '));
    } else if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') logs.push(d.params.args.map(a => a.value ?? a.description).join(' '));
  };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  // czekaj aż gra wystartuje
  for (let i = 0; i < 100; i++) {
    const r = await send('Runtime.evaluate', { expression: 'document.readyState === "complete"', returnByValue: true });
    if (r.result && r.result.result && r.result.result.value) break;
    await sleep(100);
  }
  await sleep(1200);

  const page = {
    errors, logs, send, sleep,
    async ev(expr) {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.result && r.result.exceptionDetails) {
        const x = r.result.exceptionDetails;
        throw new Error('Błąd w stronie: ' + ((x.exception && x.exception.description) || x.text));
      }
      return r.result && r.result.result ? r.result.result.value : undefined;
    },
    async key(code, type) { await send('Input.dispatchKeyEvent', { type, code, key: code, windowsVirtualKeyCode: KEYCODES[code] }); },
    async tap(code, ms = 60) { await page.key(code, 'keyDown'); await sleep(ms); await page.key(code, 'keyUp'); await sleep(40); },
    async hold(code, ms) { await page.key(code, 'keyDown'); await sleep(ms); await page.key(code, 'keyUp'); },
    async click(x, y) { for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 }); },
    async shot(name) {
      const r = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(path.join(outDir, name + '.png'), Buffer.from(r.result.data, 'base64'));
    },
    // czekaj, aż warunek (wyrażenie JS) będzie prawdziwy
    async until(expr, timeout = 8000) {
      const t0 = Date.now();
      while (Date.now() - t0 < timeout) { if (await page.ev(expr)) return true; await sleep(100); }
      return false;
    },
    async close() {
      try { ws.close(); } catch (e) { /* już zamknięte */ }
      proc.kill();
      await sleep(400);
      try { rmSync(profile, { recursive: true, force: true }); } catch (e) { /* przeglądarka jeszcze trzyma pliki */ }
    }
  };
  return page;
}
