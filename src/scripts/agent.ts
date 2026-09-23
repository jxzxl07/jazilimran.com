// The page agent. It reads the page the way JevBar reads a Mac screen, as a
// list of named controls, and acts on them visibly with its own cursor.
// Before every click or keystroke it asks authorize(), ported from JevBar.

import { authorize, type Action } from './policy';
import { parse, composeMessage, type Intent, type Contact } from './intents';
import { projects } from '../data/projects';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T & Element>(sel) as T | null;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, reduced ? Math.min(ms, 40) : ms));
const PENDING = 'agent:pending';

type Here = { page: 'home' | 'project' | 'cv'; slug?: string };
const here = (): Here => {
  const b = document.body.dataset;
  return { page: (b.page as Here['page']) ?? 'home', slug: b.slug };
};

// ---------------------------------------------------------------- the log

const log = {
  el: () => $('#agent-log')!,
  list: () => $<HTMLOListElement>('#agent-log ol')!,
  timer: 0 as number | undefined,
  open() {
    clearTimeout(this.timer);
    this.el().hidden = false;
    requestAnimationFrame(() => this.el().classList.add('on'));
  },
  closeSoon(ms = 5000) {
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.close(), ms);
  },
  close() {
    this.el().classList.remove('on');
    window.setTimeout(() => (this.el().hidden = true), 250);
  },
  command(text: string) {
    this.open();
    const li = document.createElement('li');
    li.className = 'cmd';
    li.textContent = text;
    this.list().append(li);
    this.trim();
  },
  step(text: string) {
    const li = document.createElement('li');
    li.className = 'step run';
    li.innerHTML = `<span class="s"></span><span class="t"></span>`;
    li.querySelector('.t')!.textContent = text;
    this.list().append(li);
    this.trim();
    return {
      ok: (note?: string) => mark(li, 'ok', note),
      refused: (note: string) => mark(li, 'refused', note),
      miss: (note: string) => mark(li, 'miss', note),
    };
  },
  note(text: string) {
    const li = document.createElement('li');
    li.className = 'note';
    li.textContent = text;
    this.list().append(li);
    this.trim();
  },
  trim() {
    const l = this.list();
    while (l.children.length > 14) l.firstElementChild!.remove();
    l.scrollTop = l.scrollHeight;
  },
  dump(): string {
    return this.list().innerHTML;
  },
  restore(html: string) {
    this.list().innerHTML = html;
    this.open();
  },
};

function mark(li: HTMLElement, state: 'ok' | 'refused' | 'miss', note?: string) {
  li.classList.remove('run');
  li.classList.add(state);
  if (note) {
    const n = document.createElement('span');
    n.className = 'why';
    n.textContent = note;
    li.append(n);
  }
}

// ------------------------------------------------------------- the cursor

const cursor = {
  x: innerWidth - 80,
  y: innerHeight - 80,
  el: () => $('#agent-cursor')!,
  show() {
    const el = this.el();
    el.style.transform = `translate(${this.x}px, ${this.y}px)`;
    el.classList.add('on');
  },
  hide() {
    this.el().classList.remove('on');
  },
  async moveTo(tx: number, ty: number) {
    this.show();
    const sx = this.x, sy = this.y;
    const dist = Math.hypot(tx - sx, ty - sy);
    if (reduced || dist < 2 || document.hidden) {
      this.set(tx, ty);
      return;
    }
    // A slight arc, the way a hand moves, not a straight tween.
    const nx = -(ty - sy) / (dist || 1), ny = (tx - sx) / (dist || 1);
    const bend = Math.min(90, dist * 0.18) * (sx > tx ? 1 : -1);
    const cx = (sx + tx) / 2 + nx * bend, cy = (sy + ty) / 2 + ny * bend;
    const dur = Math.min(900, 320 + dist * 0.55);
    const t0 = performance.now();
    await new Promise<void>((done) => {
      const frame = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * cx + e * e * tx;
        const y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * cy + e * e * ty;
        this.set(x, y);
        t < 1 ? requestAnimationFrame(frame) : done();
      };
      requestAnimationFrame(frame);
    });
  },
  set(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.el().style.transform = `translate(${x}px, ${y}px)`;
  },
  async press() {
    const el = this.el();
    el.classList.remove('press');
    void el.offsetWidth;
    el.classList.add('press');
    await sleep(220);
  },
};

