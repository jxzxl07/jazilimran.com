// A hand-animated pull shot, shared by the CreaseLab demo and its preview.
// Front-on, right-handed batter; coordinates in a unit box.

export type P = [number, number];
export type Pose = Record<string, P>;

const K: { t: number; p: Pose; bat: P }[] = [
  { t: 0, bat: [0.53, 0.8], p: { head: [0.5, 0.13], neck: [0.5, 0.21], ls: [0.43, 0.24], rs: [0.57, 0.24], le: [0.43, 0.36], re: [0.57, 0.36], lw: [0.49, 0.46], rw: [0.51, 0.45], lh: [0.45, 0.5], rh: [0.55, 0.5], lk: [0.43, 0.67], rk: [0.57, 0.67], la: [0.41, 0.86], ra: [0.59, 0.86] } },
  { t: 0.3, bat: [0.74, 0.03], p: { head: [0.5, 0.14], neck: [0.5, 0.22], ls: [0.43, 0.25], rs: [0.57, 0.24], le: [0.5, 0.3], re: [0.65, 0.31], lw: [0.6, 0.21], rw: [0.62, 0.22], lh: [0.45, 0.51], rh: [0.55, 0.51], lk: [0.42, 0.68], rk: [0.58, 0.68], la: [0.4, 0.86], ra: [0.6, 0.86] } },
  { t: 0.55, bat: [0.8, 0.26], p: { head: [0.49, 0.15], neck: [0.5, 0.23], ls: [0.43, 0.26], rs: [0.57, 0.25], le: [0.49, 0.33], re: [0.63, 0.35], lw: [0.58, 0.33], rw: [0.6, 0.33], lh: [0.45, 0.52], rh: [0.56, 0.52], lk: [0.4, 0.68], rk: [0.58, 0.69], la: [0.37, 0.86], ra: [0.6, 0.86] } },
  { t: 0.72, bat: [0.16, 0.3], p: { head: [0.5, 0.15], neck: [0.51, 0.23], ls: [0.45, 0.25], rs: [0.58, 0.24], le: [0.44, 0.33], re: [0.56, 0.35], lw: [0.43, 0.34], rw: [0.45, 0.35], lh: [0.46, 0.52], rh: [0.56, 0.51], lk: [0.4, 0.67], rk: [0.6, 0.7], la: [0.37, 0.86], ra: [0.62, 0.86] } },
  { t: 1, bat: [0.22, 0.02], p: { head: [0.49, 0.14], neck: [0.5, 0.22], ls: [0.44, 0.24], rs: [0.57, 0.25], le: [0.4, 0.28], re: [0.49, 0.3], lw: [0.39, 0.2], rw: [0.41, 0.21], lh: [0.46, 0.51], rh: [0.56, 0.51], lk: [0.41, 0.68], rk: [0.6, 0.7], la: [0.38, 0.86], ra: [0.62, 0.86] } },
];

const bones = [
  ['head', 'neck'], ['neck', 'ls'], ['neck', 'rs'], ['ls', 'le'], ['le', 'lw'], ['rs', 're'], ['re', 'rw'],
  ['ls', 'lh'], ['rs', 'rh'], ['lh', 'rh'], ['lh', 'lk'], ['lk', 'la'], ['rh', 'rk'], ['rk', 'ra'],
];

export const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
export const lerp = (a: P, b: P, u: number): P => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];

export function poseAt(t: number) {
  let i = 0;
  while (i < K.length - 2 && t > K[i + 1].t) i++;
  const a = K[i], b = K[i + 1];
  const u = ease(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))));
  const p: Pose = {};
  for (const k in a.p) p[k] = lerp(a.p[k], b.p[k], u);
  return { p, bat: lerp(a.bat, b.bat, u) };
}

export const angle = (a: P, b: P, c: P) => {
  const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]];
  const cos = (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(v1[0], v1[1]) * Math.hypot(v2[0], v2[1]));
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
};

const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

// Draws the pose at time t. `scale` thickens lines for small canvases.
export function drawPose(ctx: CanvasRenderingContext2D, t: number, opts: { grid?: boolean; scale?: number } = {}) {
  const { p, bat } = poseAt(t);
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const s = opts.scale ?? 1;
  const X = (q: P) => q[0] * W, Y = (q: P) => q[1] * H;
  ctx.clearRect(0, 0, W, H);
  if (opts.grid) {
    ctx.strokeStyle = css('--line');
    ctx.lineWidth = 1;
    for (let g = 0; g <= W; g += 40) {
      ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(W, g); ctx.stroke();
    }
  }
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // ground line
  ctx.strokeStyle = css('--line-2');
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath(); ctx.moveTo(W * 0.2, H * 0.875); ctx.lineTo(W * 0.8, H * 0.875); ctx.stroke();
  // bat: handle from the hands, blade to the tip
  const hands = lerp(p.lw, p.rw, 0.5);
  const shoulder = lerp(hands, bat, 0.28);
  ctx.strokeStyle = css('--muted');
  ctx.lineWidth = 3 * s;
  ctx.beginPath(); ctx.moveTo(X(hands), Y(hands)); ctx.lineTo(X(shoulder), Y(shoulder)); ctx.stroke();
  ctx.lineWidth = 8 * s;
  ctx.beginPath(); ctx.moveTo(X(shoulder), Y(shoulder)); ctx.lineTo(X(bat), Y(bat)); ctx.stroke();
  // skeleton
  ctx.strokeStyle = css('--ok');
  ctx.lineWidth = 3 * s;
  for (const [a, b] of bones) {
    ctx.beginPath(); ctx.moveTo(X(p[a]), Y(p[a])); ctx.lineTo(X(p[b]), Y(p[b])); ctx.stroke();
  }
  // joints, and the head as a ring
  ctx.fillStyle = css('--text');
  for (const k in p) {
    if (k === 'head') continue;
    ctx.beginPath(); ctx.arc(X(p[k]), Y(p[k]), 3.5 * s, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = css('--ok');
  ctx.fillStyle = css('--bg');
  ctx.beginPath(); ctx.arc(X(p.head), Y(p.head), 0.045 * H, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // the measured joint: front knee
  ctx.strokeStyle = css('--agent');
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath(); ctx.arc(X(p.lk), Y(p.lk), 0.032 * H, 0, Math.PI * 2); ctx.stroke();
  return { p, bat, hands };
}
