  // =============================================================== WSPÓLNA TABELA WYNIKÓW W SIECI
  // Adres serwera: config.js → onlineScores (albo parametr adresu ?scores=...). Serwer: tools/score-server.mjs.
  // W tabeli wyników ▲▼ przełącza LOKALNE / ŚWIAT; po wpisaniu inicjałów wynik idzie też na serwer.
  const NET_URL = String(urlParams.get('scores') || CFG.onlineScores || '').trim().replace(/\/+$/, '');
  const net = { on: /^https?:\/\//.test(NET_URL), cache: {} };
  const netTableId = k => k === 'daily' ? 'daily-' + dailyId() : k;
  function netFetch(p, opt) {
    const c = new AbortController(), tm = setTimeout(() => c.abort(), 6000);
    return fetch(NET_URL + p, Object.assign({ signal: c.signal, headers: { 'Content-Type': 'application/json' } }, opt))
      .then(r => r.json().then(d => { if (!r.ok) throw new Error(d.error || 'HTTP ' + r.status); return d; }))
      .finally(() => clearTimeout(tm));
  }
  // pobiera tabelę (najwyżej co 20 s, chyba że force)
  function netLoad(k, force) {
    if (!net.on) return;
    const id = netTableId(k), C = net.cache[id];
    if (C && !force && (C.loading || performance.now() - C.t < 20000)) return;
    net.cache[id] = { list: C ? C.list : null, loading: true, t: performance.now() };
    netFetch('/scores?table=' + encodeURIComponent(id) + '&limit=10')
      .then(d => { net.cache[id] = { list: Array.isArray(d.scores) ? d.scores.slice(0, 10) : [], t: performance.now() }; })
      .catch(() => { net.cache[id] = { list: C ? C.list : null, err: true, t: performance.now() }; });
  }
  // wpis zasługuje na tabelę światową (zwykły wynik > 0, w Boss Rush choć jeden boss, w przetrwaniu choć jedna fala)
  const netWorthy = (k, r) => net.on && !app.demo && !cheated() && (k === 'rush' ? r.b > 0 : k === 'surv' ? r.w > 0 : r.s > 0);
  function netSubmit(k, rec) {
    if (!netWorthy(k, rec)) return;
    const body = { table: netTableId(k), n: rec.n, s: rec.s | 0, st: rec.st, c: rec.c, b: rec.b, f: rec.f, w: rec.w };
    netFetch('/scores', { method: 'POST', body: JSON.stringify(body) })
      .then(d => {
        net.cache[netTableId(k)] = null; netLoad(k, true);
        app.toasts.push({ head: 'TABELA ŚWIATOWA', name: d.rank ? 'MIEJSCE ' + d.rank + '!' : 'WYNIK WYSŁANY', t: 0, col: '#80d0ff' });
      })
      .catch(e => app.toasts.push({ head: 'TABELA ŚWIATOWA', name: 'NIE UDAŁO SIĘ WYSŁAĆ', t: 0, col: '#ff8080' }));
  }
  // wiersze aktualnie oglądanej tabeli: lokalne albo z serwera
  function scoreRows() {
    if (!app.scoreNet) return app.tables[app.scoreTable];
    const C = net.cache[netTableId(app.scoreTable)];
    return (C && C.list) || [];
  }
  function netStatus() {
    if (!app.scoreNet) return '';
    const C = net.cache[netTableId(app.scoreTable)];
    if (!C || (C.loading && !C.list)) return 'ŁĄCZENIE Z SERWEREM...';
    if (C.err && !C.list) return 'BRAK POŁĄCZENIA Z SERWEREM';
    if (C.list && !C.list.length) return 'NIKT JESZCZE NIE GRAŁ — BĄDŹ PIERWSZY!';
    return '';
  }