// --------------------------------------------------------- the highlight

let tracking: HTMLElement | null = null;
function highlight(target: HTMLElement | null, label = '', tone: 'agent' | 'refused' = 'agent') {
  const box = $('#agent-hl')!;
  tracking = target;
  if (!target) {
    box.classList.remove('on');
    return;
  }
  box.dataset.tone = tone;
  $('.hl-label', box)!.textContent = label;
  box.classList.add('on');
  const follow = () => {
    if (tracking !== target) return;
    const r = target.getBoundingClientRect();
    box.style.transform = `translate(${r.left - 6}px, ${r.top - 6}px)`;
    box.style.width = `${r.width + 12}px`;
    box.style.height = `${r.height + 12}px`;
    requestAnimationFrame(follow);
  };
  follow();
}

// ------------------------------------------------------ reading the page

// What JevBar gets from the accessibility tree: a role and a real name.
function roleOf(el: Element): string {
  const tag = el.tagName.toLowerCase();
  if (el.getAttribute('role')) return el.getAttribute('role')!;
  if (tag === 'a') return 'link';
  if (tag === 'button') return 'button';
  if (tag === 'select') return 'popup';
  if (tag === 'textarea') return 'text area';
  if (tag === 'input') return 'text field';
  if (/^h[1-6]$/.test(tag)) return 'heading';
  return tag;
}

function nameOf(el: Element): string {
  const aria = el.getAttribute('aria-label');
  if (aria) return aria;
  const id = el.getAttribute('id');
  if (id) {
    const lab = document.querySelector(`label[for="${id}"]`);
    if (lab) return lab.textContent!.trim();
  }
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 60);
}

async function scrollIntoView(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const topBar = 72;
  if (r.top >= topBar && r.bottom <= innerHeight - 24) return;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  // Wait for the scroll to settle rather than guessing how long it takes.
  let last = -1, still = 0;
  const t0 = performance.now();
  while (still < 4 && performance.now() - t0 < 1400) {
    await new Promise((r) => setTimeout(r, 16));
    const y = scrollY;
    still = y === last ? still + 1 : 0;
    last = y;
  }
}

function centreOf(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return { x: r.left + Math.min(r.width / 2, 60), y: r.top + r.height / 2 };
}

async function pointAt(el: HTMLElement, label?: string) {
  await scrollIntoView(el);
  const c = centreOf(el);
  await cursor.moveTo(c.x, c.y);
  highlight(el, label ?? `${roleOf(el)} · ${nameOf(el)}`);
}

// Every press goes through the policy with the name read from the page.
async function press(el: HTMLElement): Promise<boolean> {
  const name = nameOf(el);
  const s = log.step(`click ${roleOf(el)} “${name}”`);
  const d = authorize({ verb: 'click', controlName: name });
  if (!d.allow) {
    highlight(el, `refused · ${name}`, 'refused');
    s.refused(d.reason);
    return false;
  }
  await cursor.press();
  s.ok();
  return true;
}

async function type(el: HTMLInputElement | HTMLTextAreaElement, value: string): Promise<boolean> {
  const name = nameOf(el);
  const action: Action = { verb: 'typeText', controlName: name, value };
  const d = authorize(action);
  const s = log.step(`type into “${name}”`);
  if (!d.allow) {
    s.refused(d.reason);
    return false;
  }
  el.focus({ preventScroll: true });
  el.value = '';
  const chunk = value.length > 120 ? 4 : value.length > 40 ? 2 : 1;
  for (let i = 0; i < value.length; i += chunk) {
    el.value = value.slice(0, i + chunk);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    if (!reduced) await new Promise((r) => setTimeout(r, 14));
  }
  el.classList.add('agent-filled');
  s.ok();
  return true;
}

