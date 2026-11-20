// Interactive terminal profile: an AI-harness-style shell running in the browser.

const PROFILE = {
  name: "Niel Adrian Garig",
  handle: "adrianniel",
  role: "Full-Stack Developer",
  location: "Bohol, Philippines",
  lab: "MAKASA Laboratory",
  status: "Building iQueue: campus queueing platform",
  about: [
    "I build full-stack systems that real people use every day: a campus-wide",
    "queueing platform, an irrigation survey dashboard for farmers, and a",
    "point-of-sale workspace for a pharmacy.",
    "",
    "React and Next.js on the web, Expo / React Native on mobile, and Node.js",
    "with Express, NestJS and Prisma behind them.",
  ],
  stack: {
    Languages: ["TypeScript", "JavaScript", "SQL", "C++", "PHP"],
    Frontend: ["React", "Next.js", "Tailwind CSS", "Vite"],
    Mobile: ["Expo", "React Native"],
    Backend: ["Node.js", "Express", "NestJS", "Prisma"],
    Data: ["MySQL", "MariaDB"],
    Testing: ["Vitest", "Jest", "Supertest"],
  },
  projects: [
    {
      name: "Tumbli",
      desc: "A floating water buddy for Windows: a little bottle with a face that docks at the screen edge, fills up as you drink and reminds you to take a break.",
      stack: "Tauri 2 · Rust · React · TypeScript · Vite",
      link: "https://apps.microsoft.com/detail/9N6798TPR3KX",
    },
    {
      name: "iQueue",
      desc: "Queue-management platform for campus offices: a student mobile app, an admin portal and a live display board.",
      stack: "Expo · React Native · Next.js · Express · Prisma · MariaDB",
    },
    {
      name: "L.I.S.A.",
      desc: "Irrigation Survey & Analysis System for BISU Bilar: survey records on a map, reports and AI-generated analysis.",
      stack: "React · Express · OpenLayers · MySQL",
      link: "https://lisa.bisubilar.org/",
    },
    {
      name: "Dagohoy Pharmacy",
      desc: "Point-of-sale and pharmacy operations workspace with role-based screens for owners, admins and cashiers.",
      stack: "React · TypeScript · Vite · NestJS · MySQL",
      link: "https://dagohoypharmacy.boncales.com/",
    },
  ],
  contact: [
    ["GitHub", "github.com/adrianniel", "https://github.com/adrianniel"],
    ["Email", "adrianniel.garig@gmail.com", "mailto:adrianniel.garig@gmail.com"],
  ],
};

// 5-row pixel font for the banner.
const GLYPHS = {
  N: ["X...X", "XX..X", "X.X.X", "X..XX", "X...X"],
  I: ["XXX", ".X.", ".X.", ".X.", "XXX"],
  E: ["XXXX", "X...", "XXX.", "X...", "XXXX"],
  L: ["X...", "X...", "X...", "X...", "XXXX"],
  A: [".XX.", "X..X", "XXXX", "X..X", "X..X"],
  D: ["XXX.", "X..X", "X..X", "X..X", "XXX."],
  R: ["XXX.", "X..X", "XXX.", "X.X.", "X..X"],
  G: [".XXX", "X...", "X.XX", "X..X", ".XXX"],
  " ": ["..", "..", "..", "..", ".."],
};

function banner(text) {
  const rows = ["", "", "", "", ""];
  for (const ch of text) {
    const g = GLYPHS[ch] || GLYPHS[" "];
    g.forEach((row, r) => {
      rows[r] += row.replace(/X/g, "██").replace(/\./g, "  ") + "  ";
    });
  }
  return rows.join("\n");
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------
const $ = (s) => document.querySelector(s);
const screen = $("#screen");
const output = $("#output");
const input = $("#input");
const mirror = $("#mirror");
const form = $("#form");
const chips = $("#chips");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));

