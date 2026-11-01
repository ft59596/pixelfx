// The gallery: every effect playing live from its own code. Tiles start when they scroll into view; a click
// opens one effect with its options, a sprite sheet and the code to use it.

import { effects, categories as sourceCategories } from "../src/fx/index.js";
import { createFrame, clearFrame, createFx, createAct, actBounds, composite, backdrop, drawActor, painterFor, stockActor, actorAlphaOf, PAL, BACKDROPS } from "../src/core/index.js";

import { effectText, categoryText, paletteText, backdropText, tagText } from "./zh-cn.js";
const categories = sourceCategories.map(c => ({ ...c, name: categoryText[c.id]?.[0] ?? c.name, blurb: categoryText[c.id]?.[1] ?? c.blurb }));

const REPO = "https://github.com/patch-gg/pixelfx";
const FX = Object.entries(effects).map(([id, mod]) => {
  const meta = { fps: 30, bg: "dark", loop: false, duration: 1, tags: [], options: {}, ...mod.meta };
  const original = { name: meta.name, desc: meta.desc, tags: [...meta.tags] };
  Object.assign(meta, effectText[id] ?? {});
  meta.tags = meta.tags.map(t => tagText[t] ?? t);
  return { id, original, cat: id.split("/")[0], name: meta.name, mod: { ...mod, meta }, meta };
});
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
// full-screen effects (transitions, weather, impact frames) fill a 16:9 stage edge to edge instead of floating in it
const isScreen = (fx) => fx.meta.size[0] >= 320 && Math.abs(fx.meta.size[0] / fx.meta.size[1] - 16 / 9) < 0.05;
const $ = (s) => document.querySelector(s);
function el(tag, props = {}, kids = []) {
  const e = Object.assign(document.createElement(tag), props);
  for (const k of [].concat(kids)) e.append(k);
  return e;
}

// ---- a live effect on a canvas, at an integer scale that fits the stage
class Player {
  constructor(canvas, fx, aspect, pad) {
    Object.assign(this, { canvas, fx, ctx: canvas.getContext("2d"), opts: {}, flip: false, actor: true, speed: 1, playing: true });
    this.bg = fx.meta.bg;
    this.layout(aspect, pad);
  }
  // the art-pixel stage: the effect's canvas plus some room, stretched to the tile's aspect; CSS scales it up
  layout(aspect, pad) {
    Object.assign(this, { aspect, pad });
    // an act needs room for the whole performance, not just the effect's canvas
    const acted = this.acted, b = acted ? { ...actBounds(this.fx.mod) } : null;
    // an act happens above the floor: don't spend the tile on bricks
    if (b) b.y1 = Math.min(b.y1, 22);
    const [w, h] = acted ? [b.x1 - b.x0, b.y1 - b.y0] : this.fx.meta.size, [ox, oy] = acted ? [-b.x0, -b.y0] : this.fx.meta.origin;
    this.W = Math.ceil(Math.max(w * (acted ? Math.min(pad, 1.1) : pad), h * (acted ? Math.min(pad, 1.1) : pad) * aspect));
    this.H = Math.ceil(this.W / aspect);
    this.x = Math.floor((this.W - w) / 2) + ox;
    // an act stands near the bottom of its tile, with the room above it
    this.y = acted ? Math.max(oy + 2, this.H - b.y1 - 2) : Math.floor((this.H - h) / 2) + oy;
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    // shrinking pixel art nearest-neighbour drops whole 1 px lines; smooth it only when it has to shrink
    const shown = this.canvas.getBoundingClientRect().width * devicePixelRatio;
    this.canvas.style.imageRendering = shown && shown < this.W ? "auto" : "";
    this.frame = createFrame(this.W, this.H);
    this.img = this.ctx.createImageData(this.W, this.H);
    this.setBg(this.bg);
    this.restart();
  }
  setBg(kind) {
    this.bg = kind;
    this.bgBuf = kind === "none" ? null : backdrop(kind, this.W, this.H, this.y);
    this.dirty = true;
  }
  // an effect with an act plays it, unless the character is switched off
  get acted() {
    return !!this.fx.mod.act && this.actor;
  }
  restart() {
    this.inst = (this.acted ? createAct : createFx)(this.fx.mod, { x: this.x, y: this.y, flip: this.flip, ...this.opts });
    this.acc = 0;
    this.wait = 0;
    this.dirty = true;
  }
  tick(dt) {
    const m = this.fx.meta, step = 1 / m.fps;
    if (this.playing) this.acc = Math.min(this.acc + dt * this.speed, 0.25);
    let moved = false;
    while (this.acc >= step) {
      this.acc -= step;
      if (!m.loop && (this.acted ? this.inst.done() : this.inst.t >= m.duration)) {
        this.wait += step;
        if (this.wait > 0.45) this.restart();
      } else this.inst.update(step);
      moved = true;
    }
    if (moved || this.dirty) this.render();
  }
  seek(t) {
    this.restart();
    this.inst.update(t);
    this.render();
  }
  render() {
    const f = clearFrame(this.frame);
    if (this.acted) {
      this.inst.draw(f);
      composite(f, this.img.data, this.bgBuf);
      const [sx, sy] = this.inst.shake;
      if (sx || sy) this.ctx.clearRect(0, 0, this.W, this.H);
      this.ctx.putImageData(this.img, sx, sy);
      this.dirty = false;
      return;
    }
    this.inst.draw(f, "back");
    const m = this.fx.meta, tt = m.loop ? this.inst.t % m.duration : Math.min(this.inst.t, m.duration);
    if (m.actor && this.actor) drawActor(painterFor(f).place(this.x, this.y, this.flip), this.inst.options.actor ?? stockActor(), actorAlphaOf(this.fx.mod, tt, this.inst.options));
    this.inst.draw(f, "front");
    composite(f, this.img.data, this.bgBuf);
    this.ctx.putImageData(this.img, 0, 0);
    this.dirty = false;
  }
}