// --------------------------------------------------------- doing things

function go(url: string, rest: Intent[]) {
  try {
    sessionStorage.setItem(PENDING, JSON.stringify({ rest, log: log.dump() }));
  } catch {}
  location.href = url;
}

async function perform(intent: Intent, rest: Intent[]): Promise<'continue' | 'navigated'> {
  const h = here();
  switch (intent.type) {
    case 'open': {
      const p = projects.find((x) => x.slug === intent.slug)!;
      if (h.page === 'project' && h.slug === p.slug) {
        return perform({ type: 'demo' }, rest);
      }
      const link = $<HTMLAnchorElement>(`[data-agent-project="${p.slug}"]`);
      const s = log.step(`find link “${p.name}”`);
      if (!link) {
        s.ok('on another page, navigating');
        await sleep(200);
        go(`/work/${p.slug}/`, [{ type: 'demo' }, ...rest]);
        return 'navigated';
      }
      await pointAt(link, `link · ${p.name}`);
      s.ok();
      await sleep(250);
      if (!(await press(link))) return 'continue';
      go(link.href, [{ type: 'demo' }, ...rest]);
      return 'navigated';
    }

    case 'demo': {
      const demo = $('[data-agent-demo]');
      const s = log.step('find the live demo');
      if (!demo) {
        s.miss('this page has no demo');
        return 'continue';
      }
      await pointAt(demo, 'region · live demo');
      s.ok();
      const play = $<HTMLButtonElement>('[data-agent-play]', demo);
      if (play) {
        demo.dataset.played = '1';
        await pointAt(play);
        await sleep(200);
        if (play.disabled || /pause/i.test(play.textContent ?? '')) {
          log.note('It’s already running. Watch this space.');
        } else if (await press(play)) play.click();
      }
      return 'continue';
    }

    case 'section': {
      const target = $(intent.target);
      const s = log.step(`find “${intent.label}”`);
      if (!target) {
        const home = intent.page !== 'cv';
        if ((home && h.page === 'home') || (!home && h.page === 'cv')) {
          s.miss('That part of the page isn’t here.');
          return 'continue';
        }
        s.ok(home ? 'on the home page, navigating' : 'on the CV, navigating');
        go(`${home ? '/' : '/cv/'}${intent.target}`, [intent, ...rest]);
        return 'navigated';
      }
      await pointAt(target, `region · ${intent.label}`);
      s.ok();
      return 'continue';
    }

    case 'home': {
      const s = log.step('go to the top of the home page');
      if (h.page !== 'home') {
        s.ok();
        go('/', rest);
        return 'navigated';
      }
      scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      await sleep(500);
      s.ok();
      return 'continue';
    }

    case 'cv': {
      const link = $<HTMLAnchorElement>('[data-agent-cv]');
      const s = log.step('find link “CV”');
      if (h.page === 'cv') {
        s.ok('already here');
        return 'continue';
      }
      if (link) {
        await pointAt(link, 'link · CV');
        s.ok();
        if (!(await press(link))) return 'continue';
      } else s.ok();
      go('/cv/', rest);
      return 'navigated';
    }

    case 'theme': {
      const s = log.step(`switch to ${intent.mode} mode`);
      document.documentElement.dataset.theme = intent.mode;
      try {
        localStorage.setItem('theme', intent.mode);
      } catch {}
      s.ok();
      return 'continue';
    }

    case 'contact':
      return fillContact(intent.contact, rest);

    case 'send': {
      const btn = $<HTMLButtonElement>('[data-agent-send]');
      if (!btn) {
        log.step('find a send button').refused('There is nothing here to send, and I would not press it if there were.');
        return 'continue';
      }
      await pointAt(btn);
      await sleep(300);
      await press(btn);
      return 'continue';
    }

    case 'credential': {
      log.step('type a password').refused('I never enter a password, passkey or one-time code. That one is yours to type.');
      return 'continue';
    }

    case 'help': {
      openBar('');
      return 'continue';
    }

    case 'find': {
      const s = log.step(`search the page for “${intent.query}”`);
      const hit = findText(intent.query);
      if (!hit) {
        s.miss('Nothing on this page matches. I would rather say so than guess.');
        return 'continue';
      }
      await pointAt(hit, `text · ${nameOf(hit).slice(0, 40)}`);
      s.ok();
      return 'continue';
    }
  }
}

