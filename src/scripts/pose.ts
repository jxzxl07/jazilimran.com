// A pull shot by a right-handed batter, keyframed in 3D and drawn from a raised
// broadcast-style camera. Shared by the CreaseLab demo and its preview.
//
// World axes, in metres: x towards the leg side, y up, z down the pitch towards
// the bowler. The popping crease is z = 0 and the stumps are at z = -1.22.

export type V = [number, number, number];
type Body = Record<string, V>;

const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V): V => mul(a, 1 / (len(a) || 1));
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const mix = (a: V, b: V, u: number): V => add(a, mul(sub(b, a), u));
const smooth = (u: number) => u * u * (3 - 2 * u);
export const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

// Body keyframes. Stance, backlift, back and across, downswing, contact, follow-through, finish.
const BODY: { t: number; b: Body }[] = [
  { t: 0, b: {
    head: [0.02, 1.63, 0.12], neck: [0.06, 1.48, 0.06], ls: [0.06, 1.43, 0.24], rs: [0.1, 1.42, -0.12],
    le: [-0.12, 1.12, 0.14], re: [-0.08, 1.1, -0.1], lh: [0.1, 0.93, 0.18], rh: [0.12, 0.93, -0.1],
    lk: [0.04, 0.5, 0.26], rk: [0.08, 0.5, -0.12], la: [0.1, 0.07, 0.3], ra: [0.12, 0.07, -0.14],
    lf: [-0.08, 0.02, 0.36], rf: [-0.06, 0.02, -0.12] } },
  { t: 0.24, b: {
    head: [0.02, 1.63, 0.1], neck: [0.06, 1.48, 0.04], ls: [0.06, 1.44, 0.22], rs: [0.1, 1.43, -0.14],
    le: [-0.1, 1.2, 0.02], re: [0.02, 1.12, -0.28], lh: [0.1, 0.93, 0.16], rh: [0.12, 0.93, -0.12],
    lk: [0.04, 0.5, 0.25], rk: [0.08, 0.5, -0.13], la: [0.1, 0.07, 0.3], ra: [0.12, 0.07, -0.14],
    lf: [-0.08, 0.02, 0.36], rf: [-0.06, 0.02, -0.12] } },
  { t: 0.42, b: {
    head: [0.0, 1.66, -0.06], neck: [0.05, 1.51, -0.1], ls: [0.08, 1.46, 0.08], rs: [0.02, 1.46, -0.28],
    le: [-0.06, 1.3, -0.1], re: [0.05, 1.22, -0.4], lh: [0.06, 0.96, 0.02], rh: [0.04, 0.96, -0.26],
    lk: [0.08, 0.52, 0.1], rk: [-0.06, 0.52, -0.3], la: [0.12, 0.07, 0.12], ra: [-0.12, 0.07, -0.38],
    lf: [-0.04, 0.02, 0.2], rf: [-0.3, 0.02, -0.36] } },
  { t: 0.56, b: {
    head: [0.0, 1.67, -0.12], neck: [0.04, 1.52, -0.16], ls: [0.18, 1.46, -0.08], rs: [-0.1, 1.46, -0.26],
    le: [0.08, 1.22, 0.02], re: [-0.14, 1.16, -0.12], lh: [0.14, 0.97, -0.1], rh: [-0.08, 0.97, -0.3],
    lk: [0.16, 0.55, -0.02], rk: [-0.08, 0.52, -0.32], la: [0.22, 0.1, 0.0], ra: [-0.12, 0.07, -0.38],
    lf: [0.3, 0.04, 0.08], rf: [-0.3, 0.02, -0.36] } },
  { t: 0.66, b: {
    head: [-0.02, 1.68, -0.14], neck: [0.0, 1.53, -0.18], ls: [0.2, 1.47, -0.18], rs: [-0.2, 1.47, -0.24],
    le: [0.16, 1.28, 0.1], re: [-0.1, 1.22, 0.08], lh: [0.16, 0.98, -0.22], rh: [-0.14, 0.98, -0.3],
    lk: [0.24, 0.58, -0.04], rk: [-0.12, 0.52, -0.3], la: [0.34, 0.16, -0.02], ra: [-0.12, 0.07, -0.38],
    lf: [0.44, 0.12, 0.02], rf: [-0.3, 0.02, -0.36] } },
  { t: 0.84, b: {
    head: [0.1, 1.68, -0.18], neck: [0.08, 1.53, -0.24], ls: [0.2, 1.47, -0.36], rs: [-0.06, 1.47, -0.08],
    le: [0.3, 1.24, -0.16], re: [0.14, 1.26, 0.06], lh: [0.18, 0.98, -0.34], rh: [-0.02, 0.98, -0.18],
    lk: [0.3, 0.52, -0.1], rk: [-0.1, 0.52, -0.26], la: [0.4, 0.07, -0.08], ra: [-0.14, 0.12, -0.4],
    lf: [0.56, 0.02, -0.04], rf: [-0.3, 0.03, -0.34] } },
  { t: 1, b: {
    head: [0.12, 1.69, -0.2], neck: [0.08, 1.53, -0.26], ls: [0.16, 1.47, -0.42], rs: [0.02, 1.47, -0.06],
    le: [0.36, 1.4, -0.46], re: [0.28, 1.42, -0.14], lh: [0.18, 0.98, -0.36], rh: [0.0, 0.98, -0.14],
    lk: [0.3, 0.52, -0.1], rk: [-0.1, 0.53, -0.26], la: [0.4, 0.07, -0.08], ra: [-0.14, 0.13, -0.4],
    lf: [0.56, 0.02, -0.04], rf: [-0.3, 0.03, -0.34] } },
];