// ---- tiles
const tiles = [];
const sections = [];
function build() {
  $("#count").textContent = FX.length;
  const main = $("#grid");
  for (const c of categories) {
    const list = FX.filter((f) => f.cat === c.id);
    if (!list.length) continue;
    const grid = el("div", { className: "grid" });
    const sec = el("section", { id: c.id }, [el("div", { className: "section-head" }, [el("h2", { textContent: c.name }), el("p", { textContent: c.blurb })]), grid]);
    sections.push({ c, sec, list });
    for (const fx of list) {
      const cv = el("canvas", { ariaLabel: fx.name });
      const b = fx.mod.act ? actBounds(fx.mod) : null, [fw, fh] = b ? [b.x1 - b.x0, b.y1 - b.y0] : fx.meta.size;
      const fig = el("figure", { className: isScreen(fx) ? "tile big screen" : fw > 200 || fh > 170 || (b && (fw > 130 || fx.mod.act.target || fx.mod.act.targets)) ? "tile big" : "tile", tabIndex: 0 }, [
        el("div", { className: "stage" }, cv),
        el("figcaption", {}, [el("b", { textContent: fx.name }), el("small", { textContent: fx.meta.loop ? "循环" : `${+fx.meta.duration.toFixed(2)}秒` })]),
      ]);
      const t = { fx, fig, cv, player: null, visible: false, hover: false };
      fig.addEventListener("click", () => openDetail(fx));
      fig.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), openDetail(fx)));
      fig.addEventListener("pointerenter", () => (t.hover = true));
      fig.addEventListener("pointerleave", () => (t.hover = false));
      grid.append(fig);
      tiles.push(t);
    }
    main.append(sec);
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const t = tiles.find((x) => x.fig === e.target);
      t.visible = e.isIntersecting;
      if (t.visible && !t.player) {
        t.player = isScreen(t.fx) ? new Player(t.cv, t.fx, 16 / 9, 1) : new Player(t.cv, t.fx, 6 / 5, 1.25);
        if (reduced) t.player.seek(t.fx.meta.duration * 0.4);
      }
    }
  }, { rootMargin: "200px" });
  tiles.forEach((t) => io.observe(t.fig));
}