function findText(query: string): HTMLElement | null {
  const words = query.split(' ').filter((w) => w.length > 2);
  if (!words.length) return null;
  let best: { el: HTMLElement; score: number } | null = null;
  for (const el of document.querySelectorAll<HTMLElement>('main h1, main h2, main h3, main p, main li, main dd, main dt, main td')) {
    const t = el.textContent!.toLowerCase();
    const score = words.filter((w) => t.includes(w)).length / words.length - t.length / 20000;
    if (score >= 0.5 && (!best || score > best.score)) best = { el, score };
  }
  return best?.el ?? null;
}

async function fillContact(c: Contact, rest: Intent[]): Promise<'continue' | 'navigated'> {
  const form = $<HTMLFormElement>('#contact-form');
  if (!form) {
    log.step('find the contact form').ok('on the home page, navigating');
    go('/#contact', [{ type: 'contact', contact: c }, ...rest]);
    return 'navigated';
  }
  const s = log.step('read form “Contact” · 4 fields');
  await pointAt(form, 'form · Contact');
  s.ok();

  const message = composeMessage(c);
  const fields: { sel: string; value?: string; label: string }[] = [
    { sel: '#cf-name', value: c.name, label: 'Your name' },
    { sel: '#cf-email', value: c.email, label: 'Your email' },
    { sel: '#cf-reason', value: c.reason, label: 'Reason' },
    { sel: '#cf-message', value: message, label: 'Message' },
  ];
  const filled: string[] = [];
  const left: string[] = [];

  // Page order, one control at a time, like JevBar.
  for (const f of fields) {
    const el = $<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(f.sel)!;
    if (!f.value) {
      left.push(f.label);
      continue;
    }
    await pointAt(el as HTMLElement);
    await sleep(120);
    if (el instanceof HTMLSelectElement) {
      const st = log.step(`choose “${f.value}” in “${nameOf(el)}”`);
      el.value = f.value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.classList.add('agent-filled');
      st.ok();
      filled.push(f.label);
    } else if (await type(el, f.value)) filled.push(f.label);
    else left.push(f.label);
  }

  const btn = $<HTMLButtonElement>('[data-agent-send]')!;
  await pointAt(btn);
  await sleep(350);
  await press(btn);

  const report = $('#contact-report')!;
  report.hidden = false;
  report.innerHTML = `
    <p class="label">Report</p>
    <p><span class="ok">Filled:</span> ${filled.join(', ') || 'nothing'}.</p>
    ${left.length ? `<p><span class="amber">Left for you:</span> ${left.join(', ')}.</p>` : ''}
    <p class="muted">I don’t press send. Read it, change anything you like, then send it yourself.</p>`;
  const firstEmpty = fields.find((f) => !f.value);
  if (firstEmpty) $<HTMLElement>(firstEmpty.sel)?.focus({ preventScroll: true });
  log.note(`Filled ${filled.length} of ${fields.length}. Stopped before sending.`);
  return 'continue';
}

// ----------------------------------------------------------------- run

let running = false;

export async function run(text: string, resume?: Intent[]) {
  if (running) return;
  running = true;
  parked = false;
  setTag('agent');
  closeBar();
  document.documentElement.classList.add('agent-busy');
  try {
    let plan = resume;
    if (!plan) {
      log.command(text);
      plan = parse(text, here());
      if (!plan.length) {
        log.step('understand the request').miss('I couldn’t match that to anything here. Try “show me the security project”.');
      }
    }
    for (let i = 0; i < plan.length; i++) {
      const r = await perform(plan[i], plan.slice(i + 1));
      if (r === 'navigated') return;
      await sleep(250);
    }
    log.note('Done.');
  } catch (err) {
    log.step('finish').miss(String(err));
  } finally {
    running = false;
    document.documentElement.classList.remove('agent-busy');
    await sleep(1600);
    if (!running) {
      highlight(null);
      park();
      log.closeSoon();
    }
  }
}

