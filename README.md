# jazilimran.com

My portfolio. The site has an agent built in: tell it what you want (typed, or hold ⌘⇧Space to talk) and it acts on the page with its own cursor. Before every click or keystroke it runs a port of JevBar's policy function, so it fills in the contact form but never presses send.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
```

## Where things live

| | |
|---|---|
| `src/data/projects.ts` | Every project's copy and figures. Numbers come from each project's README. |
| `src/scripts/agent.ts` | The page agent: command bar, voice, cursor, log, form filling. |
| `src/scripts/intents.ts` | Turns a request into steps. Deterministic, with no model or network calls. |
| `src/scripts/policy.ts` | A line-for-line port of JevBar's `Policy.swift`. |
| `src/components/demos/` | One live demo per project page. |

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`). The custom domain is set by `public/CNAME`.

DNS at IONOS (Domains & SSL → jazilimran.com → DNS):

| Type | Host | Points to |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | jxzxl07.github.io |
