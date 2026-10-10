  // =============================================================== FILTRY CRT (opcja)
  // AUTOMAT — zakrzywienie, poświata, miękkie skanlinie, winieta (filtr oryginalny).
  // MONITOR PC — płaski, ostry obraz, pionowa maska RGB (Trinitron), delikatne skanlinie.
  // STARY TV — mocna wypukłość, rozmycie i kolorowe obwódki sygnału antenowego, szum, pas zakłóceń, migotanie.
  const CRT_MODES = ['off', 'arcade', 'pc', 'tv'];
  const CRT_NAMES = { off: 'WYŁ.', arcade: 'AUTOMAT', pc: 'MONITOR PC', tv: 'STARY TV' };
  const CRT_DESC = { off: 'CZYSTY, OSTRY OBRAZ BEZ EFEKTÓW', arcade: 'ZAKRZYWIONY EKRAN, POŚWIATA I SKANLINIE JAK W SALONIE GIER',
    pc: 'PŁASKI MONITOR: PIONOWA MASKA RGB I DELIKATNE SKANLINIE', tv: 'STARY TELEWIZOR: ROZMYCIE, KOLOROWE OBWÓDKI, SZUM I ZAKŁÓCENIA' };
  const crtMode = () => OPTS.crt === true ? 'arcade' : CRT_MODES.includes(OPTS.crt) ? OPTS.crt : 'off';
  const crt = { a: document.createElement('canvas'), b: document.createElement('canvas'), c: document.createElement('canvas'), glow: document.createElement('canvas'), w: 0, h: 0 };
  const CRT_BEND = 0.045;
  function crtPrepare() {
    const w = screen.width, h = screen.height;
    if (crt.w === w && crt.h === h) return;
    crt.w = w; crt.h = h;
    [crt.a, crt.b, crt.c].forEach(c => { c.width = w; c.height = h; });
    crt.glow.width = W / 2; crt.glow.height = H / 2;
    const step = Math.max(2, Math.round(S));
    // skanlinie: jedna na wiersz pikseli gry, z siłą zależną od trybu
    const scan = (alpha, mask) => {
      const sl = document.createElement('canvas'); sl.width = 3; sl.height = step;
      const g = sl.getContext('2d');
      for (let y = 0; y < step; y++) {
        const d = Math.abs((y + 0.5) / step - 0.5) * 2;           // 0 w środku wiersza, 1 na granicy
        g.fillStyle = `rgba(0,0,0,${(alpha * d * d).toFixed(3)})`; g.fillRect(0, y, 3, 1);
      }
      if (mask && step >= 4) ['rgba(255,60,60,0.035)', 'rgba(60,255,60,0.035)', 'rgba(60,60,255,0.035)'].forEach((c, i) => { g.fillStyle = c; g.fillRect(i, 0, 1, step); });
      return sctx.createPattern(sl, 'repeat');
    };
    crt.scan = scan(0.22, true);
    crt.scanPc = scan(0.13, false);
    crt.scanTv = scan(0.34, false);
    // pionowa maska RGB monitora (kreski co 3 piksele ekranu, mnożona — barwi kolumny)
    const gr = document.createElement('canvas'); gr.width = 3; gr.height = 1;
    const gg = gr.getContext('2d');
    ['#ffd0d0', '#d0ffd0', '#d0d0ff'].forEach((c, i) => { gg.fillStyle = c; gg.fillRect(i, 0, 1, 1); });
    crt.grille = sctx.createPattern(gr, 'repeat');
    // szum telewizora
    const nz = document.createElement('canvas'); nz.width = nz.height = 128;
    const nzc = nz.getContext('2d'), id = nzc.createImageData(128, 128);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255 | 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    nzc.putImageData(id, 0, 0);
    crt.noise = sctx.createPattern(nz, 'repeat');
    const vig = (inner, a) => {
      const v = sctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * inner, w / 2, h / 2, Math.hypot(w, h) * 0.55);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${a})`); return v;
    };
    crt.vig = vig(0.4, 0.6); crt.vigPc = vig(0.5, 0.28); crt.vigTv = vig(0.3, 0.8);
  }
  // zakrzywienie: źródło -> (wiersze) crt.b -> (kolumny) ekran
  function crtCurve(src, bendY, bendX) {
    const w = crt.w, h = crt.h, b = crt.b.getContext('2d'), band = Math.max(2, Math.round(S));
    b.fillStyle = '#000'; b.fillRect(0, 0, w, h); b.imageSmoothingEnabled = true;
    for (let y = 0; y < h; y += band) {
      const ny = (y + band / 2) / h * 2 - 1, sw = w * (1 - bendY * ny * ny);
      b.drawImage(src, 0, y, w, band, (w - sw) / 2, y, sw, band);
    }
    sctx.fillStyle = '#000'; sctx.fillRect(0, 0, w, h); sctx.imageSmoothingEnabled = true;
    for (let x = 0; x < w; x += band) {
      const nx = (x + band / 2) / w * 2 - 1, sh = h * (1 - bendX * nx * nx);
      sctx.drawImage(crt.b, x, 0, band, h, x, (h - sh) / 2, band, sh);
    }
  }
  function crtGlow(alpha, spread) {
    const w = crt.w, h = crt.h, gc = crt.glow.getContext('2d');
    gc.imageSmoothingEnabled = true; gc.clearRect(0, 0, crt.glow.width, crt.glow.height);
    gc.drawImage(screen, 0, 0, crt.glow.width, crt.glow.height);
    sctx.imageSmoothingEnabled = true; sctx.globalCompositeOperation = 'screen'; sctx.globalAlpha = alpha;
    sctx.drawImage(crt.glow, -S * spread, -S * spread, w + S * spread * 2, h + S * spread * 2);
    sctx.globalAlpha = 1; sctx.globalCompositeOperation = 'source-over'; sctx.imageSmoothingEnabled = false;
  }
  function crtCorners(k) {
    const w = crt.w, h = crt.h, r = Math.min(w, h) * k;
    sctx.fillStyle = '#000'; sctx.beginPath(); sctx.rect(0, 0, w, h);
    sctx.moveTo(r, 0); sctx.arcTo(0, 0, 0, r, r); sctx.lineTo(0, h - r); sctx.arcTo(0, h, r, h, r); sctx.lineTo(w - r, h);
    sctx.arcTo(w, h, w, h - r, r); sctx.lineTo(w, r); sctx.arcTo(w, 0, w - r, 0, r); sctx.closePath();
    sctx.fill('evenodd');
  }
  // wersja na procesorze (rezerwa, gdy przeglądarka nie ma WebGL)
  function applyCrt2D(mode) {
    crtPrepare();
    const w = crt.w, h = crt.h, a = crt.a.getContext('2d');
    sctx.save();
    if (mode === 'arcade') {
      a.clearRect(0, 0, w, h); a.drawImage(screen, 0, 0);
      crtCurve(crt.a, CRT_BEND, CRT_BEND * 1.3);
      crtGlow(0.35, 2);
      sctx.fillStyle = crt.scan; sctx.fillRect(0, 0, w, h);
      sctx.fillStyle = crt.vig; sctx.fillRect(0, 0, w, h);
      crtCorners(0.06);
    } else if (mode === 'pc') {
      // płaski ekran: maska RGB (mnożenie), rozjaśnienie kompensujące, skanlinie, lekka poświata
      sctx.globalCompositeOperation = 'multiply'; sctx.fillStyle = crt.grille; sctx.fillRect(0, 0, w, h);
      sctx.globalCompositeOperation = 'source-over';
      crtGlow(0.22, 1);
      sctx.fillStyle = crt.scanPc; sctx.fillRect(0, 0, w, h);
      sctx.fillStyle = crt.vigPc; sctx.fillRect(0, 0, w, h);
      crtCorners(0.012);
    } else {
      // stary telewizor: kanały R i B przesunięte w bok (kolorowe obwódki), rozmycie, wypukłość
      const c = crt.c.getContext('2d'), off = Math.max(1, Math.round(S * 0.7));
      a.globalCompositeOperation = 'source-over'; a.fillStyle = '#000'; a.fillRect(0, 0, w, h);
      [['#ff0000', off], ['#00ff00', 0], ['#0000ff', -off]].forEach(([col, dx]) => {
        c.globalCompositeOperation = 'source-over'; c.drawImage(screen, 0, 0);
        c.globalCompositeOperation = 'multiply'; c.fillStyle = col; c.fillRect(0, 0, w, h);
        a.globalCompositeOperation = 'lighter'; a.drawImage(crt.c, dx, 0);
      });
      // rozmycie sygnału: pomniejszony obraz nałożony na wierzch
      c.globalCompositeOperation = 'source-over'; c.imageSmoothingEnabled = true;
      c.clearRect(0, 0, w, h); c.drawImage(crt.a, 0, 0, w / 2, h / 2);
      a.globalCompositeOperation = 'source-over'; a.imageSmoothingEnabled = true; a.globalAlpha = 0.45;
      a.drawImage(crt.c, 0, 0, w / 2, h / 2, 0, 0, w, h);
      a.globalAlpha = 1;
      crtCurve(crt.a, 0.09, 0.12);
      crtGlow(0.4, 3);
      sctx.fillStyle = crt.scanTv; sctx.fillRect(0, 0, w, h);
      // szum
      const f = app.frame || 0;
      sctx.save(); sctx.globalAlpha = 0.07; sctx.translate((f * 37) % 128, (f * 71) % 128);
      sctx.fillStyle = crt.noise; sctx.fillRect(-128, -128, w + 256, h + 256); sctx.restore();
      // przesuwający się pas zakłóceń
      const by = ((f * 1.6) % (h * 1.6)) - h * 0.3, bh = h * 0.12, gb = sctx.createLinearGradient(0, by, 0, by + bh);
      gb.addColorStop(0, 'rgba(255,255,255,0)'); gb.addColorStop(0.5, 'rgba(255,255,255,0.06)'); gb.addColorStop(1, 'rgba(255,255,255,0)');
      sctx.fillStyle = gb; sctx.fillRect(0, by, w, bh);
      // migotanie
      sctx.fillStyle = `rgba(0,0,0,${(0.03 + Math.random() * 0.03).toFixed(3)})`; sctx.fillRect(0, 0, w, h);
      sctx.fillStyle = crt.vigTv; sctx.fillRect(0, 0, w, h);
      crtCorners(0.1);
    }
    sctx.restore();
  }


  // =============================================================== FILTRY CRT NA KARCIE GRAFICZNEJ (WebGL)
  // Jeden shader nakładany na gotową klatkę: prawdziwe zakrzywienie, poświata, skanlinie na wiersz pikseli gry,
  // maska RGB, rozjechane kolory i szum starego TV. Wynik trafia na płótno #crtgl leżące dokładnie nad ekranem gry.
  const CRT_VS = 'attribute vec2 p; varying vec2 v; void main() { v = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5); gl_Position = vec4(p, 0.0, 1.0); }';
  const CRT_FS = `precision mediump float;