// ------------------------------------------------------ the command bar

const Recognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let rec: any = null;
let heard = '';

function openBar(prefill = '', listen = false) {
  const bar = $('#agent-bar')!;
  const input = $<HTMLInputElement>('#agent-input')!;
  bar.hidden = false;
  requestAnimationFrame(() => bar.classList.add('on'));
  input.value = prefill;
  if (!listen) input.focus();
  bar.classList.toggle('listening', listen);
  $('#agent-voice-note')!.hidden = !!Recognition;
}

function closeBar() {
  const bar = $('#agent-bar');
  if (!bar || bar.hidden) return;
  bar.classList.remove('on', 'listening');
  setTimeout(() => (bar.hidden = true), 180);
}

function startListening() {
  if (!Recognition) {
    openBar('');
    return;
  }
  if (rec) return;
  heard = '';
  openBar('', true);
  const input = $<HTMLInputElement>('#agent-input')!;
  rec = new Recognition();
  rec.lang = 'en-GB';
  rec.interimResults = true;
  rec.continuous = true;
  rec.onresult = (e: any) => {
    let text = '';
    for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
    heard = text.trim();
    input.value = heard;
  };
  rec.onerror = () => stopListening(false);
  rec.onend = () => {
    const wasListening = !!rec;
    rec = null;
    $('#agent-bar')!.classList.remove('listening');
    if (wasListening && heard) run(heard);
    else input.focus();
  };
  try {
    rec.start();
  } catch {
    rec = null;
  }
}

function stopListening(submit = true) {
  if (!rec) return;
  if (!submit) heard = '';
  rec.stop();
}

// ------------------------------------------------------------- reading

// On arrival, show what the agent can see: every named control, briefly.
async function readPage() {
  const status = $('#agent-status');
  const els = [...document.querySelectorAll<HTMLElement>('main a, main button, main input, main textarea, main select, main h1, main h2, .topbar a, .topbar button')].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
  });
  const total = document.querySelectorAll('a, button, input, textarea, select, h1, h2, h3').length;
  const t0 = performance.now();
  if (!reduced && !sessionStorage.getItem('agent:read')) {
    const layer = $('#agent-scan')!;
    els.slice(0, 40).forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const b = document.createElement('div');
      b.className = 'scan-box';
      b.style.cssText = `left:${r.left - 3}px;top:${r.top - 3}px;width:${r.width + 6}px;height:${r.height + 6}px;animation-delay:${i * 22}ms`;
      const tag = document.createElement('span');
      tag.textContent = roleOf(el);
      b.append(tag);
      layer.append(b);
    });
    await sleep(Math.min(40, els.length) * 22 + 900);
    layer.innerHTML = '';
    try {
      sessionStorage.setItem('agent:read', '1');
    } catch {}
  }
  if (status) {
    const ms = Math.max(1, Math.round(performance.now() - t0));
    status.innerHTML = `<b>${total}</b> elements · ready`;
    status.classList.add('ready');
    status.title = `${ms} ms`;
  }
}


// ------------------------------------------------------ resting place

// Between tasks the cursor waits by the input, so the agent is always visible.
let parked = false;
function setTag(text: string) {
  const t = $('#agent-cursor .tag');
  if (t) t.textContent = text;
}
function parkSpot() {
  const input = $('#hero-ask');
  if (!input) return null;
  const r = input.getBoundingClientRect();
  if (r.bottom < 70 || r.top > innerHeight - 40) return null;
  // Beside the Run button when there is room; otherwise stay out of the way.
  if (r.right + 190 > innerWidth) return null;
  return { x: r.right + 16, y: r.top + r.height / 2 - 6 };
}
function park() {
  const spot = parkSpot();
  if (!spot || running) {
    parked = false;
    cursor.hide();
    return;
  }
  parked = true;
  setTag('agent · waiting for you');
  cursor.moveTo(spot.x, spot.y);
}
addEventListener(
  'scroll',
  () => {
    if (!parked || running) return;
    const spot = parkSpot();
    if (!spot) cursor.hide();
    else {
      cursor.set(spot.x, spot.y);
      cursor.show();
    }
  },
  { passive: true },
);

