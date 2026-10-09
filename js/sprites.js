/* PALEO HIGHWAY — grafika proceduralna
 * Postacie rysowane są z „kości” (pozy = kąty kończyn), dzięki czemu każda animacja
 * to tylko tabela kątów. Kąty w stopniach: 0 = w dół, dodatnie = do przodu (w stronę patrzenia).
 */
(function (global) {
  'use strict';
  const D2R = Math.PI / 180;

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (amt < 0) { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
    else { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
    return '#' + ((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1);
  }
  function dir(a, L) { return [Math.sin(a * D2R) * L, Math.cos(a * D2R) * L]; }

  // --------------------------------------------------------------- pozy
  const BASE = { lean: 6, bob: 0, fa: [35, 115], ba: [15, 125], fl: [12, 14], bl: [-14, 10], head: 0 };
  function P(o) { return Object.assign({}, BASE, o); }

  const POSES = {
    idle: [P({}), P({ bob: 1, fa: [33, 118], ba: [13, 128] })],
    walk: [
      P({ fl: [25, 10], bl: [-20, 25], fa: [25, 110], ba: [5, 120] }),
      P({ fl: [5, 35], bl: [-5, 5], bob: -1 }),
      P({ fl: [-20, 25], bl: [25, 10], fa: [42, 115], ba: [25, 120] }),
      P({ fl: [-5, 5], bl: [5, 35], bob: -1 })
    ],
    run: [
      P({ lean: 18, fl: [45, 30], bl: [-35, 50], fa: [-30, 90], ba: [50, 90] }),
      P({ lean: 18, fl: [10, 80], bl: [-10, 20], fa: [10, 90], ba: [10, 90], bob: -2 }),
      P({ lean: 18, fl: [-35, 50], bl: [45, 30], fa: [50, 90], ba: [-30, 90] }),
      P({ lean: 18, fl: [-10, 20], bl: [10, 80], fa: [10, 90], ba: [10, 90], bob: -2 })
    ],
    jab: [P({ lean: 12, fa: [90, 0], ba: [20, 125], fl: [22, 10], bl: [-22, 8] })],
    cross: [P({ lean: 20, fa: [30, 125], ba: [88, 0], fl: [25, 12], bl: [-25, 10] })],
    upper: [P({ lean: -6, bob: -2, fa: [160, 15], ba: [10, 110], fl: [12, 25], bl: [-25, 5] })],
    kick: [P({ lean: -18, fa: [40, 110], ba: [-25, 90], fl: [100, 0], bl: [-8, 5] })],
    spinkick: [P({ lean: -22, fa: [-40, 60], ba: [60, 60], fl: [-10, 5], bl: [105, 0] })],
    hammerUp: [P({ lean: -10, fa: [175, 30], ba: [170, 30], fl: [15, 10], bl: [-15, 10] })],
    hammerDown: [P({ lean: 32, fa: [80, 10], ba: [75, 10], fl: [30, 30], bl: [-25, 10], bob: 2 })],
    jump: [P({ air: 20, fa: [60, 120], ba: [30, 120], fl: [60, 100], bl: [20, 90] })],
    jumpkick: [P({ air: 16, lean: -12, fa: [100, 60], ba: [-40, 40], fl: [80, 0], bl: [-10, 95] })],
    hurt: [P({ lean: -20, head: -15, fa: [-30, 40], ba: [-40, 40], fl: [-5, 10], bl: [-15, 10] })],
    hurt2: [P({ lean: 28, head: 15, fa: [10, 30], ba: [-5, 30], fl: [15, 15], bl: [-15, 15] })],
    fall: [P({ air: 14, rot: -55, fa: [130, 20], ba: [110, 20], fl: [40, 30], bl: [20, 40] })],
    down: [P({ air: 3, rot: -86, lean: 0, head: -10, fa: [150, 10], ba: [170, 10], fl: [8, 5], bl: [-5, 12] })],
    crouch: [P({ lean: 30, fa: [60, 90], ba: [30, 90], fl: [70, 120], bl: [-10, 100] })],
    grab: [P({ lean: 10, fa: [80, 40], ba: [70, 50], fl: [20, 10], bl: [-20, 10] })],
    knee: [P({ lean: 15, fa: [60, 60], ba: [50, 60], fl: [85, 115], bl: [-5, 5] })],
    throw: [P({ lean: -25, fa: [170, 20], ba: [160, 20], fl: [20, 10], bl: [-25, 10] })],
    spin: [
      P({ air: 6, lean: 0, fa: [90, 0], ba: [-90, 0], fl: [30, 20], bl: [-30, 20] }),
      P({ air: 6, lean: 0, fa: [-90, 0], ba: [90, 0], fl: [-30, 20], bl: [30, 20] })
    ],
    shoot: [P({ lean: 5, fa: [90, 0], ba: [75, 35], fl: [20, 10], bl: [-20, 10] })],
    swingUp: [P({ lean: -8, fa: [175, 40], ba: [40, 100], fl: [15, 10], bl: [-15, 10] })],
    swingDown: [P({ lean: 22, fa: [75, 0], ba: [20, 110], fl: [28, 15], bl: [-25, 10] })],
    dash: [P({ air: 4, lean: 30, fa: [90, 0], ba: [-60, 20], fl: [40, 30], bl: [-50, 30] })],
    stab: [P({ lean: 22, fa: [95, 0], ba: [-10, 60], fl: [30, 15], bl: [-25, 10] })],
    belly: [P({ lean: -20, fa: [-40, 20], ba: [-50, 20], fl: [35, 20], bl: [-35, 10] })],
    charge: [P({ lean: 35, fa: [60, 90], ba: [40, 90], fl: [40, 40], bl: [-40, 30] })],
    victory: [P({ lean: 0, fa: [178, 10], ba: [20, 40], fl: [10, 5], bl: [-12, 5] })],
    taunt: [P({ lean: -5, fa: [100, 140], ba: [-20, 40] })],
    aim: [P({ lean: 2, fa: [90, 0], ba: [80, 20], fl: [18, 12], bl: [-22, 12] })],
    lob: [P({ lean: -15, fa: [165, 40], ba: [30, 60], fl: [20, 10], bl: [-25, 10] })],
    bow: [P({ lean: 25, head: 10, fa: [20, 60], ba: [-10, 40] })],
    guard: [P({ lean: -6, bob: 2, head: 6, fa: [62, 150], ba: [40, 155], fl: [26, 14], bl: [-26, 12] })]
  };

  // --------------------------------------------------------------- figura
  function segs(ctx, pts, w, col, out) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = out; ctx.lineWidth = w + 2;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = w;
    ctx.stroke();
  }
  function circ(ctx, x, y, r, col, out) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (out) { ctx.fillStyle = out; ctx.beginPath(); ctx.arc(x, y, r + 1, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
    ctx.fillStyle = col; ctx.fill();
  }

  // Oblicza punkty szkieletu (bez rysowania) — przydatne też do hitboxów broni.
  function skeleton(b, pose) {
    const s = b.scale || 1;
    const legU = b.legU * s, legL = b.legL * s, T = b.torso * s, aU = b.armU * s, aL = b.armL * s;
    const fl = pose.fl, bl = pose.bl;
    const drop = l => dir(l[0], legU)[1] + dir(l[0] - l[1], legL)[1];
    let hipY;
    if (pose.air !== undefined) hipY = -pose.air * s - legU * 0.6;
    else hipY = -Math.max(drop(fl), drop(bl)) - 3 * s;
    hipY += (pose.bob || 0);
    const hip = [0, hipY];
    const tilt = pose.lean;
    const sh = [hip[0] + Math.sin(tilt * D2R) * T, hip[1] - Math.cos(tilt * D2R) * T];
    const hr = b.head * s;
    const neckTilt = tilt + (pose.head || 0);
    const head = [sh[0] + Math.sin(neckTilt * D2R) * (hr + 2), sh[1] - Math.cos(neckTilt * D2R) * (hr + 2)];
    function leg(l) {
      const k = dir(l[0], legU); const knee = [hip[0] + k[0], hip[1] + k[1]];
      const f = dir(l[0] - l[1], legL); const foot = [knee[0] + f[0], knee[1] + f[1]];
      return [hip, knee, foot];
    }
    function arm(a, side) {
      const sx = sh[0] + side * 1.5, sy = sh[1] + 2 * s;
      const e = dir(a[0], aU); const elbow = [sx + e[0], sy + e[1]];
      const h = dir(a[0] + a[1], aL); const hand = [elbow[0] + h[0], elbow[1] + h[1]];
      return [[sx, sy], elbow, hand, a[0] + a[1]];
    }
    return { hip, sh, head, hr, legF: leg(fl), legB: leg(bl), armF: arm(pose.fa, 1), armB: arm(pose.ba, -1), s, tilt, neckTilt };
  }

  function drawWeapon(ctx, w, hand, ang, s, out) {
    const [dx, dy] = dir(ang, 1);
    const at = L => [hand[0] + dx * L, hand[1] + dy * L];
    if (w === 'pipe') {
      segs(ctx, [at(-5), at(17)], 3, '#9aa3ad', out);
      segs(ctx, [at(-5), at(-1)], 3, '#5d4a3a', out);
    } else if (w === 'machete') {
      segs(ctx, [at(-5), at(0)], 3, '#3a2a1a', out);
      ctx.save(); ctx.translate(at(0)[0], at(0)[1]); ctx.rotate(ang * D2R);
      ctx.fillStyle = out; ctx.beginPath(); ctx.moveTo(-1, -3); ctx.lineTo(19, -3); ctx.lineTo(22, 1); ctx.lineTo(15, 3); ctx.lineTo(-1, 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c8d2d8'; ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(18, -2); ctx.lineTo(20, 1); ctx.lineTo(14, 2); ctx.lineTo(0, 1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f4f8fa'; ctx.fillRect(1, -2, 16, 1);
      ctx.restore();
    } else if (w === 'chain') {
      // łańcuch zwisa i zakręca za ręką
      const e = at(30), mid = [hand[0] + dx * 14 + 4, hand[1] + dy * 14 + 8];
      for (let i = 0; i <= 8; i++) {
        const k = i / 8, u = 1 - k;
        const px = u * u * hand[0] + 2 * u * k * mid[0] + k * k * e[0], py = u * u * hand[1] + 2 * u * k * mid[1] + k * k * e[1];
        ctx.fillStyle = out; ctx.fillRect(px - 2, py - 2, 4, 4);
        ctx.fillStyle = i % 2 ? '#9aa3ad' : '#c8d0d8'; ctx.fillRect(px - 1.5, py - 1, 3, 2);
      }
    } else if (w === 'bottle') {
      segs(ctx, [at(-3), at(4)], 4, '#3a8a4a', out);
      segs(ctx, [at(4), at(8)], 2, '#3a8a4a', out);
    } else if (w === 'knife') {
      segs(ctx, [at(0), at(8)], 2, '#e6eef2', out);
      segs(ctx, [at(-2), at(1)], 2, '#3a2a1a', out);
    } else if (w === 'rifle') {
      segs(ctx, [at(-8), at(-1)], 4, '#7a4a22', out);
      segs(ctx, [at(-1), at(18)], 2, '#2e3238', out);
    } else if (w === 'shield') {
      ctx.save(); ctx.translate(hand[0] + 2, hand[1] - 2);
      ctx.fillStyle = out; ctx.fillRect(-3, -14, 8, 26);
      ctx.fillStyle = '#6a7078'; ctx.fillRect(-2, -13, 6, 24);
      ctx.fillStyle = '#9aa3ad'; ctx.fillRect(-2, -13, 6, 2); ctx.fillRect(-2, -1, 6, 1);
      ctx.fillStyle = '#c03a2a'; ctx.fillRect(0, -9, 2, 4);
      ctx.restore();
    } else if (w === 'whip') {
      ctx.strokeStyle = out; ctx.lineWidth = 3; ctx.beginPath();
      ctx.moveTo(hand[0], hand[1]); ctx.bezierCurveTo(hand[0] + 4, hand[1] + 10, hand[0] - 8, hand[1] + 12, hand[0] - 4, hand[1] + 4); ctx.stroke();
      ctx.strokeStyle = '#6a3a1a'; ctx.lineWidth = 1.5; ctx.stroke();
    } else if (w === 'whipOut') {
      const e = at(64);
      ctx.strokeStyle = out; ctx.lineWidth = 3; ctx.beginPath();
      ctx.moveTo(hand[0], hand[1]); ctx.quadraticCurveTo(hand[0] + dx * 30, hand[1] - 10, e[0], e[1] + 2); ctx.stroke();
      ctx.strokeStyle = '#8a4a1a'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#fff6a0'; ctx.fillRect(e[0] - 2, e[1], 4, 3);
    } else if (w === 'harpoonGun') {
      segs(ctx, [at(-8), at(4)], 4, '#4a3a2a', out);
      segs(ctx, [at(-2), at(22)], 3, '#5a6a7a', out);
      segs(ctx, [at(20), at(28)], 1.5, '#d0d8e0', out);
    } else if (w === 'anchor') {
      segs(ctx, [at(-4), at(24)], 3, '#4a5058', out);
      const c = at(24);
      ctx.strokeStyle = out; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(c[0], c[1] - 4, 8, 0.2, Math.PI - 0.2); ctx.stroke();
      ctx.strokeStyle = '#7a828a'; ctx.lineWidth = 2; ctx.stroke();
    } else if (w === 'cane') {
      segs(ctx, [at(-6), at(22)], 2, '#2a1a1a', out);
      circ(ctx, at(-7)[0], at(-7)[1], 3, '#e8b040', out);
    } else if (w === 'grenade') {
      circ(ctx, at(3)[0], at(3)[1], 3, '#4a6a2a', out);
      ctx.fillStyle = '#9aa3ad'; ctx.fillRect(at(6)[0] - 1, at(6)[1] - 1, 2, 2);
    } else if (w === 'dynamite') {
      segs(ctx, [at(-2), at(5)], 3, '#c0302a', out);
      ctx.fillStyle = '#ffe060'; ctx.fillRect(at(6)[0] - 1, at(6)[1] - 1, 2, 2);
    } else if (w === 'hammer') {
      segs(ctx, [at(-4), at(22)], 3, '#6b4a2e', out);
      const c = at(22);
      ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(-ang * D2R);
      ctx.fillStyle = out; ctx.fillRect(-7, -5, 14, 10);
      ctx.fillStyle = '#7b8794'; ctx.fillRect(-6, -4, 12, 8);
      ctx.fillStyle = '#c3ccd6'; ctx.fillRect(-6, -4, 12, 2);
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(-2, -1, 4, 2);
      ctx.restore();
    }
  }

  function drawHair(ctx, b, c, hx, hy, r, ang, flash) {
    const col = flash ? '#fff' : c.hair, out = c.outline;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(ang * D2R);
    ctx.fillStyle = col; ctx.strokeStyle = out; ctx.lineWidth = 1;
    switch (b.hair) {
      case 'bandana':
        ctx.beginPath(); ctx.arc(0, -1, r + 0.5, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); ctx.stroke();
        ctx.fillStyle = flash ? '#fff' : c.accent; ctx.fillRect(-r, -r * 0.55, r * 2, 2.2);
        ctx.fillRect(-r - 4, -r * 0.5, 4, 1.6); ctx.fillRect(-r - 5, -r * 0.4 + 1, 3, 1.4);
        break;
      case 'ponytail':
        ctx.beginPath(); ctx.arc(0, -1, r + 0.8, Math.PI * 0.95, Math.PI * 2.0); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(-r - 2, 0, 2.2, 5, 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillRect(-r, -1, 2, r);
        break;
      case 'beard':
        ctx.beginPath(); ctx.arc(0, -1, r + 0.3, Math.PI * 1.1, Math.PI * 1.9); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-r * 0.4, 1); ctx.quadraticCurveTo(r * 0.3, r + 5, r * 0.95, 1); ctx.lineTo(r * 0.6, 2.5); ctx.lineTo(-r * 0.1, 2.5); ctx.closePath(); ctx.fill(); ctx.stroke();
        break;
      case 'mohawk':
        ctx.beginPath(); ctx.moveTo(-r * 0.8, -r * 0.5); ctx.lineTo(-r * 0.4, -r - 4); ctx.lineTo(0, -r - 2); ctx.lineTo(r * 0.3, -r - 4); ctx.lineTo(r * 0.5, -r * 0.6); ctx.closePath(); ctx.fill(); ctx.stroke();
        break;
      case 'hood':
        ctx.beginPath(); ctx.arc(-0.5, 0, r + 1.5, Math.PI * 0.62, Math.PI * 2.15); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1b1b1b'; ctx.fillRect(r * 0.1, -1, r, 3);
        break;
      case 'helmet':
        ctx.beginPath(); ctx.arc(0, -1, r + 1.4, Math.PI * 1.0, Math.PI * 2.0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = out; ctx.fillRect(-r - 2, -2, r * 2 + 4, 2);
        ctx.fillStyle = flash ? '#fff' : c.accent; ctx.fillRect(r * 0.2, -1, r * 0.9, 2);
        ctx.fillStyle = flash ? '#fff' : '#7a4a2a';
        ctx.beginPath(); ctx.moveTo(-r * 0.6, 2); ctx.quadraticCurveTo(r * 0.3, r + 3, r * 0.9, 2); ctx.closePath(); ctx.fill();
        break;
      case 'cap':
        ctx.beginPath(); ctx.arc(0, -1, r + 0.6, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillRect(0, -2, r + 4, 2);
        break;
      case 'hatbeard': {
        // szeroki kapelusz tropiciela + siwa broda
        ctx.beginPath(); ctx.moveTo(-r * 0.5, 1); ctx.quadraticCurveTo(r * 0.3, r + 5, r * 1.0, 1); ctx.lineTo(r * 0.6, 2.4); ctx.lineTo(-r * 0.1, 2.4); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillRect(r * 0.15, 0.2, r * 0.7, 1.2);
        const hat = flash ? '#fff' : c.accent;
        ctx.fillStyle = out; ctx.fillRect(-r - 3.5, -r * 0.55 - 1, r * 2 + 7, 3.2);
        ctx.fillStyle = hat; ctx.fillRect(-r - 2.5, -r * 0.55, r * 2 + 5, 1.6);
        ctx.fillStyle = out; ctx.beginPath(); ctx.moveTo(-r * 0.8, -r * 0.5); ctx.lineTo(-r * 0.6, -r - 3.5); ctx.lineTo(r * 0.6, -r - 3.5); ctx.lineTo(r * 0.8, -r * 0.5); ctx.fill();
        ctx.fillStyle = hat; ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.55); ctx.lineTo(-r * 0.5, -r - 2.6); ctx.lineTo(r * 0.5, -r - 2.6); ctx.lineTo(r * 0.7, -r * 0.55); ctx.fill();
        ctx.fillStyle = flash ? '#fff' : '#c03a2a'; ctx.fillRect(-r * 0.68, -r * 0.95, r * 1.36, 1.2);
        break;
      }
      case 'bald': default:
        break;
    }
    ctx.restore();
  }

  // Główna funkcja rysująca postać. (x,y) = punkt na ziemi pod stopami w buforze ekranu.
  function drawFigure(ctx, b, pose, x, y, face, opt) {
    opt = opt || {};
    const flash = opt.flash;
    const c = b.colors;
    const out = c.outline || '#140c10';
    const col = k => flash ? '#ffffff' : c[k];
    const dark = k => flash ? '#e0e0e0' : shade(c[k], -0.28);
    const sk = skeleton(b, pose);
    const s = sk.s;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(face, 1);
    if (pose.rot) { ctx.translate(sk.hip[0], sk.hip[1]); ctx.rotate(pose.rot * D2R); ctx.translate(-sk.hip[0], -sk.hip[1]); }
    if (opt.rot) { ctx.translate(sk.hip[0], sk.hip[1]); ctx.rotate(opt.rot); ctx.translate(-sk.hip[0], -sk.hip[1]); }

    const limbW = b.limbW * s, armW = b.armW * s;
    const sleeve = b.sleeveless ? 'skin' : 'shirt';
    function drawArm(a, back) {
      const cs = back ? dark(sleeve) : col(sleeve), cf = back ? dark('skin') : col('skin');
      segs(ctx, [a[0], a[1]], armW, cs, out);
      segs(ctx, [a[1], a[2]], armW * 0.9, cf, out);
      circ(ctx, a[2][0], a[2][1], armW * 0.62, back ? dark('gloves') : col('gloves'), out);
    }
    function drawLeg(l, back) {
      const cp = back ? dark('pants') : col('pants');
      segs(ctx, [l[0], l[1], l[2]], limbW, cp, out);
      // but
      const f = l[2];
      ctx.fillStyle = out; ctx.fillRect(f[0] - 2.5 * s, f[1] - 3 * s, 7.5 * s, 4.5 * s);
      ctx.fillStyle = back ? dark('boots') : col('boots'); ctx.fillRect(f[0] - 1.8 * s, f[1] - 2.3 * s, 6 * s, 3 * s);
    }

    if (opt.weaponBack) drawWeapon(ctx, opt.weaponBack, sk.armB[2], sk.armB[3], s, out);
    drawArm(sk.armB, true);
    drawLeg(sk.legB, true);

    // tułów
    const hip = sk.hip, sh = sk.sh;
    const px = Math.cos(sk.tilt * D2R), py = Math.sin(sk.tilt * D2R);
    const hw = b.hipW * s / 2, sw = b.shoulderW * s / 2;
    ctx.beginPath();
    ctx.moveTo(hip[0] - px * hw, hip[1] - py * hw);
    ctx.lineTo(hip[0] + px * hw, hip[1] + py * hw);
    ctx.lineTo(sh[0] + px * sw, sh[1] + py * sw);
    ctx.lineTo(sh[0] - px * sw, sh[1] - py * sw);
    ctx.closePath();
    ctx.lineJoin = 'round'; ctx.lineWidth = 2; ctx.strokeStyle = out; ctx.stroke();
    ctx.fillStyle = col('shirt'); ctx.fill();
    if (b.belly) {
      const mx = (hip[0] + sh[0]) / 2 + px * hw * 0.5, my = (hip[1] + sh[1]) / 2 + 2;
      ctx.beginPath(); ctx.ellipse(mx, my, b.belly * s, b.belly * 1.15 * s, sk.tilt * D2R, 0, Math.PI * 2);
      ctx.fillStyle = out; ctx.fill();
      ctx.beginPath(); ctx.ellipse(mx, my, b.belly * s - 1, b.belly * 1.15 * s - 1, sk.tilt * D2R, 0, Math.PI * 2);
      ctx.fillStyle = col(b.bellyCol || 'shirt'); ctx.fill();
    }
    // detale tułowia
    if (!flash) {
      ctx.save(); ctx.translate(hip[0], hip[1]); ctx.rotate(sk.tilt * D2R);
      const T = b.torso * s;
      (b.details || []).forEach(d => {
        ctx.fillStyle = d.c;
        if (d.t === 'belt') ctx.fillRect(-hw, -3 * s, hw * 2, 2.5 * s);
        else if (d.t === 'straps') { ctx.fillRect(-sw * 0.6, -T, 2 * s, T); ctx.fillRect(sw * 0.3, -T, 2 * s, T); }
        else if (d.t === 'stripe') ctx.fillRect(-sw * 0.9, -T * 0.65, sw * 1.8, 3 * s);
        else if (d.t === 'vest') { ctx.fillRect(-sw, -T, sw * 0.8, T * 0.85); ctx.fillRect(sw * 0.3, -T, sw * 0.7, T * 0.85); }
        else if (d.t === 'plate') { ctx.fillRect(-sw * 0.7, -T * 0.95, sw * 1.6, T * 0.5); ctx.fillStyle = shade(d.c, 0.35); ctx.fillRect(-sw * 0.7, -T * 0.95, sw * 1.6, 2); }
        else if (d.t === 'bandolier') { ctx.save(); ctx.rotate(-0.6); ctx.fillRect(-sw * 1.1, -T * 0.55, sw * 2.6, 2.5 * s); ctx.restore(); }
        else if (d.t === 'pocket') ctx.fillRect(sw * 0.1, -T * 0.7, sw * 0.6, 3 * s);
      });
      ctx.restore();
    }

    if (opt.weapon && opt.weaponUnder) drawWeapon(ctx, opt.weapon, sk.armF[2], sk.armF[3], s, out);
    drawLeg(sk.legF, false);

    // głowa
    const hx = sk.head[0], hy = sk.head[1], r = sk.hr;
    segs(ctx, [[sh[0], sh[1]], [hx - 0.5, hy + r * 0.4]], 3.5 * s, col('skin'), out);
    circ(ctx, hx, hy, r, col('skin'), out);
    if (!flash) {
      ctx.fillStyle = dark('skin');
      ctx.fillRect(hx - r * 0.2, hy + r * 0.35, r * 1.1, 1.2);
      ctx.fillStyle = '#140c10';
      const ey = hy - r * 0.2 + (pose.head || 0) * 0.04;
      ctx.fillRect(hx + r * 0.38, ey, 1.6, opt.hurtFace ? 1 : 2);
      if (b.eyeCol) { ctx.fillStyle = b.eyeCol; ctx.fillRect(hx + r * 0.38, ey, 1.6, 1); }
    }
    drawHair(ctx, b, c, hx, hy, r, sk.neckTilt, flash);

    drawArm(sk.armF, false);
    if (opt.weapon && !opt.weaponUnder) drawWeapon(ctx, opt.weapon, sk.armF[2], sk.armF[3], s, out);
    ctx.restore();
    return sk;
  }

  // Duży portret do HUD-u
  function drawPortrait(ctx, b, x, y, size, flash) {
    const c = b.colors, r = size;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = c.shirt; ctx.fillRect(-r * 1.4, r * 0.7, r * 2.8, r * 0.9);
    circ(ctx, 0, 0, r, flash ? '#fff' : c.skin, c.outline);
    ctx.fillStyle = '#140c10';
    ctx.fillRect(r * 0.3, -r * 0.2, r * 0.18, r * 0.25);
    ctx.fillRect(-r * 0.25, -r * 0.2, r * 0.18, r * 0.25);
    ctx.fillStyle = shade(c.skin, -0.3);
    ctx.fillRect(-r * 0.2, r * 0.4, r * 0.5, r * 0.1);
    ctx.scale(r / (b.head), r / (b.head));
    drawHair(ctx, b, c, 0, 0, b.head, 0, flash);
    ctx.restore();
  }

  // --------------------------------------------------------------- raptor
  function drawRaptor(ctx, x, y, face, t, st, colors, opt) {
    opt = opt || {};
    const flash = opt.flash;
    const c = colors;
    const out = '#10140c';
    const body = flash ? '#fff' : c.body, belly = flash ? '#eee' : c.belly, stripe = flash ? '#ddd' : c.stripe;
    const darkBody = flash ? '#ddd' : shade(c.body, -0.3);
    const sc = opt.scale || 1;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(face * sc, sc);
    if (st === 'down') { ctx.translate(0, -6); ctx.rotate(-1.35); ctx.translate(0, 6); }
    const run = st === 'run' || st === 'walk';
    const ph = run ? t * (st === 'run' ? 0.5 : 0.28) : 0;
    const bob = run ? Math.abs(Math.sin(ph)) * 2 : Math.sin(t * 0.08) * 0.8;
    const lunge = st === 'bite' ? 8 : (st === 'hurt' ? -4 : 0);
    const hipX = -2, hipY = -26 - bob + (st === 'hurt' ? 2 : 0);

    function leg(phase, back) {
      const sw = run ? Math.sin(phase) : (st === 'bite' ? (back ? -0.4 : 0.5) : 0);
      const lift = run ? Math.max(0, Math.cos(phase)) * 6 : 0;
      const knee = [hipX + 6 + sw * 7, hipY + 12];
      const ankle = [hipX - 3 + sw * 12, -6 - lift];
      const toe = [ankle[0] + 7, -1 - lift * 0.6];
      const colL = back ? darkBody : body;
      segs(ctx, [[hipX, hipY + 2], knee], 7, colL, out);
      segs(ctx, [knee, ankle, toe], 3.5, colL, out);
      ctx.fillStyle = flash ? '#fff' : '#e8e0c8';
      ctx.beginPath(); ctx.moveTo(toe[0] - 3, toe[1] - 2); ctx.lineTo(toe[0] - 1, toe[1] - 6); ctx.lineTo(toe[0], toe[1] - 2); ctx.fill();
    }
    leg(ph + Math.PI, true);
    // ogon
    const tail = [[hipX - 4, hipY]];
    for (let i = 1; i <= 6; i++) {
      const sway = Math.sin(t * 0.12 - i * 0.6) * i * 0.6 + (run ? Math.sin(ph) * i * 0.3 : 0);
      tail.push([hipX - 4 - i * 6, hipY - 3 + i * 0.6 + sway]);
    }
    for (let i = 0; i < tail.length - 1; i++) segs(ctx, [tail[i], tail[i + 1]], 9 - i * 1.4, body, out);
    // tułów
    ctx.save(); ctx.translate(hipX + 6 + lunge * 0.3, hipY - 3); ctx.rotate(-0.25 - (st === 'bite' ? -0.25 : 0));
    ctx.beginPath(); ctx.ellipse(0, 0, 15, 8.5, 0, 0, Math.PI * 2); ctx.fillStyle = out; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 7.5, 0, 0, Math.PI * 2); ctx.fillStyle = body; ctx.fill();
    ctx.beginPath(); ctx.ellipse(2, 3.5, 11, 3.5, 0, 0, Math.PI * 2); ctx.fillStyle = belly; ctx.fill();
    ctx.fillStyle = stripe;
    for (let i = -2; i <= 2; i++) ctx.fillRect(i * 5 - 1, -7, 2.4, 5);
    ctx.restore();
    // szyja + głowa
    const nb = [hipX + 16 + lunge * 0.5, hipY - 8];
    const hb = [nb[0] + 7 + lunge, nb[1] - 9 + (st === 'bite' ? 6 : 0) + Math.sin(t * 0.1) * (run ? 0 : 1)];
    segs(ctx, [nb, hb], opt.rex ? 10 : 7, body, out);
    // ręka
    if (opt.rex) segs(ctx, [[nb[0], nb[1] + 5], [nb[0] + 3, nb[1] + 8]], 2, darkBody, out);
    else segs(ctx, [[nb[0] - 2, nb[1] + 4], [nb[0] + 4, nb[1] + 8], [nb[0] + 6, nb[1] + 6]], 2.5, darkBody, out);
    ctx.save(); ctx.translate(hb[0], hb[1]);
    if (opt.rex) ctx.scale(1.45, 1.45);
    const jaw = st === 'bite' ? 0.55 : (st === 'roar' ? 0.7 : (st === 'hurt' ? 0.4 : 0.05));
    // żuchwa
    ctx.save(); ctx.rotate(jaw);
    ctx.fillStyle = out; ctx.fillRect(-1, 0, 15, 5);
    ctx.fillStyle = belly; ctx.fillRect(0, 1, 13, 3);
    ctx.restore();
    // czaszka
    ctx.beginPath(); ctx.moveTo(-4, -5); ctx.lineTo(10, -4); ctx.lineTo(16, -1); ctx.lineTo(16, 2); ctx.lineTo(-3, 3); ctx.closePath();
    ctx.lineWidth = 2; ctx.strokeStyle = out; ctx.stroke(); ctx.fillStyle = body; ctx.fill();
    if (jaw > 0.2 && !flash) {
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(3 + i * 3, 2); ctx.lineTo(4.5 + i * 3, 5); ctx.lineTo(6 + i * 3, 2); ctx.fill(); }
    }
    ctx.fillStyle = flash ? '#fff' : '#ffcf3a'; ctx.fillRect(3, -3, 3, 2.5);
    ctx.fillStyle = '#10140c'; ctx.fillRect(4.5, -3, 1.2, 2.5);
    ctx.fillStyle = stripe; ctx.fillRect(-3, -5, 9, 1.5);
    if (opt.rex && !flash) {
      ctx.fillStyle = '#fff'; for (let i = 0; i < 5; i++) ctx.fillRect(2 + i * 2.6, 2, 1.2, 1.6);
      ctx.strokeStyle = '#d8b8a8'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(6, -4); ctx.lineTo(10, 0); ctx.moveTo(8, -4.5); ctx.lineTo(11, -1); ctx.stroke();
      ctx.fillStyle = '#ff3a1a'; ctx.fillRect(3, -3, 3, 2.5); ctx.fillStyle = '#10140c'; ctx.fillRect(4.5, -3, 1.2, 2.5);
    }
    ctx.restore();
    leg(ph, false);
    ctx.restore();
  }

  // --------------------------------------------------------------- pachy
  // Pachy — krępy dinozaur z kopułą na głowie, szarżuje głową.
  function drawPachy(ctx, x, y, face, t, st, colors, opt) {
    opt = opt || {};
    const flash = opt.flash, out = '#10140c';
    const body = flash ? '#fff' : colors.body, belly = flash ? '#eee' : colors.belly, dome = flash ? '#fff' : colors.dome;
    const darkBody = flash ? '#ddd' : shade(colors.body, -0.3);
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(face, 1);
    if (st === 'down') { ctx.translate(0, -8); ctx.rotate(-1.4); ctx.translate(0, 8); }
    const run = st === 'run' || st === 'walk' || st === 'charge';
    const ph = run ? t * (st === 'walk' ? 0.25 : 0.55) : 0;
    const bob = run ? Math.abs(Math.sin(ph)) * 1.5 : Math.sin(t * 0.07) * 0.6;
    const head = st === 'charge' || st === 'windup' ? 8 : 0;
    const hy = -22 - bob;
    function leg(p, back) {
      const sw = run ? Math.sin(p) : 0, lift = run ? Math.max(0, Math.cos(p)) * 5 : 0;
      const knee = [2 + sw * 6, hy + 12], foot = [-2 + sw * 10, -1 - lift];
      segs(ctx, [[0, hy + 2], knee], 9, back ? darkBody : body, out);
      segs(ctx, [knee, foot, [foot[0] + 6, foot[1]]], 5, back ? darkBody : body, out);
    }
    leg(ph + Math.PI, true);
    const tail = [[-8, hy]];
    for (let i = 1; i <= 4; i++) tail.push([-8 - i * 6, hy - 1 + i * 1.5 + Math.sin(t * 0.1 - i) * i * 0.4]);
    for (let i = 0; i < tail.length - 1; i++) segs(ctx, [tail[i], tail[i + 1]], 10 - i * 2, body, out);
    ctx.save(); ctx.translate(4, hy - 2); ctx.rotate(head ? 0.15 : -0.05);
    ctx.beginPath(); ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2); ctx.fillStyle = out; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2); ctx.fillStyle = body; ctx.fill();
    ctx.beginPath(); ctx.ellipse(2, 5, 12, 4, 0, 0, Math.PI * 2); ctx.fillStyle = belly; ctx.fill();
    ctx.fillStyle = flash ? '#ddd' : colors.spots; for (let i = 0; i < 5; i++) ctx.fillRect(-10 + i * 5, -8 + (i % 2) * 2, 3, 2);
    ctx.restore();
    const hx = 20 + head, hhy = hy - 8 + head * 0.9;
    segs(ctx, [[12, hy - 4], [hx - 3, hhy + 2]], 8, body, out);
    ctx.save(); ctx.translate(hx, hhy); ctx.rotate(head ? 0.5 : 0);
    ctx.beginPath(); ctx.arc(0, -1, 8, Math.PI, 0); ctx.lineTo(9, 4); ctx.lineTo(-6, 5); ctx.closePath();
    ctx.lineWidth = 2; ctx.strokeStyle = out; ctx.stroke(); ctx.fillStyle = body; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -2, 7, Math.PI * 1.05, Math.PI * 1.95); ctx.lineTo(5, -2); ctx.lineTo(-5, -2); ctx.fillStyle = dome; ctx.fill();
    ctx.fillStyle = flash ? '#fff' : '#e8e0c8';
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-8 + i * 3, -2 - (i % 2) * 2); ctx.lineTo(-10 + i * 3, -6); ctx.lineTo(-6 + i * 3, -3); ctx.fill(); }
    ctx.fillStyle = '#10140c'; ctx.fillRect(3, 0, 2, 2);
    ctx.restore();
    leg(ph, false);
    ctx.restore();
  }

  // ------------------------------------------------------------- pociski
  function drawShot(ctx, s, x, y, t) {
    const out = '#140c10';
    ctx.save(); ctx.translate(Math.round(x), Math.round(y));
    switch (s.type) {
      case 'dynamite':
        ctx.rotate(s.landed ? 0 : t * 0.4);
        segs(ctx, [[-3, 0], [3, 0]], 3.5, '#c0302a', out);
        if (Math.floor(t / 3) % 2) { ctx.fillStyle = '#fff6a0'; ctx.fillRect(3, -2, 3, 3); }
        break;
      case 'grenade':
        ctx.rotate(s.landed ? 0 : t * 0.5);
        circ(ctx, 0, -1, 3.5, '#4a6a2a', out);
        ctx.fillStyle = '#2e4a1a'; ctx.fillRect(-2, -2, 1, 1); ctx.fillRect(1, 0, 1, 1);
        ctx.fillStyle = '#9aa3ad'; ctx.fillRect(-1, -6, 3, 2);
        if (s.fuse < 20 && Math.floor(t / 2) % 2) { ctx.fillStyle = '#ff4030'; ctx.fillRect(-1, -2, 2, 2); }
        break;
      case 'bottle':
        ctx.rotate(t * 0.45);
        segs(ctx, [[-4, 0], [3, 0]], 4, '#3a8a4a', out); segs(ctx, [[3, 0], [7, 0]], 2, '#3a8a4a', out);
        ctx.fillStyle = '#a0e0a0'; ctx.fillRect(-3, -1, 5, 1);
        break;
      case 'rock':
        ctx.rotate(t * 0.1);
        ctx.fillStyle = out; ctx.beginPath(); ctx.moveTo(-6, 2); ctx.lineTo(-4, -5); ctx.lineTo(3, -6); ctx.lineTo(6, 0); ctx.lineTo(2, 5); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#8a8478'; ctx.beginPath(); ctx.moveTo(-5, 1); ctx.lineTo(-3, -4); ctx.lineTo(3, -5); ctx.lineTo(5, 0); ctx.lineTo(1, 4); ctx.closePath(); ctx.fill();
        break;
      case 'net':
        ctx.rotate(t * 0.3);
        ctx.strokeStyle = '#e0d4a8'; ctx.lineWidth = 1; ctx.beginPath();
        for (let i = -2; i <= 2; i++) { ctx.moveTo(i * 3, -7); ctx.lineTo(i * 3, 7); ctx.moveTo(-7, i * 3); ctx.lineTo(7, i * 3); }
        ctx.stroke(); ctx.fillStyle = '#5a4a3a'; ctx.fillRect(-8, -8, 2, 2); ctx.fillRect(6, 6, 2, 2);
        break;
      case 'wrench':
        ctx.rotate(t * 0.5 * Math.sign(s.vx));
        segs(ctx, [[-5, 0], [4, 0]], 2.5, '#9aa3ad', out);
        ctx.strokeStyle = out; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(6, 0, 2.6, 0.7, Math.PI * 2 - 0.7); ctx.stroke();
        ctx.strokeStyle = '#c8d0d8'; ctx.lineWidth = 1.5; ctx.stroke();
        break;
      case 'bullet':
        ctx.fillStyle = '#fff6a0'; ctx.fillRect(-4, -1, 8, 2);
        ctx.fillStyle = 'rgba(255,200,80,0.5)'; ctx.fillRect(-10 * Math.sign(s.vx), -0.5, 8, 1);
        break;
      case 'knife':
        ctx.rotate(t * 0.6 * Math.sign(s.vx));
        segs(ctx, [[-4, 0], [4, 0]], 2, '#e6eef2', out);
        break;
      case 'harpoon':
        ctx.scale(Math.sign(s.vx), 1);
        segs(ctx, [[-14, 0], [6, 0]], 2, '#8a929a', out);
        ctx.fillStyle = out; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(4, -4); ctx.lineTo(4, 4); ctx.fill();
        ctx.fillStyle = '#d0d8e0'; ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(5, -3); ctx.lineTo(5, 3); ctx.fill();
        break;
      case 'wave': {
        ctx.fillStyle = 'rgba(255,190,60,0.35)'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffd860';
        for (let i = 0; i < 5; i++) { const h = 8 + Math.sin(t * 0.5 + i) * 5; ctx.fillRect(-10 + i * 5, -h, 3, h); }
        ctx.fillStyle = '#fff'; ctx.fillRect(-2, -14 - (t % 6) * 0.7, 3, 3);
        break;
      }
    }
    ctx.restore();
  }

  // ------------------------------------------------------------ przedmioty
  function drawItem(ctx, type, x, y, t) {
    const out = '#140c10';
    ctx.save(); ctx.translate(Math.round(x), Math.round(y));
    const bob = (type === 'gem' || type === 'coin') ? Math.round(Math.sin(t * 0.15) * 1.5) : 0;
    ctx.translate(0, bob);
    switch (type) {
      case 'meat':
        segs(ctx, [[-8, -3], [-1, -4]], 3, '#f1e6d0', out);
        circ(ctx, -9, -5, 2, '#f1e6d0', out); circ(ctx, -9, -2, 2, '#f1e6d0', out);
        ctx.beginPath(); ctx.ellipse(4, -5, 8, 6, -0.2, 0, Math.PI * 2); ctx.fillStyle = out; ctx.fill();
        ctx.beginPath(); ctx.ellipse(4, -5, 7, 5, -0.2, 0, Math.PI * 2); ctx.fillStyle = '#a5401f'; ctx.fill();
        ctx.fillStyle = '#d66a34'; ctx.fillRect(1, -9, 6, 2);
        break;
      case 'fruit':
        circ(ctx, 0, -5, 5, '#e8c22c', out);
        ctx.fillStyle = '#b8901c'; ctx.fillRect(-2, -7, 1, 1); ctx.fillRect(1, -4, 1, 1); ctx.fillRect(-1, -2, 1, 1);
        segs(ctx, [[0, -10], [-3, -14]], 2, '#3a9a3a', out); segs(ctx, [[0, -10], [3, -14]], 2, '#3a9a3a', out);
        break;
      case 'gem':
        ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(6, -6); ctx.lineTo(0, 0); ctx.lineTo(-6, -6); ctx.closePath();
        ctx.lineWidth = 2; ctx.strokeStyle = out; ctx.stroke(); ctx.fillStyle = '#35d0e0'; ctx.fill();
        ctx.fillStyle = '#c8faff'; ctx.fillRect(-2, -9, 2, 3);
        break;
      case 'coin':
        circ(ctx, 0, -6, 5, '#f4c430', out);
        ctx.fillStyle = '#a77d0e'; ctx.fillRect(-1, -9, 2, 6);
        break;
      case 'machete':
        ctx.rotate(-0.3);
        segs(ctx, [[-10, -3], [-5, -3]], 3, '#3a2a1a', out);
        ctx.fillStyle = out; ctx.fillRect(-5, -6, 17, 6);
        ctx.fillStyle = '#c8d2d8'; ctx.fillRect(-4, -5, 15, 4); ctx.fillStyle = '#f4f8fa'; ctx.fillRect(-4, -5, 14, 1);
        break;
      case 'chain':
        for (let i = 0; i < 7; i++) { const x = -10 + i * 3.4, y = -3 + Math.sin(i * 1.3) * 2; ctx.fillStyle = out; ctx.fillRect(x - 2, y - 2, 4, 4); ctx.fillStyle = i % 2 ? '#9aa3ad' : '#c8d0d8'; ctx.fillRect(x - 1.5, y - 1, 3, 2); }
        break;
      case 'bottle':
        ctx.rotate(-0.5);
        segs(ctx, [[-5, -3], [3, -3]], 5, '#3a8a4a', out); segs(ctx, [[3, -3], [8, -3]], 2.5, '#3a8a4a', out);
        ctx.fillStyle = '#a0e0a0'; ctx.fillRect(-4, -5, 6, 1);
        break;
      case 'pipe':
        segs(ctx, [[-12, -2], [12, -3]], 3, '#9aa3ad', out);
        segs(ctx, [[-12, -2], [-7, -2.2]], 3, '#5d4a3a', out);
        break;
      case 'dynamite':
        for (let i = 0; i < 3; i++) segs(ctx, [[-5 + i * 4, -2], [-5 + i * 4, -11]], 3.5, '#c0302a', out);
        ctx.fillStyle = '#e8d8a0'; ctx.fillRect(-7, -8, 13, 2);
        ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-1, -11); ctx.quadraticCurveTo(2, -16, 5, -14); ctx.stroke();
        if (Math.floor(t / 4) % 2) { ctx.fillStyle = '#ffe060'; ctx.fillRect(4, -15, 2, 2); }
        break;
      case 'grenade':
        for (let i = 0; i < 2; i++) {
          circ(ctx, -4 + i * 8, -5, 4, '#4a6a2a', out);
          ctx.fillStyle = '#2e4a1a'; ctx.fillRect(-6 + i * 8, -6, 1, 1); ctx.fillRect(-3 + i * 8, -4, 1, 1);
          ctx.fillStyle = '#9aa3ad'; ctx.fillRect(-5 + i * 8, -11, 3, 2);
        }
        break;
      case 'amber':
        ctx.fillStyle = out; ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(5, -6); ctx.lineTo(3, 0); ctx.lineTo(-3, 0); ctx.lineTo(-5, -6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#f0a020'; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(4, -6); ctx.lineTo(2.5, -1); ctx.lineTo(-2.5, -1); ctx.lineTo(-4, -6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffe0a0'; ctx.fillRect(-2, -8, 2, 3);
        break;
      case '1up':
        ctx.fillStyle = 'rgba(255,220,120,0.35)'; ctx.beginPath(); ctx.arc(0, -8, 9 + Math.sin(t * 0.2), 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, -7, 6, 8, 0, 0, Math.PI * 2); ctx.fillStyle = out; ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, -7, 5, 7, 0, 0, Math.PI * 2); ctx.fillStyle = '#f0a020'; ctx.fill();
        ctx.fillStyle = 'rgba(120,60,10,0.7)'; ctx.beginPath(); ctx.ellipse(0.5, -6, 2.5, 3.5, 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff8d0'; ctx.fillRect(-3, -12, 2, 3);
        if (Math.floor(t / 6) % 3 === 0) { ctx.fillStyle = '#fff'; ctx.fillRect(4, -15, 1, 3); ctx.fillRect(3, -14, 3, 1); }
        break;
      case 'rifle':
        segs(ctx, [[-12, -3], [-3, -3]], 4, '#7a4a22', out);
        segs(ctx, [[-3, -4], [14, -4]], 2, '#2e3238', out);
        break;
    }
    ctx.restore();
  }

  function drawBarrel(ctx, x, y, hp, kind) {
    const out = '#140c10';
    ctx.save(); ctx.translate(Math.round(x), Math.round(y));
    if (kind === 'pen') { ctx.restore(); drawPen(ctx, x, y, hp); return; }
    if (kind === 'fuel') {
      ctx.beginPath(); ctx.ellipse(0, -14, 11, 14, 0, 0, Math.PI * 2); ctx.fillStyle = out; ctx.fill();
      ctx.fillRect(-10, -27, 20, 27);
      ctx.fillStyle = '#b02a20'; ctx.fillRect(-9, -26, 18, 25);
      ctx.fillStyle = '#d0483a'; ctx.fillRect(-5, -26, 4, 25);
      ctx.fillStyle = '#3a3a3a'; ctx.fillRect(-10, -22, 20, 2); ctx.fillRect(-10, -6, 20, 2);
      ctx.fillStyle = '#ffd040'; ctx.beginPath(); ctx.moveTo(0, -19); ctx.lineTo(4, -12); ctx.lineTo(1, -12); ctx.lineTo(2, -9); ctx.lineTo(-4, -14); ctx.lineTo(-1, -14); ctx.closePath(); ctx.fill();
      ctx.restore(); return;
    }
    if (kind === 'wall') {
      ctx.fillStyle = out; ctx.fillRect(-20, -46, 40, 46);
      const cols = ['#7a6a5a', '#8a7a68', '#6e5e50'];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { ctx.fillStyle = cols[(r + c) % 3]; ctx.fillRect(-19 + c * 13, -45 + r * 11, 12, 10); }
      ctx.strokeStyle = out; ctx.lineWidth = 1;
      const k = 6 - hp;
      ctx.beginPath(); ctx.moveTo(-6, -46); ctx.lineTo(-2, -34); ctx.lineTo(-8, -22); ctx.lineTo(-3, -10);
      if (k > 1) { ctx.moveTo(-2, -34); ctx.lineTo(8, -28); ctx.lineTo(12, -16); }
      if (k > 3) { ctx.moveTo(-8, -22); ctx.lineTo(-16, -14); ctx.moveTo(8, -28); ctx.lineTo(16, -40); }
      ctx.stroke();
      ctx.fillStyle = '#4a7a3a'; ctx.fillRect(-20, -46, 6, 3); ctx.fillRect(10, -46, 10, 2);
      ctx.restore(); return;
    }
    if (kind === 'crate') {
      ctx.fillStyle = out; ctx.fillRect(-12, -24, 24, 24);
      ctx.fillStyle = '#9b6a34'; ctx.fillRect(-11, -23, 22, 22);
      ctx.fillStyle = '#6e4620';
      ctx.fillRect(-11, -23, 22, 3); ctx.fillRect(-11, -4, 22, 3);
      ctx.save(); ctx.beginPath(); ctx.rect(-11, -20, 22, 16); ctx.clip();
      ctx.strokeStyle = '#6e4620'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-11, -20); ctx.lineTo(11, -4); ctx.stroke();
      ctx.restore();
      if (hp < 2) { ctx.strokeStyle = out; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-4, -23); ctx.lineTo(0, -14); ctx.lineTo(-3, -8); ctx.stroke(); }
    } else {
      ctx.beginPath(); ctx.ellipse(0, -14, 11, 14, 0, 0, Math.PI * 2); ctx.fillStyle = out; ctx.fill();
      ctx.fillStyle = out; ctx.fillRect(-10, -27, 20, 27);
      ctx.fillStyle = '#8a5a2b'; ctx.fillRect(-9, -26, 18, 25);
      ctx.fillStyle = '#a8743e'; ctx.fillRect(-5, -26, 5, 25);
      ctx.fillStyle = '#4b4f55'; ctx.fillRect(-10, -22, 20, 3); ctx.fillRect(-10, -7, 20, 3);
      ctx.fillStyle = '#6b4220'; ctx.fillRect(-9, -28, 18, 3);
      if (hp < 2) { ctx.strokeStyle = out; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(3, -26); ctx.lineTo(6, -16); ctx.lineTo(2, -10); ctx.stroke(); }
    }
    ctx.restore();
  }

  // ------------------------------------------------- triceratops: czworonóg z kryzą i trzema rogami
  function drawTrike(ctx, x, y, face, t, st, colors, opt) {
    opt = opt || {};
    const flash = opt.flash, out = '#10140c';
    const body = flash ? '#fff' : colors.body, belly = flash ? '#eee' : colors.belly, frill = flash ? '#fff' : colors.frill;
    const dark = flash ? '#ddd' : shade(colors.body, -0.3);
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(face, 1);
    if (st === 'down') { ctx.translate(0, -10); ctx.rotate(-0.25); ctx.translate(0, 10); }
    const run = st === 'walk' || st === 'charge' || st === 'run';
    const ph = run ? t * (st === 'charge' ? 0.45 : 0.2) : 0;
    const bob = run ? Math.abs(Math.sin(ph)) * 1.2 : 0;
    const lean = st === 'charge' || st === 'windup' ? 4 : 0;
    const leg = (lx, p, back) => {
      const sw = run ? Math.sin(p) * 5 : 0, lift = run ? Math.max(0, Math.cos(p)) * 3 : 0;
      segs(ctx, [[lx, -20 - bob], [lx + sw * 0.4, -10 - lift * 0.5], [lx + sw, -1 - lift]], 7, back ? dark : body, out);
    };
    leg(-14, ph + Math.PI, true); leg(12, ph, true);
    // ogon
    segs(ctx, [[-24, -24 - bob], [-36, -20], [-44, -14]], 7, body, out);
    // tułów
    ctx.beginPath(); ctx.ellipse(0, -26 - bob, 26, 13, 0, 0, Math.PI * 2); ctx.fillStyle = out; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -26 - bob, 25, 12, 0, 0, Math.PI * 2); ctx.fillStyle = body; ctx.fill();
    ctx.beginPath(); ctx.ellipse(2, -19 - bob, 20, 4, 0, 0, Math.PI * 2); ctx.fillStyle = belly; ctx.fill();
    ctx.fillStyle = flash ? '#ddd' : shade(colors.body, -0.18);
    for (let i = 0; i < 5; i++) ctx.fillRect(-16 + i * 7, -36 - bob, 4, 3);
    leg(-12, ph, false); leg(14, ph + Math.PI, false);
    // kryza + głowa
    const hx = 26 + lean, hy = -26 - bob + lean;
    ctx.beginPath(); ctx.arc(hx - 4, hy - 4, 15, Math.PI * 0.55, Math.PI * 1.75); ctx.lineTo(hx, hy); ctx.closePath(); ctx.fillStyle = out; ctx.fill();
    ctx.beginPath(); ctx.arc(hx - 4, hy - 4, 13.5, Math.PI * 0.6, Math.PI * 1.7); ctx.lineTo(hx, hy); ctx.closePath(); ctx.fillStyle = frill; ctx.fill();
    ctx.fillStyle = flash ? '#fff' : '#e8d8b0'; for (let i = 0; i < 5; i++) { const a = Math.PI * (0.7 + i * 0.22); ctx.fillRect(hx - 4 + Math.cos(a) * 13 - 1, hy - 4 + Math.sin(a) * 13 - 1, 2, 2); }
    ctx.beginPath(); ctx.moveTo(hx - 6, hy - 5); ctx.lineTo(hx + 10, hy - 2); ctx.lineTo(hx + 14, hy + 4); ctx.lineTo(hx + 6, hy + 8); ctx.lineTo(hx - 6, hy + 6); ctx.closePath();
    ctx.lineWidth = 2; ctx.strokeStyle = out; ctx.stroke(); ctx.fillStyle = body; ctx.fill();
    ctx.fillStyle = flash ? '#fff' : '#f0ead8';
    ctx.beginPath(); ctx.moveTo(hx - 2, hy - 5); ctx.lineTo(hx + 12, hy - 14); ctx.lineTo(hx + 2, hy - 3); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx + 3, hy - 4); ctx.lineTo(hx + 16, hy - 11); ctx.lineTo(hx + 6, hy - 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx + 10, hy - 1); ctx.lineTo(hx + 16, hy - 6); ctx.lineTo(hx + 12, hy + 1); ctx.fill();
    ctx.fillStyle = '#10140c'; ctx.fillRect(hx + 2, hy - 2, 2, 2);
    ctx.restore();
  }
  // ------------------------------------------------- parazaurolof: kaczodzioby z rurowatym grzebieniem
  function drawPara(ctx, x, y, face, t, st, colors, opt) {
    opt = opt || {};
    const flash = opt.flash, out = '#10140c';
    const body = flash ? '#fff' : colors.body, belly = flash ? '#eee' : colors.belly, crest = flash ? '#fff' : colors.crest;
    const dark = flash ? '#ddd' : shade(colors.body, -0.3);
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(face, 1);
    if (st === 'down') { ctx.translate(0, -8); ctx.rotate(-1.3); ctx.translate(0, 8); }
    const run = st === 'walk' || st === 'run';
    const ph = run ? t * (st === 'run' ? 0.4 : 0.22) : 0;
    const bob = run ? Math.abs(Math.sin(ph)) * 1.5 : Math.sin(t * 0.06) * 0.6;
    const roar = st === 'roar';
    const leg = (p, back) => {
      const sw = run ? Math.sin(p) : 0, lift = run ? Math.max(0, Math.cos(p)) * 4 : 0;
      const hip = [-2, -26 - bob], knee = [4 + sw * 6, -14], ank = [-3 + sw * 9, -4 - lift];
      segs(ctx, [hip, knee], 8, back ? dark : body, out);
      segs(ctx, [knee, ank, [ank[0] + 6, -1 - lift * 0.6]], 4, back ? dark : body, out);
    };
    leg(ph + Math.PI, true);
    for (let i = 0; i < 5; i++) segs(ctx, [[-10 - i * 7, -26 - bob + i * 1.4], [-17 - i * 7, -25 - bob + (i + 1) * 1.4 + Math.sin(t * 0.1 - i) * i * 0.4]], 9 - i * 1.5, body, out);
    ctx.beginPath(); ctx.ellipse(2, -28 - bob, 17, 10, -0.15, 0, Math.PI * 2); ctx.fillStyle = out; ctx.fill();
    ctx.beginPath(); ctx.ellipse(2, -28 - bob, 16, 9, -0.15, 0, Math.PI * 2); ctx.fillStyle = body; ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, -22 - bob, 12, 3.5, -0.15, 0, Math.PI * 2); ctx.fillStyle = belly; ctx.fill();
    ctx.fillStyle = flash ? '#ddd' : colors.stripe; for (let i = 0; i < 4; i++) ctx.fillRect(-8 + i * 6, -37 - bob + i * 0.6, 3, 4);
    segs(ctx, [[14, -34 - bob], [20, -44 - bob]], 7, body, out);
    segs(ctx, [[10, -26 - bob], [16, -20], [19, -22]], 2.5, dark, out);
    const hx = 22, hy = -47 - bob;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(roar ? -0.35 : 0);
    // grzebień do tyłu
    segs(ctx, [[-2, -3], [-14, -10], [-20, -12]], 4, crest, out);
    // dziób kaczy
    ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(10, -2); ctx.lineTo(13, 1); ctx.lineTo(10, 3 + (roar ? 3 : 0)); ctx.lineTo(-3, 4); ctx.closePath();
    ctx.lineWidth = 2; ctx.strokeStyle = out; ctx.stroke(); ctx.fillStyle = body; ctx.fill();
    ctx.fillStyle = flash ? '#fff' : '#e0c890'; ctx.fillRect(6, 0, 7, 1.5);
    ctx.fillStyle = '#10140c'; ctx.fillRect(1, -2, 2, 2);
    ctx.restore();
    if (roar && !flash) {
      ctx.strokeStyle = 'rgba(255,240,180,0.7)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) { const r = 8 + ((t * 1.5 + i * 8) % 24); ctx.beginPath(); ctx.arc(hx + 14, hy, r, -0.7, 0.7); ctx.stroke(); }
    }
    leg(ph, false);
    ctx.restore();
  }

  // ------------------------------------------------- jeep (pojazd do przejęcia)
  function drawJeep(ctx, x, y, face, t, opt) {
    opt = opt || {};
    const out = '#140c10', body = opt.flash ? '#fff' : (opt.wreck ? '#4a4a3a' : '#5a6a3a');
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(face, 1);
    const bob = opt.moving ? Math.round(Math.sin(t * 0.6)) : 0;
    ctx.translate(0, bob);
    ctx.fillStyle = out; ctx.fillRect(-28, -22, 56, 18);
    ctx.fillStyle = body; ctx.fillRect(-27, -21, 54, 16);
    ctx.fillStyle = opt.flash ? '#eee' : '#4a5a2a'; ctx.fillRect(-27, -13, 54, 2);
    ctx.fillStyle = '#9fd0e0'; ctx.fillRect(12, -31, 3, 10);
    ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, -21); ctx.lineTo(-6, -33); ctx.lineTo(8, -33); ctx.lineTo(8, -21); ctx.stroke();
    ctx.fillStyle = '#d8d0a0'; ctx.fillRect(25, -18, 3, 3);
    ctx.fillStyle = '#e8d8a0'; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center'; ctx.fillText(opt.wreck ? '' : 'XX', -15, -9);
    if (opt.wreck) { ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-20, -20, 10, 6); ctx.fillRect(4, -18, 8, 5); }
    [-17, 17].forEach(wx => {
      ctx.fillStyle = out; ctx.beginPath(); ctx.arc(wx, -4, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2a2a2e'; ctx.beginPath(); ctx.arc(wx, -4, 5, 0, Math.PI * 2); ctx.fill();
      const a = t * 0.3; ctx.strokeStyle = '#7a7a7a'; ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(wx + Math.cos(a) * 3, -4 + Math.sin(a) * 3); ctx.lineTo(wx - Math.cos(a) * 3, -4 - Math.sin(a) * 3); ctx.stroke();
    });
    if (opt.nitro) for (let i = 0; i < 3; i++) { ctx.fillStyle = i ? '#ffd040' : '#ff6020'; ctx.beginPath(); ctx.ellipse(-32 - i * 6 - Math.random() * 4, -10, 6 - i, 2.5, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  // ------------------------------------------------- zagroda z młodym dinozaurem
  function drawPen(ctx, x, y, hp) {
    const out = '#140c10';
    ctx.save(); ctx.translate(Math.round(x), Math.round(y));
    ctx.fillStyle = out; ctx.fillRect(-15, -30, 30, 30);
    ctx.fillStyle = '#2a2018'; ctx.fillRect(-14, -29, 28, 28);
    // młody dinozaur
    ctx.fillStyle = '#7aaa4a'; ctx.beginPath(); ctx.ellipse(-1, -8, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(6, -14, 4, 3, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffcf3a'; ctx.fillRect(7, -15, 1.5, 1.5);
    ctx.strokeStyle = '#c8a050'; ctx.lineWidth = 2.5;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-11 + i * 5.5, -29); ctx.lineTo(-11 + i * 5.5, -1); ctx.stroke(); }
    ctx.fillStyle = '#9a7840'; ctx.fillRect(-16, -32, 32, 4); ctx.fillRect(-16, -3, 32, 3);
    ctx.fillStyle = '#c0c8d0'; ctx.fillRect(10, -18, 5, 6); ctx.fillStyle = out; ctx.fillRect(12, -16, 1, 2);
    if (hp < 4) { ctx.strokeStyle = out; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, -32); ctx.lineTo(-4, -20); ctx.lineTo(-9, -12); if (hp < 2) { ctx.moveTo(4, -32); ctx.lineTo(8, -22); } ctx.stroke(); }
    ctx.restore();
  }
  // pteranodon: duże skrzydła, grzebień, dziób
  function drawPtera(ctx, x, y, face, t, st, opt) {
    opt = opt || {};
    const flash = opt.flash, out = '#140c10';
    const body = flash ? '#fff' : '#a0684a', wing = flash ? '#eee' : '#7a4a3a', membrane = flash ? '#ddd' : '#c08a60';
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(face, 1);
    if (st === 'down') ctx.rotate(1.2);
    const flap = st === 'swoop' ? -0.9 : Math.sin(t * 0.22) * 0.8;
    const drawWing = (side) => {
      ctx.save(); ctx.scale(1, 1); ctx.rotate(side * 0.1);
      const tipY = -14 * flap, tipX = side * 4;
      ctx.beginPath(); ctx.moveTo(-4, -2); ctx.lineTo(tipX - 26, tipY - 6); ctx.lineTo(tipX - 6, tipY + 2); ctx.lineTo(8, 2); ctx.closePath();
      ctx.fillStyle = out; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-3, -1); ctx.lineTo(tipX - 24, tipY - 5); ctx.lineTo(tipX - 6, tipY + 1); ctx.lineTo(7, 1); ctx.closePath();
      ctx.fillStyle = side > 0 ? membrane : wing; ctx.fill();
      ctx.restore();
    };
    drawWing(-1);
    ctx.beginPath(); ctx.ellipse(2, 0, 10, 4, 0, 0, Math.PI * 2); ctx.fillStyle = out; ctx.fill();
    ctx.beginPath(); ctx.ellipse(2, 0, 9, 3, 0, 0, Math.PI * 2); ctx.fillStyle = body; ctx.fill();
    // głowa z grzebieniem i dziobem
    ctx.fillStyle = out; ctx.beginPath(); ctx.moveTo(9, -3); ctx.lineTo(24, 0); ctx.lineTo(9, 2); ctx.lineTo(4, -8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = flash ? '#fff' : '#e0b070'; ctx.beginPath(); ctx.moveTo(10, -2); ctx.lineTo(22, 0); ctx.lineTo(10, 1); ctx.fill();
    ctx.fillStyle = body; ctx.beginPath(); ctx.moveTo(10, -2); ctx.lineTo(5, -7); ctx.lineTo(8, -2); ctx.fill();
    ctx.fillStyle = '#ffcf3a'; ctx.fillRect(10, -2, 1.5, 1.5);
    // nogi
    ctx.strokeStyle = out; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-2, 3); ctx.lineTo(-6, 7); ctx.moveTo(1, 3); ctx.lineTo(-2, 8); ctx.stroke();
    drawWing(1);
    ctx.restore();
  }
  function drawNetOver(ctx, x, y, h) {
    ctx.save(); ctx.translate(Math.round(x), Math.round(y));
    ctx.strokeStyle = 'rgba(230,220,180,0.9)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = -3; i <= 3; i++) { ctx.moveTo(i * 5 - 8, 0); ctx.lineTo(i * 5 + 8, -h); ctx.moveTo(i * 5 + 8, 0); ctx.lineTo(i * 5 - 8, -h); }
    ctx.stroke();
    ctx.fillStyle = '#5a4a3a'; for (let i = -2; i <= 2; i++) ctx.fillRect(i * 7 - 1, -h - 1, 2, 2);
    ctx.restore();
  }

  // --------------------------------------------------------------- efekty
  function drawSpark(ctx, x, y, t, big) {
    const k = 1 - t;
    const R = (big ? 16 : 10) * (0.5 + t);
    ctx.save(); ctx.translate(Math.round(x), Math.round(y));
    ctx.globalAlpha = Math.max(0, k);
    ctx.fillStyle = '#fff6a0';
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2, r = i % 2 ? R * 0.35 : R;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, 0, R * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function drawDust(ctx, x, y, t) {
    ctx.save(); ctx.globalAlpha = Math.max(0, 0.6 * (1 - t));
    ctx.fillStyle = '#d8c8a0';
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(x + i * (4 + t * 10), y - 3 - t * 5, 3 + t * 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  global.Sprites = { POSES, drawFigure, drawPortrait, drawRaptor, drawPachy, drawShot, drawPtera, drawPen, drawNetOver, drawTrike, drawPara, drawJeep, drawItem, drawBarrel, drawSpark, drawDust, skeleton, shade, segs, circ };
})(window);
