  // =============================================================== POGODA I PORA DNIA
  // Losowane od nowa przy każdym przejściu gry (app.wxSeed) — ten sam etap raz o świcie, raz w burzy.
  const WEATHER = {
    clear: null,
    dawn: { name: 'ŚWIT', tint: '#f8c8c0', light: 'rgba(255,190,160,0.08)', sun: { x: 0.12, col: '255,210,170' } },
    sunset: { name: 'ZACHÓD SŁOŃCA', tint: '#ffa070', light: 'rgba(255,110,40,0.12)', sun: { x: 0.86, col: '255,150,60' } },
    dusk: { name: 'ZMIERZCH', tint: '#8890c8', light: 'rgba(30,30,90,0.18)' },
    mist: { name: 'MGŁA', tint: '#c8d4d0', mist: true },
    sand: { name: 'BURZA PIASKOWA', tint: '#e8c890', sand: true },
    ash: { name: 'DESZCZ POPIOŁU', tint: '#b8a8a8', ash: true },
    rain: { name: 'DESZCZ', tint: '#a0a8c0', light: 'rgba(20,30,60,0.12)', rain: true }
  };
  const STAGE_WX = [['clear', 'dawn', 'sand', 'rain'], ['mist', 'mist', 'dusk', 'rain'], ['clear', 'dusk', 'mist'],
    ['sand', 'sand', 'ash', 'clear'], ['sunset', 'sunset', 'clear', 'mist'], ['mist', 'sunset', 'rain', 'clear'], ['clear'], ['clear', 'dusk', 'rain', 'sunset']];
  function pickWeather(idx) {
    const list = STAGE_WX[idx];
    if (!list || app.ngpRun) return null;
    const h = Math.abs(Math.sin((app.wxSeed || 1) * 12.9898 + idx * 78.233) * 43758.5453) % 1;
    const k = list[Math.floor(h * list.length)];
    return WEATHER[k] ? Object.assign({ id: k }, WEATHER[k]) : null;
  }
  // tło: zabarwienie pory dnia i słońce nad horyzontem
  function drawWeatherBack(wx) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = wx.tint; ctx.fillRect(0, 0, W, H);
    if (wx.sun) {
      ctx.globalCompositeOperation = 'screen';
      const sx = W * wx.sun.x, sy = 64, g = ctx.createRadialGradient(sx, sy, 4, sx, sy, 150);
      g.addColorStop(0, `rgba(${wx.sun.col},0.9)`); g.addColorStop(0.12, `rgba(${wx.sun.col},0.45)`); g.addColorStop(1, `rgba(${wx.sun.col},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }
  let sandC = null;
  // pierwszy plan: mgła, piasek, popiół, deszcz
  function drawWeatherFront(wx) {
    const f = G.frame;
    if (wx.light) { ctx.fillStyle = wx.light; ctx.fillRect(0, 0, W, H); }
    if (wx.mist) {
      const g = ctx.createLinearGradient(0, 60, 0, H);
      g.addColorStop(0, 'rgba(210,225,220,0)'); g.addColorStop(1, 'rgba(210,225,220,0.28)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 9; i++) {
        const x = ((i * 97 - G.camX * (0.6 + (i % 3) * 0.2) + f * (0.15 + (i % 4) * 0.05)) % (W + 240) + W + 240) % (W + 240) - 120;
        const y = 120 + (i * 29) % 100;
        ctx.fillStyle = `rgba(220,232,228,${0.12 + 0.05 * Math.sin(f * 0.01 + i)})`;
        ctx.beginPath(); ctx.ellipse(x, y, 110, 16, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (wx.sand) {
      const gust = 0.5 + 0.5 * Math.sin(f * 0.006) * Math.sin(f * 0.017 + 1);
      // w porywach piasek zasłania wszystko poza okolicą graczy
      if (!sandC) { sandC = document.createElement('canvas'); sandC.width = W; sandC.height = H; }
      const sg = sandC.getContext('2d'), vis = 0.15 + gust * 0.5;
      sg.globalCompositeOperation = 'source-over'; sg.clearRect(0, 0, W, H);
      sg.fillStyle = `rgba(150,105,55,${vis.toFixed(3)})`; sg.fillRect(0, 0, W, H);
      sg.globalCompositeOperation = 'destination-out';
      for (const q of G.players) {
        if (!q.alive) continue;
        const gx = q.x - G.camX, gy = q.y - q.z - 24, rr = 100 - gust * 30, gr = sg.createRadialGradient(gx, gy, 18, gx, gy, rr);
        gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        sg.fillStyle = gr; sg.fillRect(gx - rr, gy - rr, rr * 2, rr * 2);
      }
      ctx.drawImage(sandC, 0, 0);
      ctx.fillStyle = `rgba(200,150,80,${0.14 + gust * 0.22})`; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 90; i++) {
        const sp = 4 + (i % 5) * 1.6 + gust * 4;
        const x = W + 20 - ((i * 61 + f * sp) % (W + 60)), y = (i * 41 + Math.sin(f * 0.05 + i) * 6) % H;
        ctx.fillStyle = i % 3 ? 'rgba(230,190,120,0.7)' : 'rgba(170,120,60,0.6)';
        ctx.fillRect(x, y, 3 + sp * 0.8 * (0.5 + gust), 1);
      }
      for (let i = 0; i < 4; i++) {
        const x = W + 160 - ((i * 170 + f * (2 + gust * 3)) % (W + 320));
        ctx.fillStyle = `rgba(210,160,90,${0.1 + gust * 0.12})`;
        ctx.beginPath(); ctx.ellipse(x, 60 + i * 44, 140, 26, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (wx.ash) {
      for (let i = 0; i < 60; i++) {
        const x = ((i * 47 + Math.sin(f * 0.02 + i) * 14 - G.camX * 0.3) % (W + 20) + W + 20) % (W + 20) - 10;
        const y = (i * 37 + f * (0.3 + (i % 4) * 0.15)) % (H + 10) - 5;
        if (i % 7 === 0) { ctx.fillStyle = `rgba(255,${120 + (i % 3) * 40},40,${0.6 + 0.4 * Math.sin(f * 0.2 + i)})`; ctx.fillRect(x, y, 2, 2); }
        else { ctx.fillStyle = 'rgba(200,195,195,0.6)'; ctx.fillRect(x, y, 2, 1 + (i % 2)); }
      }
      ctx.fillStyle = 'rgba(60,40,40,0.12)'; ctx.fillRect(0, 0, W, H);
    }
    if (wx.rain) {
      ctx.strokeStyle = 'rgba(170,190,230,0.45)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let i = 0; i < 80; i++) { const x = (i * 41 + f * 4) % (W + 30) - 15, y = (i * 59 + f * 11) % (H + 30) - 15; ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 10); }
      ctx.stroke();
      // rozbryzgi kropel na ziemi
      ctx.fillStyle = 'rgba(190,210,240,0.5)';
      for (let i = 0; i < 12; i++) { const k = (f * 0.07 + i * 0.37) % 1; ctx.fillRect((i * 83 + Math.floor(f / 14) * 29) % W, 150 + (i * 23) % 70, 1 + k * 3, 1); }
    }
  }