// ------------------------------------------------------------ inspector

// The page as the agent reads it, listed live beside the headline.
function buildInspector() {
  const list = $<HTMLOListElement>('#insp-list');
  if (!list) return;
  const els = [...document.querySelectorAll<HTMLElement>('main h1, main h2, main a, main button, main input, main textarea, main select')].filter(
    (el) => !el.closest('.inspector') && !el.closest('.ask-chips') && nameOf(el),
  );
  const items = new Map<HTMLElement, HTMLLIElement>();
  els.forEach((el, i) => {
    const li = document.createElement('li');
    const heading = /^H[12]$/.test(el.tagName);
    li.className = `lvl-${heading ? 1 : 2} new`;
    li.style.animationDelay = `${Math.min(i, 30) * 25}ms`;
    li.innerHTML = '<span class="r"></span><span class="n"></span>';
    li.querySelector('.r')!.textContent = roleOf(el);
    li.querySelector('.n')!.textContent = nameOf(el);
    li.title = `${roleOf(el)} · ${nameOf(el)}`;
    li.addEventListener('click', () => goTo(el));
    list.append(li);
    items.set(el, li);
  });

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) items.get(e.target as HTMLElement)?.classList.toggle('in', e.isIntersecting);
    if (list.matches(':hover')) return;
    const first = list.querySelector<HTMLElement>('li.in');
    if (first) list.scrollTo({ top: first.offsetTop - 8, behavior: reduced ? 'auto' : 'smooth' });
  });
  items.forEach((_, el) => io.observe(el));
}

// Clicking an entry in the inspector: the agent goes there, and presses it if
// it is something to press, subject to the same policy as everything else.
async function goTo(el: HTMLElement) {
  if (running) return;
  running = true;
  parked = false;
  setTag('agent');
  log.command(`go to ${roleOf(el)} “${nameOf(el)}”`);
  try {
    const s = log.step(`find ${roleOf(el)} “${nameOf(el)}”`);
    await pointAt(el);
    s.ok();
    if (el instanceof HTMLAnchorElement || (el instanceof HTMLButtonElement && !el.closest('form[data-agent-inline]'))) {
      await sleep(250);
      if (await press(el)) {
        const pending = el instanceof HTMLAnchorElement && el.dataset.agentProject ? [{ type: 'demo' } as Intent] : [];
        if (el instanceof HTMLAnchorElement && !el.getAttribute('href')!.startsWith('#')) {
          if (/^https?:/.test(el.getAttribute('href')!)) {
            log.note('That link leaves this site, so I’ve stopped here.');
          } else {
            go(el.href, pending);
            return;
          }
        } else el.click();
      }
    } else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
      el.focus({ preventScroll: true });
    }
  } finally {
    running = false;
    await sleep(1400);
    if (!running) {
      highlight(null);
      park();
      log.closeSoon();
    }
  }
}

// ---------------------------------------------------------------- intro

