// Wspólna tabela wyników PALEO HIGHWAY — mały serwer HTTP bez zależności (Node.js 18+).
// Użycie:  node tools/score-server.mjs [port] [plik-danych]
//          (domyślnie port 8787 i data/scores.json; można też PORT i SCORES_FILE w zmiennych środowiska)
// W grze ustaw adres serwera w config.js:  onlineScores: 'https://twoj-serwer.example'
//
// API (JSON, CORS włączony):
//   GET  /scores?table=main&limit=10   → { scores: [ {n, s, st, c, ...}, ... ] }
//   POST /scores  {table, n, s, st, c, b, f, w}  → { ok: true, rank: 1-based | null }
//   GET  /health  → { ok: true }
// Tabele: main, rush, surv, daily-RRRRMMDD. Serwer trzyma 100 najlepszych wpisów każdej tabeli,
// tabele dzienne starsze niż 14 dni usuwa. Ten sam adres IP może wysłać wynik co 5 s.
import http from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = +(process.argv[2] || process.env.PORT || 8787);
const FILE = path.resolve(process.argv[3] || process.env.SCORES_FILE || path.join(root, 'data', 'scores.json'));
const KEEP = 100, POST_GAP_MS = 5000, MAX_BODY = 2048;
const CHARS = ['kruk', 'nina', 'tur', 'borys', 'bursztyn', 'padlin', 'zmijka'];
const NAME_RE = /^[A-ZĄĆĘŁŃÓŚŹŻ0-9.\-! ]{1,3}$/u;
const TABLE_RE = /^(main|rush|surv|daily-\d{8})$/;

// porządek tabel — taki sam jak w grze
const cmpOf = t => t === 'rush' ? (a, b) => (b.b - a.b) || (a.f - b.f)
  : t === 'surv' ? (a, b) => (b.w - a.w) || (b.s - a.s)
  : (a, b) => b.s - a.s;

let db = {};
try { if (existsSync(FILE)) db = JSON.parse(readFileSync(FILE, 'utf8')) || {}; } catch (e) { console.error('Nie udało się wczytać', FILE, e.message); }
let saveT = null;
function save() {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    mkdirSync(path.dirname(FILE), { recursive: true });
    writeFileSync(FILE + '.tmp', JSON.stringify(db));
    renameSync(FILE + '.tmp', FILE);   // zapis atomowy
  }, 300);
}
function pruneDaily() {
  const limit = Date.now() - 14 * 864e5;
  for (const k of Object.keys(db)) {
    const m = /^daily-(\d{4})(\d{2})(\d{2})$/.exec(k);
    if (m && new Date(+m[1], +m[2] - 1, +m[3]).getTime() < limit) delete db[k];
  }
}

const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
// sprawdza i oczyszcza wpis; zwraca null, gdy coś się nie zgadza
function clean(b) {
  if (!b || typeof b !== 'object' || !TABLE_RE.test(b.table) || typeof b.n !== 'string') return null;
  const n = b.n.toUpperCase();
  if (!NAME_RE.test(n)) return null;
  const c = CHARS.includes(b.c) ? b.c : 'kruk';
  const t = b.table, r = { n, c, d: Date.now() };
  if (t === 'rush') { if (!int(b.b, 0, 12) || !int(b.f, 0, 60 * 60 * 120)) return null; r.b = b.b; r.f = b.f; }
  else if (t === 'surv') { if (!int(b.w, 0, 999) || !int(b.s, 0, 9999999)) return null; r.w = b.w; r.s = b.s; }
  else {
    if (!int(b.s, 1, 9999999)) return null;
    r.s = b.s; r.st = typeof b.st === 'string' ? b.st.slice(0, 4) : '';
  }
  return r;
}

const lastPost = new Map();
function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (url.pathname === '/health') return send(res, 200, { ok: true });
  if (url.pathname !== '/scores') return send(res, 404, { error: 'nie ma takiej ścieżki' });

  if (req.method === 'GET') {
    const t = url.searchParams.get('table') || 'main';
    if (!TABLE_RE.test(t)) return send(res, 400, { error: 'zła tabela' });
    const limit = Math.max(1, Math.min(KEEP, parseInt(url.searchParams.get('limit'), 10) || 10));
    return send(res, 200, { table: t, scores: (db[t] || []).slice(0, limit).map(({ d, ...r }) => r) });
  }
  if (req.method === 'POST') {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const now = Date.now();
    if (now - (lastPost.get(ip) || 0) < POST_GAP_MS) return send(res, 429, { error: 'za często — spróbuj za chwilę' });
    let body = '', big = false;
    req.on('data', ch => { body += ch; if (body.length > MAX_BODY) { big = true; req.destroy(); } });
    req.on('end', () => {
      if (big) return;
      let b; try { b = JSON.parse(body); } catch (e) { return send(res, 400, { error: 'zły JSON' }); }
      const r = clean(b);
      if (!r) return send(res, 400, { error: 'niepoprawny wpis' });
      lastPost.set(ip, now);
      const t = b.table, T = (db[t] = db[t] || []);
      T.push(r); T.sort(cmpOf(t));
      const rank = T.indexOf(r);
      db[t] = T.slice(0, KEEP);
      if (t.startsWith('daily-')) pruneDaily();
      save();
      send(res, 200, { ok: true, rank: rank < KEEP ? rank + 1 : null });
    });
    return;
  }
  send(res, 405, { error: 'metoda niedozwolona' });
});
server.listen(PORT, () => console.log(`Tabela wyników PALEO HIGHWAY: http://localhost:${PORT}/scores  (dane: ${FILE})`));
