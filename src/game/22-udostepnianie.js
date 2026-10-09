  // =============================================================== UDOSTĘPNIANIE WYNIKU
  // Karta PNG z wynikiem, oceną i postacią: pobranie, kopia do schowka albo systemowe „Udostępnij”.
  function shareInfo() {
    const mode = app.gameMode === 'rush' ? 'BOSS RUSH' : app.gameMode === 'survival' ? 'PRZETRWANIE' : app.gameMode === 'custom' ? 'WŁASNY ETAP'
      : app.gameMode === 'training' ? 'TRENING' : app.ngpRun ? 'NOWA GRA+' : 'ARCADE';
    let head;
    if (app.mode === 'ending') head = 'GRA UKOŃCZONA!';
    else if (app.mode === 'clear') head = ST.custom ? ST.name + ' — UKOŃCZONY' : G.special === 'escape' ? 'UCIECZKA UDANA!' : G.special === 'cages' ? 'ZAGRODA UKOŃCZONA' : ST.custom ? ST.name + ' — UKOŃCZONY' : 'ETAP ' + ST.label + ' UKOŃCZONY';
    else if (G.rush) head = 'BOSS RUSH — POKONANI BOSSOWIE: ' + ((app.rush && app.rush.done) || 0);
    else if (G.special === 'survival') head = 'PRZETRWANIE — FALA ' + ((G.surv && G.surv.wave) || 0);
    else head = 'KONIEC GRY — ' + (ST.custom ? ST.name : 'ETAP ' + ST.label);
    const res = app.mode === 'clear' && app.results ? app.results.filter(r => r.st) : [];
    const players = res.length ? res.map(r => ({ p: r.p, rank: r.rank, st: r.st, secs: r.secs }))
      : G.players.map(q => ({ p: q, st: q.st }));
    return { mode, head, players };
  }
  function makeShareCard() {
    const info = shareInfo(), CW = 384, CH = 216, SC = 3;
    const c = document.createElement('canvas'); c.width = CW * SC; c.height = CH * SC;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.drawImage(buf, 0, 4, W, CH, 0, 0, c.width, c.height);
    const L = document.createElement('canvas'); L.width = CW; L.height = CH;
    const l = L.getContext('2d');
    const gr = l.createLinearGradient(0, 0, 0, CH);
    gr.addColorStop(0, 'rgba(20,8,30,0.85)'); gr.addColorStop(0.5, 'rgba(10,6,20,0.6)'); gr.addColorStop(1, 'rgba(20,8,30,0.9)');
    l.fillStyle = gr; l.fillRect(0, 0, CW, CH);
    l.strokeStyle = '#ffb030'; l.lineWidth = 2; l.strokeRect(4, 4, CW - 8, CH - 8);
    l.strokeStyle = '#6a3a10'; l.lineWidth = 1; l.strokeRect(8.5, 8.5, CW - 17, CH - 17);
    const n = info.players.length, colW = n > 1 ? CW / 2 : CW;
    info.players.forEach((e, i) => {
      const ox = i * colW, big = n === 1;
      const bx = big ? ox + 30 : ox + 18, by = 56, bs = big ? 96 : 64;
      l.fillStyle = '#000'; l.fillRect(bx - 2, by - 2, bs + 4, bs + 4);
      l.fillStyle = n > 1 ? P_COLS[e.p.pIdx || i] : '#ffb030'; l.fillRect(bx - 1, by - 1, bs + 2, bs + 2);
      l.fillStyle = '#2a1a30'; l.fillRect(bx, by, bs, bs);
      l.save(); l.beginPath(); l.rect(bx, by, bs, bs); l.clip();
      SP.drawPortrait(l, e.p.b, bx + bs / 2, by + bs * 0.62, bs * 0.34, false); l.restore();
      if (e.rank) {
        const rx = big ? 300 : ox + colW - 44, ry = big ? 60 : 128;
        l.fillStyle = '#000'; l.fillRect(rx - 2, ry - 2, 40, 40);
        l.fillStyle = RANK_COLS[e.rank]; l.fillRect(rx, ry, 36, 36);
        l.fillStyle = '#1a1020'; l.fillRect(rx + 3, ry + 3, 30, 30);
      }
    });
    g.drawImage(L, 0, 0, c.width, c.height);
    // napisy rysuje zwykły text() — na chwilę przełączony na płótno karty
    const oS = S, oCtx = sctx;
    sctx = g; S = SC;
    try {
      text('PALEO HIGHWAY', CW / 2, 14, 12, '#ffb030', 'center');
      text('RDZA I KŁY', CW / 2, 30, 5, '#e0c0a0', 'center');
      text(info.head, CW / 2, 42, 5, '#ffe080', 'center');
      info.players.forEach((e, i) => {
        const ox = i * colW, big = n === 1, st = e.st || { kills: 0, maxCombo: 0 };
        const tx = big ? 140 : ox + 18, ty = big ? 60 : 126;
        text(e.p.name, tx, ty, big ? 9 : 6, n > 1 ? P_COLS[e.p.pIdx || i] : '#fff');
        text(String(e.p.score).padStart(7, '0'), tx, ty + (big ? 16 : 10), big ? 12 : 8, '#80d0ff');
        const lines = ['POKONANI ' + st.kills + '   KOMBO ' + st.maxCombo];
        if (e.secs !== undefined) lines.push('CZAS ' + Math.floor(e.secs / 60) + ':' + String(e.secs % 60).padStart(2, '0') + (st.dmg === 0 ? '   BEZ RYSY!' : ''));
        lines.forEach((t, k) => text(t, tx, ty + (big ? 38 : 22) + k * 9, big ? 5 : 4, '#e0e0e0'));
        if (e.rank) {
          const rx = big ? 300 : ox + colW - 44, ry = big ? 60 : 128;
          text(e.rank, rx + 18, ry + 9, 16, RANK_COLS[e.rank], 'center');
          if (big) text('OCENA', rx + 18, ry + 42, 4, '#fff', 'center');
        }
        if (!big && i === 0) { /* odstęp kolumn */ }
      });
      const d = new Date(), date = d.getDate() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
      text(info.mode + '  ·  ' + diffNow().name + '  ·  ' + date, CW / 2, 196, 4, '#c0c0c0', 'center');
    } finally { sctx = oCtx; S = oS; }
    return { canvas: c, score: Math.max(...info.players.map(e => e.p.score)), info };
  }
  function openShare() {
    try {
      const card = makeShareCard();
      const opts = ['POBIERZ', 'KOPIUJ'];
      if (navigator.share && navigator.canShare) opts.push('UDOSTĘPNIJ');
      opts.push('ZAMKNIJ');
      app.share = Object.assign(card, { opts, sel: 0, msg: '', msgT: 0, t: 0 });
      sfx('select');
    } catch (e) { console.error(e); }
  }
  function shareBlob(cb) { app.share.canvas.toBlob(b => cb(b), 'image/png'); }
  function shareMsg(m) { if (app.share) { app.share.msg = m; app.share.msgT = 200; } }
  function updateShare() {
    const sh = app.share; sh.t++;
    if (sh.msgT > 0) sh.msgT--;
    const N = sh.opts.length;
    if (pressed.left || pressed.up) { sh.sel = (sh.sel + N - 1) % N; sfx('select'); }
    if (pressed.right || pressed.down) { sh.sel = (sh.sel + 1) % N; sfx('select'); }
    if (pressed.pause || pressed.jump) { app.share = null; sfx('select'); return; }
    if (!((pressed.start || pressed.attack) && sh.t > 8)) return;
    const o = sh.opts[sh.sel], name = 'paleo-highway-' + sh.score + '.png';
    if (o === 'ZAMKNIJ') { app.share = null; sfx('select'); return; }
    sfx('start');
    if (o === 'POBIERZ') {
      shareBlob(b => {
        const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        shareMsg('ZAPISANO ' + name.toUpperCase());
      });
    } else if (o === 'KOPIUJ') {
      if (!(navigator.clipboard && navigator.clipboard.write && window.ClipboardItem)) { shareMsg('SCHOWEK NIEDOSTĘPNY — UŻYJ „POBIERZ”'); return; }
      const blobP = new Promise(r => shareBlob(r));
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blobP })])
        .then(() => shareMsg('SKOPIOWANO OBRAZEK DO SCHOWKA'))
        .catch(() => shareMsg('BRAK DOSTĘPU DO SCHOWKA (WYMAGA HTTPS LUB LOCALHOST)'));
    } else if (o === 'UDOSTĘPNIJ') {
      shareBlob(b => {
        const f = new File([b], name, { type: 'image/png' });
        const data = { files: [f], title: 'PALEO HIGHWAY', text: 'Mój wynik w PALEO HIGHWAY: ' + sh.score + ' pkt!' };
        if (navigator.canShare(data)) navigator.share(data).then(() => shareMsg('UDOSTĘPNIONO!')).catch(() => shareMsg('ANULOWANO'));
        else shareMsg('TO URZĄDZENIE NIE UDOSTĘPNIA PLIKÓW');
      });
    }
  }
  function drawShare() {
    const sh = app.share, w = screen.width, h = screen.height;
    sctx.fillStyle = 'rgba(0,0,0,0.8)'; sctx.fillRect(0, 0, w, h);
    text('UDOSTĘPNIJ WYNIK', W / 2, 8, 8, '#ffe080', 'center');
    const pw = W * 0.72, ph = pw * sh.canvas.height / sh.canvas.width, px = (W - pw) / 2, py = 22;
    sctx.imageSmoothingEnabled = true;
    sctx.fillStyle = '#ffb030'; sctx.fillRect((px - 1) * S, (py - 1) * S, (pw + 2) * S, (ph + 2) * S);
    sctx.drawImage(sh.canvas, px * S, py * S, pw * S, ph * S);
    sctx.imageSmoothingEnabled = false;
    const n = sh.opts.length, gap = 84, x0 = W / 2 - (n - 1) * gap / 2, y = py + ph + 9;
    sh.opts.forEach((o, i) => text((i === sh.sel ? '► ' : '') + o, x0 + i * gap, y, 6, i === sh.sel ? '#ffe040' : '#a0a0b0', 'center'));
    if (sh.msgT > 0) text(sh.msg, W / 2, y + 13, 4, '#7cff7c', 'center');
    else text('◄ ► WYBÓR   {ok|ENTER} — OK   {back|ESC} — ZAMKNIJ', W / 2, y + 13, 4, '#c0c0c0', 'center');
  }

  // NG+: na zmianę noc i jesień
  function drawNgpTint(background) {
    const autumn = G.stageIdx % 2 === 0;
    if (background) {
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = autumn ? '#f0b880' : '#5868a8'; ctx.fillRect(0, 0, W, H);
      ctx.restore();
      return;
    }
    if (autumn) {
      for (let i = 0; i < 22; i++) {
        const x = ((i * 53 + G.frame * (0.4 + (i % 3) * 0.2) + Math.sin(G.frame * 0.03 + i) * 12) % (W + 20)) - 10, y = (i * 37 + G.frame * (0.5 + (i % 4) * 0.15)) % (H + 10);
        ctx.fillStyle = ['#d0602a', '#e0a030', '#b03a20'][i % 3]; ctx.fillRect(x, y, 3, 2);
      }
    } else {
      const v = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 240);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,20,0.55)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    }
  }
  // ulewa: mgła z „oknami” widoczności wokół graczy
  let fogC = null;
  function drawFog() {
    if (!fogC) { fogC = document.createElement('canvas'); fogC.width = W; fogC.height = H; }
    const g = fogC.getContext('2d');
    g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
    g.fillStyle = `rgba(12,16,32,${G.fog})`; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'destination-out';
    for (const q of G.players) {
      if (!q.alive) continue;
      const gx = q.x - G.camX, gy = q.y - q.z - 24;
      const gr = g.createRadialGradient(gx, gy, 12, gx, gy, 84);
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(gx - 84, gy - 84, 168, 168);
    }
    g.globalCompositeOperation = 'source-over';
    ctx.drawImage(fogC, 0, 0);
    ctx.strokeStyle = `rgba(180,200,240,${0.55 * G.fog})`; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < 130; i++) { const x = (i * 37 + G.frame * 5) % (W + 30) - 15, y = (i * 53 + G.frame * 13) % (H + 30) - 15; ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 12); }
    ctx.stroke();
  }

