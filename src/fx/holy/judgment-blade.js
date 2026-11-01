import { Particles, Bits, Lights, P, PF, B, Rng, fit, rand, sparkle, flare, band, bolt, clamp, lerp, seg, smooth, ease, TAU, WHITE, PAL, hex, mix } from "../../core/index.js";

export const meta = {
  name: "Judgment blade",
  desc: "A colossal blade of light falls point-first out of the sky onto a burning sigil: a white slam, shock rings and glowing cracks, then it dissolves upward into motes.",
  tags: ["holy", "judgment", "sword", "strike", "spell", "impact", "ground", "one-shot"],
  size: [320, 340],
  origin: [160, 290],
  duration: 4.2,
  loop: false,
  fps: 30,
  bg: "ground",
  options: { palette: PAL.holy, sparks: ["#fffbe6", "#fff09a", "#ffd84a", "#f0b424"], seed: 3 },
};

const BLADE = 146, BW = 13, GW = 28, GRIP = 20, POMMEL = 8;
const CLIP = -290; // the canvas top: the sword enters from above it and is clipped there
const CHARGE = 0.68, HIT = 0.92, HOLD = 2.08, GONE = 3.18;
const SY = 0.22, RX = 36;
const INK = hex("#141020");

// the greatsword: tip at (x, y), point down; s is distance up the blade, t across it
function blade(p, x, y, st) {
  if (st.a <= 0 || st.dv >= 1) return;
  const ang = st.ang ?? 0, ca = Math.cos(ang), sa = Math.sin(ang), ax = sa, ay = -ca, nx = ca, ny = sa;
  p.shade(x - GW - 3, y - BLADE - 46, x + GW + 3, y + 3, (px, py, out) => {
    if (py < CLIP) return;
    const dx = px - x, dy = py - y, s = dx * ax + dy * ay, t = dx * nx + dy * ny, at = Math.abs(t);
    // dissolving: the hilt burns away first, the tip leaves last, and the cut edge is ragged
    const cut = st.dv > 0 ? BLADE * (1 - st.dv) + rand(Math.floor(px * 3 + 1), 417) * 7 - 3.5 : BLADE + 1;
    if (st.dv > 0 && s > cut) return;
    // the blade itself: lit left face, shadowed right face, a groove down each cheek, a white spine
    if (s >= 0 && s <= BLADE) {
      const hw = 1.2 + BW * Math.pow(s / BLADE, 0.55);
      if (at <= hw) {
        const q = at / hw, edge = hw - at;
        let c;
        if (st.hot) c = t < 0 || edge > 1 ? WHITE : INK; // still an outline, so the silhouette survives the flash
        else if (at < 0.9) c = WHITE;
        else if (t < 0) c = edge < 1 ? st.rim : q < 0.3 ? st.lit1 : q < 0.46 ? st.groove : q < 0.82 ? st.lit0 : st.rim;
        else c = edge < 1 ? INK : q < 0.3 ? st.shade1 : q < 0.46 ? st.groove2 : q < 0.82 ? st.shade0 : st.shade2;
        if (st.glint >= 0 && Math.abs(s - st.glint) < 1.4) c = WHITE;
        if (st.dv > 0 && cut - s < 2.5) c = WHITE; // the burning edge
        out.c = c;
        out.a = st.a;
        return;
      }
    }
    // the winged crossguard: a thick golden bar sweeping up to points at its tips, a white gem at its heart
    const gs = s - BLADE;
    if (gs >= -2 && gs <= 13 && at <= GW) {
      const u = at / GW, cy = 3.4 + 4.4 * Math.pow(u, 2.2), half = (5.8 - 2.6 * u) * Math.sqrt(Math.max(0, 1 - Math.pow(u, 14)));
      if (gs >= cy - half && gs <= cy + half) {
        const rel = (gs - (cy - half)) / (2 * half || 1);
        let c;
        if (st.hot) c = rel < 0.25 ? st.shade2 : WHITE;
        else if (at < 2.3 && Math.abs(gs - cy) < 1.7) c = WHITE;
        else if (rel > 0.62) c = st.rim;
        else if (rel < 0.25) c = st.shade2;
        else c = t < 0 ? (rel > 0.45 ? st.lit1 : st.lit0) : rel > 0.45 ? st.lit0 : st.shade1;
        out.c = c;
        out.a = st.a;
        return;
      }
    }
    // the grip, banded in gold and shadow
    if (gs > 9.5 && gs <= 9.5 + GRIP) {
      if (at <= 3.1) {
        const w = Math.floor((gs - 11) / 3) % 2, collar = gs < 11;
        out.c = st.hot ? WHITE : at > 2.2 ? INK : collar ? st.lit1 : w ? st.lit0 : st.shade1;
        out.a = st.a;
      }
      return;
    }
    // the pommel: a bright diamond on a short stem
    const top = 9.5 + GRIP;
    if (gs > top && gs <= top + POMMEL) {
      const u = (gs - top) / POMMEL, pw = 5.5 * Math.sin(Math.PI * (0.06 + u * 0.88));
      if (at <= pw) {
        out.c = st.hot ? WHITE : at < 1 ? WHITE : pw - at < 1 ? st.shade2 : st.lit1;
        out.a = st.a;
      }
    }
  });
}

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed);
  const rim = C[7], lit1 = C[6], lit0 = C[5], groove = C[3];
  const shade1 = mix(C[1], hex("#7a82a8"), 0.75), shade0 = mix(C[0], hex("#4a5276"), 0.7), shade2 = mix(C[0], hex("#1c2036"), 0.6), groove2 = mix(C[0], hex("#3a4060"), 0.5);
  const DUST = mix(C[2], hex("#6a5e7c"), 0.55), SMOKE = mix(C[1], hex("#5a5468"), 0.5);
  const STONE = [INK, mix(C[1], hex("#3c3652"), 0.6), mix(C[3], hex("#6e6480"), 0.5), mix(C[5], hex("#9c92a6"), 0.4), mix(C[6], hex("#dcd2dc"), 0.3)];
  const ps = new Particles({ rng: R, ground: () => 0, sparks: o.sparks, haze: C[5] });
  const bits = new Bits({ ground: () => 0 }), lights = new Lights();

  const cracks = [];
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI * 0.88 + (i / 10) * Math.PI * 1.76 + R.range(-0.12, 0.12);
    const L = R.range(34, 86) * (Math.abs(Math.sin(a)) > 0.75 ? 0.7 : 1);
    const pts = bolt(R, 0, 0, Math.cos(a) * L, Math.sin(a) * L * SY, { jag: 0.3, depth: 4 });
    const m = Math.floor(pts.length * 0.55), [mx, my] = pts[m], ba = a + R.sign() * R.range(0.5, 0.9);
    const fork = bolt(R, mx, my, mx + Math.cos(ba) * L * 0.38, my + Math.sin(ba) * L * 0.38 * 0.6, { jag: 0.35, depth: 3 });
    cracks.push({ pts, fork, L, cool: R.range(1.7, 2.5) });
  }

  const tipY = () => (t < CHARGE ? 0 : t >= HIT ? 0 : lerp(-230, 0, ease.inCubic(seg(t, CHARGE, HIT))));
  let t = 0, hit = false;
  const dissolving = () => seg(t, HOLD, GONE);

  // a solid thread of light from the top of the frame down to yEnd: sky to sigil while the mark is called,
  // the blade's tail of light while it falls, the pillar left behind when it lands
  function shaft(p, yEnd, k, wide = 0) {
    const y0 = CLIP + 8;
    if (k <= 0.02 || yEnd <= y0 + 6) return;
    const span = yEnd - y0;
    for (let y = y0; y < yEnd; y++) {
      const u = (yEnd - y) / span; // 0 at the bottom of the shaft, 1 at the sky
      const c = u < 0.3 ? (wide ? WHITE : C[6]) : u < 0.6 ? C[5] : u < 0.86 ? C[4] : C[3];
      p.px(0, y, c);
      if (wide) {
        p.px(-1, y, c);
        p.px(1, y, c);
        p.dot(-2, y, C[4], 0.6);
        p.dot(2, y, C[4], 0.6);
      }
    }
    p.glowLine(0, Math.max(y0, yEnd - 150), 0, yEnd, wide ? 13 : 7, C[4], wide ? 0.3 * k : 0.13 * k);
  }

  // a ring of runes called up on the floor: three rings turning against each other, spokes, glyphs
  function sigil(p, near) {
    const out = smooth(HIT + 0.16, HIT + 0.85, t);
    const k = (1 - out) * clamp(t / 0.26);
    if (k <= 0.01) return;
    const grow = ease.outCubic(clamp(t / 0.4)), open = 1 + out * 0.45;
    const hot = t > HIT && t < HIT + 0.12;
    for (const [r, dir, al] of [[RX, 1, 0.85], [RX * 0.69, -1, 0.8], [RX * 0.4, 2, 0.7]]) {
      const rr = r * grow * open, n = Math.ceil(rr * TAU * 1.25) + 4, spin = t * 0.5 * dir;
      for (let i = 0; i < n; i++) {
        const a = spin + (i / n) * TAU;
        if ((Math.sin(a) >= 0) !== near) continue;
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr * SY;
        p.dot(x, y, hot ? WHITE : i % 9 === 0 ? C[6] : C[5], k * al);
        if (near) p.dot(x, y + 0.9, hot ? C[6] : C[3], k * al * 0.75);
      }
    }
    if (grow > 0.55) {
      const reach = clamp((grow - 0.55) / 0.45);
      for (let i = 0; i < 8; i++) {
        const a = t * 0.5 + (i / 8) * TAU;
        if ((Math.sin(a) >= 0) !== near) continue;
        const r0 = RX * 0.4 * grow * open, r1 = RX * 0.69 * grow * open, m = Math.max(1, Math.round((r1 - r0) * 1.1));
        for (let j = 0; j <= m; j++) {
          const u = j / m;
          if (u > reach) break;
          const rr = r0 + (r1 - r0) * u;
          p.dot(Math.cos(a) * rr, Math.sin(a) * rr * SY, hot ? WHITE : C[5], k * 0.7);
        }
      }
    }
    if (grow > 0.85) {
      for (let i = 0; i < 6; i++) {
        const a = -t * 0.35 + (i / 6) * TAU;
        if ((Math.sin(a) >= 0) !== near) continue;
        const x = Math.round(Math.cos(a) * RX * 0.69 * open), y = Math.round(Math.sin(a) * RX * 0.69 * open * SY);
        for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) p.dot(x + dx, y + dy, hot ? WHITE : near ? C[6] : C[4], k);
        p.dot(x, y, hot ? WHITE : C[7], k);
      }
    }
    if (near && t > 0.22) {
      p.px(0, 0, hot || k > 0.62 ? WHITE : C[6]);
      p.dot(1, 0, C[3], k);
      p.dot(-1, 0, C[3], k);
      p.dot(0, 1, C[3], k);
      p.dot(0, -1, C[6], k);
      p.glow(0, 0, 22 + 12 * k, C[4], 0.3 * k);
    }
  }

  function drawCracks(p) {
    if (t < HIT) return;
    const fade = 1 - smooth(2.9, 3.7, t);
    if (fade <= 0) return;
    const grow = ease.outCubic(seg(t, HIT, HIT + 0.16));
    for (const c of cracks)
      for (const path of [c.pts, c.fork])
        for (let i = 0; i < path.length - 1; i++) {
          const [x0, y0] = path[i], [x1, y1] = path[i + 1], d = Math.hypot(x0, y0 / SY) / c.L;
          if (d > grow + 0.02) break;
          const heat = clamp(1 - (t - HIT) / c.cool - d * 0.5), fresh = d > grow - 0.14 && grow < 1;
          const col = fresh ? WHITE : heat > 0.85 ? WHITE : heat > 0.62 ? C[6] : heat > 0.42 ? C[5] : heat > 0.24 ? C[4] : heat > 0.1 ? C[2] : INK;
          p.line(x0, y0 + 1.8, x1, y1 + 1.8, INK, fade);
          p.line(x0, y0, x1, y1, col, fade);
          if (heat > 0.4) p.line(x0, y0 - 1, x1, y1 - 1, mix(col, C[6], 0.35), fade * 0.8);
          if ((i & 3) === 0 && heat > 0.2) p.glow(x0, y0, 8, C[4], 0.26 * heat * fade);
        }
  }

  function drawScorch(p) {
    if (t < HIT) return;
    const fade = 1 - smooth(3.3, 4.05, t);
    if (fade <= 0) return;
    const heat = Math.pow(clamp(1 - (t - HIT) / 1.9), 1.5);
    p.ellipse(0, 1.5, 21, 5.2, (d) => (heat > 0.65 ? (d < 0.5 ? WHITE : C[6]) : heat > 0.35 ? (d < 0.4 ? C[5] : C[3]) : heat > 0.12 ? (d < 0.3 ? C[2] : INK) : INK), fade);
    if (heat > 0.05) p.glow(0, -3, 42, C[4], 0.45 * heat * fade);
  }

  function impact() {
    lights.add(0, -34, 140, C[3], 0.72, 0.85);
    lights.add(0, -8, 64, WHITE, 0.85, 0.16);
    lights.add(0, -110, 110, C[4], 0.38, 0.55);
    for (let i = 0; i < 46; i++) {
      const a = -Math.PI / 2 + R.range(-1.35, 1.35), sp = R.range(110, 300);
      ps.spawn(P.SPARK, R.range(-3, 3), -2, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.22, 0.7));
    }
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI / 2 + R.range(-1.2, 1.2), sp = R.range(60, 150);
      bits.add({ kind: B.SHARD, x: R.range(-5, 5), y: -4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 0.7, drag: 0.5, bounce: 0.25, life: R.range(0.8, 1.3), a: R.range(0, TAU), va: R.range(-24, 24), s: R.range(2, 3.4), c: R.pick([WHITE, C[6], C[5], C[4]]) });
    }
    for (let i = 0; i < 20; i++) {
      const a = R.range(0, TAU), sp = R.range(20, 90);
      ps.spawn(P.EMBER, Math.cos(a) * 6, -R.range(0, 6), Math.cos(a) * sp, Math.sin(a) * sp - R.range(50, 110), R.range(0.8, 1.8), C[4]);
    }
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + R.range(-1.2, 1.2), sp = R.range(70, 180);
      ps.spawn(P.STAR, R.range(-4, 4), -3, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.4, 0.9), R.chance(0.5) ? WHITE : C[6], R.range(0.8, 2.4));
    }
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + R.range(-1.2, 1.2), sp = R.range(60, 160);
      bits.add({ kind: B.CHUNK, x: R.range(-4, 4), y: -6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 1, drag: 0.4, bounce: 0.3, life: R.range(1.4, 2.2), a: R.range(0, TAU), va: R.range(-16, 16), s: R.int(1, 3), ramp: STONE });
    }
    for (let i = 0; i < 30; i++) {
      const a = -Math.PI / 2 + R.range(-1, 1), sp = R.range(60, 200);
      ps.spawn(P.GRIT, R.range(-4, 4), -1, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.9, 1.5), R.pick(STONE.slice(1, 5)), R.chance(0.4) ? 2 : 1);
    }
    for (let i = 0; i < 9; i++) {
      const s = R.sign();
      ps.spawn(P.SMOKE, s * R.range(2, 10), -R.range(1, 4), s * R.range(60, 150), -R.range(2, 12), R.range(0.8, 1.3), SMOKE, R.range(2.4, 4.2), R.range(0, 0.05), PF.BIG);
    }
    for (let i = 0; i < 4; i++) ps.spawn(P.SMOKE, R.range(-6, 6), -R.range(4, 14), R.range(-14, 14), -R.range(30, 70), R.range(1.2, 1.9), SMOKE, R.range(3, 4.6), R.range(0.05, 0.2), PF.BIG);
    for (let i = 0; i < 6; i++) ps.spawn(P.VAPOUR, R.range(-6, 6), -R.range(0, 12), R.range(-30, 30), -R.range(5, 30), R.range(0.4, 0.8), C[6], R.range(2.5, 4));
  }

  return {
    update(dt) {
      t += dt;
      if (!hit && t >= HIT) {
        hit = true;
        impact();
      }
      // the mark is being called: glints lift off it, motes spiral in
      if (t < CHARGE) {
        if (R.chance(16 * dt)) {
          const a = R.range(0, TAU);
          ps.spawn(P.STAR, Math.cos(a) * RX, Math.sin(a) * RX * SY, R.range(-6, 6), -R.range(8, 26), R.range(0.3, 0.7), R.chance(0.5) ? WHITE : C[6], R.range(0.5, 1.6));
        }
        if (R.chance(20 * dt)) {
          const a = R.range(0, TAU), d = RX * 1.4;
          ps.spawn(P.MOTE, Math.cos(a) * d, Math.sin(a) * d * SY, -Math.cos(a) * R.range(30, 70), -R.range(10, 45), R.range(0.3, 0.5), C[5], 0.6);
        }
      }
      // the fall sheds motes from the sky
      if (t >= CHARGE && t < HIT && R.chance(55 * dt)) {
        ps.spawn(P.MOTE, R.range(-7, 7), CLIP + R.range(16, 70), R.range(-5, 5), R.range(150, 260), R.range(0.2, 0.4), R.chance(0.5) ? C[6] : C[5], 0.7);
      }
      // embers keep lifting off the hot floor while the blade holds
      if (t >= HIT && t < HOLD && R.chance(7 * dt)) {
        const a = R.range(0, TAU), d = R.range(6, 44);
        ps.spawn(P.EMBER, Math.cos(a) * d, Math.sin(a) * d * SY, R.range(-8, 8), -R.range(15, 45), R.range(0.5, 1.1), C[4]);
      }
      // the blade breaks into light: motes peel off its ragged top edge and rise
      if (t >= HOLD && t < GONE && R.chance(85 * dt)) {
        const cutS = BLADE * (1 - dissolving()), lx = R.range(-6, 6);
        const top = -(cutS + rand(Math.floor(lx * 3 + 1), 417) * 7 - 3.5);
        ps.spawn(P.MOTE, lx, top, R.range(-20, 20), -R.range(40, 110), R.range(0.5, 0.9), R.chance(0.55) ? C[6] : C[5], R.range(0.6, 1.2));
        if (R.chance(0.3)) ps.spawn(P.STAR, lx, top, 0, -R.range(10, 30), R.range(0.3, 0.6), WHITE, R.range(0.6, 1.6));
      }
      ps.update(dt);
      bits.update(dt);
      lights.update(dt);
    },
    drawBack(p) {
      // the thread down from the sky: it brightens as the mark is called, then becomes the blade's tail of light
      if (t < HIT) shaft(p, -2, 0.45 + 0.45 * clamp(t / CHARGE), 0);
      else {
        const col = seg(t, HIT, HIT + 0.35);
        if (col < 1) shaft(p, -BLADE - 2, 1 - col, 2);
      }
      // the ground warms under the mark
      const warm = clamp(t / 0.35) * (1 - smooth(HIT + 0.4, HIT + 1.1, t));
      if (warm > 0) p.glow(0, 0, 44, C[3], 0.3 * warm);
      sigil(p, false);
      drawScorch(p);
      drawCracks(p);
      // the shock waves over the floor: their far halves go behind
      for (const [t0, span, r0, r1, th, k] of [[HIT, 0.36, 8, 104, 5, 1.15], [HIT + 0.08, 0.4, 8, 130, 3, 0.75]]) {
        const u = seg(t, t0, t0 + span);
        if (t >= t0 && u < 1) band(p, 0, 0.5, r0 + (r1 - r0) * ease.outCubic(u), SY, Math.max(1, th * (1 - u) + 0.5), k * (1 - u), C.slice(2), (g) => Math.sin(g) < 0, u < 0.12);
      }
      ps.draw(p, "back");
    },
    draw(p) {
      const now = tipY(), dv = dissolving();
      sigil(p, true);
      // the blade: planted after the hit, shaking for a beat, then burning away into light
      if (t >= CHARGE && dv < 1) {
        const hot = t >= HIT && t < HIT + 0.05;
        const shake = t >= HIT ? 1.2 * Math.exp(-(t - HIT) * 5) * Math.sin((t - HIT) * 55) : 0;
        const pulse = t >= HIT && dv <= 0 ? ((t - HIT) % 0.55) / 0.55 * BLADE : -1;
        blade(p, shake, now, { a: 1, dv, hot, glint: pulse, rim, lit1, lit0, groove, shade0, shade1, shade2, groove2, ang: t < HIT ? 0.015 : 0 });
        const base = Math.max(CLIP + 12, now - BLADE * (1 - dv));
        if (dv < 1) {
          p.glowLine(0, base, 0, now - 2, 11, C[4], 0.13 * (t >= HIT ? 1 : 0.7));
          p.glow(0, now - 3, 16, C[5], hot ? 0.8 : 0.35);
          if (pulse >= 0) {
            p.line(-4, -pulse, 4, -pulse, WHITE, 0.9);
            p.glow(0, -pulse, 11, C[5], 0.4);
          }
        }
      }
      // the shock waves' near halves
      for (const [t0, span, r0, r1, th, k] of [[HIT, 0.36, 8, 104, 5, 1.15], [HIT + 0.08, 0.4, 8, 130, 3, 0.75]]) {
        const u = seg(t, t0, t0 + span);
        if (t >= t0 && u < 1) band(p, 0, 0.5, r0 + (r1 - r0) * ease.outCubic(u), SY, Math.max(1, th * (1 - u) + 0.5), k * (1 - u), C.slice(2), (g) => Math.sin(g) >= 0, u < 0.12);
      }
      // the dome of air thrown up
      const dome = seg(t, HIT, HIT + 0.28);
      if (t >= HIT && dome < 1) {
        const r = 8 + 38 * ease.outCubic(dome);
        p.arc(0, -2, r, Math.max(1, 2.6 * (1 - dome)), Math.PI, TAU, (u, v) => (dome < 0.16 && v > 0.5 ? WHITE : C[5]), 0.9 - dome * 0.8);
      }
      // the hero frame: a tight core, an opening ring and a flare, not a white ball
      if (t >= HIT && t < HIT + 0.09) {
        const u = (t - HIT) / 0.09;
        p.circle(0, -34, 7 * (1 - u * 0.4), WHITE);
        p.ring(0, -34, 6 + 30 * ease.outCubic(u), 2, (v) => (v > 0.5 ? WHITE : C[6]), 0.8 * (1 - u));
        flare(p, 0, -34, 50 * Math.pow(1 - u, 1.3), 0.9 * (1 - u), C);
        p.glow(0, -34, 34, WHITE, 0.35 * (1 - u));
      }
      if (t >= HIT && t < HIT + 0.32) sparkle(p, 0, -12, 18 * (1 - (t - HIT) / 0.32), WHITE, C[5], 0.65);
      bits.draw(p);
      ps.draw(p, "front");
      lights.draw(p);
    },
  };
}