varying vec2 v; uniform sampler2D T; uniform vec2 R; uniform float G, M, t, flick;
vec3 tex(vec2 uv) { return texture2D(T, uv).rgb; }
float hash(vec2 q) { return fract(sin(dot(q, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 k = M < 1.5 ? vec2(0.045, 0.058) : M < 2.5 ? vec2(0.0) : vec2(0.09, 0.12);
  vec2 c = v * 2.0 - 1.0;
  c.x *= 1.0 + k.x * c.y * c.y; c.y *= 1.0 + k.y * c.x * c.x;
  vec2 uv = c * 0.5 + 0.5;
  float rad = (M < 1.5 ? 0.06 : M < 2.5 ? 0.012 : 0.1) * min(R.x, R.y);
  vec2 q = abs(uv - 0.5) * R - (R * 0.5 - rad);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0 || length(max(q, 0.0)) > rad) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
  vec2 px = 1.0 / R;
  vec3 col;
  if (M > 2.5) {
    float off = max(1.0, G * 0.7);
    col = vec3(tex(uv + vec2(off, 0.0) * px).r, tex(uv).g, tex(uv - vec2(off, 0.0) * px).b);
  } else col = tex(uv);
  // poświata: rozmyty obraz z 12 próbek wokół piksela
  float gr = G * (M < 1.5 ? 2.0 : M < 2.5 ? 1.0 : 3.0);
  vec3 blur = vec3(0.0);
  for (int i = 0; i < 12; i++) {
    float a = float(i) * 0.5236, r2 = (i < 6 ? 0.5 : 1.0) * gr;
    blur += tex(uv + vec2(cos(a), sin(a)) * r2 * px);
  }
  blur /= 12.0;
  if (M > 2.5) col = mix(col, blur, 0.38);
  float gA = M < 1.5 ? 0.35 : M < 2.5 ? 0.22 : 0.4;
  col = 1.0 - (1.0 - col) * (1.0 - blur * gA);
  // skanlinie: jedna na wiersz pikseli gry
  float d = abs(fract(uv.y * 224.0) - 0.5) * 2.0;
  float sA = M < 1.5 ? 0.22 : M < 2.5 ? 0.13 : 0.34;
  col *= 1.0 - sA * d * d;
  // maska RGB: pionowe kreski monitora (PC), delikatnie także w automacie
  float m = mod(floor(gl_FragCoord.x), 3.0);
  vec3 mask = vec3(m < 0.5 ? 1.0 : 0.8, (m > 0.5 && m < 1.5) ? 1.0 : 0.8, m > 1.5 ? 1.0 : 0.8);
  if (M > 1.5 && M < 2.5) col *= mask * 1.12;
  else if (M < 1.5 && G >= 4.0) col *= mix(vec3(1.0), mask, 0.25);
  // stary telewizor: szum, przesuwający się pas zakłóceń i migotanie
  if (M > 2.5) {
    col += (hash(gl_FragCoord.xy + fract(t) * 517.0) - 0.5) * 0.09;
    float band = fract(t * 0.1) * 1.6 - 0.3;
    col += 0.06 * smoothstep(0.06, 0.0, abs(uv.y - band));
    col *= 1.0 - flick;
  }
  // winieta
  float vin = M < 1.5 ? 0.6 : M < 2.5 ? 0.28 : 0.62;
  float inner = M < 1.5 ? 0.4 : M < 2.5 ? 0.5 : 0.3;
  col *= 1.0 - vin * smoothstep(inner * 0.75, 1.05, length(c * R / max(R.x, R.y)));
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
  const crtGL = { ok: null, cv: null, gl: null, tex: null, u: {}, w: 0, h: 0, syncT: 0 };
  function crtGLInit() {
    if (crtGL.ok !== null) return crtGL.ok;
    crtGL.ok = false;
    try {
      const cv = document.createElement('canvas'); cv.id = 'crtgl';
      Object.assign(cv.style, { position: 'fixed', zIndex: 2, pointerEvents: 'none', display: 'none', boxShadow: 'none' });
      const gl = cv.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false });
      if (!gl) return false;
      const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, CRT_VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, CRT_FS));
      gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ['T', 'R', 'G', 'M', 't', 'flick'].forEach(n => { crtGL.u[n] = gl.getUniformLocation(prog, n); });
      cv.addEventListener('webglcontextlost', e => { e.preventDefault(); crtGL.ok = false; cv.style.display = 'none'; });
      document.body.appendChild(cv);
      Object.assign(crtGL, { cv, gl, tex, ok: true });
    } catch (e) { crtGL.ok = false; }
    return crtGL.ok;
  }
  // płótno WebGL zawsze dokładnie nad ekranem gry (ten sam rozmiar i położenie)
  function crtGLSync() {
    const cv = crtGL.cv;
    if (crtGL.w !== screen.width || crtGL.h !== screen.height) {
      cv.width = crtGL.w = screen.width; cv.height = crtGL.h = screen.height;
      crtGL.gl.viewport(0, 0, cv.width, cv.height); crtGL.syncT = 0;
    }
    if (--crtGL.syncT <= 0) {
      const r = screen.getBoundingClientRect();
      Object.assign(cv.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
      crtGL.syncT = 30;
    }
  }
  const CRT_M = { arcade: 1, pc: 2, tv: 3 };
  function crtGLDraw(mode) {
    const gl = crtGL.gl, u = crtGL.u;
    crtGLSync();
    gl.bindTexture(gl.TEXTURE_2D, crtGL.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, screen);
    gl.uniform1i(u.T, 0); gl.uniform2f(u.R, crtGL.w, crtGL.h); gl.uniform1f(u.G, S); gl.uniform1f(u.M, CRT_M[mode]);
    gl.uniform1f(u.t, (app.frame || 0) / 60); gl.uniform1f(u.flick, 0.03 + Math.random() * 0.03);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  // ---- pilnowanie płynności: gdy gra zwalnia z włączonym filtrem, filtr wyłącza się do końca sesji
  const crtPerf = { dts: [] };
  function crtPerfSample(dt) {
    if (!OPTS.crtAuto || app.crtSuspended || crtMode() === 'off' || dt > 250) { crtPerf.dts.length = 0; return; }
    crtPerf.dts.push(dt); if (crtPerf.dts.length > 120) crtPerf.dts.shift();
    if (crtPerf.dts.length < 120) return;
    const avg = crtPerf.dts.reduce((a, b) => a + b, 0) / crtPerf.dts.length;
    if (avg > 26) {
      app.crtSuspended = true; crtPerf.dts.length = 0;
      app.toasts.push({ head: 'GRA ZWALNIAŁA', name: 'FILTR CRT WYŁĄCZONY', t: 0, col: '#ffb040' });
    }
  }
  // wywoływane na końcu każdej klatki
  function applyCrt() {
    const mode = app.crtSuspended ? 'off' : crtMode();
    const useGL = mode !== 'off' && crtGLInit();
    if (crtGL.cv) crtGL.cv.style.display = useGL ? 'block' : 'none';
    if (mode === 'off') return;
    if (useGL) crtGLDraw(mode); else applyCrt2D(mode);
  }
