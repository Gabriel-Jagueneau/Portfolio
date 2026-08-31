// ─── macOS UI — Interactive OS & Window Manager ─────────────────────────────
// - Interactive mode activated when clicking the Mac screen (cards push out & stop rotating).
// - Interactive mode deactivated when clicking outside the Mac.
// - Real window management: draggable windows, close/minimize/maximize, dock indicators.
// - Fully interactive apps: Terminal with CLI, Safari, VS Code with tabs & run,
//   Music player with play/pause/seek/tracks, System Settings with toggles, Finder.

import { setMacInteractiveMode } from './cards-physics.js';

// ── Clock ──

function updateClock() {
  const timeElement = document.getElementById('mac-menu-item-time');
  if (!timeElement) return;

  const now = new Date();
  const days   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName    = days[now.getDay()];
  const dayNum     = now.getDate();
  const monthName  = months[now.getMonth()];
  const hours      = String(now.getHours()).padStart(2, '0');
  const minutes    = String(now.getMinutes()).padStart(2, '0');

  timeElement.textContent = `${dayName} ${dayNum} ${monthName} ${hours}:${minutes}`;
  setTimeout(updateClock, 1000);
}

// ── Flat Vector Icon Helpers ──

const SVG_ICONS = {
  search: `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="10.5" cy="10.5" r="7"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></svg>`,
  wifi: `<svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A16.88 16.88 0 0 0 12 4zm0 2.9c3.8 0 7.27 1.44 9.9 3.82L12 18.77 2.1 10.72A14.9 14.9 0 0 1 12 6.9z"/></svg>`,
  bluetooth: `<svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M14.24 12.01l4.7-4.7a1 1 0 000-1.42l-6-6A1 1 0 0011 0.6V9.58L6.41 5A1 1 0 005 6.41L10.59 12 5 17.59A1 1 0 106.41 19L11 14.41v8.99a1 1 0 001.94.71l6-6a1 1 0 000-1.42l-4.7-4.68zM13 3.41l3.29 3.3L13 10.01V3.41zm0 17.18v-6.6l3.29 3.3L13 20.59z"/></svg>`,
  moon: `<svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12.3 2a10 10 0 00-.19 20 10 10 0 008.7-5.1 1 1 0 00-1-1.44 8 8 0 11-8.95-12 1 1 0 001.44-1.46z"/></svg>`,
  displays: `<svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4a2 2 0 00-2 2v10a2 2 0 002 2h6v2H8a1 1 0 000 2h8a1 1 0 000-2h-2v-2h6a2 2 0 002-2V5a2 2 0 00-2-2zm0 12H4V5h16v10z"/></svg>`,
  sound: `<svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3.23v17.54a1 1 0 01-1.66.75L6.85 16H3a1 1 0 01-1-1V9a1 1 0 011-1h3.85l5.49-5.52a1 1 0 011.66.75zm4.5 8.77a5 5 0 00-2-4 1 1 0 10-1.2 1.6 3 3 0 011.2 2.4 3 3 0 01-1.2 2.4 1 1 0 101.2 1.6 5 5 0 002-4z"/></svg>`,
  speakerLow: `<svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M7 9v6h4l5 5V4L11 9H7z"/></svg>`,
  battery: `<svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M17 6H3a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2zm-2 9H4a1 1 0 01-1-1v-4a1 1 0 011-1h11a1 1 0 011 1v4a1 1 0 01-1 1zm7-6a1 1 0 00-1 1v4a1 1 0 002 0v-4a1 1 0 00-1-1z"/></svg>`,
  gear: `<svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.48.48 0 0014 2h-4a.48.48 0 00-.49.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.63 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.08.63-.08.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h4c.24 0 .44-.17.49-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6a3.6 3.6 0 110-7.2 3.6 3.6 0 010 7.2z"/></svg>`,
  airpods: `<svg width="10" height="10" viewBox="0 0 24 24" fill="#007aff"><path d="M12 2a9 9 0 00-9 9v7a3 3 0 003 3h1a2 2 0 002-2v-5a2 2 0 00-2-2H5v-1a7 7 0 1114 0v1h-2a2 2 0 00-2 2v5a2 2 0 002 2h1a3 3 0 003-3v-7a9 9 0 00-9-9z"/></svg>`,
  keyboard: `<svg width="10" height="10" viewBox="0 0 24 24" fill="#8e8e93"><path d="M20 5H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2zm-9 3h2v2h-2V8zm-4 0h2v2H7V8zm-2 4h2v2H5v-2zm8 4H7v-2h6v2zm2-4h-2v-2h2v2zm0-4h2v2h-2V8zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg>`,
  trackpad: `<svg width="10" height="10" viewBox="0 0 24 24" fill="#8e8e93"><path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 10H5V6h14v8z"/></svg>`,
  lock: `<svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6a5 5 0 00-10 0v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4zm3.1-9H8.9V6a3.1 3.1 0 016.2 0v2z"/></svg>`,
  check: `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#34c759" stroke-width="3.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  fileJs: `<svg width="9" height="9" viewBox="0 0 24 24" fill="#f7df1e" style="display:inline-block; vertical-align:middle; margin-right:3px;"><path d="M3 3h18v18H3V3zm10.5 13.5h2v-7h-2v7zm-5-3.5h2v-3.5h-2V13z"/></svg>`,
  filePy: `<svg width="9" height="9" viewBox="0 0 24 24" fill="#61afef" style="display:inline-block; vertical-align:middle; margin-right:3px;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
  fileJson: `<svg width="9" height="9" viewBox="0 0 24 24" fill="#98c379" style="display:inline-block; vertical-align:middle; margin-right:3px;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM8 12h8v2H8v-2z"/></svg>`,
  play: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>`,
  pause: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/></svg>`,
  prev: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="19,5 9,12 19,19"/><rect x="5" y="5" width="2.5" height="14" rx="0.5"/></svg>`,
  next: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,5 15,12 5,19"/><rect x="16.5" y="5" width="2.5" height="14" rx="0.5"/></svg>`,
  musicNote: `<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55A4 4 0 1014 17V7h6V3h-8z"/></svg>`,
  leaf: `<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17 6c-2.76 0-5 2.24-5 5 0 1.63.78 3.08 2 4v7h2v-7c1.22-.92 2-2.37 2-4 0-2.76-2.24-5-5-5zM7 10c-2.76 0-5 2.24-5 5 0 1.63.78 3.08 2 4v3h2v-3c1.22-.92 2-2.37 2-4 0-2.76-2.24-5-5-5z"/></svg>`,
  synth: `<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M15 4V2h-2v2h-2V2H9v2H7a2 2 0 00-2 2v2H3v2h2v2H3v2h2v2H3v2h2v2a2 2 0 002 2h2v2h2v-2h2v2h2v-2h2a2 2 0 002-2v-2h2v-2h-2v-2h2v-2h-2v-2h2V8h-2V6a2 2 0 00-2-2h-2zm0 14H9V6h6v12z"/></svg>`,
  nightMoon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12.3 2a10 10 0 00-.19 20 10 10 0 008.7-5.1 1 1 0 00-1-1.44 8 8 0 11-8.95-12 1 1 0 001.44-1.46z"/></svg>`,
  appleLogo: `<svg width="22" height="22" viewBox="0 0 170 170" fill="currentColor"><path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.97-12.04-14.67-6.04-9.35-10.8-19.8-14.28-31.35-3.48-11.55-5.22-22.37-5.22-32.46 0-14.24 3.79-25.96 11.37-35.15 7.58-9.19 16.92-13.88 28.02-14.07 4.97 0 10.45 1.37 16.44 4.11 5.99 2.74 9.54 4.16 10.66 4.27 1.45-.22 5.31-1.74 11.58-4.56 6.27-2.82 11.75-4.11 16.44-3.88 12.31.62 22.18 5.46 29.6 14.52-10.74 6.51-16.02 15.53-15.84 27.05.18 8.94 3.65 16.32 10.41 22.14 6.76 5.82 14.73 9.07 23.91 9.75-2.02 6.09-4.57 12.18-7.65 18.27zm-29.35-105.74c0-7.39 2.65-14.18 7.95-20.37 5.3-6.19 11.77-9.84 19.41-10.94.44 2.82.44 5.3.01 7.44-.66 6.94-3.44 13.43-8.34 19.46-4.9 6.03-11.23 9.77-18.99 11.21-.04-2.2-.04-4.46-.04-6.8z"/></svg>`
};