function el(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function scrollDown() {
  screen.scrollTop = screen.scrollHeight;
}

function append(node, parent = output) {
  node.classList.add("line-in");
  parent.appendChild(node);
  scrollDown();
  return node;
}

// Type plain text into a node, a few characters per frame.
async function typeInto(node, text, speed = 8) {
  if (reduceMotion) {
    node.textContent = text;
    return;
  }
  for (let i = 0; i < text.length; i += 2) {
    node.textContent = text.slice(0, i + 2);
    scrollDown();
    await sleep(speed);
  }
}

const SPIN = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const VERBS = ["Thinking", "Compiling", "Resolving", "Fetching profile", "Booting"];

async function think(ms) {
  const verb = VERBS[Math.floor(Math.random() * VERBS.length)];
  const node = append(el("p", "thinking", `<span class="spin">${SPIN[0]}</span> <span class="label">${verb}…</span>`));
  const spin = node.querySelector(".spin");
  let i = 0;
  const t = setInterval(() => (spin.textContent = SPIN[++i % SPIN.length]), 80);
  await sleep(ms);
  clearInterval(t);
  node.remove();
}

// ---------------------------------------------------------------------------
// Replies. Each returns a list of "parts": strings are typed out, nodes are
// faded in, giving a streamed, AI-style answer.
// ---------------------------------------------------------------------------
function kv(key, value, width = 10) {
  return el("p", "", `<span class="key">${esc(key.padEnd(width))}</span><span class="muted">: </span>${value}`);
}

function tags(list) {
  const row = el("div", "chip-row");
  list.forEach((t) => row.appendChild(el("span", "tag", esc(t))));
  return row;
}

const COMMANDS = {
  adrianniel: {
    help: "who I am, the full profile",
    run: () => [
      el("pre", "banner", banner("NIEL ADRIAN")),
      kv("Name", esc(PROFILE.name)),
      kv("Role", esc(PROFILE.role)),
      kv("Location", esc(PROFILE.location)),
      kv("Lab", esc(PROFILE.lab)),
      kv("Status", `<span class="key">●</span> ${esc(PROFILE.status)}`),
      "",
      ...PROFILE.about,
      "",
      el("p", "muted", "Try <span class=\"cmd\">projects</span>, <span class=\"cmd\">stack</span> or <span class=\"cmd\">contact</span> next."),
    ],
  },
  about: {
    help: "a short intro",
    run: () => PROFILE.about,
  },
  stack: {
    help: "languages, frameworks and tools",
    run: () =>
      Object.entries(PROFILE.stack).flatMap(([group, list]) => [
        el("p", "key", esc(group)),
        tags(list),
      ]),
  },
  projects: {
    help: "things I have built",
    run: () =>
      PROFILE.projects.map((p) => {
        const n = el("div", "project");
        const title = p.link ? `${esc(p.name)}  <a href="${p.link}" target="_blank" rel="noopener">${esc(p.linkLabel || "live ↗")}</a>` : esc(p.name);
        n.innerHTML = `<h3><span class="accent">▸</span> ${title}</h3><p>${esc(p.desc)}</p><p class="violet">${esc(p.stack)}</p>`;
        return n;
      }),
  },
  contact: {
    help: "how to reach me",
    run: () =>
      PROFILE.contact.map(([k, label, href]) =>
        kv(k, `<a href="${href}" target="_blank" rel="noopener">${esc(label)}</a>`, 8),
      ),
  },
  help: {
    help: "list commands",
    run: () => [
      "Available commands:",
      "",
      ...Object.entries(COMMANDS)
        .filter(([, c]) => c.help)
        .map(([name, c]) => el("p", "", `  <span class="cmd">${name.padEnd(12)}</span><span class="muted">${esc(c.help)}</span>`)),
    ],
  },
  clear: { help: "clear the screen", run: () => (output.innerHTML = "", []), instant: true },
  cls: { run: () => (output.innerHTML = "", []), instant: true },
  whoami: { run: () => COMMANDS.adrianniel.run() },
  github: {
    help: "open my GitHub",
    run: () => {
      window.open("https://github.com/adrianniel", "_blank", "noopener");
      return [el("p", "muted", "Opening github.com/adrianniel …")];
    },
  },
  sudo: { run: () => [el("p", "err", "Permission denied. Nice try though. 😄")] },
  exit: { run: () => [el("p", "muted", "There is no escape. Try “help” instead.")] },
};

// ---------------------------------------------------------------------------
// Shell loop
// ---------------------------------------------------------------------------
const history = [];
let histIndex = 0;
let busy = false;

function setBusy(on) {
  busy = on;
  document.body.classList.toggle("busy", on);
}

async function execute(raw) {
  const line = raw.trim();
  append(el("p", "echo", `<span class="gt">&gt;</span>${esc(line)}`));
  if (!line) return;

  history.push(line);
  histIndex = history.length;

  const name = line.split(/\s+/)[0].toLowerCase();
  const cmd = COMMANDS[name];

  if (!cmd) {
    append(el("p", "err", `'${esc(name)}' is not recognized as a command.`));
    append(el("p", "muted", 'Type <span class="cmd">help</span> to see what I can do, or <span class="cmd">adrianniel</span> to start.'));
    return;
  }

  if (cmd.instant) {
    cmd.run();
    return;
  }

  setBusy(true);
  await think(name === "adrianniel" || name === "whoami" ? 1300 : 600);
  const reply = append(el("div", "reply"));
  for (const part of cmd.run()) {
    if (typeof part === "string") {
      const p = el("p");
      reply.appendChild(p);
      await typeInto(p, part || " ");
    } else {
      append(part, reply);
      await sleep(part.classList.contains("banner") ? 260 : 70);
    }
  }
  setBusy(false);
}

function syncMirror() {
  mirror.textContent = input.value;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (busy) return;
  const value = input.value;
  input.value = "";
  syncMirror();
  await execute(value);
  input.focus();
});

