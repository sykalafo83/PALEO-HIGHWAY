// Renderuje muzykę i sample gry do plików WAV (assets/audio/) przy pomocy headless Edge/Chrome.
// Użycie: node tools/export-audio.mjs [ścieżka-do-przeglądarki]
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets', 'audio');
const candidates = [
  process.argv[2],
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].filter(Boolean);
const browser = candidates.find(p => existsSync(p));
if (!browser) { console.error('Nie znaleziono przeglądarki Chromium. Podaj ścieżkę jako argument.'); process.exit(1); }

const page = pathToFileURL(path.join(root, 'export.html')).href + '?dump';
const profile = path.join(os.tmpdir(), 'paleo-export-' + process.pid);
const port = 9400 + Math.floor(Math.random() * 400);
const proc = spawn(browser, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', page], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let ws;
for (let i = 0; i < 150 && !ws; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    const t = list.find(x => x.type === 'page' && x.url.startsWith(page.split('?')[0]));
    if (t) { ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r); }
  } catch { /* przeglądarka jeszcze startuje */ }
  if (!ws) await sleep(200);
}
if (!ws) { console.error('Brak połączenia z przeglądarką.'); proc.kill(); process.exit(1); }

let id = 0; const pending = new Map();
ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const evaluate = expr => new Promise(r => { const i = ++id; pending.set(i, d => r(d.result?.result?.value)); ws.send(JSON.stringify({ id: i, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } })); });

let done = false;
let lastTitle = '';
for (let i = 0; i < 600 && !done; i++) {
  const t = await evaluate('document.title');
  done = t === 'DONE';
  if (t !== lastTitle) { lastTitle = t; console.log('  ', t); }
  if (!done) await sleep(500);
}
const txt = done ? await evaluate('document.getElementById("dump").textContent') : null;
const files = {};
if (txt && !txt.startsWith('ERROR')) {
  // CDP źle znosi bardzo duże wiadomości — pobieramy base64 kawałkami
  const CH = 512 * 1024;
  for (const name of JSON.parse(txt)) {
    const key = JSON.stringify(name);
    const len = await evaluate(`window.__out[${key}].length`);
    let s = '';
    for (let o = 0; o < len; o += CH) s += await evaluate(`window.__out[${key}].slice(${o}, ${o + CH})`);
    files[name] = s;
  }
}
ws.close(); proc.kill();
await sleep(500);
try { rmSync(profile, { recursive: true, force: true }); } catch { /* profil może być jeszcze zablokowany */ }

if (!txt || txt.startsWith('ERROR')) { console.error('Renderowanie nie powiodło się:', txt || 'timeout'); process.exit(1); }
mkdirSync(outDir, { recursive: true });
for (const [name, b64] of Object.entries(files)) {
  const buf = Buffer.from(b64, 'base64');
  writeFileSync(path.join(outDir, name), buf);
  console.log(name.padEnd(24), (buf.length / 1024).toFixed(0).padStart(6), 'KB');
}
console.log(`Zapisano ${Object.keys(files).length} plików do ${outDir}`);