// ── Music App State ──

const musicTracks = [
  { title: "Midnight Chill Beats", artist: "Lo-Fi Beats • Apple Music", duration: 194, color: "linear-gradient(135deg, #fa2d48, #ff7643)", icon: SVG_ICONS.musicNote },
  { title: "Agronomy Dreams", artist: "Nature & Code • Chillhop", duration: 210, color: "linear-gradient(135deg, #34c759, #30b0c7)", icon: SVG_ICONS.leaf },
  { title: "Silicon Sunset", artist: "Synthwave Lab • Electronic", duration: 185, color: "linear-gradient(135deg, #af52de, #5856d6)", icon: SVG_ICONS.synth },
  { title: "Paris by Night", artist: "Gabriel J. • Ambient", duration: 240, color: "linear-gradient(135deg, #007aff, #5ac8fa)", icon: SVG_ICONS.nightMoon }
];
let currentTrackIdx = 0;
let isMusicPlaying = false;
let musicCurrentSec = 45;
let musicInterval = null;

// ── VS Code App State ──

const codeFiles = {
  "developpeur.js": {
    lang: "javascript",
    code: `const developpeur = {
  nom: "Gabriel Jagueneau",
  formation: "Ingénieur Agronome & Dev",
  competences: ["JavaScript", "Python", "React", "Node", "Data"],
  statut: "Disponible pour nouveaux projets"
};

function creerProjet() {
  return "Innovation, Agronomie & Tech";
}
console.log(creerProjet());`
  },
  "skills.py": {
    lang: "python",
    code: `# Skills & Stack
skills = {
    "frontend": ["HTML5", "CSS3", "JavaScript", "React", "Next.js"],
    "backend": ["Node.js", "Express", "Python", "FastAPI", "SQL"],
    "agronomy": ["Data Analysis", "GIS / SIG", "Plant Modeling"],
    "tools": ["Git", "Docker", "Figma", "VS Code", "Vite"]
}
print(f"Loaded {len(skills)} skill categories!")`
  },
  "contact.json": {
    lang: "json",
    code: `{
  "email": "contact@gjagueneau.fr",
  "github": "https://github.com/Gabriel-Jagueneau",
  "linkedin": "https://linkedin.com/in/gabriel-jagueneau",
  "location": "Paris / Bordeaux, France",
  "openToWork": true
}`
  }
};
let activeCodeFile = "developpeur.js";

// ── Settings App State ──

const settingsState = {
  wifi: true,
  bluetooth: true,
  darkmode: true,
  retina: true
};

// ── Terminal App State ──

const terminalHistory = [];

// ── App Definitions ──