input.addEventListener("input", syncMirror);

input.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && history.length) {
    e.preventDefault();
    histIndex = Math.max(0, histIndex - 1);
    input.value = history[histIndex];
    syncMirror();
  } else if (e.key === "ArrowDown" && history.length) {
    e.preventDefault();
    histIndex = Math.min(history.length, histIndex + 1);
    input.value = history[histIndex] || "";
    syncMirror();
  } else if (e.key === "Tab") {
    e.preventDefault();
    const v = input.value.toLowerCase();
    const match = Object.keys(COMMANDS).find((c) => v && c.startsWith(v));
    if (match) {
      input.value = match;
      syncMirror();
    }
  } else if (e.key === "l" && e.ctrlKey) {
    e.preventDefault();
    output.innerHTML = "";
  }
});

// Clicking anywhere in the terminal focuses the prompt (unless selecting text).
screen.addEventListener("click", (e) => {
  if (e.target.closest("a, button")) return;
  if (!window.getSelection().toString()) input.focus();
});

// Suggested-command chips: they "type" the command, then run it.
async function typeCommand(cmd) {
  if (busy) return;
  input.value = "";
  for (const ch of cmd) {
    input.value += ch;
    syncMirror();
    await sleep(45);
  }
  await sleep(150);
  form.requestSubmit();
}

["adrianniel", "projects", "stack", "contact", "help", "clear"].forEach((c, i) => {
  const b = el("button", i === 0 ? "primary" : "", esc(c));
  b.type = "button";
  b.addEventListener("click", () => typeCommand(c));
  chips.appendChild(b);
});

// Boot sequence.
(async function boot() {
  append(el("p", "muted", "PowerShell 7.5.0 · niel-shell v1.0"));
  await sleep(200);
  append(
    el(
      "div",
      "welcome",
      '<b>✻</b> Welcome to <b>Niel Adrian</b>\'s terminal.<br>' +
        '<span class="muted">Type</span> <span class="cmd">adrianniel</span> ' +
        '<span class="muted">to see who I am, or</span> <span class="cmd">help</span> ' +
        '<span class="muted">for all commands.</span>',
    ),
  );
  input.focus();
})();