// The bat: where the top hand is, and which way the bat points. Extra keys through
// the swing keep it sweeping round the front of the body rather than flipping.
const BAT: { t: number; h: V; d: V }[] = [
  { t: 0, h: [-0.22, 0.86, 0.02], d: [-0.1, -1, 0.02] },
  { t: 0.12, h: [-0.14, 1.05, -0.14], d: [0, -0.2, -1] },
  { t: 0.24, h: [-0.02, 1.3, -0.28], d: [0.12, 0.85, -0.5] },
  { t: 0.42, h: [0.0, 1.48, -0.36], d: [0.25, 0.8, -0.4] },
  { t: 0.56, h: [-0.1, 1.3, 0.05], d: [-0.75, 0.35, -0.55] },
  { t: 0.66, h: [0.08, 1.22, 0.3], d: [-0.97, 0.05, 0.2] },
  { t: 0.72, h: [0.22, 1.26, 0.22], d: [0.1, 0.15, 0.98] },
  { t: 0.77, h: [0.32, 1.3, 0.1], d: [0.85, 0.3, 0.2] },
  { t: 0.84, h: [0.34, 1.34, 0.02], d: [0.55, 0.35, -0.75] },
  { t: 1, h: [0.3, 1.62, -0.3], d: [-0.1, -0.35, -0.93] },
];

export const BAT_LEN = 0.86;
export const CONTACT = 0.66;
export const PHASES = [
  { at: 0, name: 'stance' },
  { at: 0.24, name: 'backlift' },
  { at: 0.42, name: 'back and across' },
  { at: 0.66, name: 'contact' },
  { at: 0.84, name: 'finish' },
];

function seg<T extends { t: number }>(keys: T[], t: number) {
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1];
  return { a, b, u: smooth(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)))) };
}

export function frameAt(t: number) {
  const { a, b, u } = seg(BODY, t);
  const j: Body = {};
  for (const k in a.b) j[k] = mix(a.b[k], b.b[k], u);
  const s = seg(BAT, t);
  const hands = mix(s.a.h, s.b.h, s.u);
  const dir = norm(mix(norm(s.a.d), norm(s.b.d), s.u));
  // Top hand at the top of the handle, bottom hand just below it.
  j.lw = hands;
  j.rw = add(hands, mul(dir, 0.1));
  return { j, hands, dir, ball: ballAt(t) };
}

// A short ball: pitches about 5.5 m short, climbs to chest height, and is pulled
// in front of square on the leg side.
function ballAt(t: number): V | null {
  const release: V = [-0.1, 2.1, 17];
  const bounce: V = [-0.2, 0.04, 5.6];
  const { hands, dir } = batAt(CONTACT);
  const hit = add(hands, mul(dir, 0.62));
  if (t < 0.3) return null;
  if (t < 0.56) return mix(release, bounce, (t - 0.3) / 0.26);
  if (t < CONTACT) {
    const u = (t - 0.56) / (CONTACT - 0.56);
    const p = mix(bounce, hit, u);
    p[1] = bounce[1] + (hit[1] - bounce[1]) * Math.sin((u * Math.PI) / 2);
    return p;
  }
  const u = (t - CONTACT) / (1 - CONTACT);
  const out: V = [hit[0] + 9 * u, hit[1] + 2.4 * u - 3 * u * u, hit[2] + 3 * u];
  return out[1] < 0 ? [out[0], 0.04, out[2]] : out;
}
function batAt(t: number) {
  const s = seg(BAT, t);
  return { hands: mix(s.a.h, s.b.h, s.u), dir: norm(mix(norm(s.a.d), norm(s.b.d), s.u)) };
}