const appDefinitions = {
  "Terminal": {
    title: "gabriel — zsh — 80×24",
    widthPct: 54, heightPct: 56,
    render: (win) => `
      <div class="app-terminal" id="term-container-${win.id}">
        <p class="term-login">Last login: ${new Date().toLocaleDateString()} on ttys001</p>
        <p class="term-welcome">Type <span class="term-highlight">'help'</span> to see available commands.</p>
        <div class="term-output" id="term-out-${win.id}">
          <p><span class="term-prompt">gabriel@macbook</span> <span class="term-path">~/Portfolio</span> % <span class="term-cmd">git status</span></p>
          <p class="term-success">● On branch main — working tree clean</p>
        </div>
        <form class="term-input-line" id="term-form-${win.id}">
          <span class="term-prompt">gabriel@macbook</span> <span class="term-path">~/Portfolio</span> %&nbsp;
          <input type="text" class="term-cli-input" id="term-input-${win.id}" autocomplete="off" spellcheck="false" autofocus />
        </form>
      </div>`,
    setup: (win) => {
      const form = win.el.querySelector(`#term-form-${win.id}`);
      const input = win.el.querySelector(`#term-input-${win.id}`);
      const output = win.el.querySelector(`#term-out-${win.id}`);
      const container = win.el.querySelector(`#term-container-${win.id}`);
      if (!form || !input || !output) return;

      container.addEventListener('click', () => input.focus());

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const cmd = input.value.trim();
        input.value = '';
        if (!cmd) return;

        const cmdLine = document.createElement('p');
        cmdLine.innerHTML = `<span class="term-prompt">gabriel@macbook</span> <span class="term-path">~/Portfolio</span> % <span class="term-cmd">${escapeHtml(cmd)}</span>`;
        output.appendChild(cmdLine);

        const resLine = document.createElement('div');
        resLine.className = 'term-cmd-result';

        const lower = cmd.toLowerCase();
        if (lower === 'help') {
          resLine.innerHTML = `
            <p class="term-muted">Commands: <span class="term-highlight">whoami</span>, <span class="term-highlight">skills</span>, <span class="term-highlight">projects</span>, <span class="term-highlight">contact</span>, <span class="term-highlight">ls</span>, <span class="term-highlight">cat &lt;file&gt;</span>, <span class="term-highlight">clear</span>, <span class="term-highlight">date</span>, <span class="term-highlight">sudo</span></p>`;
        } else if (lower === 'whoami' || lower === 'bio') {
          resLine.innerHTML = `<p class="term-success">Gabriel Jagueneau — Ingénieur Agronome & Développeur Full-Stack (Plintzy / Portfolio).</p>`;
        } else if (lower === 'skills' || lower === 'tech') {
          resLine.innerHTML = `<p class="term-info">JS, Python, React, Next.js, Node.js, CSS/SCSS, SQL, Git, Docker, Agronomie & Data.</p>`;
        } else if (lower === 'projects') {
          resLine.innerHTML = `<p class="term-info">● Plintzy (Startup & App)<br/>● TIPE Agronomie & Modélisation<br/>● Portfolio 2026<br/>● TDR Website</p>`;
        } else if (lower === 'contact') {
          resLine.innerHTML = `<p class="term-highlight">contact@gjagueneau.fr | linkedin.com/in/gabriel-jagueneau</p>`;
        } else if (lower === 'clear') {
          output.innerHTML = '';
          container.scrollTop = 0;
          return;
        } else if (lower === 'ls') {
          resLine.innerHTML = `<p><span>developpeur.js</span> &nbsp; <span style="color:#58a6ff">projects/</span> &nbsp; <span>Resume.pdf</span> &nbsp; <span>index.html</span></p>`;
        } else if (lower.startsWith('cat ')) {
          const target = lower.replace('cat ', '').trim();
          if (target.includes('dev') || target.includes('.js')) {
            resLine.innerHTML = `<pre class="term-code">const developpeur = { nom: "Gabriel", formation: "Agronome & Dev" };</pre>`;
          } else if (target.includes('resume') || target.includes('cv')) {
            resLine.innerHTML = `<p class="term-success">Gabriel Jagueneau - Resume: Engineering + Web Dev.</p>`;
          } else {
            resLine.innerHTML = `<p class="term-muted">cat: ${escapeHtml(target)}: No such file or directory</p>`;
          }
        } else if (lower === 'date') {
          resLine.innerHTML = `<p>${new Date().toString()}</p>`;
        } else if (lower === 'sudo' || lower.startsWith('sudo ')) {
          resLine.innerHTML = `<p class="term-warn">Permission denied: you are already root on this machine.</p>`;
        } else {
          resLine.innerHTML = `<p class="term-err">zsh: command not found: ${escapeHtml(cmd)}. Type <span class="term-highlight">'help'</span> for a list.</p>`;
        }

        output.appendChild(resLine);
        container.scrollTop = container.scrollHeight;
      });
    }
  },
  "Finder": {
    title: "Projects — Finder",
    widthPct: 52, heightPct: 56,
    render: (win) => `
      <div class="app-finder">
        <aside class="finder-sidebar">
          <div class="finder-section-title">Favorites</div>
          <div class="finder-item active" data-folder="projects"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg> Projects</div>
          <div class="finder-item" data-folder="recents"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg> Recents</div>
          <div class="finder-item" data-folder="docs"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg> Documents</div>
          <div class="finder-section-title">iCloud</div>
          <div class="finder-item" data-folder="icloud"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg> iCloud Drive</div>
        </aside>
        <main class="finder-main">
          <div class="finder-content" id="finder-items-${win.id}">
            <div class="finder-icon" data-open="Code" title="Open Code Editor">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#007aff"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>
              <span>Plintzy</span>
            </div>
            <div class="finder-icon" data-open="Safari" title="Open Safari">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#007aff"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>
              <span>Agronomy</span>
            </div>
            <div class="finder-icon" data-open="Code" title="View Code">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#ff9500"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
              <span>developpeur.js</span>
            </div>
            <div class="finder-icon" data-open="Safari" title="Open Website">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#34c759"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
              <span>index.html</span>
            </div>
          </div>
          <div class="finder-footer">4 items, 420 GB available</div>
        </main>
      </div>`,
    setup: (win) => {
      const items = win.el.querySelectorAll('.finder-icon');
      items.forEach(it => {
        it.addEventListener('dblclick', () => {
          const target = it.getAttribute('data-open');
          if (target && appDefinitions[target]) spawnOrFocusWindow(target);
        });
        it.addEventListener('click', () => {
          items.forEach(i => i.classList.remove('selected'));
          it.classList.add('selected');
        });
      });

      const sidebarItems = win.el.querySelectorAll('.finder-item');
      sidebarItems.forEach(sb => {
        sb.addEventListener('click', () => {
          sidebarItems.forEach(s => s.classList.remove('active'));
          sb.classList.add('active');
        });
      });
    }
  },
  "Safari": {
    title: "Gabriel Jagueneau — Portfolio",
    widthPct: 54, heightPct: 54,
    render: (win) => `
      <div class="app-safari">
        <header class="safari-header">
          <span class="safari-nav-btn" id="safari-back-${win.id}" title="Back">‹</span>
          <span class="safari-nav-btn" id="safari-forward-${win.id}" title="Forward">›</span>
          <div class="safari-address">
            <span class="lock-icon">${SVG_ICONS.lock}</span>
            <input type="text" class="safari-addr-input" id="safari-addr-${win.id}" value="https://gjagueneau.fr" spellcheck="false" />
            <span class="safari-reload-btn" id="safari-reload-${win.id}" title="Reload">↻</span>
          </div>
        </header>
        <div class="safari-bookmarks">
          <button class="safari-chip active" data-url="https://gjagueneau.fr">${SVG_ICONS.sparkle} Portfolio</button>
          <button class="safari-chip" data-url="https://plintzy.com">${SVG_ICONS.leaf} Plintzy</button>
          <button class="safari-chip" data-url="https://github.com/Gabriel-Jagueneau">${SVG_ICONS.github} GitHub</button>
          <button class="safari-chip" data-url="https://linkedin.com/in/gabriel-jagueneau">${SVG_ICONS.linkedin} LinkedIn</button>
        </div>
        <main class="safari-body" id="safari-viewport-${win.id}">
          <div class="safari-hero-title">Gabriel Jagueneau</div>
          <div class="safari-hero-desc">Agronomy Engineering Student & Full-Stack Developer</div>
          <div class="safari-badge">Portfolio 2026 Online & Interactive</div>
          <div class="safari-action-links">
            <a href="#projets" class="safari-link-btn">Voir mes projets</a>
            <a href="#contact" class="safari-link-btn secondary">Me contacter</a>
          </div>
        </main>
      </div>`,
    setup: (win) => {
      const addrInput = win.el.querySelector(`#safari-addr-${win.id}`);
      const viewport = win.el.querySelector(`#safari-viewport-${win.id}`);
      const reloadBtn = win.el.querySelector(`#safari-reload-${win.id}`);
      const chips = win.el.querySelectorAll('.safari-chip');

      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          chips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          const url = chip.getAttribute('data-url');
          if (addrInput) addrInput.value = url;
          if (viewport) {
            viewport.style.opacity = '0.5';
            setTimeout(() => {
              viewport.style.opacity = '1';
              if (url.includes('plintzy')) {
                viewport.innerHTML = `
                  <div class="safari-hero-title" style="background: linear-gradient(90deg, #34c759, #00aeff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Plintzy</div>
                  <div class="safari-hero-desc">Application & Startup connectant l'innovation végétale et l'expérience utilisateur.</div>
                  <div class="safari-badge">Statut : En développement actif</div>
                `;
              } else if (url.includes('github')) {
                viewport.innerHTML = `
                  <div class="safari-hero-title">GitHub @Gabriel-Jagueneau</div>
                  <div class="safari-hero-desc">Explorez les repositories, projets open-source et contributions.</div>
                  <div class="safari-badge">14+ Public Repositories</div>
                `;
              } else {
                viewport.innerHTML = `
                  <div class="safari-hero-title">Gabriel Jagueneau</div>
                  <div class="safari-hero-desc">Agronomy Engineering Student & Full-Stack Developer</div>
                  <div class="safari-badge">Portfolio 2026 Online & Interactive</div>
                `;
              }
            }, 200);
          }
        });
      });

      reloadBtn?.addEventListener('click', () => {
        reloadBtn.style.transform = 'rotate(360deg)';
        reloadBtn.style.transition = 'transform 0.4s ease';
        setTimeout(() => {
          reloadBtn.style.transform = 'none';
          reloadBtn.style.transition = 'none';
        }, 400);
      });
    }
  },
  "Code": {
    title: "developpeur.js — Visual Studio Code",
    widthPct: 52, heightPct: 56,
    render: (win) => `
      <div class="app-code">
        <aside class="code-sidebar">
          <div class="code-section-title">EXPLORER</div>
          <div class="code-file ${activeCodeFile === 'developpeur.js' ? 'active' : ''}" data-file="developpeur.js">${SVG_ICONS.fileJs} devel...ur.js</div>
          <div class="code-file ${activeCodeFile === 'skills.py' ? 'active' : ''}" data-file="skills.py">${SVG_ICONS.filePy} skills.py</div>
          <div class="code-file ${activeCodeFile === 'contact.json' ? 'active' : ''}" data-file="contact.json">${SVG_ICONS.fileJson} contact.json</div>
        </aside>
        <main class="code-editor-wrap">
          <div class="code-top-actions">
            <span class="code-active-tab">${activeCodeFile === 'developpeur.js' ? SVG_ICONS.fileJs : activeCodeFile === 'skills.py' ? SVG_ICONS.filePy : SVG_ICONS.fileJson} ${activeCodeFile}</span>
            <button class="code-run-btn" id="code-run-${win.id}">${SVG_ICONS.play} Run</button>
          </div>
          <textarea class="code-textarea" id="code-area-${win.id}" spellcheck="false">${escapeHtml(codeFiles[activeCodeFile].code)}</textarea>
          <div class="code-console" id="code-console-${win.id}">
            <span class="console-prompt">Console:</span> <span id="code-output-${win.id}">Ready. Press '▶ Run' to execute.</span>
          </div>
        </main>
      </div>`,
    setup: (win) => {
      const area = win.el.querySelector(`#code-area-${win.id}`);
      const runBtn = win.el.querySelector(`#code-run-${win.id}`);
      const out = win.el.querySelector(`#code-output-${win.id}`);
      const tabLabel = win.el.querySelector('.code-active-tab');
      const fileTabs = win.el.querySelectorAll('.code-file');

      fileTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const file = tab.getAttribute('data-file');
          if (file && codeFiles[file]) {
            activeCodeFile = file;
            fileTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const icon = file === 'developpeur.js' ? SVG_ICONS.fileJs : file === 'skills.py' ? SVG_ICONS.filePy : SVG_ICONS.fileJson;
            if (tabLabel) tabLabel.innerHTML = `${icon} ${file}`;
            if (area) area.value = codeFiles[file].code;
            if (out) out.textContent = `Switched to ${file}. Ready.`;
          }
        });
      });

      runBtn?.addEventListener('click', () => {
        if (!out) return;
        out.textContent = "Executing...";
        setTimeout(() => {
          if (activeCodeFile === "developpeur.js") {
            out.innerHTML = `<span style="color:#34c759;">[Output] "Innovation, Agronomie & Tech"</span>`;
          } else if (activeCodeFile === "skills.py") {
            out.innerHTML = `<span style="color:#34c759;">[Output] Loaded 4 skill categories!</span>`;
          } else {
            out.innerHTML = `<span style="color:#58a6ff;">[Output] Valid JSON ✓ Contact loaded.</span>`;
          }
        }, 250);
      });
    }
  },
  "Music": {
    title: "Music",
    widthPct: 40, heightPct: 52,
    render: (win) => {
      const track = musicTracks[currentTrackIdx];
      const mins = Math.floor(musicCurrentSec / 60);
      const secs = String(musicCurrentSec % 60).padStart(2, '0');
      const remSecs = track.duration - musicCurrentSec;
      const remMins = Math.floor(remSecs / 60);
      const remSecsStr = String(remSecs % 60).padStart(2, '0');
      const pct = Math.min(100, (musicCurrentSec / track.duration) * 100);

      return `
        <div class="app-music">
          <div class="music-cover" id="music-cover-${win.id}" style="background: ${track.color};">${track.icon}</div>
          <div class="music-meta">
            <div class="music-track" id="music-track-${win.id}">${track.title}</div>
            <div class="music-artist" id="music-artist-${win.id}">${track.artist}</div>
          </div>
          <div class="music-progress-wrap" id="music-prog-wrap-${win.id}">
            <div class="music-progress">
              <div class="music-bar" id="music-bar-${win.id}" style="width: ${pct}%;"></div>
            </div>
            <div class="music-time">
              <span id="music-time-curr-${win.id}">${mins}:${secs}</span>
              <span id="music-time-rem-${win.id}">-${remMins}:${remSecsStr}</span>
            </div>
          </div>
          <div class="music-controls">
            <span class="music-btn" id="music-prev-${win.id}" title="Previous">${SVG_ICONS.prev}</span>
            <span class="music-btn play-btn" id="music-play-${win.id}" title="Play/Pause">${isMusicPlaying ? SVG_ICONS.pause : SVG_ICONS.play}</span>
            <span class="music-btn" id="music-next-${win.id}" title="Next">${SVG_ICONS.next}</span>
          </div>
        </div>`;
    },
    setup: (win) => {
      const playBtn = win.el.querySelector(`#music-play-${win.id}`);
      const prevBtn = win.el.querySelector(`#music-prev-${win.id}`);
      const nextBtn = win.el.querySelector(`#music-next-${win.id}`);
      const progWrap = win.el.querySelector(`#music-prog-wrap-${win.id}`);
      const bar = win.el.querySelector(`#music-bar-${win.id}`);
      const timeCurr = win.el.querySelector(`#music-time-curr-${win.id}`);
      const timeRem = win.el.querySelector(`#music-time-rem-${win.id}`);
      const trackName = win.el.querySelector(`#music-track-${win.id}`);
      const artistName = win.el.querySelector(`#music-artist-${win.id}`);
      const cover = win.el.querySelector(`#music-cover-${win.id}`);

      function updateMusicUI() {
        const track = musicTracks[currentTrackIdx];
        if (trackName) trackName.textContent = track.title;
        if (artistName) artistName.textContent = track.artist;
        if (cover) {
          cover.style.background = track.color;
          cover.innerHTML = track.icon;
        }
        if (playBtn) playBtn.innerHTML = isMusicPlaying ? SVG_ICONS.pause : SVG_ICONS.play;

        const mins = Math.floor(musicCurrentSec / 60);
        const secs = String(musicCurrentSec % 60).padStart(2, '0');
        const remSecs = Math.max(0, track.duration - musicCurrentSec);
        const remMins = Math.floor(remSecs / 60);
        const remSecsStr = String(remSecs % 60).padStart(2, '0');

        if (timeCurr) timeCurr.textContent = `${mins}:${secs}`;
        if (timeRem) timeRem.textContent = `-${remMins}:${remSecsStr}`;
        if (bar) bar.style.width = `${(musicCurrentSec / track.duration) * 100}%`;
      }

      playBtn?.addEventListener('click', () => {
        isMusicPlaying = !isMusicPlaying;
        if (isMusicPlaying) {
          clearInterval(musicInterval);
          musicInterval = setInterval(() => {
            const track = musicTracks[currentTrackIdx];
            musicCurrentSec = (musicCurrentSec + 1) % track.duration;
            updateMusicUI();
          }, 1000);
        } else {
          clearInterval(musicInterval);
        }
        updateMusicUI();
      });

      nextBtn?.addEventListener('click', () => {
        currentTrackIdx = (currentTrackIdx + 1) % musicTracks.length;
        musicCurrentSec = 0;
        updateMusicUI();
      });

      prevBtn?.addEventListener('click', () => {
        currentTrackIdx = (currentTrackIdx - 1 + musicTracks.length) % musicTracks.length;
        musicCurrentSec = 0;
        updateMusicUI();
      });

      progWrap?.addEventListener('click', (e) => {
        const rect = progWrap.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, clickX / rect.width));
        const track = musicTracks[currentTrackIdx];
        musicCurrentSec = Math.floor(ratio * track.duration);
        updateMusicUI();
      });
    }
  },
  "Settings": {
    title: "System Settings",
    widthPct: 56, heightPct: 62,
    render: (win) => `
      <div class="app-settings-macos">
        <!-- Sidebar -->
        <aside class="settings-sidebar">
          <div class="settings-search">
            <span class="search-icon">${SVG_ICONS.search}</span>
            <input type="text" class="settings-search-input" placeholder="Search" spellcheck="false" />
          </div>
          <div class="settings-user-card" data-cat="profile">
            <div class="user-avatar">GJ</div>
            <div class="user-info">
              <span class="user-name">Gabriel JAGUENEAU</span>
              <span class="user-sub">Apple Account</span>
            </div>
            <span class="chevron">›</span>
          </div>
          <div class="settings-nav-list">
            <div class="settings-nav-item active" data-cat="wifi">
              <span class="nav-icon blue">${SVG_ICONS.wifi}</span>
              <span class="nav-title">Wi-Fi</span>
              <span class="nav-status-badge">${settingsState.wifi ? 'Gabriel-5G' : 'Off'}</span>
            </div>
            <div class="settings-nav-item" data-cat="bluetooth">
              <span class="nav-icon indigo">${SVG_ICONS.bluetooth}</span>
              <span class="nav-title">Bluetooth</span>
              <span class="nav-status-badge">${settingsState.bluetooth ? 'On' : 'Off'}</span>
            </div>
            <div class="settings-nav-item" data-cat="appearance">
              <span class="nav-icon purple">${SVG_ICONS.moon}</span>
              <span class="nav-title">Appearance</span>
            </div>
            <div class="settings-nav-item" data-cat="displays">
              <span class="nav-icon blue">${SVG_ICONS.displays}</span>
              <span class="nav-title">Displays</span>
            </div>
            <div class="settings-nav-item" data-cat="sound">
              <span class="nav-icon red">${SVG_ICONS.sound}</span>
              <span class="nav-title">Sound</span>
            </div>
            <div class="settings-nav-item" data-cat="battery">
              <span class="nav-icon green">${SVG_ICONS.battery}</span>
              <span class="nav-title">Battery</span>
              <span class="nav-status-badge">100%</span>
            </div>
            <div class="settings-nav-item" data-cat="general">
              <span class="nav-icon gray">${SVG_ICONS.gear}</span>
              <span class="nav-title">General</span>
            </div>
          </div>
        </aside>

        <!-- Main Settings Pane -->
        <main class="settings-pane" id="settings-pane-${win.id}">
          <!-- Content dynamically injected -->
        </main>
      </div>`,
    setup: (win) => {
      const pane = win.el.querySelector(`#settings-pane-${win.id}`);
      const navItems = win.el.querySelectorAll('.settings-nav-item');
      const userCard = win.el.querySelector('.settings-user-card');

      function renderCategory(cat) {
        if (!pane) return;
        if (cat === 'wifi') {
          pane.innerHTML = `
            <div class="settings-section">
              <div class="section-header-row">
                <h2>Wi-Fi</h2>
                <label class="macos-switch">
                  <input type="checkbox" id="wifi-toggle-${win.id}" ${settingsState.wifi ? 'checked' : ''} />
                  <span class="slider"></span>
                </label>
              </div>
              <div class="settings-card-group">
                <div class="card-row header-row">
                  <span class="card-row-title">Known Networks</span>
                </div>
                <div class="card-row ${settingsState.wifi ? 'highlight' : 'disabled'}">
                  <div class="row-left">
                    <span class="network-icon">${SVG_ICONS.wifi}</span>
                    <div>
                      <div class="network-name">Gabriel-5G (Connected)</div>
                      <div class="network-sub">Security: WPA3 Personal • Channel 149</div>
                    </div>
                  </div>
                  <span class="check-icon">${SVG_ICONS.check}</span>
                </div>
                <div class="card-row">
                  <div class="row-left">
                    <span class="network-icon">${SVG_ICONS.wifi}</span>
                    <div>
                      <div class="network-name">Campus-Student-Wi-Fi</div>
                      <div class="network-sub">Auto-Join Enabled</div>
                    </div>
                  </div>
                  <span class="lock-icon">${SVG_ICONS.lock}</span>
                </div>
                <div class="card-row">
                  <div class="row-left">
                    <span class="network-icon">${SVG_ICONS.wifi}</span>
                    <div>
                      <div class="network-name">Plintzy-Office-Network</div>
                      <div class="network-sub">Fast 1 Gbps Fiber</div>
                    </div>
                  </div>
                  <span class="lock-icon">${SVG_ICONS.lock}</span>
                </div>
              </div>
            </div>`;
          const tog = pane.querySelector(`#wifi-toggle-${win.id}`);
          tog?.addEventListener('change', () => {
            settingsState.wifi = tog.checked;
            const badge = win.el.querySelector('.settings-nav-item[data-cat="wifi"] .nav-status-badge');
            if (badge) badge.textContent = settingsState.wifi ? 'Gabriel-5G' : 'Off';
            renderCategory('wifi');
          });
        } else if (cat === 'bluetooth') {
          pane.innerHTML = `
            <div class="settings-section">
              <div class="section-header-row">
                <h2>Bluetooth</h2>
                <label class="macos-switch">
                  <input type="checkbox" id="bt-toggle-${win.id}" ${settingsState.bluetooth ? 'checked' : ''} />
                  <span class="slider"></span>
                </label>
              </div>
              <div class="settings-card-group">
                <div class="card-row header-row">
                  <span class="card-row-title">My Devices</span>
                </div>
                <div class="card-row">
                  <div class="row-left">
                    <span class="dev-icon">${SVG_ICONS.airpods}</span>
                    <div>
                      <div class="network-name">AirPods Pro (2nd gen)</div>
                      <div class="network-sub">${settingsState.bluetooth ? 'Connected • 95%' : 'Disconnected'}</div>
                    </div>
                  </div>
                  <span class="status-pill ${settingsState.bluetooth ? 'on' : 'off'}">${settingsState.bluetooth ? 'Connected' : 'Off'}</span>
                </div>
                <div class="card-row">
                  <div class="row-left">
                    <span class="dev-icon">${SVG_ICONS.keyboard}</span>
                    <div>
                      <div class="network-name">Magic Keyboard with Touch ID</div>
                      <div class="network-sub">Connected • 88%</div>
                    </div>
                  </div>
                  <span class="status-pill on">Connected</span>
                </div>
                <div class="card-row">
                  <div class="row-left">
                    <span class="dev-icon">${SVG_ICONS.trackpad}</span>
                    <div>
                      <div class="network-name">Magic Trackpad</div>
                      <div class="network-sub">Connected • 92%</div>
                    </div>
                  </div>
                  <span class="status-pill on">Connected</span>
                </div>
              </div>
            </div>`;
          const tog = pane.querySelector(`#bt-toggle-${win.id}`);
          tog?.addEventListener('change', () => {
            settingsState.bluetooth = tog.checked;
            const badge = win.el.querySelector('.settings-nav-item[data-cat="bluetooth"] .nav-status-badge');
            if (badge) badge.textContent = settingsState.bluetooth ? 'On' : 'Off';
            renderCategory('bluetooth');
          });
        } else if (cat === 'appearance') {
          pane.innerHTML = `
            <div class="settings-section">
              <h2>Appearance</h2>
              <div class="appearance-theme-picker">
                <div class="theme-option ${!settingsState.darkmode ? 'selected' : ''}" data-mode="light">
                  <div class="theme-preview light-theme">
                    <div class="mini-win"></div>
                  </div>
                  <span>Light</span>
                </div>
                <div class="theme-option ${settingsState.darkmode ? 'selected' : ''}" data-mode="dark">
                  <div class="theme-preview dark-theme">
                    <div class="mini-win"></div>
                  </div>
                  <span>Dark</span>
                </div>
                <div class="theme-option" data-mode="auto">
                  <div class="theme-preview auto-theme">
                    <div class="mini-win-split"></div>
                  </div>
                  <span>Auto</span>
                </div>
              </div>

              <div class="settings-card-group" style="margin-top:12px;">
                <div class="card-row">
                  <span class="card-row-title">Accent Color</span>
                  <div class="accent-dots">
                    <span class="accent-dot blue selected"></span>
                    <span class="accent-dot purple"></span>
                    <span class="accent-dot pink"></span>
                    <span class="accent-dot red"></span>
                    <span class="accent-dot orange"></span>
                    <span class="accent-dot green"></span>
                    <span class="accent-dot graphite"></span>
                  </div>
                </div>
                <div class="card-row">
                  <span class="card-row-title">Sidebar Icon Size</span>
                  <select class="macos-select">
                    <option>Medium (Default)</option>
                    <option>Small</option>
                    <option>Large</option>
                  </select>
                </div>
              </div>
            </div>`;

          const themeOpts = pane.querySelectorAll('.theme-option');
          themeOpts.forEach(opt => {
            opt.addEventListener('click', () => {
              themeOpts.forEach(t => t.classList.remove('selected'));
              opt.classList.add('selected');
              settingsState.darkmode = opt.getAttribute('data-mode') !== 'light';
            });
          });

          const dots = pane.querySelectorAll('.accent-dot');
          dots.forEach(d => {
            d.addEventListener('click', () => {
              dots.forEach(x => x.classList.remove('selected'));
              d.classList.add('selected');
            });
          });
        } else if (cat === 'displays') {
          pane.innerHTML = `
            <div class="settings-section">
              <h2>Displays</h2>
              <div class="display-preview-card">
                <div class="macbook-screen-graphic">
                  <span>Liquid Retina XDR (14-inch)</span>
                  <small>3024 × 1964 @ 120Hz ProMotion</small>
                </div>
              </div>
              <div class="settings-card-group" style="margin-top:10px;">
                <div class="card-row">
                  <span class="card-row-title">Brightness</span>
                  <input type="range" class="macos-slider" min="10" max="100" value="85" />
                </div>
                <div class="card-row">
                  <div>
                    <div class="card-row-title">True Tone</div>
                    <div class="card-row-sub">Automatically adapt colors to ambient light</div>
                  </div>
                  <label class="macos-switch">
                    <input type="checkbox" checked />
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="card-row">
                  <div>
                    <div class="card-row-title">Night Shift</div>
                    <div class="card-row-sub">Warm color spectrum during nighttime</div>
                  </div>
                  <label class="macos-switch">
                    <input type="checkbox" checked />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>`;
        } else if (cat === 'sound') {
          pane.innerHTML = `
            <div class="settings-section">
              <h2>Sound</h2>
              <div class="settings-card-group">
                <div class="card-row">
                  <span class="card-row-title">Output Volume</span>
                  <div style="display:flex; align-items:center; gap:8px; flex:1; max-width:180px; justify-content:flex-end;">
                    <span>${SVG_ICONS.speakerLow}</span>
                    <input type="range" class="macos-slider" min="0" max="100" value="75" style="width:120px;" />
                    <span>${SVG_ICONS.sound}</span>
                  </div>
                </div>
                <div class="card-row">
                  <div>
                    <div class="card-row-title">Play Sound on Startup</div>
                    <div class="card-row-sub">Classic Mac chime</div>
                  </div>
                  <label class="macos-switch">
                    <input type="checkbox" checked />
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="card-row">
                  <span class="card-row-title">Alert Sound</span>
                  <select class="macos-select">
                    <option>Glass (Default)</option>
                    <option>Funk</option>
                    <option>Bottle</option>
                    <option>Ping</option>
                  </select>
                </div>
              </div>
            </div>`;
        } else if (cat === 'battery') {
          pane.innerHTML = `
            <div class="settings-section">
              <h2>Battery</h2>
              <div class="battery-hero-card">
                <div class="battery-indicator-wrap">
                  <div class="battery-pct-big">100%</div>
                  <div class="battery-health-badge">● Health: Normal (100%)</div>
                </div>
                <div class="battery-bar-wrap">
                  <div class="battery-bar-fill" style="width:100%;"></div>
                </div>
                <small style="color:rgba(255,255,255,0.5); font-size:7.5px;">Power Source: Power Adapter • Fully Charged</small>
              </div>
              <div class="settings-card-group" style="margin-top:10px;">
                <div class="card-row">
                  <div>
                    <div class="card-row-title">Low Power Mode</div>
                    <div class="card-row-sub">Reduces energy usage to increase battery life</div>
                  </div>
                  <label class="macos-switch">
                    <input type="checkbox" />
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="card-row">
                  <div>
                    <div class="card-row-title">Optimized Battery Charging</div>
                    <div class="card-row-sub">Reduces battery aging by learning charging routine</div>
                  </div>
                  <label class="macos-switch">
                    <input type="checkbox" checked />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>`;
        } else {
          // General / Profile
          pane.innerHTML = `
            <div class="settings-section">
              <div class="about-mac-hero">
                <div class="apple-logo-badge">${SVG_ICONS.appleLogo}</div>
                <div class="about-mac-title">MacBook Pro 14"</div>
                <div class="about-mac-sub">Apple M3 Pro • 18 GB Unified Memory</div>
                <div class="about-mac-os">macOS Sonoma 14.5</div>
              </div>
              <div class="settings-card-group" style="margin-top:10px;">
                <div class="card-row">
                  <span class="card-row-title">Owner</span>
                  <strong style="color:#fff;">Gabriel Jagueneau</strong>
                </div>
                <div class="card-row">
                  <span class="card-row-title">Role</span>
                  <span style="color:#58a6ff;">Ingénieur Agronome & Dev</span>
                </div>
                <div class="card-row">
                  <span class="card-row-title">Storage</span>
                  <span>512 GB SSD (340 GB Free)</span>
                </div>
                <div class="card-row">
                  <span class="card-row-title">Apple Care+</span>
                  <span style="color:#34c759;">Active Coverage</span>
                </div>
              </div>
            </div>`;
        }
      }

      // Initial render
      renderCategory('wifi');

      // Sidebar events
      navItems.forEach(item => {
        item.addEventListener('click', () => {
          navItems.forEach(n => n.classList.remove('active'));
          userCard?.classList.remove('active');
          item.classList.add('active');
          const cat = item.getAttribute('data-cat');
          renderCategory(cat);
        });
      });

      userCard?.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        userCard.classList.add('active');
        renderCategory('general');
      });
    }
  }
};

