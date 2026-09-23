// A line-for-line port of JevBar's Policy.swift (github.com/jxzxl07/JevBar).
// The agent on this site asks this function before every click and keystroke,
// with the accessible name it read from the page, never its own wording.

export type Verb = 'click' | 'typeText' | 'setValue' | 'pressKey' | 'scroll';
export type TaskKind = 'general' | 'jobApplication';
export type Action = { verb: Verb; controlName: string; value?: string };
export type Decision = { allow: true } | { allow: false; reason: string };

export function authorize(action: Action, task: TaskKind = 'general'): Decision {
  const credential = credentialRefusal(action);
  if (credential) return { allow: false, reason: credential };

  const press = action.verb === 'click' || action.verb === 'pressKey';

  if (press && task === 'jobApplication' && finalSubmit.matches(action.controlName)) {
    return {
      allow: false,
      reason: `'${action.controlName}' looks like it submits the application. I fill it in and stop; sending it is yours.`,
    };
  }

  if (press && communication.matches(action.controlName)) {
    return {
      allow: false,
      reason: `'${action.controlName}' would send something to another person, which I never do. I prepare; you send.`,
    };
  }

  return { allow: true };
}

function credentialRefusal(action: Action): string | null {
  if (action.verb !== 'typeText' && action.verb !== 'setValue') return null;
  if (!credential.matches(action.controlName)) return null;
  return 'I never enter a password, passkey or one-time code. That one is yours to type.';
}

// Whole-phrase matching over a closed list. Substring matching would be wrong
// both ways: "resend" contains "send", and an anchored match misses "Send".
class Pattern {
  constructor(private phrases: string[]) {}

  matches(name: string): boolean {
    const words = words_(name);
    if (words.length === 0) return false;
    return this.phrases.some((phrase) => {
      const needle = phrase.split(' ');
      if (needle.length > words.length) return false;
      for (let start = 0; start <= words.length - needle.length; start++) {
        if (needle.every((w, i) => words[start + i] === w)) return true;
      }
      return false;
    });
  }
}

const words_ = (name: string) =>
  name
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

const credential = new Pattern([
  'password', 'passcode', 'passkey', 'one-time code', 'one time code', 'otp',
  'security code', 'verification code', 'pin',
]);

// "Continue", "Next" and "Save draft" are deliberately absent: refusing them
// would make an agent useless rather than safe.
const finalSubmit = new Pattern([
  'submit application', 'submit my application', 'submit', 'apply now',
  'send application', 'finish and submit', 'complete application',
  'complete my application',
]);

const communication = new Pattern([
  'send', 'send message', 'send email', 'reply', 'reply all', 'post', 'publish',
  'tweet', 'share', 'call', 'start call', 'join call',
]);