// ---- filters
const state = { cat: "all", q: "" };
function chips() {
  const box = $("#chips");
  const mk = (id, label, n) => {
    const b = el("button", { className: "chip", type: "button" }, [label, el("span", { textContent: n })]);
    b.dataset.cat = id;
    b.addEventListener("click", () => setCat(id));
    box.append(b);
  };
  mk("all", "全部", FX.length);
  for (const s of sections) mk(s.c.id, s.c.name, s.list.length);
}
function setCat(id, fromHash = false) {
  state.cat = sections.some((s) => s.c.id === id) ? id : "all";
  document.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === state.cat)));
  if (!fromHash) history.replaceState(null, "", state.cat === "all" ? location.pathname : "#" + state.cat);
  filter();
  if (!fromHash) window.scrollTo({ top: 0 });
}
function filter() {
  const q = state.q.trim().toLowerCase();
  let shown = 0;
  for (const s of sections) {
    let any = false;
    for (const fx of s.list) {
      const t = tiles.find((x) => x.fx === fx);
      const hit = (state.cat === "all" || state.cat === s.c.id) && (!q || [fx.id, fx.name, fx.meta.desc, ...fx.meta.tags, fx.original.name, fx.original.desc, ...fx.original.tags, categoryText[fx.cat]?.[0], fx.meta.loop ? "循环" : "单次"].join(" ").toLowerCase().includes(q));
      t.fig.hidden = !hit;
      any ||= hit;
      shown += hit;
    }
    s.sec.hidden = !any;
  }
  $("#none").hidden = shown > 0;
}