// ── Helpers ──

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── State & Windows Map ──

const desktop         = document.getElementById('mac-desktop');
const macContainer    = document.getElementById('imagurrrr');
const activeAppNameEl = document.querySelector('.active-app-name');

let isDesktopVisible  = false;
let isMacInteractive  = false;
let windowCounter     = 0;
let highestZIndex     = 10;
let autoSpawnTimer    = null;

// Map of open windows: Map<appName, WindowInstance>
const openWindows = new Map();

function setActiveApp(appName) {
  if (activeAppNameEl) activeAppNameEl.textContent = appName || 'Finder';
}

function updateDockDots() {
  document.querySelectorAll('.dock .dock-item[data-app]').forEach(item => {
    const appName = item.getAttribute('data-app');
    let dot = item.querySelector('.dock-dot');
    const isOpen = openWindows.has(appName);
    if (isOpen) {
      if (!dot) {
        dot = document.createElement('span');
        dot.className = 'dock-dot';
        item.appendChild(dot);
      }
    } else {
      if (dot) dot.remove();
    }
  });
}

// ── Window Management ──

export function spawnOrFocusWindow(appName) {
  if (!desktop || !appDefinitions[appName]) return;

  const existing = openWindows.get(appName);
  if (existing) {
    if (existing.isMinimized) {
      restoreWindow(existing);
    }
    focusWindow(existing);
    return;
  }

  const app = appDefinitions[appName];
  const winId = ++windowCounter;

  const win = document.createElement('div');
  win.className = 'window active-window';
  win.setAttribute('data-app-name', appName);

  const desktopW = desktop.offsetWidth || 500;
  const desktopH = desktop.offsetHeight || 300;
  const widthPx  = Math.round((desktopW * app.widthPct) / 100);
  const heightPx = Math.round((desktopH * app.heightPct) / 100);

  // Stagger positions so new windows don't completely cover existing ones
  const count = openWindows.size;
  const offsetX = (count * 20) % Math.max(20, desktopW - widthPx - 20);
  const offsetY = (count * 16) % Math.max(16, desktopH - heightPx - 30);
  const posX = Math.max(8, 12 + offsetX);
  const posY = Math.max(6, 8 + offsetY);

  win.style.width  = `${app.widthPct}%`;
  win.style.height = `${app.heightPct}%`;
  win.style.left   = `${posX}px`;
  win.style.top    = `${posY}px`;
  win.style.zIndex = `${++highestZIndex}`;
  win.style.opacity = '0';
  win.style.transform = 'scale(0.92) translateY(12px)';
  win.style.filter = 'blur(6px)';

  const instance = {
    id: winId,
    appName,
    el: win,
    isMinimized: false,
    isMaximized: false,
    prevBounds: { width: `${app.widthPct}%`, height: `${app.heightPct}%`, left: `${posX}px`, top: `${posY}px` }
  };

  win.innerHTML = `
    <div class="window-header">
      <div class="dots">
        <span class="dot close" title="Close"></span>
        <span class="dot minimize" title="Minimize"></span>
        <span class="dot maximize" title="Maximize"></span>
      </div>
      <span class="window-title">${app.title}</span>
    </div>
    <div class="window-content">${app.render(instance)}</div>
  `;

  // Focus on click
  win.addEventListener('mousedown', () => focusWindow(instance));

  // Controls
  const closeBtn = win.querySelector('.dot.close');
  const minBtn   = win.querySelector('.dot.minimize');
  const maxBtn   = win.querySelector('.dot.maximize');

  closeBtn?.addEventListener('click', (e) => { e.stopPropagation(); closeWindow(instance); });
  minBtn?.addEventListener('click', (e) => { e.stopPropagation(); minimizeWindow(instance); });
  maxBtn?.addEventListener('click', (e) => { e.stopPropagation(); toggleMaximizeWindow(instance); });

  // Draggable Header
  makeDraggable(win, instance);

  desktop.appendChild(win);
  openWindows.set(appName, instance);
  updateDockDots();
  focusWindow(instance);

  if (app.setup) {
    app.setup(instance);
  }

  requestAnimationFrame(() => {
    win.style.opacity   = '1';
    win.style.transform = 'scale(1) translateY(0)';
    win.style.filter    = 'blur(0px)';
  });

  // If in autonomous non-interactive mode, schedule auto-dismiss
  if (!isMacInteractive) {
    const lifetime = Math.floor(14000 + Math.random() * 6000);
    instance.autoDismissTimer = setTimeout(() => {
      if (!isMacInteractive && openWindows.has(appName)) {
        closeWindow(instance);
      }
    }, lifetime);
  }
}

