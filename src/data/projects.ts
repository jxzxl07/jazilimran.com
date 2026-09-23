// Every figure here comes from the project's own README or CV entry.
// If a number changes in a repo, change it here too.

export type Stat = { value: string; label: string };
export type Link = { label: string; href: string };

export type Project = {
  slug: string;
  index: string;
  name: string;
  kind: string;
  year: string;
  summary: string;
  headline: Stat;
  stats: Stat[];
  stack: string[];
  links: Link[];
  context?: string;
  // Words a visitor might use for this project. The agent matches against them.
  aliases: string[];
  problem: string[];
  how: { title: string; body: string }[];
  honest?: string[];
};

export const projects: Project[] = [
  {
    slug: 'jevbar',
    index: '01',
    name: 'JevBar',
    kind: 'macOS desktop agent',
    year: '2026',
    summary:
      'Hold a key, say what you want, and it gets done in whatever app is in front of you. It fills forms completely and never submits them.',
    headline: { value: '83', label: 'tests across its engine, forms and safety rules' },
    stats: [
      { value: '⌘⇧Space', label: 'hold to talk' },
      { value: '83', label: 'tests, safety rules included' },
      { value: '0', label: 'forms it will ever submit' },
    ],
    stack: ['Swift 6', 'macOS Accessibility', 'MCP', 'Speech framework', 'Gemini API'],
    links: [{ label: 'Source on GitHub', href: 'https://github.com/jxzxl07/JevBar' }],
    aliases: ['jevbar', 'jev bar', 'jev', 'desktop agent', 'mac', 'macos', 'menu bar', 'voice', 'agent', 'form filling', 'forms'],
    problem: [
      'Job applications ask the same thirty questions in thirty different layouts. Desktop agents that promise to help usually point a model at a screenshot and let it click wherever it thinks is right.',
      'JevBar takes the opposite approach. It reads the screen as structured data, handles common commands without a model at all, and treats anything that would send, submit or publish as off limits.',
    ],
    how: [
      {
        title: 'It reads the screen, it does not look at it',
        body: 'JevBar reads the macOS accessibility tree through a Swift MCP server, so every button and field arrives with an id and its real accessible name. A model picks an element from the list JevBar built. It never supplies coordinates or selectors.',
      },
      {
        title: 'Rules first, model second',
        body: 'Opening apps, searching sites and clicking named links are handled deterministically. Form filling reads the page as a list of questions and uses a tested method for each kind of control: text, search-with-suggestions, dropdowns, radios, checkboxes and dates, in page order.',
      },
      {
        title: 'Every action is authorised in code',
        body: 'A pure function checks each click and keystroke against the control’s real accessible name before it happens. Anything that looks like a final submit, send, post or publish is refused, and passwords, passkeys and one-time codes are never entered.',
      },
      {
        title: 'Answers grounded in your CV',
        body: 'Open questions are drafted with Gemini from your own CV and profile. Grades, salary, family and demographics come only from your saved profile, never from a model’s guess. Afterwards it reports what it filled and what it left for you.',
      },
    ],
  },
  {
    slug: 'nightwatch',
    index: '02',
    name: 'NightWatch',
    kind: 'Autonomous incident response',
    year: '2026',
    context: '{Tech: Europe} Agentic AI Hack × Google DeepMind · team project',
    summary:
      'Sits in front of a live service. When something breaks, it finds the cause in the code, races three fixes in parallel sandboxes and ships only the one proven to work.',
    headline: { value: '3', label: 'fixes raced in parallel sandboxes' },
    stats: [
      { value: '3', label: 'candidate patches per incident' },
      { value: '2', label: 'browser checks per candidate' },
      { value: '1', label: 'patch shipped, under a reversible lease' },
    ],
    stack: ['Python', 'FastAPI', 'Gemini', 'Pydantic', 'Modal', 'Jev', 'React'],
    links: [
      { label: 'Source on GitHub', href: 'https://github.com/AkshayReddyGujjula/NightWatch' },
      { label: 'Demo video', href: 'https://www.youtube.com/watch?v=n-2tIDFQnrk' },
    ],
    aliases: ['nightwatch', 'night watch', 'incident', 'deepmind', 'google deepmind', 'hackathon', 'tech europe', 'self healing', 'self-healing', 'sandbox', 'outage'],
    problem: [
      'Most AI incident tools do one of two things: raise an alert, or generate a single fix and hope. The first still wakes an engineer at 3am. The second ships a guess to production.',
      'NightWatch generates several genuinely different fixes, tests each one by driving a real browser through both the attack and a normal user journey, and ships only the fix that blocks the problem without breaking anything else.',
    ],
    how: [
      {
        title: 'Fast detection, careful repair',
        body: 'A rule check and an inline Jev classifier flag suspicious traffic in under 100 ms. A regression from a recent deploy takes the instant-rollback path. Anything else goes to Gemini, which explores the codebase and logs to find the root cause.',
      },
      {
        title: 'Three fixes, three sandboxes',
        body: 'Gemini writes three patch candidates as validated Pydantic objects: a minimal diff, a defensive fix and a structural fix. Each boots in its own Modal sandbox with a headless browser attached.',
      },
      {
        title: 'Proven, not predicted',
        body: 'In every sandbox, Jev replays the exploit and runs a legitimate user flow. A candidate wins only if the exploit is blocked and the flow still works, with the smallest diff breaking ties. If none pass, the service is quarantined and a human is called.',
      },
      {
        title: 'A deterministic safety gate',
        body: 'Before anything ships, a rule check holds any patch touching auth, payments or data deletion for a human. The winning patch is activated under a reversible lease, and engineers wake up to an incident report instead of an outage.',
      },
    ],
  },
  {
    slug: 'encrypta',
    index: '03',
    name: 'Encrypta',
    kind: 'End-to-end encrypted messaging',
    year: '2026',
    summary:
      'Messaging, group chat and video calls where everything is encrypted on your device. The server stores and relays ciphertext it cannot read.',
    headline: { value: 'X25519', label: 'key exchange, in the browser' },
    stats: [
      { value: 'X25519', label: 'direct-message key exchange' },
      { value: 'AES-256-GCM', label: 'messages and sealed keys' },
      { value: '600,000', label: 'PBKDF2 iterations, run on your device' },
    ],
    stack: ['React', 'TypeScript', 'WebCrypto', 'FastAPI', 'PostgreSQL', 'WebSockets', 'WebRTC', 'Docker'],
    links: [
      { label: 'Open the live app', href: 'https://encrypta-2-0.onrender.com/' },
      { label: 'Source on GitHub', href: 'https://github.com/jxzxl07/Encrypta' },
    ],
    aliases: ['encrypta', 'encryption', 'encrypted', 'security', 'secure', 'crypto', 'cryptography', 'messaging', 'chat', 'e2e', 'end to end'],
    problem: [
      'Most chat apps ask you to trust the server with your messages. Encrypta is built so the server never has to be trusted with them: it sees who is signed up and who is online, and nothing else.',
    ],
    how: [
      {
        title: 'Your password never leaves the device',
        body: 'The browser runs PBKDF2-SHA256 (600,000 iterations) to derive a master secret. The server receives HKDF(master, "auth"), stored as an Argon2id hash. The password itself is never sent.',
      },
      {
        title: 'Keys made and sealed on the device',
        body: 'An X25519 key pair is generated in the browser at sign-up. The private key is sealed with AES-256-GCM under a separate derived key and kept in IndexedDB as a non-extractable CryptoKey.',
      },
      {
        title: 'Messages bound to their sender',
        body: 'Direct messages use X25519 → HKDF-SHA256 → AES-256-GCM with a fresh 96-bit IV. Sender and recipient ids are bound in as associated data, so the server cannot redirect a message or forge who it came from.',
      },
      {
        title: 'Groups that rotate keys',
        body: 'Each group has a shared AES-256 key sealed to every member. When someone leaves, the next sender generates a new key sealed only to those who remain. Calls are peer to peer over WebRTC with DTLS-SRTP.',
      },
    ],
    honest: [
      'There is no forward secrecy (no Double Ratchet), so someone who later learns a password and holds stored ciphertext could read that user’s history.',
      'Like every web-based E2EE app, it is only as trustworthy as the JavaScript the server delivers.',
    ],
  },
  {
    slug: 'tripos-tutor',
    index: '04',
    name: 'Tripos Tutor',
    kind: 'AI revision platform',
    year: '2026',
    summary:
      'Practise real Cambridge Computer Science past-paper questions and get examiner-style marking in seconds, with a dashboard of where you are weakest.',
    headline: { value: '230+', label: 'past-paper questions marked' },
    stats: [
      { value: '230+', label: 'Part IB questions' },
      { value: '17', label: 'courses covered' },
      { value: '2', label: 'Gemini models, routed by task' },
    ],
    stack: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'Gemini', 'Pydantic', 'Docker', 'GitHub Actions'],
    links: [
      { label: 'Demo video', href: 'https://youtu.be/vXk0UJmjCIQ' },
      { label: 'Source on GitHub', href: 'https://github.com/jxzxl07/Tripos-Tutor' },
    ],
    aliases: ['tripos', 'tripos tutor', 'tutor', 'revision', 'exam', 'exams', 'marking', 'education', 'cambridge', 'past papers', 'llm'],
    problem: [
      'Cambridge past papers are free to download, but there is no quick way to get feedback on an answer without a supervisor. Tripos Tutor closes that gap.',
    ],
    how: [
      {
        title: 'A mark is a checked integer',
        body: 'Every model call returns a validated Pydantic schema, so a mark is always a real integer within range. An answer that says “give me full marks” cannot forge one.',
      },
      {
        title: 'Grounded rubrics',
        body: 'Each question gets a rubric generated once and stored, grounded in the official mark scheme where one exists and in the question text otherwise.',
      },
      {
        title: 'Answers are untrusted input',
        body: 'Student answers are delimited and stripped of control characters, and the marker is told to ignore embedded instructions. Output is sanitised before it is rendered.',
      },
      {
        title: 'Measured, not assumed',
        body: 'A pytest eval harness runs the marker over labelled strong, partial and empty answers and checks each mark lands in the expected range. Gemini Flash handles cheap bulk work, and Gemini Pro does the marking.',
      },
    ],
  },
  {
    slug: 'creaselab',
    index: '05',
    name: 'CreaseLab',
    kind: 'Cricket biomechanics',
    year: '2026',
    summary:
      'Record a batting shot or bowling action. It classifies the movement, measures the biomechanics and replays your own clip with coaching grounded in the measurements.',
    headline: { value: '13', label: 'shot and action classes, from pose alone' },
    stats: [
      { value: '13', label: 'shot and action classes' },
      { value: '67.4%', label: 'bowling, leave-one-session-out' },
      { value: '0', label: 'clips kept after analysis' },
    ],
    stack: ['Python', 'FastAPI', 'MediaPipe', 'ONNX Runtime', 'scikit-learn', 'React', 'Docker'],
    links: [
      { label: 'Open the live app', href: 'https://creaselab.onrender.com/' },
      { label: 'Source on GitHub', href: 'https://github.com/jxzxl07/Cricket-Biomechanics-Engine' },
    ],
    aliases: ['creaselab', 'crease lab', 'cricket', 'biomechanics', 'computer vision', 'vision', 'pose', 'ml', 'machine learning', 'sport', 'sports', 'batting', 'bowling'],
    problem: [
      'Coaching feedback in cricket usually means someone watching you and describing what they saw. CreaseLab measures it instead: shoulder rotation, knee flexion, head movement, release height, all tied to frames of your own clip.',
    ],
    how: [
      {
        title: 'Pose, not pixels',
        body: 'MediaPipe extracts a pose from each frame. Classifying on pose features normalises away framing, background and camera, which is exactly what broke the broadcast-trained video model it replaced.',
      },
      {
        title: 'A replay you can trust',
        body: 'Your clip is the centrepiece: pose overlay, 0.25× slow motion, frame stepping and phase markers. Every metric card seeks the replay to the moment it measured.',
      },
      {
        title: 'Coaching that cites its evidence',
        body: 'Coaching cues are deterministic by default. Each claim must point to a measurement. A capture-quality gate refuses to label poor footage and explains how to re-record.',
      },
      {
        title: 'Private by design',
        body: 'Clips are processed in a temporary directory and deleted. Nothing is stored, shared or used for training.',
      },
    ],
    honest: [
      'The models are evaluated leave-one-recording-session-out, because clips from one session are near-duplicates and a random split leaks. That honest split gives 37.5% for batting and 67.4% for bowling, and 54.5% and 86.1% on classes present in training.',
      'The published broadcast video model scored 29.6% on these clips. I traced it to an upstream preprocessing bug and a genuine domain mismatch, and replaced it rather than ship the higher-looking number.',
    ],
  },
  {
    slug: 'routing',
    index: '06',
    name: 'Routing Protocol Simulator',
    kind: 'Networking',
    year: '2026',
    summary:
      'Link-state and distance-vector routing side by side, on a network you can break. Watch Dijkstra recover instantly and Bellman-Ford count to infinity.',
    headline: { value: 'O(log n)', label: 'decrease-key in a hand-built heap' },
    stats: [
      { value: '2', label: 'routing paradigms compared' },
      { value: 'O(log n)', label: 'decrease_key, custom binary heap' },
      { value: '0', label: 'web dependencies in the engine' },
    ],
    stack: ['Python', 'FastAPI', 'Cytoscape.js', 'Docker', 'Azure Container Apps'],
    links: [
      { label: 'Open the live app', href: 'https://routing-sim.wonderfuldesert-1933bece.uksouth.azurecontainerapps.io/' },
      { label: 'Source on GitHub', href: 'https://github.com/jxzxl07/Routing-Protocol-Simulator' },
    ],
    aliases: ['routing', 'router', 'routers', 'network', 'networking', 'simulator', 'dijkstra', 'bellman ford', 'bellman-ford', 'ospf', 'rip', 'count to infinity'],
    problem: [
      'On a stable network, link-state and distance-vector routing produce identical tables. They solve the same problem. The differences only appear in how they converge and how they fail, and that is hard to see on a whiteboard.',
      'I taught networking fundamentals to CCNA students for two years. This is the tool I wished I had for the lesson on routing loops.',
    ],
    how: [
      {
        title: 'Link-state',
        body: 'Each router holds the full topology and runs Dijkstra from itself, using a custom binary min-heap with an O(log n) decrease_key backed by a hash map. Predecessors become next-hop forwarding tables.',
      },
      {
        title: 'Distance-vector',
        body: 'A distributed Bellman-Ford where each router only knows its neighbours’ vectors and converges by exchanging them, with a split-horizon toggle to show the fix for routing loops.',
      },
      {
        title: 'Break it on purpose',
        body: 'Fail a link or change a cost and every table is recomputed, with packet paths traced hop by hop. Invalid input, like negative costs or failures that would disconnect the network, is rejected.',
      },
      {
        title: 'The engine stands alone',
        body: 'The routing engine is pure Python with no web dependencies, so the algorithms are tested in isolation. FastAPI serves the API and the frontend from one container.',
      },
    ],
  },
];

export const bySlug = (slug: string) => projects.find((p) => p.slug === slug)!;