// ---- detail
let detail = null;
function openDetail(fx) {
  const d = $("#detail");
  const big = $("#big"), screen = isScreen(fx);
  big.parentElement.classList.toggle("screen", screen);
  detail = screen ? new Player(big, fx, 16 / 9, 1) : new Player(big, fx, 16 / 10, 1.6);
  const m = fx.meta;
  $("#d-name").textContent = m.name;
  $("#d-id").textContent = fx.id;
  $("#d-desc").textContent = m.desc;
  const frames = Math.round(m.duration * m.fps) + (m.loop || m.endBehavior === "hold" ? 0 : 1);
  $("#d-facts").replaceChildren(
    ...[["播放方式", m.loop ? "循环播放" : "单次播放"], ["时长", `${+m.duration.toFixed(2)} 秒，${frames} 帧，${m.fps} 帧/秒`], ...(fx.mod.act ? [["角色动作", actFacts(fx.mod)]] : []), ["画布尺寸", `${m.size[0]} × ${m.size[1]} 像素`], ["标签", m.tags.join("、")]].flatMap(([k, v]) => [el("dt", { textContent: k }), el("dd", { textContent: v })]),
  );
  // controls
  $("#d-bg").replaceChildren(...BACKDROPS.concat("none").map((b) => btn(backdropText[b] ?? b, () => detail.setBg(b), b === m.bg, "bg")));
  $("#d-speed").replaceChildren(...[0.25, 0.5, 1].map((s) => btn(`${s}×`, () => (detail.speed = s), s === 1, "speed")));
  buildPalettes(fx);
  $("#d-actor").hidden = !m.actor;
  $("#d-actor").setAttribute("aria-pressed", "true");
  $("#d-flip").setAttribute("aria-pressed", "false");
  $("#d-play").setAttribute("aria-pressed", "true");
  $("#d-play").textContent = "暂停";
  $("#d-sheet").replaceChildren();
  code(fx);
  d.showModal();
  d.scrollTop = 0;
}
// what the body does around the effect, in a line: the wind-up, the freeze, the recovery
function actFacts(mod) {
  const k = mod.act.poses, lead = Math.max(0, -k[0][0]), end = k[k.length - 1][0] - mod.meta.duration, hits = (mod.act.hits ?? []).filter((h) => h.stop);
  const parts = [];
  if (lead > 0) parts.push(`蓄力 ${lead.toFixed(2)} 秒`);
  if (hits.length) parts.push(`${hits[0].t.toFixed(2)} 秒处${hits.length === 1 ? `顿帧 ${Math.round(hits[0].stop * 1000)} 毫秒` : `开始，共 ${hits.length} 次顿帧`}`);
  if (!mod.meta.loop && end > 0.02) parts.push(`收势 ${end.toFixed(2)} 秒`);
  return parts.join("，") || "角色随特效同步动作";
}
function btn(label, fn, on, group) {
  const b = el("button", { className: "btn", type: "button", textContent: label });
  b.setAttribute("aria-pressed", String(!!on));
  b.addEventListener("click", () => {
    if (group) b.parentElement.querySelectorAll(".btn").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    fn();
  });
  return b;
}
// Keep editable ramps separate from shared effect defaults and PAL presets.
function colorHex(c) {
  if (typeof c === "number") return "#" + [c & 255, (c >>> 8) & 255, (c >>> 16) & 255].map(v => v.toString(16).padStart(2, "0")).join("");
  return c.length === 4 ? "#" + [...c.slice(1)].map(v => v + v).join("") : c;
}
function selectPalette(key, colors) {
  if (colors) detail.opts.palette = colors.map(colorHex);
  else delete detail.opts.palette;
  $("#d-pal").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.palette === key)));
  const ramp = detail.opts.palette ?? detail.fx.meta.options.palette ?? PAL.fire;
  $("#d-pal-colors").replaceChildren(...ramp.map((c, i) => {
    const input = el("input", { type: "color", value: colorHex(c), title: `颜色 ${i + 1}: ${colorHex(c)}` });
    input.setAttribute("aria-label", `调色板颜色 ${i + 1}`);
    input.addEventListener("input", () => {
      const edited = [...(detail.opts.palette ?? ramp)].map(colorHex);
      edited[i] = input.value;
      detail.opts.palette = edited;
      input.title = `颜色 ${i + 1}: ${input.value}`;
      $("#d-pal").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", "false"));
      detail.restart();
      $("#d-sheet").replaceChildren();
      code(detail.fx);
    });
    return input;
  }));
  detail.restart();
  $("#d-sheet").replaceChildren();
  code(detail.fx);
}
function buildPalettes(fx) {
  const presets = [["", "原色", fx.meta.options.palette ?? PAL.fire], ...Object.entries(PAL).map(([k,v]) => [k,paletteText[k] ?? k,v])];
  $("#d-pal").replaceChildren(...presets.map(([key, name, colors]) => {
    const strip = el("span", { className: "palette-strip" }, colors.map(c => {
      const swatch = el("span");
      swatch.style.backgroundColor = colorHex(c);
      return swatch;
    }));
    strip.setAttribute("aria-hidden", "true");
    const b = el("button", { type: "button", className: "palette-preset", title: name }, [strip, el("span", { textContent: name })]);
    b.dataset.palette = key;
    b.addEventListener("click", () => selectPalette(key, key ? colors : null));
    return b;
  }));
  selectPalette("", null);
}
function code(fx) {
  const v = fx.id.split("/")[1].replace(/-(\w)/g, (_, c) => c.toUpperCase());
  const opts = { x: 160, y: 120, ...(detail.opts.palette ? { palette: detail.opts.palette } : {}), ...(detail.flip ? { flip: true } : {}) };
  const acted = !!fx.mod.act, make = acted ? "createAct" : "createFx";
  $("#d-code").textContent = [
    `import { createFrame, ${make}, composite } from "pixelfx";`,
    `import * as ${v} from "pixelfx/fx/${fx.id}";`,
    ``,
    `const frame = createFrame(320, 180);`,
    `const fx = ${make}(${v}, ${JSON.stringify(opts).replace(/"\[…\]"/, "[…]").replace(/"(\w+)":/g, "$1: ").replace(/,/g, ", ")});`,
    ``,
    `// 每帧更新`,
    `fx.update(dt);`,
    `fx.draw(frame);          // 绘制颜色与辉光`,
    `composite(frame, imageData.data, null);`,
    ...(acted ? [``, `// 使用自己的角色时，可参考 ${v}.act 中的姿势、命中与顿帧时序`] : []),
  ].join("\n");
  $("#d-src").href = `${REPO}/blob/main/src/fx/${fx.id}.js`;
}
function sheet() {
  const fx = detail.fx, m = fx.meta, [w, h] = m.size, n = Math.max(1, Math.round(m.duration * m.fps) + (m.loop || m.endBehavior === "hold" ? 0 : 1));
  const cols = Math.min(n, Math.max(1, Math.ceil(Math.sqrt((n * h) / w)))), rows = Math.ceil(n / cols);
  const cv = el("canvas", { width: cols * w, height: rows * h }), ctx = cv.getContext("2d");
  const frame = createFrame(w, h), img = ctx.createImageData(w, h);
  const inst = createFx(fx.mod, { x: m.origin[0], y: m.origin[1], ...detail.opts, flip: detail.flip });
  for (let i = 0; i < n; i++) {
    if (i) inst.update(1 / m.fps);
    inst.draw(clearFrame(frame));
    composite(frame, img.data, null);
    ctx.putImageData(img, (i % cols) * w, Math.floor(i / cols) * h);
  }
  const k = Math.max(1, Math.min(4, Math.floor(1100 / (cols * w))));
  const pic = el("img", { src: cv.toDataURL("image/png"), alt: `${m.name} 精灵表`, width: cols * w * k, height: rows * h * k });
  $("#d-sheet").replaceChildren(pic, el("p", { textContent: `共 ${n} 帧，每帧 ${w} × ${h} 像素，每行 ${cols} 帧，${m.fps} 帧/秒，${m.loop ? "循环播放" : "单次播放"}。右键保存图片；命令行导出：node tools/render.mjs ${fx.id} --sheet` }));
}
function wireDetail() {
  const d = $("#detail");
  $("#d-close").addEventListener("click", () => d.close());
  d.addEventListener("close", () => (detail = null));
  d.addEventListener("click", (e) => e.target === d && d.close());
  $("#d-play").addEventListener("click", (e) => {
    detail.playing = !detail.playing;
    e.target.setAttribute("aria-pressed", String(detail.playing));
    e.target.textContent = detail.playing ? "暂停" : "播放";
  });
  $("#d-again").addEventListener("click", () => detail.restart());
  $("#d-flip").addEventListener("click", (e) => {
    detail.flip = !detail.flip;
    e.target.setAttribute("aria-pressed", String(detail.flip));
    detail.restart();
    code(detail.fx);
  });
  $("#d-actor").addEventListener("click", (e) => {
    detail.actor = !detail.actor;
    e.target.setAttribute("aria-pressed", String(detail.actor));
    // with an act, the character is the performance: off shows the effect alone, as a sprite sheet has it
    if (detail.fx.mod.act) detail.layout(detail.aspect, detail.pad);
    detail.dirty = true;
  });
  $("#d-seed").addEventListener("click", () => {
    detail.opts.seed = 1 + Math.floor(Math.random() * 9999);
    detail.restart();
  });
  $("#d-pal-reset").addEventListener("click", () => selectPalette("", null));
  $("#d-make").addEventListener("click", sheet);
  $("#d-copy").addEventListener("click", async (e) => {
    const text = $("#d-code").textContent;
    try {
      await navigator.clipboard.writeText(text);
      e.target.textContent = "已复制";
    } catch {
      getSelection().selectAllChildren($("#d-code"));
      e.target.textContent = "已选中";
    }
    setTimeout(() => (e.target.textContent = "复制"), 1400);
  });
}

// ---- the clock
let last = performance.now();
function frameLoop(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (detail) detail.tick(dt);
  else for (const t of tiles) if (t.visible && t.player && !t.fig.hidden && (!reduced || t.hover)) t.player.tick(dt);
  requestAnimationFrame(frameLoop);
}

build();
chips();
wireDetail();
$("#q").addEventListener("input", (e) => {
  state.q = e.target.value;
  filter();
});
setCat(location.hash.slice(1) || "all", true);
addEventListener("hashchange", () => setCat(location.hash.slice(1) || "all", true));
requestAnimationFrame(frameLoop);
