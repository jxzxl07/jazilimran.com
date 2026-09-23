// Turns what a visitor said into a plan. Deterministic on purpose: no model,
// no network. Anything it cannot match, it says so instead of guessing.

import { projects } from '../data/projects';

export type Contact = {
  name?: string;
  email?: string;
  org?: string;
  reason: 'Internship' | 'Role' | 'Collaboration' | 'Question';
  about?: string;
};

export type Intent =
  | { type: 'open'; slug: string }
  | { type: 'section'; target: string; label: string; page?: 'cv' }
  | { type: 'contact'; contact: Contact }
  | { type: 'send' }
  | { type: 'credential' }
  | { type: 'theme'; mode: 'light' | 'dark' }
  | { type: 'demo' }
  | { type: 'home' }
  | { type: 'cv' }
  | { type: 'help' }
  | { type: 'find'; query: string };

const has = (s: string, ...words: string[]) =>
  words.some((w) => new RegExp(`(^|[^a-z])${w.replace(/ /g, '\\s+')}([^a-z]|$)`).test(s));

// Split "open NightWatch and then show me his CV" into two requests, but keep
// "drive and pull" or a message body together.
function clauses(text: string): string[] {
  if (/draft|write|compose|message|enquir|inquir|hire|intern/.test(text)) {
    const [first, ...rest] = text.split(/,?\s+(?:and\s+)?then\s+/);
    return [first, ...rest];
  }
  return text.split(/,?\s+(?:and\s+then|then|and\s+also|and)\s+(?=(?:open|show|go|take|scroll|find|switch|turn|send|submit|draft|write|play|run|start|download|see)\b)/);
}

