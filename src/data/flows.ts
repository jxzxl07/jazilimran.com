// Architecture of each project, drawn on its page. Every node comes from the
// project's README. `steps[i]` lists the nodes that "How it works" step i is
// about; the diagram lights them up as that step scrolls into view.

export type FlowNode = { id: string; label: string; sub?: string; col: number; row: number };
export type Flow = { nodes: FlowNode[]; edges: [string, string][]; steps: string[][] };

export const flows: Record<string, Flow> = {
  jevbar: {
    nodes: [
      { id: 'voice', label: 'You speak', sub: 'hold ⌘⇧Space', col: 0, row: 1 },
      { id: 'ax', label: 'Accessibility tree', sub: 'named controls, via MCP', col: 1, row: 0 },
      { id: 'plan', label: 'Plan', sub: 'rules first', col: 1, row: 1 },
      { id: 'model', label: 'Gemini', sub: 'picks from the list', col: 2, row: 0 },
      { id: 'profile', label: 'Profile + CV', sub: 'never guessed', col: 2, row: 2 },
      { id: 'policy', label: 'authorize()', sub: 'one pure function', col: 3, row: 1 },
      { id: 'act', label: 'Click / type', sub: 'in page order', col: 4, row: 1 },
      { id: 'report', label: 'Report', sub: 'filled · left for you', col: 4, row: 2 },
    ],
    edges: [
      ['voice', 'plan'], ['ax', 'plan'], ['ax', 'model'], ['plan', 'model'], ['plan', 'policy'],
      ['model', 'policy'], ['profile', 'model'], ['policy', 'act'], ['act', 'report'],
    ],
    steps: [['ax', 'model', 'plan'], ['voice', 'plan', 'policy', 'act'], ['plan', 'model', 'policy', 'act'], ['profile', 'model', 'act', 'report']],
  },

  nightwatch: {
    nodes: [
      { id: 'traffic', label: 'Live traffic', col: 0, row: 1 },
      { id: 'detect', label: 'Rule check + Jev', sub: 'flags in < 100 ms', col: 1, row: 1 },
      { id: 'rollback', label: 'Instant rollback', sub: 'if a deploy broke it', col: 1, row: 2 },
      { id: 'diagnose', label: 'Gemini diagnosis', sub: 'reads code and logs', col: 2, row: 0 },
      { id: 'patches', label: '3 patch candidates', sub: 'validated schemas', col: 2, row: 1 },
      { id: 'jev', label: 'Jev in a browser', sub: 'exploit + user flow', col: 3, row: 0 },
      { id: 'sandboxes', label: '3 Modal sandboxes', sub: 'one per patch', col: 3, row: 1 },
      { id: 'gate', label: 'Safety gate', sub: 'auth · payments · deletion', col: 4, row: 1 },
      { id: 'ship', label: 'Reversible lease', sub: 'plus an incident report', col: 4, row: 2 },
    ],
    edges: [
      ['traffic', 'detect'], ['detect', 'rollback'], ['detect', 'diagnose'], ['diagnose', 'patches'],
      ['patches', 'sandboxes'], ['jev', 'sandboxes'], ['sandboxes', 'gate'], ['gate', 'ship'],
    ],
    steps: [['traffic', 'detect', 'rollback', 'diagnose'], ['diagnose', 'patches', 'sandboxes'], ['jev', 'sandboxes', 'gate'], ['sandboxes', 'gate', 'ship']],
  },

  encrypta: {
    nodes: [
      { id: 'pw', label: 'Password', sub: 'never leaves the device', col: 0, row: 0 },
      { id: 'pbkdf', label: 'PBKDF2-SHA256', sub: '600,000 iterations', col: 1, row: 0 },
      { id: 'auth', label: 'HKDF → auth', sub: 'stored as Argon2id', col: 2, row: 0 },
      { id: 'keys', label: 'X25519 key pair', sub: 'made in the browser', col: 0, row: 1 },
      { id: 'msg', label: 'AES-256-GCM', sub: 'fresh IV · ids as AAD', col: 2, row: 1 },
      { id: 'server', label: 'Server', sub: 'relays ciphertext only', col: 3, row: 1 },
      { id: 'store', label: 'IndexedDB', sub: 'non-extractable key', col: 0, row: 2 },
      { id: 'wrap', label: 'HKDF → key-wrap', sub: 'seals the private key', col: 1, row: 2 },
      { id: 'group', label: 'Group key', sub: 'rotates on leave', col: 2, row: 2 },
      { id: 'calls', label: 'WebRTC calls', sub: 'DTLS-SRTP, peer to peer', col: 3, row: 2 },
    ],
    edges: [
      ['pw', 'pbkdf'], ['pbkdf', 'auth'], ['auth', 'server'], ['pbkdf', 'wrap'], ['keys', 'wrap'],
      ['keys', 'store'], ['keys', 'msg'], ['msg', 'server'], ['group', 'msg'], ['calls', 'server'],
    ],
    steps: [['pw', 'pbkdf', 'auth', 'server'], ['keys', 'wrap', 'store', 'pbkdf'], ['keys', 'msg', 'server'], ['group', 'msg', 'calls', 'server']],
  },

  'tripos-tutor': {
    nodes: [
      { id: 'q', label: 'Past-paper question', sub: 'rendered from the PDF', col: 0, row: 0 },
      { id: 'ans', label: 'Student answer', sub: 'untrusted input', col: 0, row: 1 },
      { id: 'rubric', label: 'Stored rubric', sub: 'from the mark scheme', col: 1, row: 0 },
      { id: 'clean', label: 'Delimit + strip', sub: 'control chars removed', col: 1, row: 1 },
      { id: 'flash', label: 'Gemini Flash', sub: 'rubrics, summaries', col: 2, row: 0 },
      { id: 'pro', label: 'Gemini Pro', sub: 'does the marking', col: 2, row: 1 },
      { id: 'evalh', label: 'pytest eval harness', sub: 'strong · partial · empty', col: 2, row: 2 },
      { id: 'schema', label: 'MarkResult schema', sub: 'a checked integer', col: 3, row: 1 },
      { id: 'render', label: 'Sanitised feedback', col: 4, row: 1 },
      { id: 'dash', label: 'Weakness dashboard', sub: 'per course', col: 4, row: 2 },
    ],
    edges: [
      ['q', 'rubric'], ['flash', 'rubric'], ['rubric', 'pro'], ['ans', 'clean'], ['clean', 'pro'],
      ['pro', 'schema'], ['schema', 'render'], ['schema', 'dash'], ['evalh', 'pro'],
    ],
    steps: [['pro', 'schema', 'render'], ['q', 'rubric', 'flash', 'pro'], ['ans', 'clean', 'pro', 'render'], ['evalh', 'pro', 'schema', 'dash']],
  },

  creaselab: {
    nodes: [
      { id: 'clip', label: 'Your clip', sub: 'recorded or uploaded', col: 0, row: 1 },
      { id: 'check', label: 'Upload checks', sub: 'type · size · ≤ 12 s', col: 1, row: 1 },
      { id: 'pose', label: 'MediaPipe pose', sub: 'joints per frame', col: 2, row: 1 },
      { id: 'gate', label: 'Quality gate', sub: 'refuses poor footage', col: 2, row: 2 },
      { id: 'cls', label: 'Pose classifier', sub: 'ONNX, capped confidence', col: 3, row: 0 },
      { id: 'metrics', label: 'Biomechanics', sub: 'angles, speed, timing', col: 3, row: 1 },
      { id: 'phases', label: 'Phase detection', col: 3, row: 2 },
      { id: 'replay', label: 'Synced replay', sub: '0.25× · frame stepping', col: 4, row: 0 },
      { id: 'coach', label: 'Coaching', sub: 'cites a measurement', col: 4, row: 1 },
      { id: 'delete', label: 'Clip deleted', sub: 'nothing stored', col: 4, row: 2 },
    ],
    edges: [
      ['clip', 'check'], ['check', 'pose'], ['pose', 'gate'], ['pose', 'cls'], ['pose', 'metrics'], ['pose', 'phases'],
      ['cls', 'replay'], ['metrics', 'replay'], ['phases', 'replay'], ['metrics', 'coach'], ['coach', 'delete'],
    ],
    steps: [['pose', 'cls', 'metrics'], ['phases', 'metrics', 'replay'], ['gate', 'metrics', 'coach'], ['clip', 'check', 'delete']],
  },

  routing: {
    nodes: [
      { id: 'yaml', label: 'YAML topology', sub: 'validated on load', col: 0, row: 1 },
      { id: 'heap', label: 'Binary min-heap', sub: 'O(log n) decrease_key', col: 1, row: 0 },
      { id: 'graph', label: 'Graph model', sub: 'adjacency list', col: 1, row: 1 },
      { id: 'sim', label: 'Simulator', sub: 'link events', col: 1, row: 2 },
      { id: 'dij', label: 'Dijkstra', sub: 'link-state', col: 2, row: 0 },
      { id: 'dv', label: 'Distance-vector', sub: 'split-horizon toggle', col: 2, row: 2 },
      { id: 'fwd', label: 'Forwarding tables', sub: 'next hop per router', col: 3, row: 1 },
      { id: 'trace', label: 'Packet trace', sub: 'hop by hop', col: 4, row: 1 },
      { id: 'api', label: 'FastAPI + Cytoscape', sub: 'one container', col: 4, row: 2 },
    ],
    edges: [
      ['yaml', 'graph'], ['heap', 'dij'], ['graph', 'dij'], ['graph', 'dv'], ['graph', 'sim'], ['sim', 'dv'],
      ['dij', 'fwd'], ['dv', 'fwd'], ['fwd', 'trace'], ['trace', 'api'],
    ],
    steps: [['heap', 'graph', 'dij', 'fwd'], ['graph', 'dv', 'fwd'], ['sim', 'dv', 'fwd', 'trace'], ['yaml', 'graph', 'api']],
  },
};