function focusWindow(instance) {
  document.querySelectorAll('.desktop .window').forEach(w => w.classList.remove('active-window'));
  instance.el.classList.add('active-window');
  instance.el.style.zIndex = `${++highestZIndex}`;
  setActiveApp(instance.appName);
}

function closeWindow(instance) {
  if (instance.autoDismissTimer) clearTimeout(instance.autoDismissTimer);

  instance.el.style.opacity   = '0';
  instance.el.style.transform = 'scale(0.92) translateY(-10px)';
  instance.el.style.filter    = 'blur(6px)';

  setTimeout(() => {
    instance.el.remove();
    openWindows.delete(instance.appName);
    updateDockDots();

    // Set active app to next top window
    let topApp = 'Finder';
    let topZ = 0;
    openWindows.forEach((winInst, name) => {
      const z = parseInt(winInst.el.style.zIndex || '0', 10);
      if (z > topZ && !winInst.isMinimized) {
        topZ = z;
        topApp = name;
      }
    });
    setActiveApp(topApp);
  }, 300);
}

function minimizeWindow(instance) {
  instance.isMinimized = true;
  instance.el.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease';
  instance.el.style.transform = 'scale(0.2) translateY(300px)';
  instance.el.style.opacity   = '0';
  instance.el.style.pointerEvents = 'none';
  setTimeout(() => {
    instance.el.style.display = 'none';
  }, 300);
}