export function parse(raw: string, here: { page: 'home' | 'project' | 'cv'; slug?: string }): Intent[] {
  const original = raw.trim();
  const text = original.toLowerCase().replace(/[’']/g, "'");
  if (!text) return [];
  const out: Intent[] = [];
  for (const c of clauses(text)) {
    const intent = one(c, original, here);
    if (intent) out.push(intent);
  }
  return out;
}

function one(s: string, original: string, here: { page: string; slug?: string }): Intent | null {
  if (has(s, 'password', 'passcode', 'passkey', 'otp', 'one time code', 'verification code')) {
    return { type: 'credential' };
  }
  if (/^(please\s+)?(send|submit)\b|\b(send|submit)\s+(it|the (form|message|email)|that)\b|press send|click send|hit send/.test(s)) {
    return { type: 'send' };
  }
  if (has(s, 'help', 'what can you do', 'what can i say', 'how does this work')) return { type: 'help' };
  if (has(s, 'light mode', 'light theme', 'lights on')) return { type: 'theme', mode: 'light' };
  if (has(s, 'dark mode', 'dark theme', 'lights off')) return { type: 'theme', mode: 'dark' };

  const wantsDraft =
    /\b(draft|write|compose|fill|enquir|inquir|hire|hiring|recruit|internship|intern|offer|reach out|get in touch|message (him|jazil)|email (him|jazil)|contact (him|jazil))/.test(s);
  if (wantsDraft) return { type: 'contact', contact: contactFrom(s, original) };

  if (has(s, 'demo', 'play', 'run it', 'try it', 'show me how it works') && here.page === 'project') {
    return { type: 'demo' };
  }

  // Questions about him, not his projects, even when they mention cricket.
  if (['captain', 'prize', 'award', 'maths challenge'].some((w) => s.includes(w)))
    return { type: 'section', target: '#education', label: 'Education', page: 'cv' };

  const project = matchProject(s);
  if (project) return { type: 'open', slug: project };

  if (has(s, 'cv', 'resume', 'résumé', 'curriculum vitae')) return { type: 'cv' };
  if (has(s, 'study', 'studies', 'university', 'uni', 'cambridge', 'caius', 'degree', 'education', 'school', 'a levels', 'a-levels', 'grades'))
    return { type: 'section', target: '#education', label: 'Education', page: 'cv' };
  if (has(s, 'experience', 'worked', 'job', 'jobs', 'teach', 'taught', 'teaching', 'instructor', 'hudl', 'invirtigo', 'ccna'))
    return { type: 'section', target: '#experience', label: 'Experience', page: 'cv' };
  if (has(s, 'skills', 'languages', 'stack', 'tech stack', 'technologies', 'know', 'python', 'java', 'ocaml', 'react', 'docker'))
    return { type: 'section', target: '#skills', label: 'Skills', page: 'cv' };
  if (has(s, 'about', 'who is', "who's", 'who are you', 'background'))
    return { type: 'home' };
  if (has(s, 'cricket', 'hobbies', 'prizes', 'awards'))
    return { type: 'section', target: '#education', label: 'Education', page: 'cv' };
  if (has(s, 'log', 'timeline', 'history', 'when'))
    return { type: 'section', target: '#log', label: 'Log' };
  if (has(s, 'projects', 'work', 'portfolio', 'built', 'build', 'made'))
    return { type: 'section', target: '#work', label: 'Selected work' };
  if (has(s, 'contact', 'email', 'reach', 'linkedin', 'github'))
    return { type: 'section', target: '#contact', label: 'Contact' };
  if (has(s, 'home', 'top', 'start', 'back')) return { type: 'home' };

  const query = s
    .replace(/\b(show|me|find|where|is|the|a|an|his|he|does|did|what|about|go|to|take|please|can|you|i|want|see|jazil|for|of|on|in)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return query ? { type: 'find', query } : null;
}

function matchProject(s: string): string | null {
  let best: { slug: string; score: number } | null = null;
  for (const p of projects) {
    for (const alias of p.aliases) {
      if (has(s, alias)) {
        // Longer aliases are more specific: "google deepmind" beats "agent".
        const score = alias.length + (alias === p.name.toLowerCase() ? 20 : 0);
        if (!best || score > best.score) best = { slug: p.slug, score };
      }
    }
  }
  return best?.slug ?? null;
}

const notAName = new Set([
  'a', 'an', 'the', 'looking', 'interested', 'hiring', 'from', 'at', 'with', 'recruiting', 'trying',
  'wondering', 'curious', 'writing', 'here', 'just', 'not', 'so', 'very', 'really', 'reaching', 'hoping',
  'a recruiter', 'recruiter', 'working', 'on', 'in', 'keen', 'impressed', 'reaching',
]);

const titleCase = (s: string) => s.replace(/\b\p{L}/gu, (c) => c.toUpperCase());

function contactFrom(s: string, original: string): Contact {
  const c: Contact = { reason: 'Question' };
  if (/intern|placement|summer/.test(s)) c.reason = 'Internship';
  else if (/hire|hiring|role|position|job|graduate|recruit|offer/.test(s)) c.reason = 'Role';
  else if (/collab|build (something )?together|work together|partner/.test(s)) c.reason = 'Collaboration';

  const email = original.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (email) c.email = email[0];

  const name = s.match(/\b(?:i'm|i am|this is|my name is|name's)\s+([a-z][a-z-]+)(?:\s+([a-z][a-z-]+))?/);
  if (name && !notAName.has(name[1])) {
    const second = name[2] && !notAName.has(name[2]) && !/^(and|from|at|with|i|we)$/.test(name[2]) ? ` ${name[2]}` : '';
    c.name = titleCase(name[1] + second);
  }

  const org = original.match(/\b(?:from|at|with)\s+([A-Z0-9][\w&.-]*(?:\s+[A-Z0-9][\w&.-]*){0,3})/);
  const orgLower = s.match(/\b(?:from|at)\s+([a-z0-9][\w&.-]*(?:\s+(?!and|to|about|who|looking|for|i|we)[a-z0-9][\w&.-]*){0,2})/);
  const orgRaw = org?.[1] ?? orgLower?.[1];
  if (orgRaw && !/^(the|a|an|my|his|cambridge|this|here|home)$/i.test(orgRaw)) {
    c.org = orgRaw.length <= 4 ? orgRaw.toUpperCase() : titleCase(orgRaw);
  }

  const project = matchProject(s.replace(/intern(ship)?|hire|hiring|recruit(er|ing)?/g, ''));
  if (project) c.about = projects.find((p) => p.slug === project)?.name;
  return c;
}

export function composeMessage(c: Contact): string {
  const who = c.name && c.org ? `I'm ${c.name} from ${c.org}` : c.name ? `I'm ${c.name}` : c.org ? `I work at ${c.org}` : '';
  const opener = who ? `Hi Jazil, ${who}.` : 'Hi Jazil,';
  const about = c.about ? ` I came across ${c.about} on your site.` : '';
  const body = {
    Internship: ` I'd like to talk to you about an internship${c.org ? ` with us` : ''}.`,
    Role: ` I'd like to talk to you about a role${c.org ? ` on our team` : ''}.`,
    Collaboration: ` I'd like to build something together.`,
    Question: ` I had a question about your work.`,
  }[c.reason];
  const close = c.reason === 'Question' ? '' : ' Would you have time for a short call?';
  return `${opener}${about}${body}${close}`;
}
