# jazilimran.com — plan

Personal portfolio for Jazil Imran. Domain `www.jazilimran.com` (bought on IONOS), hosted on GitHub Pages.

## Goal

A site with a real wow factor that is still professional. It must not look generated (no gradient blobs, glass cards, emoji greetings, skill-icon grids), and it must not resemble akshaygujjula.com (a friend's site built as a node canvas).

The wow comes from the work itself: the site behaves like the software Jazil builds.

## Concept: the site works like JevBar

- The visitor holds **⌘⇧Space** (or taps the mic, or types). An overlay shows their words live, like JevBar's.
- An **agent cursor** acts on the page, with a step log: "show me the cricket project" scrolls to CreaseLab, opens it and highlights the result.
- "I want to hire Jazil for an internship": the agent **fills the contact form** in page order, then stops with a JevBar-style report: filled N fields, left your email for you, **never submits**, review and send it yourself.
- Runs entirely in the browser: the Web Speech API (Chrome, Edge, Safari) with typed input as a fallback, and a deterministic command grammar. No LLM backend and no paid API calls.
- **Readable without the gimmick:** a recruiter who never touches the agent understands who Jazil is within 5 seconds. Fast, mobile-friendly and accessible, with the agent switchable off and `prefers-reduced-motion` respected.

## Projects (these six only; JevDesk is retired, never list it)

| Project | Live demo on its page | Links |
|---|---|---|
| **JevBar** — macOS menu-bar voice agent; fills forms, never submits | The home page itself, plus `JevBar.mp4` and the safety commitments | github.com/jxzxl07/JevBar |
| **NightWatch** — autonomous incident response agent (Tech Europe × Google DeepMind Agentic AI Hack) | A section of the page breaks, three sandboxes race to fix it, a patch is applied under a reversible lease, then an incident report | github.com/AkshayReddyGujjula/NightWatch · youtube.com/watch?v=n-2tIDFQnrk |
| **Encrypta** — E2E encrypted messaging, group chat and video calls | Animated X25519 key exchange; the server sees only ciphertext | github.com/jxzxl07/Encrypta · encrypta-2-0.onrender.com |
| **Tripos Tutor** — AI revision platform for Cambridge students, 230+ past questions | An answer marked live against its rubric, feeding the weakness dashboard | github.com/jxzxl07/Tripos-Tutor · youtu.be/vXk0UJmjCIQ |
| **CreaseLab** — cricket biomechanics; 82.3% hold-out shot classification | A pose skeleton replays a shot as the classifier settles | github.com/jxzxl07/Cricket-Biomechanics-Engine · creaselab.onrender.com |
| **Routing Protocol Simulator** — link-state vs distance-vector | A small network you break to watch count-to-infinity, compared with link-state | github.com/jxzxl07/Routing-Protocol-Simulator · routing-sim.wonderfuldesert-1933bece.uksouth.azurecontainerapps.io |

Local source folders: `~/Desktop/Projects/{JevBar,NightWatch,Encrypta,Tripos Tutor,Cricket Biomechanics Engine,Routing Protocol Simulator}`.
CV: `~/Desktop/Career/Applications/Jazil_Imran_CV.pdf`. The public copy must drop the phone number.

## Background (from the CV)

- Computer Science BA, University of Cambridge (Gonville & Caius), 2025–2028.
- A-levels: A*A*A*A* (Maths, Further Maths, CS, Physics). Cricket Team Captain; Senior Maths Challenge Gold.
- Networking Instructor, Invirtigo (2022–2024): CCNA teaching for 20+ students.
- Hudl, technology work shadowing (2024).
- LinkedIn: linkedin.com/in/jazilimran · GitHub: github.com/jxzxl07

## Design

- Dark and precise, like good instrument software. One accent colour.
- Serif for prose, monospace for the agent log and data.
- Motion only where the agent is doing something. View Transitions between pages.
- Small networking touches (e.g. live hop timings in the footer).

## Stack and hosting

- Astro (static output), hand-written CSS, one content file per project. No UI kit or template.
- GitHub Actions → GitHub Pages.
- IONOS DNS: `A @` → 185.199.108.153 / .109.153 / .110.153 / .111.153; `CNAME www` → `<user>.github.io`. Enforce HTTPS in the Pages settings.

## Build order

1. **Prototype the home page:** voice/typing, the agent cursor, and the contact form it fills but won't send. Review with Jazil before continuing.
2. Design system, then the full home page with real content.
3. Project pages with their demos.
4. CV page, dark/light themes, performance and accessibility checks, OG image.
5. Deploy and connect the domain.

## Open questions

- Headline: the "software that acts on its own, and the guardrails that make it safe" angle?
- Hackathons beyond NightWatch, and any placings?
- Public email: Cambridge or Gmail?
- Show the Year 1 result, or only the A-levels?
- Photo, yes or no?
- LinkedIn content that isn't on the CV (not yet read: login wall).