// ------------------------------------------------------------------ metrics

const deg = (r: number) => (r * 180) / Math.PI;
const angleAt = (a: V, b: V, c: V) => deg(Math.acos(Math.max(-1, Math.min(1, dot(norm(sub(a, b)), norm(sub(c, b)))))));

export function metricsAt(t: number, shotSeconds: number) {
  const f = frameAt(t);
  const f0 = frameAt(0);
  const prev = frameAt(Math.max(0, t - 0.01));
  const shoulders = (j: Body) => deg(Math.atan2(j.ls[0] - j.rs[0], j.ls[2] - j.rs[2]));
  return {
    knee: 180 - angleAt(f.j.lh, f.j.lk, f.j.la),
    rotation: shoulders(f.j) - shoulders(f0.j),
    handSpeed: len(sub(f.hands, prev.hands)) / (0.01 * shotSeconds),
    headMove: len(sub(f.j.head, f0.j.head)) * 100,
  };
}

// ------------------------------------------------------------------- camera

type Cam = { pos: V; f: V; r: V; u: V; focal: number; cx: number; cy: number };
function camera(W: number, H: number): Cam {
  // Raised, from the off side and slightly in front: the angle a coach films from,
  // where the hips and shoulders visibly open as the shot is played.
  const pos: V = [-3.4, 1.9, 4.2];
  const target: V = [0.05, 0.92, -0.25];
  const f = norm(sub(target, pos));
  const r = norm(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  return { pos, f, r, u, focal: H * 2.25, cx: W / 2, cy: H * 0.57 };
}
function project(c: Cam, p: V) {
  const d = sub(p, c.pos);
  const z = dot(d, c.f);
  return { x: c.cx + (c.focal * dot(d, c.r)) / z, y: c.cy - (c.focal * dot(d, c.u)) / z, z };
}

const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

// ---------------------------------------------------------------------- draw

export function drawScene(ctx: CanvasRenderingContext2D, t: number, opts: { grid?: boolean } = {}) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const c = camera(W, H);
  const P = (p: V) => project(c, p);
  const px = (m: number, z: number) => (c.focal * m) / z;
  const col = { line: css('--line'), line2: css('--line-2'), text: css('--text'), muted: css('--muted'), faint: css('--faint'), ok: css('--ok'), bg: css('--bg'), bg3: css('--bg-3'), agent: css('--agent') };
  ctx.clearRect(0, 0, W, H);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const poly = (pts: V[], fill: string) => {
    ctx.beginPath();
    pts.forEach((p, i) => {
      const q = P(p);
      i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };
  const seg3 = (a: V, b: V, colour: string, widthM: number) => {
    const p = P(a), q = P(b);
    ctx.strokeStyle = colour;
    ctx.lineWidth = Math.max(1, px(widthM, (p.z + q.z) / 2));
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
    ctx.stroke();
  };

  // The pitch and its markings.
  poly([[-1.52, 0, -3.5], [1.52, 0, -3.5], [1.52, 0, 3.2], [-1.52, 0, 3.2]], col.bg3);
  const white = col.muted;
  seg3([-2.2, 0.001, 0], [2.2, 0.001, 0], white, 0.05); // popping crease
  seg3([-1.32, 0.001, -1.22], [1.32, 0.001, -1.22], white, 0.05); // bowling crease
  seg3([-1.32, 0.001, -2.44], [-1.32, 0.001, 1.22], white, 0.05); // return creases
  seg3([1.32, 0.001, -2.44], [1.32, 0.001, 1.22], white, 0.05);
  if (opts.grid) {
    for (let z = -3; z <= 3; z += 1) seg3([-1.52, 0.001, z], [1.52, 0.001, z], col.line, 0.012);
  }

  // Stumps and bails, behind the batter from this camera.
  for (const x of [-0.11, 0, 0.11]) seg3([x, 0, -1.22], [x, 0.71, -1.22], col.text, 0.035);
  seg3([-0.12, 0.72, -1.22], [0.12, 0.72, -1.22], col.text, 0.02);

  const { j, hands, dir, ball } = frameAt(t);

  // Shadows on the pitch: batter, then ball.
  const pelvis = mix(j.lh, j.rh, 0.5);
  const sh = P([pelvis[0], 0, pelvis[2]]);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(sh.x, sh.y, px(0.45, sh.z), px(0.14, sh.z), 0, 0, Math.PI * 2);
  ctx.fill();
  const visible = ball && P(ball).z > 0.5;
  if (ball && visible) {
    const bs = P([ball[0], 0, ball[2]]);
    ctx.beginPath();
    ctx.ellipse(bs.x, bs.y, px(0.05, bs.z), px(0.02, bs.z), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Everything that belongs to the batter, drawn back to front.
  type Item = { z: number; draw: () => void };
  const items: Item[] = [];
  const bone = (a: string, b: string, w = 0.075) =>
    items.push({ z: (P(j[a]).z + P(j[b]).z) / 2, draw: () => seg3(j[a], j[b], col.ok, w) });
  // Torso as a soft plate between shoulders and hips.
  items.push({
    z: P(mix(j.ls, j.rh, 0.5)).z + 0.05,
    draw: () => {
      ctx.globalAlpha = 0.28;
      poly([j.ls, j.rs, j.rh, j.lh], col.ok);
      ctx.globalAlpha = 1;
    },
  });
  [['neck', 'ls'], ['neck', 'rs'], ['ls', 'lh'], ['rs', 'rh'], ['lh', 'rh'], ['ls', 'rs']].forEach(([a, b]) => bone(a, b, 0.07));
  [['ls', 'le'], ['le', 'lw'], ['rs', 're'], ['re', 'rw']].forEach(([a, b]) => bone(a, b, 0.08));
  [['lh', 'lk'], ['lk', 'la'], ['rh', 'rk'], ['rk', 'ra']].forEach(([a, b]) => bone(a, b, 0.11));
  [['la', 'lf'], ['ra', 'rf']].forEach(([a, b]) => bone(a, b, 0.08));
  bone('neck', 'head', 0.06);
  // The bat: handle, then blade.
  const handleEnd = add(hands, mul(dir, 0.28));
  const toe = add(hands, mul(dir, BAT_LEN));
  items.push({
    z: P(add(hands, mul(dir, 0.5))).z,
    draw: () => {
      seg3(hands, handleEnd, col.faint, 0.035);
      seg3(handleEnd, toe, col.muted, 0.11);
    },
  });
  // Head, with a helmet peak towards where he is looking.
  items.push({
    z: P(j.head).z - 0.01,
    draw: () => {
      const h = P(j.head);
      ctx.fillStyle = col.bg;
      ctx.strokeStyle = col.ok;
      ctx.lineWidth = Math.max(1.5, px(0.03, h.z));
      ctx.beginPath();
      ctx.arc(h.x, h.y, px(0.12, h.z), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    },
  });
  // Joints.
  for (const k of ['ls', 'rs', 'le', 're', 'lw', 'rw', 'lh', 'rh', 'lk', 'rk', 'la', 'ra']) {
    items.push({
      z: P(j[k]).z - 0.02,
      draw: () => {
        const q = P(j[k]);
        ctx.fillStyle = col.text;
        ctx.beginPath();
        ctx.arc(q.x, q.y, Math.max(1.5, px(0.03, q.z)), 0, Math.PI * 2);
        ctx.fill();
      },
    });
  }
  // The measured joint: front knee.
  items.push({
    z: P(j.lk).z - 0.03,
    draw: () => {
      const q = P(j.lk);
      ctx.strokeStyle = col.agent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(q.x, q.y, px(0.09, q.z), 0, Math.PI * 2);
      ctx.stroke();
    },
  });
  if (ball && visible) {
    items.push({
      z: P(ball).z,
      draw: () => {
        const q = P(ball);
        ctx.fillStyle = '#d6453d';
        ctx.beginPath();
        ctx.arc(q.x, q.y, Math.max(2.5, px(0.036, q.z)), 0, Math.PI * 2);
        ctx.fill();
      },
    });
  }
  items.sort((a, b) => b.z - a.z).forEach((i) => i.draw());
}