function restoreWindow(instance) {
  instance.isMinimized = false;
  instance.el.style.display = 'flex';
  instance.el.style.pointerEvents = 'auto';
  requestAnimationFrame(() => {
    instance.el.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease';
    instance.el.style.transform = instance.isMaximized ? 'none' : 'scale(1) translateY(0)';
    instance.el.style.opacity   = '1';
  });
}

function toggleMaximizeWindow(instance) {
  const win = instance.el;
  if (!instance.isMaximized) {
    instance.prevBounds = {
      width: win.style.width,
      height: win.style.height,
      left: win.style.left,
      top: win.style.top
    };
    win.style.left   = '4px';
    win.style.top    = '4px';
    win.style.width  = 'calc(100% - 8px)';
    win.style.height = 'calc(100% - 8px)';
    instance.isMaximized = true;
  } else {
    win.style.width  = instance.prevBounds.width;
    win.style.height = instance.prevBounds.height;
    win.style.left   = instance.prevBounds.left;
    win.style.top    = instance.prevBounds.top;
    instance.isMaximized = false;
  }
}

function makeDraggable(win, instance) {
  const header = win.querySelector('.window-header');
  if (!header) return;

  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('.dots')) return; // Ignore dot clicks
    if (instance.isMaximized) return; // Don't drag if maximized

    e.preventDefault();
    focusWindow(instance);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialLeft = win.offsetLeft;
    const initialTop  = win.offsetTop;
    const desktopW = desktop.offsetWidth || 500;
    const desktopH = desktop.offsetHeight || 300;

    // Dynamically compute the current visual scale factor of the Mac desktop
    const dRect = desktop.getBoundingClientRect();
    const scale = (desktop.offsetWidth > 0 ? dRect.width / desktop.offsetWidth : 1) || 1;

    function onMouseMove(e) {
      const dx = (e.clientX - startX) / scale;
      const dy = (e.clientY - startY) / scale;

      let newLeft = initialLeft + dx;
      let newTop  = initialTop + dy;

      // Bounds clamping
      newLeft = Math.max(-win.offsetWidth + 60, Math.min(desktopW - 60, newLeft));
      newTop  = Math.max(0, Math.min(desktopH - 30, newTop));

      win.style.left = `${newLeft}px`;
      win.style.top  = `${newTop}px`;
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

// ── Autonomous Cycle for Non-Interactive Mode ──

function scheduleAutoSpawn(delay = 8000) {
  if (autoSpawnTimer) clearTimeout(autoSpawnTimer);
  if (isMacInteractive || !isDesktopVisible || document.hidden) return;

  autoSpawnTimer = setTimeout(() => {
    if (!isMacInteractive && isDesktopVisible && !document.hidden && openWindows.size < 2) {
      const appKeys = Object.keys(appDefinitions);
      const unopened = appKeys.filter(k => !openWindows.has(k));
      const chosen = unopened[Math.floor(Math.random() * unopened.length)] || appKeys[0];
      spawnOrFocusWindow(chosen);
    }
    scheduleAutoSpawn(Math.floor(9000 + Math.random() * 5000));
  }, delay);
}

// ── Interactive Mode Controller ──

export function setInteractive(active) {
  if (isMacInteractive === active) return;
  isMacInteractive = Boolean(active);

  setMacInteractiveMode(isMacInteractive);

  const container = document.querySelector('.macos-container');
  if (container) {
    container.classList.toggle('is-interactive', isMacInteractive);
  }

  if (isMacInteractive) {
    // Stop all auto-dismiss and auto-spawn timers
    if (autoSpawnTimer) clearTimeout(autoSpawnTimer);
    openWindows.forEach(winInst => {
      if (winInst.autoDismissTimer) clearTimeout(winInst.autoDismissTimer);
    });

    // If no window is open, launch Finder or Terminal to invite immediate interaction
    if (openWindows.size === 0) {
      spawnOrFocusWindow('Terminal');
    }
  } else {
    // Resume gentle auto-spawning
    scheduleAutoSpawn(6000);
  }
}

let isMacFullscreen = false;

export function toggleMacFullscreen(force) {
  const mac = document.getElementById('imagurrrr') || document.querySelector('.image-container');
  const backdrop = document.getElementById('mac-fullscreen-backdrop');
  const exitBtn = document.getElementById('mac-exit-fullscreen');
  const dockFullscreenItem = document.getElementById('dock-item-fullscreen');

  if (typeof force === 'boolean') {
    isMacFullscreen = force;
  } else {
    isMacFullscreen = !isMacFullscreen;
  }

  if (isMacFullscreen && mac) {
    setInteractive(true);

    // Calculate current rect before zoom
    const rect = mac.getBoundingClientRect();
    const targetW = window.innerWidth * 0.93;
    const targetH = window.innerHeight * 0.91;
    const scale = Math.min(targetW / rect.width, targetH / rect.height);

    // Delta from Mac's center to Viewport center
    const macCenterX = rect.left + rect.width / 2;
    const macCenterY = rect.top + rect.height / 2;
    const viewCenterX = window.innerWidth / 2;
    const viewCenterY = window.innerHeight / 2;
    const deltaX = viewCenterX - macCenterX;
    const deltaY = viewCenterY - macCenterY;

    mac.style.setProperty('--zoom-tx', `${Math.round(deltaX)}px`);
    mac.style.setProperty('--zoom-ty', `${Math.round(deltaY)}px`);
    mac.style.setProperty('--zoom-scale', `${scale.toFixed(3)}`);

    mac.classList.add('is-zooming');
    document.body.classList.add('mac-fullscreen-mode');
    mac.classList.add('is-mac-zoomed');
    backdrop?.classList.add('active');
    exitBtn?.classList.add('active');
    dockFullscreenItem?.classList.add('active-fullscreen');

    let dot = dockFullscreenItem?.querySelector('.dock-dot');
    if (!dot && dockFullscreenItem) {
      dot = document.createElement('span');
      dot.className = 'dock-dot';
      dockFullscreenItem.appendChild(dot);
    }

    // Remove is-zooming after transition completes so browser rasterizes at crisp 4K Retina resolution
    setTimeout(() => {
      mac.classList.remove('is-zooming');
    }, 700);
  } else {
    mac?.classList.add('is-zooming');
    document.body.classList.remove('mac-fullscreen-mode');
    mac?.classList.remove('is-mac-zoomed');
    backdrop?.classList.remove('active');
    exitBtn?.classList.remove('active');
    dockFullscreenItem?.classList.remove('active-fullscreen');

    // Deactivate interactive mode so cards immediately resume normal rotation
    setInteractive(false);

    setTimeout(() => {
      mac?.classList.remove('is-zooming');
      if (!isMacFullscreen && mac) {
        mac.style.removeProperty('--zoom-tx');
        mac.style.removeProperty('--zoom-ty');
        mac.style.removeProperty('--zoom-scale');
      }
    }, 750);
  }
}

// ── Dock Event Handlers ──

function initDock() {
  document.querySelectorAll('.dock .dock-item[data-app]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid bubbling
      const appName = item.getAttribute('data-app');
      if (appName === 'Fullscreen') {
        toggleMacFullscreen();
        return;
      }
      if (appName && appDefinitions[appName]) {
        // If clicking on Mac dock, activate interactive mode
        setInteractive(true);
        spawnOrFocusWindow(appName);
      }
    });
  });

  const exitBtn = document.getElementById('mac-exit-fullscreen');
  exitBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMacFullscreen(false);
  });

  const backdrop = document.getElementById('mac-fullscreen-backdrop');
  backdrop?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMacFullscreen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isMacFullscreen) {
        toggleMacFullscreen(false);
      } else if (isMacInteractive) {
        setInteractive(false);
      }
    }
  });
}