// On a first visit the agent introduces itself without being asked, then hands
// over. Any key, click, touch or scroll stops it immediately.
async function intro() {
  let stopped = false;
  const stop = () => (stopped = true);
  const evs = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
  evs.forEach((e) => addEventListener(e, stop, { capture: true, once: true }));
  const done = () => {
    evs.forEach((e) => removeEventListener(e, stop, { capture: true }));
    highlight(null);
    if (!running) park();
  };
  try {
    sessionStorage.setItem('agent:intro', '1');
  } catch {}

  const h1 = $('main h1');
  const insp = $('.inspector');
  const input = $<HTMLInputElement>('#hero-ask input');
  if (!h1 || !input) return done();

  cursor.set(innerWidth + 40, innerHeight * 0.35);
  setTag('agent');
  const at = async (el: HTMLElement, label: string, hold: number) => {
    if (stopped) return;
    const c = centreOf(el);
    await cursor.moveTo(c.x, c.y);
    if (stopped) return;
    highlight(el, label);
    await sleep(hold);
  };

  await at(h1, 'heading · the short version', 1500);
  if (insp && insp.getBoundingClientRect().top < innerHeight - 100) {
    await at(insp, 'region · everything I can read on this page', 1700);
  }
  await at(input, 'text field · you can talk to me here', 600);
  const sample = 'Show me the security project';
  for (let i = 1; i <= sample.length && !stopped; i++) {
    input.value = sample.slice(0, i);
    await sleep(38);
  }
  if (!stopped) {
    highlight(input, 'your turn · press ↵ to run it');
    await sleep(2600);
  }
  done();
}

// ------------------------------------------------------------------ wire

function labelKeys() {
  if (document.documentElement.dataset.keys !== 'pc') return;
  const labels: Record<string, string> = { open: 'Ctrl K', talk: 'Ctrl Shift Space' };
  document.querySelectorAll<HTMLElement>('kbd[data-kbd]').forEach((k) => (k.textContent = labels[k.dataset.kbd!] ?? k.textContent));
}

function init() {
  labelKeys();
  // Hold ⌘⇧Space on a Mac, Ctrl+Shift+Space elsewhere, to talk; let go to run.
  let holding = false;
  addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement)?.tagName) && (e.target as HTMLElement).id !== 'agent-input';
    if (e.code === 'Space' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!holding) {
        holding = true;
        startListening();
      }
      return;
    }
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
      e.preventDefault();
      openBar();
    }
    if (e.key === 'Escape') {
      stopListening(false);
      closeBar();
    }
  });
  addEventListener('keyup', (e) => {
    if (holding && (e.code === 'Space' || e.key === 'Meta' || e.key === 'Control' || e.key === 'Shift')) {
      holding = false;
      stopListening(true);
    }
  });

  document.querySelectorAll('[data-agent-open]').forEach((b) => b.addEventListener('click', () => openBar()));
  $('#agent-mic')?.addEventListener('click', () => (rec ? stopListening(true) : startListening()));
  $('#agent-bar')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeBar();
  });
  $('#agent-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $<HTMLInputElement>('#agent-input')!.value.trim();
    if (v) run(v);
  });
  $('#agent-log-close')?.addEventListener('click', () => log.close());

  document.querySelectorAll<HTMLElement>('[data-ask]').forEach((b) =>
    b.addEventListener('click', () => run(b.dataset.ask!)),
  );
  document.querySelectorAll<HTMLFormElement>('[data-agent-inline]').forEach((f) =>
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = f.querySelector('input')!;
      if (input.value.trim()) run(input.value.trim());
    }),
  );
  document.querySelectorAll<HTMLElement>('[data-agent-mic]').forEach((b) => {
    if (!Recognition) {
      b.hidden = true;
      return;
    }
    b.addEventListener('click', () => (rec ? stopListening(true) : startListening()));
  });

  // Carry on with a plan that crossed a page boundary.
  let pending: { rest: Intent[]; log: string } | null = null;
  try {
    pending = JSON.parse(sessionStorage.getItem(PENDING) ?? 'null');
    sessionStorage.removeItem(PENDING);
  } catch {}
  if (pending) {
    try {
      sessionStorage.setItem('agent:read', '1');
    } catch {}
    log.restore(pending.log);
    readPage();
    setTimeout(() => run('', pending!.rest), 450);
  } else {
    document.fonts?.ready.then(() =>
      setTimeout(async () => {
        await readPage();
        let seen = false;
        try {
          seen = !!sessionStorage.getItem('agent:intro');
        } catch {}
        if (here().page === 'home' && !seen && !reduced && scrollY < 100) intro();
        else park();
      }, 250),
    );
  }
  buildInspector();
}

init();
