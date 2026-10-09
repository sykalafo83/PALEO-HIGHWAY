  // =============================================================== GRACZ
  function updatePlayer(p) {
    const held = inp[p.pIdx].held, pressed = inp[p.pIdx].pressed;
    const dx = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    const dy = (held.down ? 1 : 0) - (held.up ? 1 : 0);
    const d = p.def;
    p.t++;
    // wykrywanie ↓ ↘ → (względem kierunku patrzenia)
    if (dy > 0 && dx === 0) p.qcfD = G.frame;
    if (dx === p.face && dy <= 0 && G.frame - (p.qcfD || -99) < 16) p.qcfReady = G.frame;
    if (p.cmdCool > 0) p.cmdCool--;
    if (pressed.attack) p.lastAtkPress = G.frame;
    if (p.state !== 'block') p.guard = Math.min(100, (p.guard === undefined ? 100 : p.guard) + 0.45);
    if (p.blockFlash > 0) p.blockFlash--;
    if (p.mount && ['idle', 'walk', 'rideAtk', 'rideJump'].includes(p.state)) { updateRider(p, held, pressed, dx, dy); return; }
    if (p.carry && !['lift', 'carry', 'heave'].includes(p.state)) dropCarry(p);
    if (updateCarry(p, held, pressed, dx, dy)) return;
    switch (p.state) {
      case 'enter':
        p.vx = d.speed; p.x += p.vx; p.animT++;
        if (p.x >= ST.startX) setState(p, 'idle');
        return;
      case 'block':
        // garda: stoi w miejscu, może się obrócić; puszczenie bloku albo skok kończy gardę
        p.vx = 0; p.animT++;
        if (pressed.block) p.blockStart = G.frame;
        if (dx) p.face = dx;
        if (!held.block) { setState(p, 'idle'); return; }
        if (pressed.special && p.fury >= 100) { startSuper(p); return; }
        if (pressed.jump && !held.attack) { setState(p, 'jump'); p.vz = 5.4; p.vx = dx * d.speed * 1.1; p.vy = dy * d.speed * 0.5; p.jumpAtk = false; sfx('jump'); return; }
        return;
      case 'idle': case 'walk': {
        if (dx && pressed[dx > 0 ? 'right' : 'left']) {
          if (p.tapDir === dx && G.frame - p.tapT < 14) p.running = true;
          p.tapDir = dx; p.tapT = G.frame;
        }
        if (!dx || dx !== p.tapDir) p.running = false;
        if (held.block) { setState(p, 'block'); p.vx = 0; p.running = false; if (pressed.block) p.blockStart = G.frame; return; }
        if (pressed.special) { startSpecial(p); return; }
        if (pressed.jump) {
          setState(p, 'jump'); p.vz = 5.4; p.vx = dx * d.speed * (p.running ? 1.6 : 1.1); p.vy = dy * d.speed * 0.5;
          p.jumpAtk = false; sfx('jump'); return;
        }
        if (pressed.attack) {
          // co-op: wyrzut partnera trzymającego gardę obok / podwójny rzut wroga trzymanego przez partnera
          const mate = G.players.find(q => q !== p && q.alive && q.state === 'block' && Math.abs(q.x - p.x) < 28 && Math.abs(q.y - p.y) < 12);
          if (mate) { launchMate(p, mate); return; }
          const held2 = G.actors.find(e => e.grabbedBy && e.grabbedBy !== p && e.grabbedBy.kind === 'player' && Math.abs(e.x - p.x) < 36 && Math.abs(e.y - p.y) < 12);
          if (held2) { doubleThrow(p, held2); return; }
          const veh = nearVehicle(p);
          if (veh) { boardVehicle(p, veh); return; }
          const beast = nearTamed(p);
          if (beast) { mountBeast(p, beast); return; }
          if (!p.weapon && !(p.cmdCool > 0) && G.frame - (p.qcfReady || -99) < 12) { startCommand(p); return; }
          if (p.running) { setState(p, 'dash'); p.vx = p.face * 3.4; sfx('whoosh'); p.running = false; return; }
          const it = nearItem(p);
          if (it) { setState(p, 'pickup'); p.pickItem = it; return; }
          const pr = held.down && !p.weapon && nearProp(p);
          if (pr) { liftProp(p, pr); return; }
          if (MELEE[p.weapon]) { p.pipeCount = 0; startMove(p, MELEE[p.weapon].move); return; }
          if (!p.weapon && held.up && !dx) { startMove(p, MOVES.launcher); p.comboIdx = 0; return; }
          if (p.weapon === 'rifle') { setState(p, 'shoot'); return; }
          if (THROWN.includes(p.weapon)) { setState(p, 'toss'); p.tossDir = dx; return; }
          if (!p.connected || G.frame - p.lastAtk > 40) p.comboIdx = 0;
          startMove(p, MOVES[d.combo[p.comboIdx]]); return;
        }
        const sp = d.speed * (p.running ? 1.9 : 1), tvx = dx * sp;
        // mokra nawierzchnia: po biegu postać ślizga się przy hamowaniu i zawracaniu
        if (slippery() && Math.abs(p.vx) > d.speed * 1.15 && Math.abs(tvx - p.vx) > 0.3 && Math.sign(tvx) !== Math.sign(p.vx)) {
          p.vx += (tvx - p.vx) * 0.07;
          if (!p.sliding) { p.sliding = true; G.popups.push({ x: p.x, y: p.y - 50, txt: 'POŚLIZG!', t: 0, col: '#80d0ff' }); sfx('whoosh'); }
          if (G.frame % 4 === 0) G.fx.push({ type: 'debris', x: p.x - Math.sign(p.vx) * 6, y: p.y, z: 1, vx: -p.vx * 0.3, vz: 1.2, t: 0, life: 18, col: '#a0c0e0' });
        } else { p.vx = tvx; p.sliding = false; }
        p.vy = dy * sp * 0.65;
        if (dx) p.face = dx;
        p.state = (dx || dy) ? 'walk' : 'idle';
        if (dx || dy) p.animT++;
        p.x += p.vx; p.y += p.vy;
        if (dx && (!p.weapon || p.weapon === p.def.innate)) {
          for (const e of G.actors) {
            if (e.team !== 'enemy' || e.kind !== 'human' || isBoss(e) || !hittable(e) || e.armor) continue;
            const ex = (e.x - p.x) * p.face;
            if (ex > 4 && ex < 17 && Math.abs(e.y - p.y) < 5 && e.z === 0) { startGrab(p, e); break; }
          }
        }
        touchItems(p);
        return;
      }
      case 'netted':
        p.netT -= 1 + ((pressed.attack || pressed.jump || pressed.special) ? 9 : 0) + ((pressed.left || pressed.right || pressed.up || pressed.down) ? 5 : 0);
        if (p.netT <= 0) { setState(p, 'idle'); p.invuln = Math.max(p.invuln, 30); sfx('whoosh'); G.popups.push({ x: p.x, y: p.y - 50, txt: 'WOLNY!', t: 0, col: '#7cff7c' }); }
        return;
      case 'attack': {
        const m = p.move;
        // atak+skok nie musi być idealnie równoczesny: skok w pierwszych klatkach ciosu też daje specjał
        if (pressed.jump && held.attack && p.t <= 4 && !p.weapon) { startSpecial(p); return; }
        if (pressed.attack && p.t > 1) p.buffer = true;
        if (p.t >= m.start && p.t < m.start + m.active) {
          const h = resolveHits(p, m, !!m.around);
          if (h) {
            p.connected = true;
            if (MELEE[p.weapon]) { p.dur -= h; if (p.dur <= 0) { p.weapon = null; sfx('crash'); spark(p.x + p.face * 20, p.y, 26); G.popups.push({ x: p.x, y: p.y - 50, txt: 'PĘKŁO!', t: 0, col: '#c0c0c0' }); } }
          }
        }
        if (p.t === m.start) sfx('whoosh');
        if (p.t >= m.start + m.active && p.buffer && p.connected && !m.knock) {
          if (MELEE[p.weapon]) { const M = MELEE[p.weapon]; p.pipeCount = (p.pipeCount || 0) + 1; startMove(p, p.pipeCount >= M.max ? M.fin : M.move); if (p.weapon === 'chain' && p.pipeCount >= M.max) sfx('whip'); return; }
          if (p.comboIdx < d.combo.length - 1) { p.comboIdx++; startMove(p, MOVES[d.combo[p.comboIdx]]); return; }
        }
        if (p.t >= m.start + m.active + m.rec) {
          if (m.knock || !p.connected) p.comboIdx = 0;
          else p.comboIdx = Math.min(p.comboIdx + 1, d.combo.length - 1);
          p.pipeCount = 0;
          setState(p, 'idle');
        }
        return;
      }
      case 'jump': {
        // ...i atak w pierwszych klatkach skoku (gracz rzadko trafia w tę samą klatkę)
        if (pressed.attack && held.jump && p.t <= 4 && !p.weapon) { p.z = 0; p.vz = 0; p.vx = 0; startSpecial(p); return; }
        p.x += p.vx; p.y += p.vy; p.vz -= GRAV; p.z += p.vz;
        if (pressed.attack && !p.jumpAtk && held.down) {
          const v = G.actors.find(e => e.team === 'enemy' && e.kind === 'human' && !isBoss(e) && hittable(e) && Math.abs(e.x - p.x) < 28 && Math.abs(e.y - p.y) < 10);
          if (v) { startAirThrow(p, v); return; }
        }
        if (pressed.attack && !p.jumpAtk) { p.jumpAtk = true; sfx('whoosh'); p.hitSet = null; }
        if (p.jumpAtk) resolveHits(p, { reach: 30, dmg: 10, knock: true, snd: 'heavy', height: 40 });
        if (p.z <= 0) { p.z = 0; p.vz = 0; setState(p, 'land'); sfx('land'); dust(p.x, p.y); }
        return;
      }
      case 'land': if (p.t > 6) setState(p, 'idle'); return;
      case 'teamthrow': if (p.t > 16) setState(p, 'idle'); return;
      case 'teamfly': {
        // partner wyrzucony jak pocisk: taranuje wrogów na drodze
        p.x += p.vx; p.vz -= GRAV; p.z += p.vz; p.animT++;
        if (!p.hitSet) p.hitSet = new Set();
        for (const t of G.actors) {
          if (p.hitSet.has(t) || !hostile(p, t) || !hittable(t)) continue;
          if (Math.abs(t.x - p.x) < 18 + t.rad * 0.5 && Math.abs(t.y - p.y) < 12 && Math.abs(t.z - p.z) < 40) {
            p.hitSet.add(t); hurt(t, Math.round(18 * (p.def.power || 1)), Math.sign(p.vx) || 1, true, p, { unblock: true });
            spark(t.x, t.y, hitY(t), true); sfx('heavy'); G.hitstop = 4; G.shake = 4;
          }
        }
        if (p.z <= 0) { p.z = 0; p.vz = 0; p.vx = 0; setState(p, 'land'); dust(p.x, p.y); sfx('land'); }
        return;
      }
      case 'dash':
        p.x += p.vx; p.vx *= 0.94;
        if (p.t > 3 && p.t < 16) resolveHits(p, { reach: 22, dmg: 12, knock: true, snd: 'heavy' });
        if (p.t > 24) setState(p, 'idle');
        return;
      case 'special': updateSpecial(p); return;
      case 'super': updateSuper(p); return;
      case 'cmd': updateCommand(p); return;
      case 'airthrow': updateAirThrow(p); return;
      case 'suplex': updateSuplex(p); return;
      case 'pickup':
        if (p.t === 5 && p.pickItem && G.items.includes(p.pickItem)) {
          const it = p.pickItem;
          G.items.splice(G.items.indexOf(it), 1);
          const throwable = THROWN.includes(it.type);
          if (throwable && p.weapon === it.type) p.ammo = Math.min(9, p.ammo + (it.ammo || 3));
          else { p.weapon = it.type; p.ammo = (it.ammo || (throwable ? 3 : 8)) + (throwable ? p.up.bomb : 0); p.dur = it.dur || (MELEE[it.type] ? MELEE[it.type].dur : 16); if (it.type === 'bottle') p.ammo = Math.min(p.ammo, it.ammo || 2); }
          sfx('pickup');
          G.popups.push({ x: p.x, y: p.y - 50, txt: WEAPON_NAMES[it.type] + (throwable ? ' ×' + p.ammo : ''), t: 0, col: '#ffe080' });
        }
        if (p.t > 10) setState(p, 'idle');
        return;
      case 'toss':
        if (p.t === 8) tossBomb(p);
        if (p.t > 18) setState(p, 'idle');
        return;
      case 'shoot':
        if (p.t === 4) fireRifle(p);
        if (p.t > 20) setState(p, 'idle');
        return;
      case 'grab': {
        const v = p.grabbing;
        if (!v || v.state !== 'grabbed') { p.grabbing = null; setState(p, 'idle'); return; }
        v.x = p.x + p.face * 15; v.y = p.y; v.face = p.backGrab ? p.face : -p.face;
        if (pressed.jump) { release(v); p.grabbing = null; setState(p, 'idle'); return; }
        if (pressed.attack) {
          if (p.backGrab) { setState(p, 'suplex'); sfx('grab'); return; }
          if (dx === -p.face) { p.face = -p.face; setState(p, 'throw'); return; }
          setState(p, 'knee'); return;
        }
        if (p.t > 110) { release(v); p.grabbing = null; setState(p, 'hurt'); p.vx = -p.face; }
        return;
      }
      case 'knee': {
        const v = p.grabbing;
        if (!v) { setState(p, 'idle'); return; }
        v.x = p.x + p.face * 15; v.y = p.y;
        if (p.t === 4) {
          v.hp -= 6 * ((p.def.power) || 1); v.flash = 6; sfx('hit'); sfx('eHurt'); spark(v.x, v.y, 24); G.hitstop = 4;
          addScore(p, 60); addCombo(p); G.lastEnemy = v; G.lastEnemyT = 200;
          p.kneeCount = (p.kneeCount || 0) + 1;
          if (v.hp <= 0) { v.grabbedBy = null; p.grabbing = null; onDeath(v, p); setState(v, 'fall'); v.vx = p.face * 2; v.vz = 3.5; v.z = 1; p.kneeCount = 0; }
        }
        if (p.t > 12) {
          if (p.kneeCount >= 3 && p.grabbing) { p.kneeCount = 0; setState(p, 'throw'); }
          else if (p.grabbing) { p.state = 'grab'; p.t = 30; } else setState(p, 'idle');
        }
        return;
      }
      case 'throw': {
        const v = p.grabbing;
        if (v && p.t < 6) { v.x = p.x - p.face * 6; v.y = p.y; v.z = 18; }
        if (p.t === 6 && v) {
          sfx('throw');
          v.grabbedBy = null; p.grabbing = null;
          setState(v, 'thrown'); v.x = p.x + p.face * 10; v.face = -p.face; v.vx = p.face * 4.4; v.vz = 4; v.z = 16; v.thrower = p; v.bounced = false;
          p.kneeCount = 0;
        }
        if (p.t > 18) setState(p, 'idle');
        return;
      }
    }
  }
  function startMove(a, m) { setState(a, 'attack'); a.move = m; a.buffer = false; a.connected = false; a.lastAtk = G.frame; }
  function startSpecial(p) {
    if (p.fury >= 100) { startSuper(p); return; }
    setState(p, 'special'); p.specialPaid = false; p.vx = 0; sfx('whoosh');
    if (!(p.shoutT > G.frame)) { shout(p, 'special'); p.shoutT = G.frame + 90; }
  }
  function startGrab(p, e) {
    p.backGrab = e.face === p.face;   // wróg odwrócony plecami
    setState(p, 'grab'); p.grabbing = e; e.grabbedBy = p; setState(e, 'grabbed'); p.kneeCount = 0; sfx('grab');
    if (p.backGrab) G.popups.push({ x: p.x, y: p.y - 56, txt: 'Z TYŁU!', t: 0, col: '#ffe080' });
  }

  // ---------------------------------------------------- specjały postaci (atak+skok / L)
  function paySpecial(p, h) { if (h && !p.specialPaid) { p.specialPaid = true; p.hp = Math.max(1, p.hp - 6); } }
  function updateSpecial(p) {
    p.invuln = Math.max(p.invuln, 2);
    switch (p.key) {
      case 'nina': // salto z kopnięciem
        if (p.t === 1) { p.vz = 5.2; p.vx = p.face * 2.4; sfx('jump'); }
        p.x += p.vx; p.vz -= GRAV; p.z = Math.max(0, p.z + p.vz);
        if (p.t > 2 && p.t < 30) paySpecial(p, resolveHits(p, { reach: 30, dmg: 12, knock: true, snd: 'heavy', height: 60 }, true));
        if (p.t > 4 && p.z <= 0) { p.z = 0; sfx('land'); dust(p.x, p.y); setState(p, 'land'); }
        return;
      case 'padlin': // młyn kotwicą
        if (p.t === 1) sfx('whoosh');
        if (p.t % 6 === 2 && p.t < 30) { p.hitSet = null; paySpecial(p, resolveHits(p, { reach: 54, dmg: 9, knock: p.t > 24, snd: 'heavy', height: 50 }, true)); sfx('whoosh'); }
        if (p.t > 34) setState(p, 'idle');
        return;
      case 'zmijka': // wir bicza
        if (p.t % 5 === 1 && p.t < 34) { p.hitSet = null; paySpecial(p, resolveHits(p, { reach: 70, dmg: 6, knock: p.t > 28, snd: 'whip', height: 40 }, true)); sfx('whip'); }
        if (p.t > 38) setState(p, 'idle');
        return;
      case 'tur': // trzęsienie ziemi
        if (p.t === 1) { p.vz = 3.4; sfx('jump'); }
        if (p.t > 1) { p.vz -= GRAV * 1.4; p.z = Math.max(0, p.z + p.vz); }
        if (p.t > 4 && p.z <= 0 && !p.slammed) {
          p.slammed = true; sfx('slam'); G.shake = 12;
          G.fx.push({ type: 'shock', x: p.x, y: p.y, z: 0, t: 0, life: 22, r: 80 });
          for (let i = 0; i < 5; i++) dust(p.x + rnd(-40, 40), p.y + rnd(-6, 6));
          let h = 0;
          for (const t of G.actors) {
            if (!hostile(p, t) || !hittable(t) || t.z > 6) continue;
            if (Math.abs(t.x - p.x) < 74 + t.rad && Math.abs(t.y - p.y) < 22 + (t.depthR || 0)) { hurt(t, Math.round(12 * (p.def.power || 1)), t.x >= p.x ? 1 : -1, true, p, { unblock: true }); h++; }
          }
          paySpecial(p, h);
        }
        if (p.slammed && p.t > 26) { p.slammed = false; setState(p, 'idle'); }
        return;
      case 'bursztyn': { // skok przez cień: znika i uderza od tyłu najbliższego wroga
        p.alpha = p.t < 10 ? 1 - p.t / 10 : Math.min(1, (p.t - 10) / 8);
        if (p.t === 10) {
          sfx('warp');
          const tgt = G.actors.filter(t => hostile(p, t) && hittable(t) && Math.abs(t.x - p.x) < 220).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
          if (tgt) {
            const side = tgt.face || 1;
            p.x = clamp(tgt.x - side * 24, G.camX + 10, G.camX + W - 10); p.y = tgt.y; p.face = tgt.x > p.x ? 1 : -1;
            paySpecial(p, 1); hurt(tgt, Math.round(16 * (p.def.power || 1)), p.face, true, p, { unblock: true }); spark(tgt.x, tgt.y, hitY(tgt), true); sfx('heavy');
          }
        }
        if (p.t > 22) { p.alpha = 1; setState(p, 'idle'); }
        return;
      }
      case 'borys': // młynek laską — 3 trafienia dookoła
        if (p.t % 9 === 1) { p.hitSet = null; sfx('whoosh'); }
        if (p.t > 2 && p.t < 30) paySpecial(p, resolveHits(p, { reach: 40, dmg: 7, knock: p.t > 20, snd: 'hit', height: 40 }, true));
        if (p.t > 34) setState(p, 'idle');
        return;
      default: // KRUK — wirujący kopniak
        if ((p.t > 4 && p.t < 10) || (p.t > 14 && p.t < 20)) {
          if (p.t === 15) p.hitSet = null;
          paySpecial(p, resolveHits(p, { reach: 30, dmg: 10, knock: true, snd: 'heavy', height: 40 }, true));
        }
        if (p.t % 8 === 0) sfx('whoosh');
        if (p.t > 28) setState(p, 'idle');
    }
  }

  // ---------------------------------------------------- ruchy komendowe ↓ ↘ → + atak
  function startCommand(p) {
    setState(p, 'cmd'); p.cmdCool = 50; p.qcfReady = -99;
    if (p.key === 'borys') { startMove(p, MOVES.cmdPoke); p.cmdPoke = true; return; }
    G.popups.push({ x: p.x, y: p.y - 60, txt: p.def.moves[1].split(': ')[1] + '!', t: 0, col: '#ffe080' });
  }
  function updateCommand(p) {
    switch (p.key) {
      case 'kruk': // rzut kluczem francuskim
        if (p.t === 8) { shoot({ type: 'wrench', owner: p, x: p.x + p.face * 16, y: p.y, z: 26, vx: p.face * 4.6, dmg: Math.round(14 * (p.def.power || 1)), knock: true, life: 120 }); sfx('throw'); }
        if (p.t > 20) setState(p, 'idle');
        return;
      case 'nina': // wślizg
        if (p.t === 1) { p.vx = p.face * 4.6; sfx('whoosh'); }
        p.x += p.vx; p.vx *= 0.95;
        if (p.t > 2 && p.t < 20) resolveHits(p, { reach: 26, dmg: 12, knock: true, snd: 'heavy', height: 20 });
        if (p.t % 5 === 0) dust(p.x - p.face * 8, p.y);
        if (p.t > 26) setState(p, 'idle');
        return;
      case 'padlin': // rzut kotwicą
        if (p.t === 8) { shoot({ type: 'harpoon', owner: p, x: p.x + p.face * 16, y: p.y, z: 28, vx: p.face * 4.4, dmg: Math.round(18 * (p.def.power || 1)), knock: true, life: 110 }); sfx('throw'); }
        if (p.t > 22) setState(p, 'idle');
        return;
      case 'zmijka': // wachlarz noży
        if (p.t === 8) { [-10, 0, 10].forEach(o => shoot({ type: 'knife', owner: p, x: p.x + p.face * 12, y: clamp(p.y + o, FLOOR_TOP + 6, FLOOR_BOTTOM), z: 26, vx: p.face * 4.8, dmg: 9, knock: false, life: 100 })); sfx('whoosh'); }
        if (p.t > 20) setState(p, 'idle');
        return;
      case 'bursztyn': // fala energii po ziemi
        if (p.t === 8) { shoot({ type: 'wave', owner: p, x: p.x + p.face * 18, y: p.y, z: 0, vx: p.face * 3.8, dmg: Math.round(14 * (p.def.power || 1)), knock: true, life: 160 }); sfx('energy'); }
        if (p.t > 22) setState(p, 'idle');
        return;
      case 'tur': // taran barkiem z pancerzem
        p.invuln = Math.max(p.invuln, 2);
        if (p.t === 1) { p.vx = p.face * 4.2; sfx('charge'); }
        if (p.t < 26) { p.x += p.vx; if (p.t % 4 === 0) dust(p.x - p.face * 10, p.y); resolveHits(p, { reach: 24, dmg: 16, knock: true, snd: 'heavy', shake: 5 }); }
        if (p.t > 36) setState(p, 'idle');
        return;
    }
    setState(p, 'idle');
  }

  // ---------------------------------------------------- rzut w powietrzu (↓ + atak w skoku przy wrogu)
  function startAirThrow(p, v) {
    setState(p, 'airthrow'); p.grabbing = v; v.grabbedBy = p; setState(v, 'grabbed'); v.airHeld = true;
    p.vz = Math.max(p.vz, 2.4); p.vx = 0; p.vy = 0; sfx('grab');
    G.popups.push({ x: p.x, y: p.y - 70, txt: 'RZUT W LOCIE!', t: 0, col: '#ffe080' });
  }
  function updateAirThrow(p) {
    p.invuln = Math.max(p.invuln, 2);
    const v = p.grabbing;
    p.vz -= GRAV * 1.3; p.z = Math.max(0, p.z + p.vz);
    if (v) { v.x = p.x + p.face * 4; v.y = p.y; v.z = p.z + 34 * scaleOf(p); }
    if (p.z <= 0 && p.t > 3) {
      if (v) {
        v.grabbedBy = null; v.airHeld = false; p.grabbing = null;
        v.hp -= Math.round(18 * (p.def.power || 1)); v.lastThrow = true; v.flash = 6; addScore(p, 400); addCombo(p); unlock('airthrow'); G.lastEnemy = v; G.lastEnemyT = 200;
        if (v.hp <= 0) onDeath(v, p);
        setState(v, 'fall'); v.z = 1; v.vz = 2.2; v.vx = p.face * 1.6; v.bounced = false;
        spark(v.x, v.y, 10, true);
      }
      sfx('slam'); G.shake = 10; dust(p.x, p.y); dust(p.x + p.face * 10, p.y);
      setState(p, 'land');
    }
  }
  // ---------------------------------------------------- suplex (chwyt od tyłu + atak)
  function updateSuplex(p) {
    const v = p.grabbing;
    if (!v) { setState(p, 'idle'); return; }
    const k = Math.min(1, p.t / 14);
    v.x = p.x + p.face * (15 - 34 * k); v.y = p.y; v.z = Math.sin(k * Math.PI) * 30 + 6; v.airHeld = k > 0.3;
    if (p.t === 14) {
      unlock('suplex');
      v.grabbedBy = null; v.airHeld = false; p.grabbing = null;
      v.hp -= Math.round(20 * (p.def.power || 1)); v.lastThrow = true; v.flash = 6; addScore(p, 500); addCombo(p); G.lastEnemy = v; G.lastEnemyT = 200;
      if (v.hp <= 0) onDeath(v, p);
      setState(v, 'fall'); v.z = 1; v.vz = 2; v.vx = -p.face * 1.4; v.bounced = false;
      sfx('slam'); G.shake = 10; spark(v.x, v.y, 8, true); dust(v.x, v.y);
    }
    if (p.t > 28) setState(p, 'idle');
  }

  // ---------------------------------------------------- ujeżdżanie dinozaurów
  const MOUNT_TIME = 15 * 60;
  const RIDE = {
    raptor: { sp: 2.5, jump: 6.2, seat: 25, name: 'RAPTOR', acc: 'RAPTORA' },
    pachy: { sp: 1.9, jump: 4.4, seat: 27, name: 'PACHY', acc: 'PACHY' },
    trike: { sp: 1.5, jump: 3.6, seat: 32, name: 'TRICERATOPS', acc: 'TRICERATOPSA' },
    para: { sp: 2.1, jump: 5.4, seat: 34, name: 'PARAZAUROLOF', acc: 'PARAZAUROLOFA' },
    ptera: { sp: 2.3, jump: 0, seat: 5, name: 'PTERANODON', acc: 'PTERANODONA', fly: true },
    jeep: { sp: 3.0, seat: 17, name: 'JEEP', acc: 'JEEPA', vehicle: true },
    cart: { sp: 3.6, seat: 6, name: 'WAGONIK', acc: 'WAGONIK', vehicle: true, rail: 163 }
  };
  function nearVehicle(p) { return (G.vehicles || []).find(v => !v.used && Math.abs(v.x - p.x) < 32 && Math.abs(v.y - p.y) < 12); }
  function boardVehicle(p, v) {
    v.used = true; v.taken = true;
    const time = v.type === 'cart' ? 20 * 60 : 12 * 60;
    p.mount = { type: v.type, vehicle: true, t: time, max: time, cool: 0, v: 0 };
    p.weapon = null; p.x = v.x; p.y = v.y; setState(p, 'idle'); sfx('charge'); sfx('pickup');
    G.popups.push({ x: p.x, y: p.y - 60, txt: v.type === 'cart' ? 'WSKAKUJESZ DO WAGONIKA!' : 'PRZEJMUJESZ JEEPA!', t: 0, col: '#7cff7c' });
  }
  function updateVehicle(p, held, pressed, dx, dy, m, R) {
    p.animT++;
    if (R.rail) {
      p.y = R.rail;
      m.v = clamp((m.v + dx * 0.12) * 0.99, -R.sp, R.sp);
      const C = ST.CARTS || { x0: -1e9, x1: 1e9 };
      if (p.x > C.x1 - 12) { dismount(p, true); return; }
      if (p.x < C.x0 + 12 && m.v < 0) m.v = 0;
      if (pressed.attack) sfx('go');
    } else {
      m.v += (dx * R.sp - m.v) * 0.12; p.y += dy * R.sp * 0.55;
      if (pressed.attack && !(m.cool > 0)) { m.nitro = 24; m.cool = 70; sfx('charge'); }
      if (m.nitro > 0) { m.nitro--; m.v = p.face * (R.sp + 2.4); }
    }
    p.x += m.v; if (Math.abs(m.v) > 0.3) p.face = Math.sign(m.v);
    p.state = Math.abs(m.v) > 0.3 ? 'walk' : 'idle';
    if (Math.abs(m.v) > 1.4) {
      m.hits = m.hits || new Map();
      for (const t of G.actors) {
        if (!hostile(p, t) || !hittable(t) || t.z > 10) continue;
        if (Math.abs(t.x - p.x) > 26 + t.rad * 0.5 || Math.abs(t.y - p.y) > 9 + (t.depthR || 0)) continue;
        if ((m.hits.get(t) || 0) > G.frame) continue;
        m.hits.set(t, G.frame + 40);
        hurt(t, isBoss(t) ? 8 : 16, Math.sign(m.v), !isBoss(t), p, { unblock: true }); spark(t.x, t.y, hitY(t), true); sfx('heavy'); G.shake = 4;
      }
      if (G.frame % 8 === 0) dust(p.x - Math.sign(m.v) * 24, p.y);
    }
    touchItems(p);
  }
  function nearTamed(p) {
    return G.actors.find(a => a.state === 'tamed' && a.alive && Math.abs(a.x - p.x) < 24 && Math.abs(a.y - p.y) < 10);
  }
  function mountBeast(p, beast) {
    beast.alive = false; beast.remove = true;
    const time = (beast.kind === 'ptera' ? 8 * 60 : MOUNT_TIME) + 300 * ((p.up && p.up.ride) || 0);
    p.mount = { type: beast.kind, cols: beast.cols, t: time, max: time, cool: 0 };
    unlock('rider');
    p.weapon = null; setState(p, 'rideJump'); p.vz = 3.2; p.z = Math.max(p.z, 0.1);
    sfx('screech'); sfx('pickup');
    G.popups.push({ x: p.x, y: p.y - 70, txt: 'DOSIADASZ ' + RIDE[beast.kind].acc + '!', t: 0, col: '#7cff7c' });
  }
  function dismount(p, voluntary) {
    const m = p.mount; if (!m) return;
    p.mount = null;
    if (m.vehicle) {
      G.vehicles.push({ type: m.type, x: p.x, y: p.y, used: true });
      if (voluntary) { setState(p, 'jump'); p.vz = 4; p.vx = -p.face * 1.2; p.vy = 0; p.jumpAtk = false; }
      return;
    }
    const b = makeEnemy(m.type, p.x, p.y);
    b.cols = m.cols; b.hp = 0; b.maxHp = b.def.hp; b.lagHp = 0; b.dying = true;
    b.face = p.x - G.camX < W / 2 ? -1 : 1; setState(b, 'flee'); b.alive = true;
    G.actors.push(b);
    sfx('screech');
    if (voluntary) { setState(p, 'jump'); p.vz = m.type === 'ptera' ? 1 : 4; p.vx = -p.face * 1.2; p.vy = 0; p.jumpAtk = false; }
    else if (m.type === 'ptera' && p.z > 0) { p.vz = 0; }
  }
  function updateRider(p, held, pressed, dx, dy) {
    const m = p.mount, raptor = m.type === 'raptor', R = RIDE[m.type];
    if (--m.t <= 0 || pressed.special) { dismount(p, true); return; }
    if (m.cool > 0) m.cool--;
    if (R.vehicle) { updateVehicle(p, held, pressed, dx, dy, m, R); return; }
    p.animT++;
    if (R.fly && p.state !== 'rideAtk') { p.z += (30 - p.z) * 0.15; p.vz = 0; }
    switch (p.state) {
      case 'idle': case 'walk': case 'rideJump': {
        if (p.state === 'rideJump' && !R.fly) break;
        const sp = R.sp;
        p.vx = dx * sp; p.vy = dy * sp * 0.6;
        if (dx) p.face = dx;
        p.x += p.vx; p.y += p.vy;
        p.state = (dx || dy) ? 'walk' : 'idle';
        if (pressed.jump && !R.fly) { setState(p, 'rideJump'); p.vz = R.jump; p.vx = dx * sp * 1.1; sfx('jump'); return; }
        if (pressed.attack) {
          setState(p, 'rideAtk');
          if (raptor) { p.move = MOVES.rideBite; sfx('screech'); }
          else if (m.type === 'para' && m.cool <= 0) { p.rideRoar = true; m.cool = 90; }
          else if (m.type === 'para') { p.rideRoar = false; p.move = MOVES.rideBite; }
          else if (R.fly) sfx('screech');
          else { p.vx = p.face * (m.type === 'trike' ? 3.6 : 4.4); sfx('charge'); }
        }
        if (p.z < 2) touchItems(p);
        return;
      }
    }
    switch (p.state) {
      case 'rideAtk':
        if (R.fly) {
          const k = Math.min(1, p.t / 30);
          p.z = 30 - Math.sin(k * Math.PI) * 27; p.x += p.face * 2.2;
          if (p.z < 14) resolveHits(p, { abs: true, reach: 26, dmg: 12, knock: true, snd: 'bite', height: 40 });
          if (p.t > 30) setState(p, 'idle');
          return;
        }
        if (m.type === 'para' && p.rideRoar) {
          if (p.t === 6) {
            sfx('roar'); G.shake = 8;
            for (const t of G.actors) if (hostile(p, t) && hittable(t) && t.z < 10 && Math.abs(t.x - p.x) < 110 && Math.abs(t.y - p.y) < 30) {
              hurt(t, 4, t.x >= p.x ? 1 : -1, false, p, { unblock: true });
              if (t.alive && t.hp > 0 && t.kind === 'human' && !isBoss(t)) setState(t, 'stun');
            }
          }
          if (p.t > 36) setState(p, 'idle');
          return;
        }
        if (raptor || m.type === 'para') {
          if (p.t >= 6 && p.t < 12) { p.x += p.face * 1.5; if (p.t === 7) sfx('bite'); resolveHits(p, MOVES.rideBite); }
          if (p.t > 18) setState(p, 'idle');
        } else {
          const trike = m.type === 'trike', len = trike ? 44 : 32;
          if (p.t < len) { p.x += p.vx; if (p.t % 4 === 0) dust(p.x - p.face * 14, p.y); resolveHits(p, { abs: true, reach: trike ? 40 : 34, dmg: trike ? 18 : 16, knock: true, snd: 'heavy', shake: 5, depth: 12 }); }
          if (p.t > len + 10) setState(p, 'idle');
        }
        return;
      case 'rideJump':
        p.x += p.vx; p.vz -= GRAV; p.z += p.vz;
        if (pressed.attack && !p.jumpAtk) { p.jumpAtk = true; p.hitSet = null; sfx('bite'); }
        if (p.jumpAtk) resolveHits(p, { abs: true, reach: 34, dmg: 13, knock: true, snd: 'heavy', height: 50 });
        if (p.z <= 0) {
          p.z = 0; p.vz = 0; p.jumpAtk = false; sfx('land'); dust(p.x, p.y); setState(p, 'idle');
          if (!raptor) { G.shake = 4; for (const t of G.actors) if (hostile(p, t) && hittable(t) && t.z < 4 && Math.abs(t.x - p.x) < 40 && Math.abs(t.y - p.y) < 14) hurt(t, 8, t.x >= p.x ? 1 : -1, true, p); }
        }
        return;
    }
  }
  const WEAPON_NAMES = { pipe: 'RURA', rifle: 'STRZELBA', dynamite: 'DYNAMIT', grenade: 'GRANAT', machete: 'MACZETA', chain: 'ŁAŃCUCH', bottle: 'BUTELKA' };
  const isWeaponItem = t => !!WEAPON_NAMES[t];
  // broń biała: ruch, wykończenie serii (cios kończący), wytrzymałość, długość serii
  const MELEE = {
    pipe: { move: MOVES.pipe, fin: Object.assign({}, MOVES.pipe, { knock: true }), dur: 16, max: 2 },
    machete: { move: MOVES.machete, fin: Object.assign({}, MOVES.machete, { knock: true, dmg: 18 }), dur: 12, max: 3 },
    chain: { move: MOVES.chain, fin: MOVES.chainSpin, dur: 14, max: 2 }
  };
  const THROWN = ['dynamite', 'grenade', 'bottle'];
  function tossBomb(p) {
    if (p.ammo <= 0) { p.weapon = null; return; }
    p.ammo--;
    if (p.weapon === 'bottle') {
      shoot({ type: 'bottle', owner: p, x: p.x + p.face * 12, y: p.y, z: 28 * p.b.scale, vx: p.face * 4.6, dmg: 14, knock: true, life: 70 });
      sfx('throw'); if (p.ammo <= 0) p.weapon = null; return;
    }
    const far = p.tossDir === p.face ? 1.35 : p.tossDir === -p.face ? 0.6 : 1;
    const gren = p.weapon === 'grenade';
    shoot({ type: p.weapon, owner: p, x: p.x + p.face * 10, y: p.y, z: 34 * p.b.scale,
      vx: p.face * (gren ? 2.6 : 1.9) * far, vy: 0, vz: gren ? 3.2 : 3.8, fuse: gren ? 70 : 0, life: 999 });
    sfx('throw');
    if (p.ammo <= 0) p.weapon = null;
  }
  function nearItem(p) {
    return G.items.find(it => isWeaponItem(it.type) && it.z === 0 && Math.abs(it.x - p.x) < 16 && Math.abs(it.y - p.y) < 9);
  }
  function touchItems(p) {
    for (let i = G.items.length - 1; i >= 0; i--) {
      const it = G.items[i];
      if (isWeaponItem(it.type) || it.z > 0) continue;
      if (Math.abs(it.x - p.x) > 13 || Math.abs(it.y - p.y) > 8) continue;
      G.items.splice(i, 1);
      if (it.type === 'meat') { p.hp = Math.min(p.maxHp, p.hp + 60); sfx('food'); addScore(p, 300); G.popups.push({ x: it.x, y: it.y - 30, txt: '+ZDROWIE', t: 0, col: '#7cff7c' }); }
      else if (it.type === 'fruit') { p.hp = Math.min(p.maxHp, p.hp + 25); sfx('food'); addScore(p, 100); G.popups.push({ x: it.x, y: it.y - 30, txt: '+25', t: 0, col: '#7cff7c' }); }
      else if (it.type === 'amber') { p.amber++; sfx('coin'); G.popups.push({ x: it.x, y: it.y - 30, txt: '+1 BURSZTYN', t: 0, col: '#f0a020' }); }
      else if (it.type === 'gem') { p.amber++; addScore(p, 2000); sfx('coin'); G.popups.push({ x: it.x, y: it.y - 30, txt: '2000', t: 0, col: '#80f0ff' }); }
      else if (it.type === '1up') { p.lives++; sfx('oneup'); addScore(p, 1000); G.popups.push({ x: it.x, y: it.y - 30, txt: '1UP!', t: 0, col: '#7cff7c' }); }
      else if (it.type === 'coin') { addScore(p, 500); sfx('coin'); G.popups.push({ x: it.x, y: it.y - 30, txt: '500', t: 0, col: '#ffe080' }); }
    }
  }
  function fireRifle(p) {
    if (p.ammo <= 0) { sfx('empty'); p.weapon = null; return; }
    p.ammo--; sfx('gun'); G.shake = 3;
    let best = null, bd = 1e9;
    for (const t of G.actors) {
      if (!hostile(p, t) || !hittable(t)) continue;
      const dx = (t.x - p.x) * p.face;
      if (dx < 0 || dx > W || Math.abs(t.y - p.y) > 12 + (t.depthR || 0)) continue;
      if (dx < bd) { bd = dx; best = t; }
    }
    const x2 = best ? best.x : p.x + p.face * W;
    G.fx.push({ type: 'tracer', x: p.x + p.face * 22, x2, y: p.y, z: 24 * p.b.scale, t: 0, life: 6 });
    G.fx.push({ type: 'muzzle', x: p.x + p.face * 26, y: p.y, z: 24 * p.b.scale, t: 0, life: 5 });
    if (best) { hurt(best, 20, p.face, true, p); spark(best.x, best.y, hitY(best), true); G.hitstop = 5; }
    if (p.ammo <= 0) { G.popups.push({ x: p.x, y: p.y - 50, txt: 'PUSTO!', t: 0, col: '#ff8080' }); p.weapon = null; }
  }