function initInteractiveListeners() {
  function getMac() {
    return document.getElementById('imagurrrr') || document.querySelector('.image-container');
  }

  // Pointer / mouse down detection
  document.addEventListener('mousedown', (e) => {
    const mac = getMac();
    if (!mac) return;

    const isInsideMac = mac.contains(e.target) || e.target.closest('#imagurrrr') || e.target.closest('.macos-container');
    const isCard = e.target.closest('.cardage');
    const isExitBtn = e.target.closest('#mac-exit-fullscreen');

    if (isInsideMac || isExitBtn) {
      setInteractive(true);
    } else if (!isCard && !isMacFullscreen) {
      setInteractive(false);
    }
  });
}

// ── Viewport Observer ──

function initDesktopObserver() {
  if (!desktop) return;

  const desktopObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const wasVisible = isDesktopVisible;
      isDesktopVisible = entry.isIntersecting;
      if (isDesktopVisible && !wasVisible) {
        if (openWindows.size === 0 && !isMacInteractive) {
          setTimeout(() => { if (!isMacInteractive) spawnOrFocusWindow('Terminal'); }, 600);
          setTimeout(() => { if (!isMacInteractive && openWindows.size < 2) spawnOrFocusWindow('Safari'); }, 4000);
        }
        scheduleAutoSpawn(8000);
      } else if (!isDesktopVisible) {
        if (autoSpawnTimer) { clearTimeout(autoSpawnTimer); autoSpawnTimer = null; }
      }
    });
  }, { rootMargin: '100px' });

  desktopObserver.observe(desktop);
}

// ── Bootstrap ──

export function initMacUI() {
  updateClock();
  initDock();
  initInteractiveListeners();
  initDesktopObserver();
}
