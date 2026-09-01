// ─── macOS UI — Ultra-Realistic & 100% Interactive Operating System ───────────────
// - Authentic macOS Sonoma / Sequoia design language with complete interactive ecosystem.
// - Interactive Top Menu Bar (Apple Menu, Contextual Menus, Battery, Wi-Fi, Control Center, Spotlight).
// - Interactive Control Center with live Brightness, Volume, Dark Mode & AirDrop toggles.
// - Interactive Spotlight Search (⌘ Space) for searching apps, contacts, and live calculator math.
// - Lock Screen & Sleep Screen overlays with authentic unlock & wake transitions.
// - Fully interactive macOS Apps:
//     1. Finder: Sidebar folders (Applications, Projects, Documents), double-click to open files.
//     2. Safari: Real address bar, multiple interactive tabs (Portfolio, Plintzy, GitHub, LinkedIn).
//     3. VS Code: Multi-tab file explorer, editable code, interactive "▶ Run" console execution.
//     4. Music: Animated waveform equalizer, seekable progress scrubber, volume slider, playlist queue.
//     5. System Settings: Live Dark/Light theme toggle, Accent colors, Wi-Fi/BT switches, M3 Pro specs.
//     6. Terminal: zsh with command history, fastfetch / neofetch, matrix rain, whoami, projects, help.
//     7. Calculator: Authentic macOS standard calculator with clickable buttons and keyboard support.
//     8. About This Mac: Authentic modal dialog with M3 Pro chip icon and storage breakdown.

import { setMacInteractiveMode } from './cards-physics.js';

// ═══════════════════════════════════════════════════════════════════════════════
// SVG Vector Flat Icons (100% Crisp Vector, Zero Emojis)
// ═══════════════════════════════════════════════════════════════════════════════
const SVG_ICONS = {
  apple: `<svg width="10" height="10" viewBox="0 0 170 170" fill="currentColor"><path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.97-12.04-14.67-6.04-9.35-10.8-19.8-14.28-31.35-3.48-11.55-5.22-22.37-5.22-32.46 0-14.24 3.79-25.96 11.37-35.15 7.58-9.19 16.92-13.88 28.02-14.07 4.97 0 10.45 1.37 16.44 4.11 5.99 2.74 9.54 4.16 10.66 4.27 1.45-.22 5.31-1.74 11.58-4.56 6.27-2.82 11.75-4.11 16.44-3.88 12.31.62 22.18 5.46 29.6 14.52-10.74 6.51-16.02 15.53-15.84 27.05.18 8.94 3.65 16.32 10.41 22.14 6.76 5.82 14.73 9.07 23.91 9.75-2.02 6.09-4.57 12.18-7.65 18.27zm-29.35-105.74c0-7.39 2.65-14.18 7.95-20.37 5.3-6.19 11.77-9.84 19.41-10.94.44 2.82.44 5.3.01 7.44-.66 6.94-3.44 13.43-8.34 19.46-4.9 6.03-11.23 9.77-18.99 11.21-.04-2.2-.04-4.46-.04-6.8z"/></svg>`,
  search: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="10.5" cy="10.5" r="7"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></svg>`,
  controlCenter: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2zm0 8h16a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2zm0 8h16a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2z"/></svg>`,
  wifi: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A16.88 16.88 0 0 0 12 4zm0 2.9c3.8 0 7.27 1.44 9.9 3.82L12 18.77 2.1 10.72A14.9 14.9 0 0 1 12 6.9z"/></svg>`,
  bluetooth: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M14.24 12.01l4.7-4.7a1 1 0 000-1.42l-6-6A1 1 0 0011 0.6V9.58L6.41 5A1 1 0 005 6.41L10.59 12 5 17.59A1 1 0 106.41 19L11 14.41v8.99a1 1 0 001.94.71l6-6a1 1 0 000-1.42l-4.7-4.68zM13 3.41l3.29 3.3L13 10.01V3.41zm0 17.18v-6.6l3.29 3.3L13 20.59z"/></svg>`,
  moon: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12.3 2a10 10 0 00-.19 20 10 10 0 008.7-5.1 1 1 0 00-1-1.44 8 8 0 11-8.95-12 1 1 0 001.44-1.46z"/></svg>`,
  sun: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  displays: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4a2 2 0 00-2 2v10a2 2 0 002 2h6v2H8a1 1 0 000 2h8a1 1 0 000-2h-2v-2h6a2 2 0 002-2V5a2 2 0 00-2-2zm0 12H4V5h16v10z"/></svg>`,
  sound: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3.23v17.54a1 1 0 01-1.66.75L6.85 16H3a1 1 0 01-1-1V9a1 1 0 011-1h3.85l5.49-5.52a1 1 0 011.66.75zm4.5 8.77a5 5 0 00-2-4 1 1 0 10-1.2 1.6 3 3 0 011.2 2.4 3 3 0 01-1.2 2.4 1 1 0 101.2 1.6 5 5 0 002-4z"/></svg>`,
  speakerMute: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
  battery: `<svg width="12" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M17 6H3a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2zm-2 9H4a1 1 0 01-1-1v-4a1 1 0 011-1h11a1 1 0 011 1v4a1 1 0 01-1 1zm7-6a1 1 0 00-1 1v4a1 1 0 002 0v-4a1 1 0 00-1-1z"/></svg>`,
  batteryCharging: `<svg width="12" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M17 6H3a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2zm-6 10l1.5-3.5H9.5L13 7l-1.5 3.5h3L11 16zm10-7a1 1 0 00-1 1v4a1 1 0 002 0v-4a1 1 0 00-1-1z"/></svg>`,
  gear: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.48.48 0 0014 2h-4a.48.48 0 00-.49.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.63 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.08.63-.08.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h4c.24 0 .44-.17.49-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6a3.6 3.6 0 110-7.2 3.6 3.6 0 010 7.2z"/></svg>`,
  airdrop: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 00-9 9 9 9 0 003 6.71L7.41 17.3A7 7 0 1112 19a6.93 6.93 0 01-4.95-2.05L5.64 18.36A9 9 0 1012 3zm0 4a5 5 0 00-5 5 4.93 4.93 0 001.46 3.54L9.88 14.12A3 3 0 1112 15a2.93 2.93 0 01-2.12-.88L8.46 15.54A5 5 0 1012 7zm0 4a1 1 0 100 2 1 1 0 000-2z"/></svg>`,
  airpods: `<svg width="11" height="11" viewBox="0 0 24 24" fill="#007aff"><path d="M12 2a9 9 0 00-9 9v7a3 3 0 003 3h1a2 2 0 002-2v-5a2 2 0 00-2-2H5v-1a7 7 0 1114 0v1h-2a2 2 0 00-2 2v5a2 2 0 002 2h1a3 3 0 003-3v-7a9 9 0 00-9-9z"/></svg>`,
  keyboard: `<svg width="11" height="11" viewBox="0 0 24 24" fill="#8e8e93"><path d="M20 5H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2zm-9 3h2v2h-2V8zm-4 0h2v2H7V8zm-2 4h2v2H5v-2zm8 4H7v-2h6v2zm2-4h-2v-2h2v2zm0-4h2v2h-2V8zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg>`,
  trackpad: `<svg width="11" height="11" viewBox="0 0 24 24" fill="#8e8e93"><path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 10H5V6h14v8z"/></svg>`,
  lock: `<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6a5 5 0 00-10 0v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4zm3.1-9H8.9V6a3.1 3.1 0 016.2 0v2z"/></svg>`,
  check: `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#34c759" stroke-width="3.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  folder: `<svg width="12" height="12" viewBox="0 0 24 24" fill="#007aff"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>`,
  folderProjects: `<svg width="28" height="28" viewBox="0 0 24 24" fill="#007aff"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>`,
  fileCode: `<svg width="28" height="28" viewBox="0 0 24 24" fill="#f59e0b"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
  filePdf: `<svg width="28" height="28" viewBox="0 0 24 24" fill="#ef4444"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-3h2c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zm5 2h-2v-5h2c.83 0 1.5.67 1.5 1.5v2c0 .83-.67 1.5-1.5 1.5z"/></svg>`,
  fileHtml: `<svg width="28" height="28" viewBox="0 0 24 24" fill="#3b82f6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  fileJs: `<svg width="10" height="10" viewBox="0 0 24 24" fill="#f7df1e"><path d="M3 3h18v18H3V3zm10.5 13.5h2v-7h-2v7zm-5-3.5h2v-3.5h-2V13z"/></svg>`,
  filePy: `<svg width="10" height="10" viewBox="0 0 24 24" fill="#38bdf8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
  fileJson: `<svg width="10" height="10" viewBox="0 0 24 24" fill="#4ade80"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM8 12h8v2H8v-2z"/></svg>`,
  play: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>`,
  pause: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/></svg>`,
  prev: `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="19,5 9,12 19,19"/><rect x="5" y="5" width="2.5" height="14" rx="0.5"/></svg>`,
  next: `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,5 15,12 5,19"/><rect x="16.5" y="5" width="2.5" height="14" rx="0.5"/></svg>`,
  shuffle: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`,
  repeat: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>`,
  musicNote: `<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55A4 4 0 1014 17V7h6V3h-8z"/></svg>`,
  leaf: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17 6c-2.76 0-5 2.24-5 5 0 1.63.78 3.08 2 4v7h2v-7c1.22-.92 2-2.37 2-4 0-2.76-2.24-5-5-5zM7 10c-2.76 0-5 2.24-5 5 0 1.63.78 3.08 2 4v3h2v-3c1.22-.92 2-2.37 2-4 0-2.76-2.24-5-5-5z"/></svg>`,
  sprout: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
  synth: `<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M15 4V2h-2v2h-2V2H9v2H7a2 2 0 00-2 2v2H3v2h2v2H3v2h2v2H3v2h2v2a2 2 0 002 2h2v2h2v-2h2v2h2v-2h2a2 2 0 002-2v-2h2v-2h-2v-2h2v-2h-2v-2h2V8h-2V6a2 2 0 00-2-2h-2zm0 14H9V6h6v12z"/></svg>`,
  nightMoon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12.3 2a10 10 0 00-.19 20 10 10 0 008.7-5.1 1 1 0 00-1-1.44 8 8 0 11-8.95-12 1 1 0 001.44-1.46z"/></svg>`,
  sparkle: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>`,
  github: `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
  linkedin: `<svg width="11" height="11" viewBox="0 0 24 24" fill="#0077b5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
  calculator: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 2H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2zm-2 4v2H7V6h10zm-8 6H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm8 0h-6v-2h6v2z"/></svg>`,
  globe: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  aiChip: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>`,
  satellite: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.93 4.93a10 10 0 0 1 14.14 0l-1.41 1.41a8 8 0 0 0-11.32 0L4.93 4.93zm2.83 2.83a6 6 0 0 1 8.48 0l-1.41 1.41a4 4 0 0 0-5.66 0L7.76 7.76zm4.24 3.24a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-8.49 9.9l6-6 1.42 1.41-6 6-1.42-1.41z"/></svg>`,
  smartphone: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  box: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16.5l-9 5.2-9-5.2V7.5l9-5.2 9 5.2v9z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  flask: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.31L4.65 19.3A2 2 0 0 0 6.41 22h11.18a2 2 0 0 0 1.76-2.7L14 9.31V2h-4z"/><line x1="8.5" y1="2" x2="15.5" y2="2"/></svg>`,
  briefcase: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  graduationCap: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  rocket: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><line x1="9" y1="12" x2="12" y2="15"/></svg>`,
  codeTag: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  externalLink: `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  fileExplorer: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`,
  gitBranch: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`,
  playDebug: `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`,
  extension: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z"/></svg>`,
  alertTriangle: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  listenPlay: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/></svg>`,
  radio: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="8" width="20" height="14" rx="2" ry="2"/><line x1="6" y1="4" x2="18" y2="4"/><line x1="12" y1="4" x2="12" y2="8"/><circle cx="12" cy="15" r="3"/></svg>`,
  compass: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor"/></svg>`,
  clock: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  playlist: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="16" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  closeIcon: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
};

// ═══════════════════════════════════════════════════════════════════════════════
// Music App Tracks & State
// ═══════════════════════════════════════════════════════════════════════════════
const musicTracks = [
  { title: "Midnight Chill Beats", artist: "Lo-Fi Beats • Apple Music", duration: 194, color: "linear-gradient(135deg, #fa2d48, #ff7643)", icon: SVG_ICONS.musicNote },
  { title: "Agronomy Dreams", artist: "Nature & Code • Chillhop", duration: 210, color: "linear-gradient(135deg, #34c759, #30b0c7)", icon: SVG_ICONS.leaf },
  { title: "Silicon Sunset", artist: "Synthwave Lab • Electronic", duration: 185, color: "linear-gradient(135deg, #af52de, #5856d6)", icon: SVG_ICONS.synth },
  { title: "Paris by Night", artist: "Gabriel J. • Ambient", duration: 240, color: "linear-gradient(135deg, #007aff, #5ac8fa)", icon: SVG_ICONS.nightMoon }
];
let currentTrackIdx = 0;
let isMusicPlaying = false;
let musicCurrentSec = 45;
let musicVolume = 80;
let musicInterval = null;

// ── Web Audio API Ambient Synthesizer ──
let audioCtx = null;
let audioGainNode = null;
let musicSynthTimer = null;
let chordIdx = 0;

const CHORD_PROGRESSIONS = [
  [349.23, 440.00, 523.25, 659.25], // Fmaj7
  [329.63, 392.00, 493.88, 587.33], // Em7
  [293.66, 349.23, 440.00, 523.25], // Dm7
  [261.63, 329.63, 392.00, 493.88]  // Cmaj7
];

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
      audioGainNode = audioCtx.createGain();
      audioGainNode.gain.value = (musicVolume / 100) * 0.12;
      audioGainNode.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSynthChord(notes) {
  const ctx = getAudioContext();
  if (!ctx || !audioGainNode) return;

  const now = ctx.currentTime;
  notes.forEach((freq, i) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600 + i * 160, now);

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.035 / notes.length, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioGainNode);

      osc.start(now);
      osc.stop(now + 3.1);
    } catch (e) {}
  });
}

function startMusicAudio() {
  getAudioContext();
  if (musicSynthTimer) clearInterval(musicSynthTimer);
  playSynthChord(CHORD_PROGRESSIONS[chordIdx % CHORD_PROGRESSIONS.length]);
  musicSynthTimer = setInterval(() => {
    if (!isMusicPlaying) {
      clearInterval(musicSynthTimer);
      return;
    }
    chordIdx = (chordIdx + 1) % CHORD_PROGRESSIONS.length;
    playSynthChord(CHORD_PROGRESSIONS[chordIdx]);
  }, 3200);
}

function stopMusicAudio() {
  if (musicSynthTimer) {
    clearInterval(musicSynthTimer);
    musicSynthTimer = null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VS Code App Files & State
// ═══════════════════════════════════════════════════════════════════════════════
const codeFiles = {
  "developpeur.js": {
    lang: "javascript",
    code: `// Gabriel Jagueneau — Ingénieur & Développeur
const developpeur = {
  nom: "Gabriel Jagueneau",
  formation: "Ingénieur Agronome (Bordeaux Sciences Agro)",
  metier: "Lead Dev & Fondateur Plintzy",
  competences: ["JavaScript", "React", "Node.js", "Python", "Data GIS"],
  statut: "Ouvert aux opportunités & collaborations"
};

function creerProjet() {
  return "Lancement : Innovation végétale, tech & design !";
}
console.log(creerProjet());`
  },
  "skills.py": {
    lang: "python",
    code: `# Stack technique & Outils
skills = {
    "frontend": ["React", "Next.js", "TypeScript", "Vanilla CSS", "Three.js"],
    "backend": ["Node.js", "Express", "Python", "FastAPI", "PostgreSQL"],
    "agronomie": ["Modélisation végétale", "SIG / QGIS", "Analyse de données"],
    "devops": ["Docker", "Git", "GitHub Actions", "Vite", "Supabase"]
}

def afficher_stack():
    for cat, items in skills.items():
        print(f"[{cat.upper()}] : {', '.join(items)}")

afficher_stack()`
  },
  "contact.json": {
    lang: "json",
    code: `{
  "nom": "Gabriel Jagueneau",
  "email": "contact@gjagueneau.fr",
  "github": "https://github.com/Gabriel-Jagueneau",
  "linkedin": "https://linkedin.com/in/gabriel-jagueneau",
  "localisation": "Paris / Bordeaux, France",
  "disponibilite": "Immédiate"
}`
  },
  "agronomie_model.ts": {
    lang: "typescript",
    code: `// Simulation croissance végétale & capteurs IoT
interface PlantSensorData {
  soilMoisture: number; // %
  sunlightHours: number;
  ndviIndex: number;
}

function calculateHealthIndex(data: PlantSensorData): string {
  const score = (data.soilMoisture * 0.4) + (data.ndviIndex * 60);
  return score > 75 ? "Optimal Canopy Health [Score > 75]" : "Irrigation Required [Low Moisture]";
}

console.log(calculateHealthIndex({ soilMoisture: 82, sunlightHours: 7.5, ndviIndex: 0.88 }));`
  }
};
let activeCodeFile = "developpeur.js";

// ═══════════════════════════════════════════════════════════════════════════════
// System Settings State
// ═══════════════════════════════════════════════════════════════════════════════
const settingsState = {
  wifi: true,
  bluetooth: true,
  darkmode: true,
  airdrop: true,
  brightness: 90,
  soundVolume: 75,
  accentColor: "blue",
  alertSound: "Glass",
  lowPowerMode: false
};

// ═══════════════════════════════════════════════════════════════════════════════
// Calculator State & Helper
// ═══════════════════════════════════════════════════════════════════════════════
const calcState = {
  displayValue: '0',
  firstOperand: null,
  waitingForSecondOperand: false,
  operator: null,
  clearAll: true
};

function formatCalcNumber(num) {
  if (num === 'Erreur' || num === 'Error' || isNaN(num)) return 'Erreur';
  if (!isFinite(num)) return 'Erreur';
  const rounded = parseFloat(Number(num).toPrecision(10));
  return String(rounded);
}

function performCalc(op, a, b) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return b !== 0 ? (a / b) : 'Erreur';
  return b;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Global Desktop & Windows References
// ═══════════════════════════════════════════════════════════════════════════════
const desktop = document.getElementById('mac-desktop');
const activeAppNameEl = document.getElementById('mac-menu-app-name');

let isDesktopVisible = false;
let isMacInteractive = false;
let windowCounter = 0;
let highestZIndex = 10;
let autoSpawnTimer = null;
let activePopover = null;

// Map of open windows: Map<appName, WindowInstance>
const openWindows = new Map();

function setActiveApp(appName) {
  if (activeAppNameEl) activeAppNameEl.textContent = appName || 'Finder';
}

function updateDockDots() {
  document.querySelectorAll('.dock .dock-item[data-app]').forEach(item => {
    const appName = item.getAttribute('data-app');
    const isOpen = openWindows.has(appName);
    item.classList.toggle('has-running-window', isOpen);
  });
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Applications Definitions
// ═══════════════════════════════════════════════════════════════════════════════
const appDefinitions = {
  // ── 1. Terminal (zsh) ──
  "Terminal": {
    title: "gabriel — zsh — 80×24",
    widthPct: 56, heightPct: 58,
    render: (win) => `
      <div class="app-terminal" id="term-container-${win.id}">
        <p class="term-login">Last login: ${new Date().toLocaleDateString()} on ttys001</p>
        <p class="term-welcome">Welcome to macOS Sonoma 14.5. Type <span class="term-highlight">'help'</span> or <span class="term-highlight">'fastfetch'</span>.</p>
        <div class="term-output" id="term-out-${win.id}">
          <p><span class="term-prompt">gabriel@macbook</span> <span class="term-path">~/Portfolio</span> % <span class="term-cmd">fastfetch</span></p>
          <div class="term-fastfetch">
            <pre class="term-ascii-logo">
      
    
   
  
  
   
    
      </pre>
            <div class="term-fastfetch-info">
              <p><strong style="color:#58a6ff;">Gabriel Jagueneau</strong> @ MacBook Pro</p>
              <p>-------------------------</p>
              <p><span class="term-key">OS:</span> macOS Sonoma 14.5 (Darwin 23.5.0)</p>
              <p><span class="term-key">Host:</span> MacBookPro18,3 (14-inch, 2024)</p>
              <p><span class="term-key">CPU:</span> Apple M3 Pro (12 Cores)</p>
              <p><span class="term-key">GPU:</span> Apple M3 Pro (18-core GPU)</p>
              <p><span class="term-key">Memory:</span> 18 GB Unified LPDDR5</p>
              <p><span class="term-key">Role:</span> Agronomy Engineer & Full-Stack Dev</p>
            </div>
          </div>
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

      const history = [];
      let histIdx = -1;

      container.addEventListener('click', () => input.focus());

      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
          if (history.length && histIdx < history.length - 1) {
            histIdx++;
            input.value = history[history.length - 1 - histIdx];
          }
        } else if (e.key === 'ArrowDown') {
          if (histIdx > 0) {
            histIdx--;
            input.value = history[history.length - 1 - histIdx];
          } else if (histIdx === 0) {
            histIdx = -1;
            input.value = '';
          }
        }
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const cmd = input.value.trim();
        input.value = '';
        if (!cmd) return;

        history.push(cmd);
        histIdx = -1;

        const cmdLine = document.createElement('p');
        cmdLine.innerHTML = `<span class="term-prompt">gabriel@macbook</span> <span class="term-path">~/Portfolio</span> % <span class="term-cmd">${escapeHtml(cmd)}</span>`;
        output.appendChild(cmdLine);

        const resLine = document.createElement('div');
        resLine.className = 'term-cmd-result';

        const lower = cmd.toLowerCase();
        if (lower === 'help') {
          resLine.innerHTML = `
            <p class="term-muted">Available commands: <span class="term-highlight">whoami</span>, <span class="term-highlight">skills</span>, <span class="term-highlight">projects</span>, <span class="term-highlight">fastfetch</span>, <span class="term-highlight">matrix</span>, <span class="term-highlight">contact</span>, <span class="term-highlight">ls</span>, <span class="term-highlight">cat &lt;file&gt;</span>, <span class="term-highlight">open &lt;app&gt;</span>, <span class="term-highlight">clear</span>, <span class="term-highlight">date</span>, <span class="term-highlight">sudo</span></p>`;
        } else if (lower === 'whoami' || lower === 'bio') {
          resLine.innerHTML = `<p class="term-success">Gabriel Jagueneau — Élève-Ingénieur Agronome (Bordeaux Sciences Agro) & Développeur Web Full-Stack / Fondateur Plintzy.</p>`;
        } else if (lower === 'skills' || lower === 'tech') {
          resLine.innerHTML = `<p class="term-info">Stack: JavaScript (ES6+), React, Next.js, Python, FastAPI, Node.js, SQL, Three.js, Docker, GIS/QGIS, Modélisation Agronomique.</p>`;
        } else if (lower === 'projects') {
          resLine.innerHTML = `<p class="term-info">● <strong>Plintzy</strong>: Startup & App tech végétale<br/>● <strong>TIPE Agronomie</strong>: Modélisation biologique & capteurs<br/>● <strong>Portfolio 2026</strong>: Interface interactive 3D WebGL<br/>● <strong>TDR Website</strong>: Plateforme web moderne</p>`;
        } else if (lower === 'contact') {
          resLine.innerHTML = `<p class="term-highlight">Email: contact@gjagueneau.fr | LinkedIn: linkedin.com/in/gabriel-jagueneau | GitHub: @Gabriel-Jagueneau</p>`;
        } else if (lower === 'fastfetch' || lower === 'neofetch') {
          resLine.innerHTML = `
            <div class="term-fastfetch">
              <pre class="term-ascii-logo">
      
    
   
  
  
   
    
      </pre>
              <div class="term-fastfetch-info">
                <p><strong style="color:#58a6ff;">Gabriel Jagueneau</strong> @ MacBook Pro</p>
                <p>-------------------------</p>
                <p><span class="term-key">OS:</span> macOS Sonoma 14.5 (Darwin 23.5.0)</p>
                <p><span class="term-key">Host:</span> MacBookPro18,3 (14-inch, 2024)</p>
                <p><span class="term-key">CPU:</span> Apple M3 Pro (12 Cores)</p>
                <p><span class="term-key">Memory:</span> 18 GB Unified LPDDR5</p>
              </div>
            </div>`;
        } else if (lower === 'matrix') {
          resLine.innerHTML = `<p style="color:#22c55e; font-family:monospace; line-height:1.2;">01010110 01100101 01110010 01110100 00100000 01000001 01100111 01110010 01101111 00100000 01010100 01100101 01100011 01101000<br/>Wake up, Neo... The Matrix has you.<br/>Follow the green code stream.</p>`;
        } else if (lower === 'clear') {
          output.innerHTML = '';
          container.scrollTop = 0;
          return;
        } else if (lower === 'ls') {
          resLine.innerHTML = `<p><span style="color:#58a6ff;">Applications/</span> &nbsp; <span style="color:#58a6ff;">Projects/</span> &nbsp; <span>developpeur.js</span> &nbsp; <span>skills.py</span> &nbsp; <span>CV_Gabriel.pdf</span> &nbsp; <span>index.html</span></p>`;
        } else if (lower.startsWith('cat ')) {
          const target = lower.replace('cat ', '').trim();
          if (target.includes('dev') || target.includes('.js')) {
            resLine.innerHTML = `<pre class="term-code">const dev = { nom: "Gabriel Jagueneau", formation: "Agronome & Dev", statut: "Disponible" };</pre>`;
          } else if (target.includes('skills') || target.includes('.py')) {
            resLine.innerHTML = `<pre class="term-code">skills = {"languages": ["JS", "Python", "SQL"], "frameworks": ["React", "FastAPI"]}</pre>`;
          } else if (target.includes('cv') || target.includes('resume')) {
            resLine.innerHTML = `<p class="term-success">Gabriel Jagueneau - Curriculum Vitae : Double compétence Agronomie + Informatique.</p>`;
          } else {
            resLine.innerHTML = `<p class="term-muted">cat: ${escapeHtml(target)}: No such file or directory</p>`;
          }
        } else if (lower.startsWith('open ')) {
          const app = lower.replace('open ', '').trim().toLowerCase();
          if (app.includes('safari')) spawnOrFocusWindow('Safari');
          else if (app.includes('code') || app.includes('vs')) spawnOrFocusWindow('Code');
          else if (app.includes('music')) spawnOrFocusWindow('Music');
          else if (app.includes('calc')) spawnOrFocusWindow('Calculator');
          else if (app.includes('setting')) spawnOrFocusWindow('Settings');
          else if (app.includes('finder')) spawnOrFocusWindow('Finder');
          else resLine.innerHTML = `<p class="term-err">Unable to open application '${escapeHtml(app)}'.</p>`;
        } else if (lower === 'date') {
          resLine.innerHTML = `<p>${new Date().toString()}</p>`;
        } else if (lower === 'sudo' || lower.startsWith('sudo ')) {
          resLine.innerHTML = `<p class="term-warn">Permission granted: you are root on this machine.</p>`;
        } else {
          resLine.innerHTML = `<p class="term-err">zsh: command not found: ${escapeHtml(cmd)}. Type <span class="term-highlight">'help'</span> for a list of commands.</p>`;
        }

        output.appendChild(resLine);
        container.scrollTop = container.scrollHeight;
      });
    }
  },

  // ── 2. Finder (Native macOS Glass Design) ──
  "Finder": {
    title: "Projects — Finder",
    widthPct: 62, heightPct: 64,
    render: (win) => `
      <div class="app-finder">
        <aside class="finder-sidebar">
          <div class="finder-section-title">Favorites</div>
          <div class="finder-item active" data-folder="projects">
            <span class="finder-item-icon blue">${SVG_ICONS.folder}</span>
            <span>Projects</span>
          </div>
          <div class="finder-item" data-folder="applications">
            <span class="finder-item-icon purple"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg></span>
            <span>Applications</span>
          </div>
          <div class="finder-item" data-folder="documents">
            <span class="finder-item-icon orange"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg></span>
            <span>Documents</span>
          </div>
          <div class="finder-item" data-folder="downloads">
            <span class="finder-item-icon green"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg></span>
            <span>Downloads</span>
          </div>
          <div class="finder-section-title">iCloud</div>
          <div class="finder-item" data-folder="icloud">
            <span class="finder-item-icon cyan"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg></span>
            <span>iCloud Drive</span>
          </div>
        </aside>
        <main class="finder-main">
          <div class="finder-toolbar">
            <div class="finder-nav-arrows">
              <button class="finder-arrow-btn" id="finder-back-${win.id}" title="Back">‹</button>
              <button class="finder-arrow-btn" id="finder-fwd-${win.id}" title="Forward" disabled>›</button>
            </div>
            <div class="finder-breadcrumbs">
              <span class="crumb-icon">${SVG_ICONS.folder}</span>
              <span class="crumb-name" id="finder-title-${win.id}">Projects</span>
            </div>
            <div class="finder-search-box">
              <span class="search-icon">${SVG_ICONS.search}</span>
              <input type="text" class="finder-search-input" id="finder-search-${win.id}" placeholder="Search" />
            </div>
          </div>
          <div class="finder-content" id="finder-items-${win.id}">
            <!-- Items injected by JS -->
          </div>
          <div class="finder-footer" id="finder-foot-${win.id}">4 items, 342.8 GB available</div>
        </main>
      </div>`,
    setup: (win) => {
      const itemsContainer = win.el.querySelector(`#finder-items-${win.id}`);
      const titleEl = win.el.querySelector(`#finder-title-${win.id}`);
      const footEl = win.el.querySelector(`#finder-foot-${win.id}`);
      const searchInput = win.el.querySelector(`#finder-search-${win.id}`);
      const sidebarItems = win.el.querySelectorAll('.finder-item');

      const folderData = {
        projects: [
          { name: "Plintzy", icon: SVG_ICONS.folderProjects, type: "app", open: "Safari", badge: "Startup" },
          { name: "TIPE-Agronomie", icon: SVG_ICONS.folderProjects, type: "app", open: "Code", badge: "Research" },
          { name: "developpeur.js", icon: SVG_ICONS.fileCode, type: "file", open: "Code", targetFile: "developpeur.js" },
          { name: "skills.py", icon: SVG_ICONS.fileCode, type: "file", open: "Code", targetFile: "skills.py" }
        ],
        applications: [
          { name: "Safari.app", icon: SVG_ICONS.fileHtml, open: "Safari" },
          { name: "VS Code.app", icon: SVG_ICONS.fileCode, open: "Code" },
          { name: "Terminal.app", icon: SVG_ICONS.fileCode, open: "Terminal" },
          { name: "Music.app", icon: SVG_ICONS.musicNote, open: "Music" },
          { name: "Calculator.app", icon: SVG_ICONS.calculator, open: "Calculator" },
          { name: "Settings.app", icon: SVG_ICONS.gear, open: "Settings" }
        ],
        documents: [
          { name: "CV_Gabriel_Jagueneau.pdf", icon: SVG_ICONS.filePdf, open: "Safari" },
          { name: "Resume_English.pdf", icon: SVG_ICONS.filePdf, open: "Safari" },
          { name: "contact.json", icon: SVG_ICONS.fileCode, open: "Code", targetFile: "contact.json" },
          { name: "agronomie_model.ts", icon: SVG_ICONS.fileCode, open: "Code", targetFile: "agronomie_model.ts" }
        ],
        downloads: [
          { name: "plintzy-v1.0.apk", icon: SVG_ICONS.fileCode, open: "Safari" },
          { name: "agronomie_paper.pdf", icon: SVG_ICONS.filePdf, open: "Safari" },
          { name: "gjlogo.png", icon: SVG_ICONS.fileHtml, open: "Safari" }
        ],
        icloud: [
          { name: "Portfolio_Archive", icon: SVG_ICONS.folderProjects, open: "Code" },
          { name: "Notes_Agronomie.txt", icon: SVG_ICONS.fileCode, open: "Code" }
        ]
      };

      let currentFolder = 'projects';

      function renderFolder(folderKey, query = '') {
        if (!itemsContainer) return;
        currentFolder = folderKey;
        let list = folderData[folderKey] || folderData.projects;
        if (query) {
          list = list.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
        }
        if (titleEl) titleEl.textContent = folderKey.charAt(0).toUpperCase() + folderKey.slice(1);
        if (footEl) footEl.textContent = `${list.length} items, 342.8 GB available`;

        itemsContainer.innerHTML = list.map(item => `
          <div class="finder-icon" data-open="${item.open}" data-target-file="${item.targetFile || ''}" title="${item.name}">
            <div class="finder-svg-wrap">${item.icon}</div>
            <span class="finder-name-label">${item.name}</span>
          </div>
        `).join('');

        const icons = itemsContainer.querySelectorAll('.finder-icon');
        icons.forEach(ic => {
          ic.addEventListener('click', () => {
            icons.forEach(i => i.classList.remove('selected'));
            ic.classList.add('selected');
          });
          ic.addEventListener('dblclick', () => {
            const targetFile = ic.getAttribute('data-target-file');
            if (targetFile && codeFiles[targetFile]) {
              activeCodeFile = targetFile;
            }
            const targetApp = ic.getAttribute('data-open');
            if (targetApp && appDefinitions[targetApp]) spawnOrFocusWindow(targetApp);
          });
        });
      }

      sidebarItems.forEach(sb => {
        sb.addEventListener('click', () => {
          sidebarItems.forEach(s => s.classList.remove('active'));
          sb.classList.add('active');
          const f = sb.getAttribute('data-folder');
          if (searchInput) searchInput.value = '';
          renderFolder(f);
        });
      });

      searchInput?.addEventListener('input', (e) => {
        renderFolder(currentFolder, e.target.value.trim());
      });

      renderFolder('projects');
    }
  },

  // ── 3. Safari (Apple Web Engine UI) ──
  "Safari": {
    title: "Gabriel Jagueneau — Portfolio",
    widthPct: 70, heightPct: 68,
    render: (win) => `
      <div class="app-safari">
        <header class="safari-header">
          <div class="safari-nav-group">
            <button class="safari-nav-btn" id="safari-back-${win.id}" title="Back">‹</button>
            <button class="safari-nav-btn" id="safari-forward-${win.id}" title="Forward" disabled>›</button>
          </div>
          <div class="safari-address">
            <span class="lock-icon">${SVG_ICONS.lock}</span>
            <span class="safari-protocol">https://</span>
            <input type="text" class="safari-addr-input" id="safari-addr-${win.id}" value="gjagueneau.fr" spellcheck="false" />
            <button class="safari-reload-btn" id="safari-reload-${win.id}" title="Reload">↻</button>
          </div>
          <div class="safari-actions-right">
            <span class="safari-act-btn" title="Share">↗</span>
            <span class="safari-act-btn" title="New Tab">+</span>
          </div>
        </header>
        <div class="safari-tab-bar">
          <div class="safari-tab active">
            <span class="tab-icon">${SVG_ICONS.globe}</span>
            <span class="tab-title" id="safari-tab-title-${win.id}">Gabriel Jagueneau — Portfolio</span>
            <span class="tab-close">×</span>
          </div>
        </div>
        <div class="safari-bookmarks">
          <button class="safari-chip active" data-url="https://gjagueneau.fr">${SVG_ICONS.sparkle} Portfolio</button>
          <button class="safari-chip" data-url="https://plintzy.com">${SVG_ICONS.leaf} Plintzy</button>
          <button class="safari-chip" data-url="https://github.com/Gabriel-Jagueneau">${SVG_ICONS.github} GitHub</button>
          <button class="safari-chip" data-url="https://linkedin.com/in/gabriel-jagueneau">${SVG_ICONS.linkedin} LinkedIn</button>
        </div>
        <main class="safari-body" id="safari-viewport-${win.id}">
          <!-- Dynamic Content -->
        </main>
      </div>`,
    setup: (win) => {
      const addrInput = win.el.querySelector(`#safari-addr-${win.id}`);
      const tabTitle = win.el.querySelector(`#safari-tab-title-${win.id}`);
      const viewport = win.el.querySelector(`#safari-viewport-${win.id}`);
      const reloadBtn = win.el.querySelector(`#safari-reload-${win.id}`);
      const chips = win.el.querySelectorAll('.safari-chip');

      function loadUrl(url) {
        if (!viewport) return;
        viewport.style.opacity = '0.35';
        const displayUrl = url.replace(/^https?:\/\//, '');
        if (addrInput) addrInput.value = displayUrl;

        setTimeout(() => {
          viewport.style.opacity = '1';
          if (url.includes('plintzy')) {
            if (tabTitle) tabTitle.textContent = 'Plintzy — Agronomie Connectée & IA';
            viewport.innerHTML = `
              <div class="safari-page-wrap">
                <div class="safari-brand-badge" style="background:rgba(34, 197, 94, 0.2); border-color:#22c55e; color:#4ade80;"><span style="display:inline-flex; vertical-align:middle; margin-right:3px;">${SVG_ICONS.leaf}</span> STARTUP AGRONOMIQUE</div>
                <h1 class="safari-hero-title" style="background: linear-gradient(90deg, #34c759, #00aeff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Plintzy</h1>
                <p class="safari-hero-desc">L'application mobile & web qui démocratise l'agronomie de précision, le diagnostic végétal par vision par ordinateur et le suivi des parcelles agricoles.</p>
                <div class="safari-feature-grid">
                  <div class="safari-f-card"><strong><span style="display:inline-flex; vertical-align:middle; margin-right:3px;">${SVG_ICONS.aiChip}</span> Diagnostic Vision IA</strong><small>Détection instantanée des carences minérales et bioagresseurs foliaires.</small></div>
                  <div class="safari-f-card"><strong><span style="display:inline-flex; vertical-align:middle; margin-right:3px;">${SVG_ICONS.satellite}</span> Télédétection & SIG</strong><small>Cartographie NDVI, humidité du sol et prévisions micro-climatiques.</small></div>
                  <div class="safari-f-card"><strong><span style="display:inline-flex; vertical-align:middle; margin-right:3px;">${SVG_ICONS.smartphone}</span> Mobile & Web App</strong><small>Architecture réactive (Next.js, TypeScript, Supabase, Tailwind).</small></div>
                </div>
                <div class="safari-action-links">
                  <button class="safari-link-btn" onclick="window.open('https://plintzy.com', '_blank')">Visiter Plintzy.com <span style="display:inline-flex; margin-left:3px;">${SVG_ICONS.externalLink}</span></button>
                  <button class="safari-link-btn secondary" id="safari-view-code-plintzy">Voir le Code Source</button>
                </div>
              </div>`;
            win.el.querySelector('#safari-view-code-plintzy')?.addEventListener('click', () => spawnOrFocusWindow('Code'));
          } else if (url.includes('github')) {
            if (tabTitle) tabTitle.textContent = 'Gabriel Jagueneau (@Gabriel-Jagueneau) · GitHub';
            viewport.innerHTML = `
              <div class="safari-page-wrap">
                <div class="safari-brand-badge" style="background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.25); color:#fff;"><span style="display:inline-flex; vertical-align:middle; margin-right:3px;">${SVG_ICONS.github}</span> GITHUB PROFILE</div>
                <h1 class="safari-hero-title">@Gabriel-Jagueneau</h1>
                <p class="safari-hero-desc">Dépôts open-source, simulations biologiques en Python, interfaces Three.js WebGL et bots interactifs.</p>
                <div class="safari-feature-grid">
                  <div class="safari-f-card"><strong><span style="display:inline-flex; vertical-align:middle; margin-right:3px;">${SVG_ICONS.box}</span> Portfolio-2026</strong><small>Three.js, 3D WebGL Tree, Moteur Physique & macOS UI.</small></div>
                  <div class="safari-f-card"><strong><span style="display:inline-flex; vertical-align:middle; margin-right:3px;">${SVG_ICONS.leaf}</span> plintzy-app</strong><small>React Native, TypeScript, API Node.js & Computer Vision.</small></div>
                  <div class="safari-f-card"><strong><span style="display:inline-flex; vertical-align:middle; margin-right:3px;">${SVG_ICONS.flask}</span> agronomy-tipe</strong><small>Modélisation de croissance et équations différentielles.</small></div>
                </div>
                <div class="safari-action-links">
                  <button class="safari-link-btn" onclick="window.open('https://github.com/Gabriel-Jagueneau', '_blank')">Ouvrir le Profil GitHub <span style="display:inline-flex; margin-left:3px;">${SVG_ICONS.externalLink}</span></button>
                </div>
              </div>`;
          } else if (url.includes('linkedin')) {
            if (tabTitle) tabTitle.textContent = 'Gabriel Jagueneau | LinkedIn';
            viewport.innerHTML = `
              <div class="safari-page-wrap">
                <div class="safari-brand-badge" style="background:rgba(0, 119, 181, 0.2); border-color:#0077b5; color:#38bdf8;"><span style="display:inline-flex; vertical-align:middle; margin-right:3px;">${SVG_ICONS.briefcase}</span> PROFIL PROFESSIONNEL</div>
                <h1 class="safari-hero-title">Gabriel Jagueneau</h1>
                <p class="safari-hero-desc">Élève-Ingénieur Agronome (Bordeaux Sciences Agro) • Lead Developer & Fondateur Plintzy • Passionné par la DeepTech et l'AgTech.</p>
                <div class="safari-feature-grid">
                  <div class="safari-f-card"><strong><span style="display:inline-flex; vertical-align:middle; margin-right:3px;">${SVG_ICONS.graduationCap}</span> Formation d'Excellence</strong><small>CPGE BCPST puis École d'Ingénieurs Agronomes de Bordeaux.</small></div>
                  <div class="safari-f-card"><strong><span style="display:inline-flex; vertical-align:middle; margin-right:3px;">${SVG_ICONS.rocket}</span> Entrepreneuriat</strong><small>Lauréat Pépite & Développement d'applications à fort impact.</small></div>
                </div>
                <div class="safari-action-links">
                  <button class="safari-link-btn" onclick="window.open('https://linkedin.com/in/gabriel-jagueneau', '_blank')">Se connecter sur LinkedIn <span style="display:inline-flex; margin-left:3px;">${SVG_ICONS.externalLink}</span></button>
                </div>
              </div>`;
          } else {
            if (tabTitle) tabTitle.textContent = 'Gabriel Jagueneau — Portfolio';
            viewport.innerHTML = `
              <div class="safari-page-wrap">
                <div class="safari-brand-badge"><span style="display:inline-flex; vertical-align:middle; margin-right:3px;">${SVG_ICONS.sparkle}</span> PORTFOLIO OFFICIEL 2026</div>
                <h1 class="safari-hero-title">Gabriel Jagueneau</h1>
                <p class="safari-hero-desc">Ingénieur Agronome & Développeur Full-Stack. Explorez mon espace interactif, mes projets AgTech et mes stacks techniques.</p>
                <div class="safari-feature-grid">
                  <div class="safari-f-card"><strong><span style="display:inline-flex; vertical-align:middle; margin-right:3px;">${SVG_ICONS.leaf}</span> Agronomie & Modélisation</strong><small>Capteurs IoT, traitement d'images foliaires & analyse de données.</small></div>
                  <div class="safari-f-card"><strong><span style="display:inline-flex; vertical-align:middle; margin-right:3px;">${SVG_ICONS.codeTag}</span> Ingénierie Full-Stack</strong><small>Applications réactives (React, Python, Node.js, WebGL 3D, Supabase).</small></div>
                </div>
                <div class="safari-action-links">
                  <button class="safari-link-btn" id="safari-open-term">Lancer le Terminal</button>
                  <button class="safari-link-btn secondary" id="safari-open-code">Éditeur VS Code</button>
                </div>
              </div>`;

            win.el.querySelector('#safari-open-term')?.addEventListener('click', () => spawnOrFocusWindow('Terminal'));
            win.el.querySelector('#safari-open-code')?.addEventListener('click', () => spawnOrFocusWindow('Code'));
          }
        }, 150);
      }

      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          chips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          loadUrl(chip.getAttribute('data-url'));
        });
      });

      addrInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          let val = addrInput.value.trim();
          if (!val.startsWith('http')) val = 'https://' + val;
          loadUrl(val);
        }
      });

      reloadBtn?.addEventListener('click', () => {
        reloadBtn.style.transform = 'rotate(360deg)';
        reloadBtn.style.transition = 'transform 0.4s ease';
        loadUrl(addrInput ? addrInput.value : 'https://gjagueneau.fr');
        setTimeout(() => { reloadBtn.style.transform = 'none'; reloadBtn.style.transition = 'none'; }, 400);
      });

      loadUrl('https://gjagueneau.fr');
    }
  },

  // ── 4. VS Code (Modern One Dark Pro IDE) ──
  "Code": {
    title: "developpeur.js — Visual Studio Code",
    widthPct: 74, heightPct: 70,
    render: (win) => `
      <div class="app-code">
        <aside class="code-activity-bar">
          <div class="act-icon active" title="Explorer">${SVG_ICONS.fileExplorer}</div>
          <div class="act-icon" title="Search">${SVG_ICONS.search}</div>
          <div class="act-icon" title="Source Control">${SVG_ICONS.gitBranch}</div>
          <div class="act-icon" title="Run & Debug">${SVG_ICONS.playDebug}</div>
          <div class="act-icon" title="Extensions">${SVG_ICONS.extension}</div>
          <div class="act-icon bottom" title="Settings">${SVG_ICONS.gear}</div>
        </aside>
        <aside class="code-sidebar">
          <div class="code-section-header">
            <span class="arrow">▾</span>
            <span>EXPLORER : PORTFOLIO</span>
          </div>
          <div class="code-file-list">
            <div class="code-file ${activeCodeFile === 'developpeur.js' ? 'active' : ''}" data-file="developpeur.js">
              <span class="f-icon js">JS</span>
              <span class="f-name">developpeur.js</span>
            </div>
            <div class="code-file ${activeCodeFile === 'skills.py' ? 'active' : ''}" data-file="skills.py">
              <span class="f-icon py">PY</span>
              <span class="f-name">skills.py</span>
            </div>
            <div class="code-file ${activeCodeFile === 'contact.json' ? 'active' : ''}" data-file="contact.json">
              <span class="f-icon json">{}</span>
              <span class="f-name">contact.json</span>
            </div>
            <div class="code-file ${activeCodeFile === 'agronomie_model.ts' ? 'active' : ''}" data-file="agronomie_model.ts">
              <span class="f-icon ts">TS</span>
              <span class="f-name">agronomie_model.ts</span>
            </div>
          </div>
        </aside>
        <main class="code-editor-wrap">
          <div class="code-tab-header">
            <div class="code-tab active">
              <span class="tab-f-icon" id="code-tab-icon-${win.id}">JS</span>
              <span class="tab-f-name" id="code-tab-name-${win.id}">${activeCodeFile}</span>
              <span class="tab-close">×</span>
            </div>
            <div class="code-editor-actions">
              <button class="code-run-btn" id="code-run-${win.id}">
                <span class="play-icon">${SVG_ICONS.play}</span> Run Code
              </button>
            </div>
          </div>
          <div class="code-breadcrumbs">
            <span>portfolio</span> <span>›</span> <span>src</span> <span>›</span> <span class="active-crumb" id="code-crumb-${win.id}">${activeCodeFile}</span>
          </div>
          <div class="code-main-area">
            <div class="code-gutter" id="code-gutter-${win.id}"></div>
            <textarea class="code-textarea" id="code-area-${win.id}" spellcheck="false">${escapeHtml(codeFiles[activeCodeFile].code)}</textarea>
          </div>
          <div class="code-console-panel">
            <div class="console-tab-row">
              <span class="console-tab active">TERMINAL</span>
              <span class="console-tab">OUTPUT</span>
              <span class="console-tab">PROBLEMS (0)</span>
            </div>
            <div class="code-console-body" id="code-console-${win.id}">
              <span class="console-prompt">gabriel@macbook:~/portfolio $</span>
              <span id="code-output-${win.id}" class="console-text">Prêt. Cliquez sur 'Run Code' pour exécuter le script.</span>
            </div>
          </div>
          <footer class="code-status-bar">
            <div class="status-left">
              <span style="display:inline-flex;align-items:center;gap:3px;">${SVG_ICONS.gitBranch} main*</span>
              <span>↻ 0</span>
              <span style="display:inline-flex;align-items:center;gap:3px;">${SVG_ICONS.alertTriangle} 0</span>
            </div>
            <div class="status-right">
              <span>Ln 1, Col 1</span>
              <span>Spaces: 2</span>
              <span>UTF-8</span>
              <span id="code-status-lang-${win.id}">${codeFiles[activeCodeFile].lang.toUpperCase()}</span>
              <span>Prettier</span>
            </div>
          </footer>
        </main>
      </div>`,
    setup: (win) => {
      const area = win.el.querySelector(`#code-area-${win.id}`);
      const gutter = win.el.querySelector(`#code-gutter-${win.id}`);
      const runBtn = win.el.querySelector(`#code-run-${win.id}`);
      const out = win.el.querySelector(`#code-output-${win.id}`);
      const tabIcon = win.el.querySelector(`#code-tab-icon-${win.id}`);
      const tabName = win.el.querySelector(`#code-tab-name-${win.id}`);
      const crumb = win.el.querySelector(`#code-crumb-${win.id}`);
      const langStatus = win.el.querySelector(`#code-status-lang-${win.id}`);
      const fileTabs = win.el.querySelectorAll('.code-file');

      function updateGutter(text) {
        if (!gutter) return;
        const lineCount = (text.match(/\n/g) || []).length + 1;
        let linesHtml = '';
        for (let i = 1; i <= Math.max(lineCount, 12); i++) {
          linesHtml += `<span>${i}</span>`;
        }
        gutter.innerHTML = linesHtml;
      }

      function loadCodeFile(file) {
        if (!codeFiles[file]) return;
        activeCodeFile = file;
        fileTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-file') === file));
        
        const ext = file.split('.').pop().toUpperCase();
        if (tabIcon) tabIcon.textContent = ext;
        if (tabName) tabName.textContent = file;
        if (crumb) crumb.textContent = file;
        if (langStatus) langStatus.textContent = codeFiles[file].lang.toUpperCase();
        if (area) {
          area.value = codeFiles[file].code;
          updateGutter(area.value);
        }
        if (out) out.innerHTML = `Fichier chargé : <strong style="color:#61afef;">${file}</strong>. Prêt à exécuter.`;
      }

      area?.addEventListener('input', () => {
        updateGutter(area.value);
      });

      area?.addEventListener('scroll', () => {
        if (gutter) gutter.scrollTop = area.scrollTop;
      });

      fileTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const file = tab.getAttribute('data-file');
          if (file) loadCodeFile(file);
        });
      });

      runBtn?.addEventListener('click', () => {
        if (!out) return;
        out.innerHTML = `<span style="color:#58a6ff;">[node execution] Lancement de ${activeCodeFile}...</span>`;
        setTimeout(() => {
          if (activeCodeFile === "developpeur.js") {
            out.innerHTML = `<span style="color:#34c759;">[Sortie] Lancement : Innovation végétale, tech & design !</span><br/><span style="color:#98c379;">Done in 0.08s.</span>`;
          } else if (activeCodeFile === "skills.py") {
            out.innerHTML = `<span style="color:#34c759;">[FRONTEND] : React, Next.js, TypeScript, Three.js<br/>[BACKEND] : Node.js, Python, PostgreSQL, FastAPI<br/>[AGRONOMIE] : Modélisation biologique, SIG/QGIS</span>`;
          } else if (activeCodeFile === "agronomie_model.ts") {
            out.innerHTML = `<span style="color:#34c759;">[Health Index] Optimal Canopy Health (Score: 85.6/100)</span><br/><span style="color:#61afef;">✓ Capteurs IoT synchronisés.</span>`;
          } else {
            out.innerHTML = `<span style="color:#58a6ff;">[JSON Validated] ✓ Profil Gabriel Jagueneau prêt pour recrutement & partenariats.</span>`;
          }
        }, 220);
      });

      if (area) updateGutter(area.value);
    }
  },

  // ── 5. Apple Music (Authentic macOS Player) ──
  "Music": {
    title: "Music",
    widthPct: 60, heightPct: 65,
    render: (win) => {
      const track = musicTracks[currentTrackIdx];
      const mins = Math.floor(musicCurrentSec / 60);
      const secs = String(musicCurrentSec % 60).padStart(2, '0');
      const remSecs = Math.max(0, track.duration - musicCurrentSec);
      const remMins = Math.floor(remSecs / 60);
      const remSecsStr = String(remSecs % 60).padStart(2, '0');
      const pct = Math.min(100, (musicCurrentSec / track.duration) * 100);

      return `
        <div class="app-music">
          <aside class="music-sidebar">
            <div class="music-side-header">Apple Music</div>
            <div class="music-side-item active">
              <span class="side-icon">${SVG_ICONS.listenPlay}</span> Écouter
            </div>
            <div class="music-side-item">
              <span class="side-icon">${SVG_ICONS.radio}</span> Radio
            </div>
            <div class="music-side-item">
              <span class="side-icon">${SVG_ICONS.compass}</span> Explorer
            </div>
            <div class="music-side-header" style="margin-top:6px;">Bibliothèque</div>
            <div class="music-side-item">
              <span class="side-icon">${SVG_ICONS.clock}</span> Récents
            </div>
            <div class="music-side-item">
              <span class="side-icon">${SVG_ICONS.playlist}</span> Playlists
            </div>
          </aside>

          <main class="music-main-content">
            <!-- Now Playing Top Bar / Hero -->
            <div class="music-hero-card">
              <div class="music-cover" id="music-cover-${win.id}" style="background: ${track.color};">
                ${track.icon}
              </div>
              <div class="music-meta">
                <div class="music-track" id="music-track-${win.id}">${track.title}</div>
                <div class="music-artist" id="music-artist-${win.id}">${track.artist}</div>
                <div class="music-equalizer ${isMusicPlaying ? 'playing' : ''}" id="music-eq-${win.id}">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
              </div>
            </div>

            <!-- Transport & Scrubber Controls -->
            <div class="music-player-controls">
              <div class="music-buttons-row">
                <button class="music-btn secondary" id="music-shuffle-${win.id}" title="Shuffle">${SVG_ICONS.shuffle}</button>
                <button class="music-btn" id="music-prev-${win.id}" title="Previous">${SVG_ICONS.prev}</button>
                <button class="music-btn play-btn" id="music-play-${win.id}" title="Play/Pause">
                  ${isMusicPlaying ? SVG_ICONS.pause : SVG_ICONS.play}
                </button>
                <button class="music-btn" id="music-next-${win.id}" title="Next">${SVG_ICONS.next}</button>
                <button class="music-btn secondary" id="music-repeat-${win.id}" title="Repeat">${SVG_ICONS.repeat}</button>
              </div>

              <div class="music-progress-wrap" id="music-prog-wrap-${win.id}">
                <span class="time-lbl" id="music-time-curr-${win.id}">${mins}:${secs}</span>
                <div class="music-progress">
                  <div class="music-bar" id="music-bar-${win.id}" style="width: ${pct}%;"></div>
                </div>
                <span class="time-lbl" id="music-time-rem-${win.id}">-${remMins}:${remSecsStr}</span>
              </div>

              <div class="music-volume-row">
                <span class="vol-icon">${SVG_ICONS.sound}</span>
                <input type="range" class="macos-slider music-vol-slider" id="music-vol-${win.id}" min="0" max="100" value="${musicVolume}" />
              </div>
            </div>

            <!-- Up Next Queue -->
            <div class="music-queue-section">
              <div class="queue-title">À suivre</div>
              <div class="music-playlist">
                ${musicTracks.map((t, idx) => `
                  <div class="playlist-item ${idx === currentTrackIdx ? 'active' : ''}" data-track-idx="${idx}">
                    <span class="p-index">${idx === currentTrackIdx && isMusicPlaying ? SVG_ICONS.play : (idx + 1)}</span>
                    <div class="p-thumb" style="background:${t.color};">${t.icon}</div>
                    <div class="p-info">
                      <div class="p-title">${t.title}</div>
                      <div class="p-sub">${t.artist.split('•')[0]}</div>
                    </div>
                    <span class="p-dur">${Math.floor(t.duration/60)}:${String(t.duration%60).padStart(2,'0')}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </main>
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
      const eq = win.el.querySelector(`#music-eq-${win.id}`);
      const volSlider = win.el.querySelector(`#music-vol-${win.id}`);
      const playlistItems = win.el.querySelectorAll('.playlist-item');

      function updateMusicUI() {
        const track = musicTracks[currentTrackIdx];
        if (trackName) trackName.textContent = track.title;
        if (artistName) artistName.textContent = track.artist;
        if (cover) {
          cover.style.background = track.color;
          cover.innerHTML = track.icon;
        }
        if (playBtn) playBtn.innerHTML = isMusicPlaying ? SVG_ICONS.pause : SVG_ICONS.play;
        if (eq) eq.classList.toggle('playing', isMusicPlaying);

        const mins = Math.floor(musicCurrentSec / 60);
        const secs = String(musicCurrentSec % 60).padStart(2, '0');
        const remSecs = Math.max(0, track.duration - musicCurrentSec);
        const remMins = Math.floor(remSecs / 60);
        const remSecsStr = String(remSecs % 60).padStart(2, '0');

        if (timeCurr) timeCurr.textContent = `${mins}:${secs}`;
        if (timeRem) timeRem.textContent = `-${remMins}:${remSecsStr}`;
        if (bar) bar.style.width = `${(musicCurrentSec / track.duration) * 100}%`;

        playlistItems.forEach((it, idx) => {
          it.classList.toggle('active', idx === currentTrackIdx);
          const pIndex = it.querySelector('.p-index');
          if (pIndex) pIndex.textContent = (idx === currentTrackIdx && isMusicPlaying) ? '▶' : (idx + 1);
        });
      }

      playBtn?.addEventListener('click', () => {
        isMusicPlaying = !isMusicPlaying;
        if (isMusicPlaying) {
          startMusicAudio();
          clearInterval(musicInterval);
          musicInterval = setInterval(() => {
            const track = musicTracks[currentTrackIdx];
            musicCurrentSec = (musicCurrentSec + 1) % track.duration;
            updateMusicUI();
          }, 1000);
        } else {
          stopMusicAudio();
          clearInterval(musicInterval);
        }
        updateMusicUI();
      });

      nextBtn?.addEventListener('click', () => {
        currentTrackIdx = (currentTrackIdx + 1) % musicTracks.length;
        musicCurrentSec = 0;
        if (isMusicPlaying) startMusicAudio();
        updateMusicUI();
      });

      prevBtn?.addEventListener('click', () => {
        currentTrackIdx = (currentTrackIdx - 1 + musicTracks.length) % musicTracks.length;
        musicCurrentSec = 0;
        if (isMusicPlaying) startMusicAudio();
        updateMusicUI();
      });

      playlistItems.forEach((it, idx) => {
        it.addEventListener('click', () => {
          currentTrackIdx = idx;
          musicCurrentSec = 0;
          isMusicPlaying = true;
          startMusicAudio();
          clearInterval(musicInterval);
          musicInterval = setInterval(() => {
            const track = musicTracks[currentTrackIdx];
            musicCurrentSec = (musicCurrentSec + 1) % track.duration;
            updateMusicUI();
          }, 1000);
          updateMusicUI();
        });
      });

      progWrap?.addEventListener('click', (e) => {
        const rect = progWrap.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, clickX / rect.width));
        const track = musicTracks[currentTrackIdx];
        musicCurrentSec = Math.floor(ratio * track.duration);
        updateMusicUI();
      });

      volSlider?.addEventListener('input', (e) => {
        musicVolume = Number(e.target.value);
        if (audioGainNode && audioCtx) {
          audioGainNode.gain.setValueAtTime((musicVolume / 100) * 0.12, audioCtx.currentTime);
        }
      });
    }
  },


  // ── 6. Calculator (Apple Native Logic) ──
  "Calculator": {
    title: "Calculator",
    widthPct: 36, heightPct: 56,
    render: (win) => `
      <div class="app-calculator" id="calc-app-${win.id}">
        <div class="calc-display" id="calc-disp-${win.id}">
          <div class="calc-expr" id="calc-expr-${win.id}"></div>
          <div class="calc-main-value" id="calc-val-${win.id}">${calcState.displayValue.replace('.', ',')}</div>
        </div>
        <div class="calc-grid">
          <button class="calc-btn fn" id="calc-clear-btn-${win.id}" data-action="clear">${calcState.displayValue === '0' || calcState.clearAll ? 'AC' : 'C'}</button>
          <button class="calc-btn fn" data-action="sign">±</button>
          <button class="calc-btn fn" data-action="percent">%</button>
          <button class="calc-btn op ${calcState.operator === '/' && calcState.waitingForSecondOperand ? 'active' : ''}" data-action="op" data-val="/">÷</button>

          <button class="calc-btn num" data-val="7">7</button>
          <button class="calc-btn num" data-val="8">8</button>
          <button class="calc-btn num" data-val="9">9</button>
          <button class="calc-btn op ${calcState.operator === '*' && calcState.waitingForSecondOperand ? 'active' : ''}" data-action="op" data-val="*">×</button>

          <button class="calc-btn num" data-val="4">4</button>
          <button class="calc-btn num" data-val="5">5</button>
          <button class="calc-btn num" data-val="6">6</button>
          <button class="calc-btn op ${calcState.operator === '-' && calcState.waitingForSecondOperand ? 'active' : ''}" data-action="op" data-val="-">−</button>

          <button class="calc-btn num" data-val="1">1</button>
          <button class="calc-btn num" data-val="2">2</button>
          <button class="calc-btn num" data-val="3">3</button>
          <button class="calc-btn op ${calcState.operator === '+' && calcState.waitingForSecondOperand ? 'active' : ''}" data-action="op" data-val="+">+</button>

          <button class="calc-btn num zero" data-val="0">0</button>
          <button class="calc-btn num" data-val=".">,</button>
          <button class="calc-btn op" data-action="equals">=</button>
        </div>
      </div>`,
    setup: (win) => {
      const valEl = win.el.querySelector(`#calc-val-${win.id}`);
      const exprEl = win.el.querySelector(`#calc-expr-${win.id}`);
      const clearBtn = win.el.querySelector(`#calc-clear-btn-${win.id}`);
      const grid = win.el.querySelector('.calc-grid');

      function updateCalcUI() {
        if (valEl) {
          valEl.textContent = calcState.displayValue.replace('.', ',');
          const len = calcState.displayValue.length;
          if (len > 12) valEl.style.fontSize = '14px';
          else if (len > 9) valEl.style.fontSize = '20px';
          else valEl.style.fontSize = '';
        }
        if (exprEl) {
          const opMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
          if (calcState.operator && calcState.firstOperand !== null) {
            exprEl.textContent = `${formatCalcNumber(calcState.firstOperand).replace('.', ',')} ${opMap[calcState.operator] || calcState.operator}`;
          } else {
            exprEl.textContent = '';
          }
        }
        if (clearBtn) {
          clearBtn.textContent = (calcState.displayValue === '0' || calcState.clearAll) ? 'AC' : 'C';
        }
        grid?.querySelectorAll('.calc-btn.op').forEach(btn => {
          const opVal = btn.getAttribute('data-val');
          btn.classList.toggle('active', Boolean(calcState.operator && calcState.waitingForSecondOperand && opVal === calcState.operator));
        });
      }

      function handleCalcInput(action, val) {
        if (action === 'num') {
          if (val === '.' || val === ',') {
            if (calcState.waitingForSecondOperand || calcState.displayValue === 'Erreur') {
              calcState.displayValue = '0.';
              calcState.waitingForSecondOperand = false;
            } else if (!calcState.displayValue.includes('.')) {
              calcState.displayValue += '.';
            }
            calcState.clearAll = false;
          } else if (val >= '0' && val <= '9') {
            if (calcState.waitingForSecondOperand || calcState.displayValue === '0' || calcState.displayValue === 'Erreur') {
              calcState.displayValue = String(val);
              calcState.waitingForSecondOperand = false;
            } else {
              if (calcState.displayValue.replace('-', '').replace('.', '').length < 10) {
                calcState.displayValue += String(val);
              }
            }
            calcState.clearAll = false;
          }
        } else if (action === 'clear') {
          if (calcState.displayValue !== '0' && !calcState.clearAll) {
            calcState.displayValue = '0';
            calcState.clearAll = true;
          } else {
            calcState.displayValue = '0';
            calcState.firstOperand = null;
            calcState.operator = null;
            calcState.waitingForSecondOperand = false;
            calcState.clearAll = true;
          }
        } else if (action === 'sign') {
          if (calcState.displayValue !== '0' && calcState.displayValue !== 'Erreur') {
            const num = parseFloat(calcState.displayValue);
            calcState.displayValue = formatCalcNumber(-num);
          }
        } else if (action === 'percent') {
          if (calcState.displayValue !== 'Erreur') {
            const current = parseFloat(calcState.displayValue);
            if (calcState.firstOperand !== null && calcState.operator) {
              calcState.displayValue = formatCalcNumber((calcState.firstOperand * current) / 100);
            } else {
              calcState.displayValue = formatCalcNumber(current / 100);
            }
          }
        } else if (action === 'op') {
          const inputValue = parseFloat(calcState.displayValue);
          if (calcState.operator && calcState.waitingForSecondOperand) {
            calcState.operator = val;
          } else {
            if (calcState.firstOperand === null && !isNaN(inputValue)) {
              calcState.firstOperand = inputValue;
            } else if (calcState.operator && calcState.firstOperand !== null) {
              const result = performCalc(calcState.operator, calcState.firstOperand, inputValue);
              calcState.displayValue = formatCalcNumber(result);
              calcState.firstOperand = result === 'Erreur' ? null : result;
            }
            calcState.waitingForSecondOperand = true;
            calcState.operator = val;
          }
        } else if (action === 'equals') {
          const inputValue = parseFloat(calcState.displayValue);
          if (calcState.operator && calcState.firstOperand !== null) {
            const result = performCalc(calcState.operator, calcState.firstOperand, inputValue);
            calcState.displayValue = formatCalcNumber(result);
            calcState.firstOperand = null;
            calcState.operator = null;
            calcState.waitingForSecondOperand = false;
            calcState.clearAll = false;
          }
        }
        updateCalcUI();
      }

      grid?.addEventListener('click', (e) => {
        const btn = e.target.closest('.calc-btn');
        if (!btn) return;
        const val = btn.getAttribute('data-val');
        const action = btn.getAttribute('data-action');
        if (btn.classList.contains('num')) {
          handleCalcInput('num', val);
        } else {
          handleCalcInput(action, val);
        }
      });

      const keyHandler = (e) => {
        if (!win.el.classList.contains('active-window')) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key >= '0' && e.key <= '9') {
          e.preventDefault();
          handleCalcInput('num', e.key);
        } else if (e.key === '.' || e.key === ',') {
          e.preventDefault();
          handleCalcInput('num', '.');
        } else if (e.key === '+') {
          e.preventDefault();
          handleCalcInput('op', '+');
        } else if (e.key === '-') {
          e.preventDefault();
          handleCalcInput('op', '-');
        } else if (e.key === '*') {
          e.preventDefault();
          handleCalcInput('op', '*');
        } else if (e.key === '/') {
          e.preventDefault();
          handleCalcInput('op', '/');
        } else if (e.key === 'Enter' || e.key === '=') {
          e.preventDefault();
          handleCalcInput('equals');
        } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          handleCalcInput('clear');
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          if (calcState.displayValue.length > 1 && calcState.displayValue !== 'Erreur') {
            calcState.displayValue = calcState.displayValue.slice(0, -1);
          } else {
            calcState.displayValue = '0';
          }
          updateCalcUI();
        } else if (e.key === '%') {
          e.preventDefault();
          handleCalcInput('percent');
        }
      };

      document.addEventListener('keydown', keyHandler);
      win.cleanup = () => document.removeEventListener('keydown', keyHandler);

      updateCalcUI();
    }
  },

  // ── 7. System Settings ──
  "Settings": {
    title: "System Settings",
    widthPct: 60, heightPct: 64,
    render: (win) => `
      <div class="app-settings-macos">
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

        <main class="settings-pane" id="settings-pane-${win.id}">
          <!-- Content dynamically rendered -->
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
                  <div class="theme-preview light-theme"><div class="mini-win"></div></div>
                  <span>Light</span>
                </div>
                <div class="theme-option ${settingsState.darkmode ? 'selected' : ''}" data-mode="dark">
                  <div class="theme-preview dark-theme"><div class="mini-win"></div></div>
                  <span>Dark</span>
                </div>
                <div class="theme-option" data-mode="auto">
                  <div class="theme-preview auto-theme"><div class="mini-win-split"></div></div>
                  <span>Auto</span>
                </div>
              </div>

              <div class="settings-card-group" style="margin-top:12px;">
                <div class="card-row">
                  <span class="card-row-title">Accent Color</span>
                  <div class="accent-dots">
                    <span class="accent-dot blue ${settingsState.accentColor === 'blue' ? 'selected' : ''}" data-color="blue"></span>
                    <span class="accent-dot purple ${settingsState.accentColor === 'purple' ? 'selected' : ''}" data-color="purple"></span>
                    <span class="accent-dot pink ${settingsState.accentColor === 'pink' ? 'selected' : ''}" data-color="pink"></span>
                    <span class="accent-dot red ${settingsState.accentColor === 'red' ? 'selected' : ''}" data-color="red"></span>
                    <span class="accent-dot orange ${settingsState.accentColor === 'orange' ? 'selected' : ''}" data-color="orange"></span>
                    <span class="accent-dot green ${settingsState.accentColor === 'green' ? 'selected' : ''}" data-color="green"></span>
                    <span class="accent-dot graphite ${settingsState.accentColor === 'graphite' ? 'selected' : ''}" data-color="graphite"></span>
                  </div>
                </div>
              </div>
            </div>`;

          const themeOpts = pane.querySelectorAll('.theme-option');
          themeOpts.forEach(opt => {
            opt.addEventListener('click', () => {
              themeOpts.forEach(t => t.classList.remove('selected'));
              opt.classList.add('selected');
              settingsState.darkmode = opt.getAttribute('data-mode') !== 'light';
              document.querySelector('.macos-container')?.classList.toggle('light-mode', !settingsState.darkmode);
            });
          });

          const dots = pane.querySelectorAll('.accent-dot');
          dots.forEach(d => {
            d.addEventListener('click', () => {
              dots.forEach(x => x.classList.remove('selected'));
              d.classList.add('selected');
              settingsState.accentColor = d.getAttribute('data-color');
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
                  <input type="range" class="macos-slider" id="disp-bright-${win.id}" min="20" max="100" value="${settingsState.brightness}" />
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
              </div>
            </div>`;

          pane.querySelector(`#disp-bright-${win.id}`)?.addEventListener('input', (e) => {
            settingsState.brightness = Number(e.target.value);
            const overlay = document.getElementById('mac-brightness-overlay');
            if (overlay) overlay.style.opacity = `${(100 - settingsState.brightness) * 0.007}`;
          });
        } else if (cat === 'sound') {
          pane.innerHTML = `
            <div class="settings-section">
              <h2>Sound</h2>
              <div class="settings-card-group">
                <div class="card-row">
                  <span class="card-row-title">Output Volume</span>
                  <div style="display:flex; align-items:center; gap:8px; flex:1; max-width:180px; justify-content:flex-end;">
                    <span>${SVG_ICONS.sound}</span>
                    <input type="range" class="macos-slider" min="0" max="100" value="${settingsState.soundVolume}" style="width:120px;" />
                  </div>
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
                <div class="battery-bar-wrap"><div class="battery-bar-fill" style="width:100%;"></div></div>
                <small style="color:rgba(255,255,255,0.5); font-size:8px;">Power Source: Power Adapter • Fully Charged</small>
              </div>
            </div>`;
        } else {
          // General / Profile
          pane.innerHTML = `
            <div class="settings-section">
              <div class="about-mac-hero">
                <div class="apple-logo-badge">${SVG_ICONS.apple}</div>
                <div class="about-mac-title">MacBook Pro 14"</div>
                <div class="about-mac-sub">Apple M3 Pro • 18 GB Unified Memory</div>
                <div class="about-mac-os">macOS Sonoma 14.5</div>
              </div>
              <div class="settings-card-group" style="margin-top:10px;">
                <div class="card-row"><span class="card-row-title">Owner</span><strong style="color:#fff;">Gabriel Jagueneau</strong></div>
                <div class="card-row"><span class="card-row-title">Role</span><span style="color:#58a6ff;">Ingénieur Agronome & Dev</span></div>
                <div class="card-row"><span class="card-row-title">Storage</span><span>512 GB SSD (340 GB Free)</span></div>
                <div class="card-row"><span class="card-row-title">AppleCare+</span><span style="color:#34c759;">Active Coverage</span></div>
              </div>
            </div>`;
        }
      }

      renderCategory('wifi');

      navItems.forEach(item => {
        item.addEventListener('click', () => {
          navItems.forEach(n => n.classList.remove('active'));
          userCard?.classList.remove('active');
          item.classList.add('active');
          renderCategory(item.getAttribute('data-cat'));
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

// ═══════════════════════════════════════════════════════════════════════════════
// Window Manager & Lifecycle
// ═══════════════════════════════════════════════════════════════════════════════
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

  const count = openWindows.size;
  const offsetX = (count * 18) % Math.max(20, desktopW - widthPx - 20);
  const offsetY = (count * 14) % Math.max(16, desktopH - heightPx - 30);
  const posX = Math.max(8, 14 + offsetX);
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

  win.addEventListener('mousedown', () => focusWindow(instance));

  win.querySelector('.dot.close')?.addEventListener('click', (e) => { e.stopPropagation(); closeWindow(instance); });
  win.querySelector('.dot.minimize')?.addEventListener('click', (e) => { e.stopPropagation(); minimizeWindow(instance); });
  win.querySelector('.dot.maximize')?.addEventListener('click', (e) => { e.stopPropagation(); toggleMaximizeWindow(instance); });

  // Double click header to maximize
  win.querySelector('.window-header')?.addEventListener('dblclick', (e) => {
    if (!e.target.closest('.dots')) toggleMaximizeWindow(instance);
  });

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
}

function focusWindow(instance) {
  document.querySelectorAll('.desktop .window').forEach(w => w.classList.remove('active-window'));
  instance.el.classList.add('active-window');
  instance.el.style.zIndex = `${++highestZIndex}`;
  setActiveApp(instance.appName);
}

function closeWindow(instance) {
  if (instance.cleanup) instance.cleanup();
  instance.el.style.opacity   = '0';
  instance.el.style.transform = 'scale(0.92) translateY(-10px)';
  instance.el.style.filter    = 'blur(6px)';

  setTimeout(() => {
    instance.el.remove();
    openWindows.delete(instance.appName);
    updateDockDots();

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
  }, 280);
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
    instance.prevBounds = { width: win.style.width, height: win.style.height, left: win.style.left, top: win.style.top };
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
    if (e.target.closest('.dots')) return;
    if (instance.isMaximized) return;

    e.preventDefault();
    focusWindow(instance);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialLeft = win.offsetLeft;
    const initialTop  = win.offsetTop;
    const desktopW = desktop.offsetWidth || 500;
    const desktopH = desktop.offsetHeight || 300;

    const dRect = desktop.getBoundingClientRect();
    const scale = (desktop.offsetWidth > 0 ? dRect.width / desktop.offsetWidth : 1) || 1;

    function onMouseMove(e) {
      const dx = (e.clientX - startX) / scale;
      const dy = (e.clientY - startY) / scale;

      let newLeft = initialLeft + dx;
      let newTop  = initialTop + dy;

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

// ═══════════════════════════════════════════════════════════════════════════════
// Menu Bar Dropdowns & Overlays (Apple Menu, Popovers, Control Center, Spotlight)
// ═══════════════════════════════════════════════════════════════════════════════
function closeAllPopovers() {
  document.querySelectorAll('.mac-popover').forEach(p => p.remove());
  activePopover = null;
}

function openPopover(targetEl, popoverHtml, customClass = '') {
  closeAllPopovers();
  const macContainer = document.querySelector('.macos-container');
  if (!macContainer) return;

  const popover = document.createElement('div');
  popover.className = `mac-popover ${customClass}`;
  popover.innerHTML = popoverHtml;

  const targetRect = targetEl.getBoundingClientRect();
  const macRect = macContainer.getBoundingClientRect();

  const relLeft = targetRect.left - macRect.left;
  const relRight = macRect.right - targetRect.right;

  if (relLeft < macRect.width * 0.5) {
    popover.style.left = `${Math.max(6, relLeft)}px`;
  } else {
    popover.style.right = `${Math.max(6, relRight)}px`;
  }
  popover.style.top = '22px';

  macContainer.appendChild(popover);
  activePopover = popover;

  popover.addEventListener('mousedown', (e) => e.stopPropagation());
}

function initMenuInteractions() {
  const appleBtn = document.getElementById('mac-menu-apple');
  const batteryBtn = document.getElementById('mac-menu-battery');
  const wifiBtn = document.getElementById('mac-menu-wifi');
  const ccBtn = document.getElementById('mac-menu-control-center');
  const spotlightBtn = document.getElementById('mac-menu-spotlight');

  // Apple Menu Dropdown
  appleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activePopover) { closeAllPopovers(); return; }

    const html = `
      <div class="menu-dropdown-list">
        <div class="menu-drop-item" data-action="about">À propos de ce Mac</div>
        <div class="menu-drop-sep"></div>
        <div class="menu-drop-item" data-action="settings">Réglages Système...</div>
        <div class="menu-drop-item" data-action="appstore">App Store...</div>
        <div class="menu-drop-sep"></div>
        <div class="menu-drop-item" data-action="forcequit">Forcer à quitter... <span>⌥⌘⎋</span></div>
        <div class="menu-drop-sep"></div>
        <div class="menu-drop-item" data-action="sleep">Mettre en veille</div>
        <div class="menu-drop-item" data-action="restart">Redémarrer...</div>
        <div class="menu-drop-item" data-action="shutdown">Éteindre...</div>
        <div class="menu-drop-sep"></div>
        <div class="menu-drop-item" data-action="lock">Verrouiller l'écran <span>^⌘Q</span></div>
      </div>`;

    openPopover(appleBtn, html, 'apple-menu-popover');

    document.querySelectorAll('.menu-drop-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        closeAllPopovers();
        if (action === 'settings') spawnOrFocusWindow('Settings');
        else if (action === 'about') showAboutMacModal();
        else if (action === 'lock') lockScreen();
        else if (action === 'sleep') sleepScreen();
        else if (action === 'restart' || action === 'shutdown') {
          alert("Action simulée : Redémarrage de macOS");
        }
      });
    });
  });

  // Battery Popover
  batteryBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activePopover) { closeAllPopovers(); return; }
    const html = `
      <div class="battery-popover-content">
        <div class="pop-header"><strong>Batterie</strong> <span>100%</span></div>
        <div class="pop-sub">Source d'alimentation : Adaptateur secteur</div>
        <div class="pop-sep"></div>
        <div class="pop-item" id="pop-open-battery">Réglages Batterie...</div>
      </div>`;
    openPopover(batteryBtn, html);
    document.getElementById('pop-open-battery')?.addEventListener('click', () => {
      closeAllPopovers();
      spawnOrFocusWindow('Settings');
    });
  });

  // Wi-Fi Popover
  wifiBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activePopover) { closeAllPopovers(); return; }
    const html = `
      <div class="wifi-popover-content">
        <div class="pop-header">
          <strong>Wi-Fi</strong>
          <label class="macos-switch small"><input type="checkbox" id="pop-wifi-tog" ${settingsState.wifi ? 'checked' : ''}/><span class="slider"></span></label>
        </div>
        <div class="pop-sep"></div>
        <div class="pop-section-title">Réseau actuel</div>
        <div class="pop-item active">${SVG_ICONS.wifi} Gabriel-5G <span class="check">${SVG_ICONS.check}</span></div>
        <div class="pop-section-title">Autres réseaux</div>
        <div class="pop-item">${SVG_ICONS.wifi} Campus-Student-Wi-Fi <span class="lock">${SVG_ICONS.lock}</span></div>
        <div class="pop-item">${SVG_ICONS.wifi} Plintzy-Office-Network <span class="lock">${SVG_ICONS.lock}</span></div>
      </div>`;
    openPopover(wifiBtn, html);
    document.getElementById('pop-wifi-tog')?.addEventListener('change', (ev) => {
      settingsState.wifi = ev.target.checked;
    });
  });

  // Control Center Popover
  ccBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activePopover) { closeAllPopovers(); return; }
    const track = musicTracks[currentTrackIdx];

    const html = `
      <div class="control-center-panel">
        <div class="cc-row top-modules">
          <div class="cc-module connectivity-box">
            <div class="cc-toggle-item ${settingsState.wifi ? 'active' : ''}" id="cc-tog-wifi">
              <span class="cc-icon-circle">${SVG_ICONS.wifi}</span>
              <div><div class="cc-label">Wi-Fi</div><small>${settingsState.wifi ? 'Gabriel-5G' : 'Off'}</small></div>
            </div>
            <div class="cc-toggle-item ${settingsState.bluetooth ? 'active' : ''}" id="cc-tog-bt">
              <span class="cc-icon-circle">${SVG_ICONS.bluetooth}</span>
              <div><div class="cc-label">Bluetooth</div><small>${settingsState.bluetooth ? 'On' : 'Off'}</small></div>
            </div>
            <div class="cc-toggle-item ${settingsState.airdrop ? 'active' : ''}" id="cc-tog-airdrop">
              <span class="cc-icon-circle">${SVG_ICONS.airdrop}</span>
              <div><div class="cc-label">AirDrop</div><small>${settingsState.airdrop ? 'Contacts' : 'Off'}</small></div>
            </div>
          </div>
          <div class="cc-column right-tiles">
            <div class="cc-tile ${settingsState.darkmode ? 'active' : ''}" id="cc-tog-dark">
              <span class="tile-icon">${SVG_ICONS.moon}</span>
              <span>Mode Sombre</span>
            </div>
            <div class="cc-tile" id="cc-open-calc">
              <span class="tile-icon">${SVG_ICONS.calculator}</span>
              <span>Calculatrice</span>
            </div>
          </div>
        </div>

        <div class="cc-slider-card">
          <div class="slider-title">Affichage (${settingsState.brightness}%)</div>
          <input type="range" class="macos-slider big" id="cc-disp-slider" min="20" max="100" value="${settingsState.brightness}" />
        </div>

        <div class="cc-slider-card">
          <div class="slider-title">Son (${settingsState.soundVolume}%)</div>
          <input type="range" class="macos-slider big" id="cc-sound-slider" min="0" max="100" value="${settingsState.soundVolume}" />
        </div>

        <div class="cc-now-playing-card">
          <div class="mini-cover" style="background:${track.color};">${track.icon}</div>
          <div class="mini-meta">
            <strong>${track.title}</strong>
            <small>${track.artist.split('•')[0]}</small>
          </div>
          <button class="cc-play-btn" id="cc-play-btn">${isMusicPlaying ? '⏸' : '▶'}</button>
        </div>
      </div>`;

    openPopover(ccBtn, html, 'cc-popover');

    const wifiTog = document.getElementById('cc-tog-wifi');
    wifiTog?.addEventListener('click', () => {
      settingsState.wifi = !settingsState.wifi;
      wifiTog.classList.toggle('active', settingsState.wifi);
    });

    const btTog = document.getElementById('cc-tog-bt');
    btTog?.addEventListener('click', () => {
      settingsState.bluetooth = !settingsState.bluetooth;
      btTog.classList.toggle('active', settingsState.bluetooth);
    });

    const darkTog = document.getElementById('cc-tog-dark');
    darkTog?.addEventListener('click', () => {
      settingsState.darkmode = !settingsState.darkmode;
      darkTog.classList.toggle('active', settingsState.darkmode);
      document.querySelector('.macos-container')?.classList.toggle('light-mode', !settingsState.darkmode);
    });

    document.getElementById('cc-open-calc')?.addEventListener('click', () => {
      closeAllPopovers();
      spawnOrFocusWindow('Calculator');
    });

    document.getElementById('cc-disp-slider')?.addEventListener('input', (e) => {
      settingsState.brightness = Number(e.target.value);
      const overlay = document.getElementById('mac-brightness-overlay');
      if (overlay) overlay.style.opacity = `${(100 - settingsState.brightness) * 0.007}`;
    });

    document.getElementById('cc-sound-slider')?.addEventListener('input', (e) => {
      settingsState.soundVolume = Number(e.target.value);
    });

    document.getElementById('cc-play-btn')?.addEventListener('click', () => {
      isMusicPlaying = !isMusicPlaying;
      closeAllPopovers();
      spawnOrFocusWindow('Music');
    });
  });

  // Spotlight Search
  spotlightBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSpotlight();
  });

  // Generic Top Bar Menus (File, Edit, View, Window, Help)
  document.querySelectorAll('.top-bar .menu-item[data-menu]').forEach(mItem => {
    mItem.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activePopover) { closeAllPopovers(); return; }
      const menuType = mItem.getAttribute('data-menu');
      let itemsHtml = '';

      if (menuType === 'file') {
        itemsHtml = `
          <div class="menu-drop-item" data-action="newwin">Nouvelle fenêtre <span>⌘N</span></div>
          <div class="menu-drop-item" data-action="newtab">Nouvel onglet <span>⌘T</span></div>
          <div class="menu-drop-sep"></div>
          <div class="menu-drop-item" data-action="closewin">Fermer la fenêtre <span>⌘W</span></div>`;
      } else if (menuType === 'edit') {
        itemsHtml = `
          <div class="menu-drop-item">Annuler <span>⌘Z</span></div>
          <div class="menu-drop-item">Rétablir <span>⇧⌘Z</span></div>
          <div class="menu-drop-sep"></div>
          <div class="menu-drop-item">Couper <span>⌘X</span></div>
          <div class="menu-drop-item">Copier <span>⌘C</span></div>
          <div class="menu-drop-item">Coller <span>⌘V</span></div>
          <div class="menu-drop-item">Tout sélectionner <span>⌘A</span></div>`;
      } else if (menuType === 'view') {
        itemsHtml = `
          <div class="menu-drop-item">Par icônes <span>⌘1</span></div>
          <div class="menu-drop-item">Par liste <span>⌘2</span></div>
          <div class="menu-drop-sep"></div>
          <div class="menu-drop-item" data-action="fullscreen">Activer le plein écran <span>^⌘F</span></div>`;
      } else if (menuType === 'window') {
        itemsHtml = `
          <div class="menu-drop-item" data-action="min">Réduire <span>⌘M</span></div>
          <div class="menu-drop-item" data-action="zoom">Agrandir / Zoom</div>
          <div class="menu-drop-sep"></div>
          <div class="menu-drop-item">Tout ramener au premier plan</div>`;
      } else {
        itemsHtml = `
          <div class="menu-drop-item" data-action="help">Recherche Aide</div>
          <div class="menu-drop-sep"></div>
          <div class="menu-drop-item" data-action="contact">Contacter Gabriel Jagueneau</div>`;
      }

      openPopover(mItem, `<div class="menu-dropdown-list">${itemsHtml}</div>`);

      document.querySelectorAll('.menu-drop-item').forEach(it => {
        it.addEventListener('click', () => {
          const act = it.getAttribute('data-action');
          closeAllPopovers();
          if (act === 'fullscreen') toggleMacFullscreen();
          else if (act === 'contact') spawnOrFocusWindow('Safari');
          else if (act === 'newwin') spawnOrFocusWindow('Finder');
        });
      });
    });
  });

  document.addEventListener('click', () => closeAllPopovers());
}

// ═══════════════════════════════════════════════════════════════════════════════
// Spotlight Search Modal
// ═══════════════════════════════════════════════════════════════════════════════
function toggleSpotlight() {
  let existing = document.getElementById('mac-spotlight-modal');
  if (existing) { existing.remove(); return; }

  const macContainer = document.querySelector('.macos-container');
  if (!macContainer) return;

  const modal = document.createElement('div');
  modal.id = 'mac-spotlight-modal';
  modal.className = 'mac-spotlight-modal';
  modal.innerHTML = `
    <div class="spotlight-search-bar">
      ${SVG_ICONS.search}
      <input type="text" id="spotlight-input" placeholder="Spotlight Search (apps, contacts, math...)" autofocus />
    </div>
    <div class="spotlight-results" id="spotlight-results">
      <div class="spot-item active" data-open="Terminal"><span>Terminal</span><small>Application</small></div>
      <div class="spot-item" data-open="Safari"><span>Safari</span><small>Application</small></div>
      <div class="spot-item" data-open="Code"><span>Visual Studio Code</span><small>Application</small></div>
      <div class="spot-item" data-open="Music"><span>Music</span><small>Application</small></div>
      <div class="spot-item" data-open="Calculator"><span>Calculator</span><small>Application</small></div>
      <div class="spot-item" data-open="Settings"><span>System Settings</span><small>Application</small></div>
    </div>`;

  macContainer.appendChild(modal);

  const input = modal.querySelector('#spotlight-input');
  const results = modal.querySelector('#spotlight-results');

  input?.focus();

  input?.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) return;

    // Check if it's a math expression (e.g. 2+2, 5*8)
    if (/^[0-9+\-*/().\s]+$/.test(q)) {
      try {
        const res = Function(`'use strict'; return (${q})`)();
        if (res !== undefined) {
          results.innerHTML = `
            <div class="spot-item active" data-calc="true" data-val="${res}">
              <span>= ${res}</span>
              <small>Calculatrice</small>
            </div>`;
          results.querySelector('.spot-item[data-calc]')?.addEventListener('click', () => {
            calcState.displayValue = String(res);
            modal.remove();
            spawnOrFocusWindow('Calculator');
          });
          return;
        }
      } catch (err) {}
    }

    const apps = ['Terminal', 'Safari', 'Code', 'Music', 'Calculator', 'Settings', 'Finder'];
    const matched = apps.filter(a => a.toLowerCase().includes(q));

    if (matched.length) {
      results.innerHTML = matched.map((a, i) => `
        <div class="spot-item ${i === 0 ? 'active' : ''}" data-open="${a}">
          <span>${a}</span>
          <small>Application</small>
        </div>
      `).join('');
    } else {
      results.innerHTML = `<div class="spot-item disabled"><span>Aucun résultat pour "${escapeHtml(q)}"</span></div>`;
    }

    results.querySelectorAll('.spot-item[data-open]').forEach(item => {
      item.addEventListener('click', () => {
        const target = item.getAttribute('data-open');
        modal.remove();
        spawnOrFocusWindow(target);
      });
    });
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const active = results.querySelector('.spot-item.active');
      const target = active?.getAttribute('data-open');
      const isCalc = active?.getAttribute('data-calc');
      if (isCalc) {
        const val = active.getAttribute('data-val');
        if (val) calcState.displayValue = String(val);
        modal.remove();
        spawnOrFocusWindow('Calculator');
      } else if (target) {
        modal.remove();
        spawnOrFocusWindow(target);
      }
    } else if (e.key === 'Escape') {
      modal.remove();
    }
  });

  results.querySelectorAll('.spot-item[data-open]').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-open');
      modal.remove();
      spawnOrFocusWindow(target);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// About This Mac Modal
// ═══════════════════════════════════════════════════════════════════════════════
function showAboutMacModal() {
  document.getElementById('mac-about-modal')?.remove();
  const macContainer = document.querySelector('.macos-container');
  if (!macContainer) return;

  const modal = document.createElement('div');
  modal.id = 'mac-about-modal';
  modal.className = 'mac-modal-dialog';
  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-close-btn" id="modal-close-about">✕</div>
      <div class="modal-apple-badge">${SVG_ICONS.apple}</div>
      <h3>MacBook Pro</h3>
      <p class="modal-sub">14 pouces, 2024</p>
      <div class="modal-specs-list">
        <div class="spec-row"><span>Puce :</span> <strong>Apple M3 Pro (12 cœurs)</strong></div>
        <div class="spec-row"><span>Mémoire :</span> <strong>18 Go Mémoire unifiée</strong></div>
        <div class="spec-row"><span>Graphismes :</span> <strong>GPU 18 cœurs intégré</strong></div>
        <div class="spec-row"><span>Numéro de série :</span> <strong>GJ77X92026M3P</strong></div>
        <div class="spec-row"><span>macOS :</span> <strong>Sonoma 14.5</strong></div>
      </div>
      <div class="modal-actions">
        <button class="mac-dialog-btn primary" id="modal-more-info">En savoir plus...</button>
      </div>
    </div>`;

  macContainer.appendChild(modal);
  document.getElementById('modal-close-about')?.addEventListener('click', () => modal.remove());
  document.getElementById('modal-more-info')?.addEventListener('click', () => {
    modal.remove();
    spawnOrFocusWindow('Settings');
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Lock Screen & Sleep Screen
// ═══════════════════════════════════════════════════════════════════════════════
function lockScreen() {
  const macContainer = document.querySelector('.macos-container');
  if (!macContainer || document.getElementById('mac-lockscreen')) return;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const dateStr = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;

  const lock = document.createElement('div');
  lock.id = 'mac-lockscreen';
  lock.className = 'mac-lockscreen-overlay';
  lock.innerHTML = `
    <div class="lock-time">${timeStr}</div>
    <div class="lock-date">${dateStr}</div>
    <div class="lock-avatar-wrap">
      <div class="lock-avatar">GJ</div>
      <div class="lock-username">Gabriel JAGUENEAU</div>
      <div class="lock-input-wrap">
        <input type="password" id="lock-pwd-input" placeholder="Touch ID ou Mot de passe" />
        <button class="lock-submit-btn" id="lock-submit-btn">→</button>
      </div>
      <small style="color:rgba(255,255,255,0.45); margin-top:8px; font-size:8px;">Appuyez sur Entrée ou cliquez pour déverrouiller</small>
    </div>`;

  macContainer.appendChild(lock);

  function unlock() {
    lock.style.opacity = '0';
    lock.style.transform = 'scale(1.06)';
    setTimeout(() => lock.remove(), 400);
  }

  document.getElementById('lock-submit-btn')?.addEventListener('click', unlock);
  document.getElementById('lock-pwd-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') unlock();
  });
  lock.addEventListener('click', (e) => {
    if (e.target === lock) unlock();
  });
}

function sleepScreen() {
  const macContainer = document.querySelector('.macos-container');
  if (!macContainer || document.getElementById('mac-sleep-overlay')) return;

  const sleep = document.createElement('div');
  sleep.id = 'mac-sleep-overlay';
  sleep.className = 'mac-sleep-overlay';
  sleep.innerHTML = `<span style="font-size:10px; color:rgba(255,255,255,0.3);">Cliquez pour réveiller le Mac</span>`;
  macContainer.appendChild(sleep);

  sleep.addEventListener('click', () => {
    sleep.style.opacity = '0';
    setTimeout(() => sleep.remove(), 300);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Clock
// ═══════════════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════════════
// Interactive Mode Controller & Fullscreen
// ═══════════════════════════════════════════════════════════════════════════════
export function setInteractive(active) {
  if (isMacInteractive === active) return;
  isMacInteractive = Boolean(active);

  setMacInteractiveMode(isMacInteractive);

  const container = document.querySelector('.macos-container');
  if (container) {
    container.classList.toggle('is-interactive', isMacInteractive);
  }

  if (isMacInteractive) {
    if (autoSpawnTimer) clearTimeout(autoSpawnTimer);
    if (openWindows.size === 0) {
      spawnOrFocusWindow('Terminal');
    }
  } else {
    closeAllPopovers();
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

    const rect = mac.getBoundingClientRect();
    const targetW = window.innerWidth * 0.94;
    const targetH = window.innerHeight * 0.92;
    const scale = Math.min(targetW / rect.width, targetH / rect.height);

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

// ═══════════════════════════════════════════════════════════════════════════════
// Dock Magnification & Listeners
// ═══════════════════════════════════════════════════════════════════════════════
function initDockMagnification() {
  const dock = document.getElementById('mac-dock') || document.querySelector('.dock');
  if (!dock) return;

  const items = Array.from(dock.querySelectorAll('.dock-item'));

  dock.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const maxScale = 1.38;
    const maxDist = 80;

    items.forEach(item => {
      const rect = item.getBoundingClientRect();
      const itemCenterX = rect.left + rect.width / 2;
      const dist = Math.abs(mouseX - itemCenterX);

      if (dist < maxDist) {
        const norm = dist / maxDist;
        const scale = 1 + (maxScale - 1) * (0.5 + 0.5 * Math.cos(norm * Math.PI));
        item.style.transform = `scale(${scale.toFixed(3)}) translateY(-${((scale - 1) * 16).toFixed(1)}px)`;
      } else {
        item.style.transform = 'scale(1) translateY(0)';
      }
    });
  });

  dock.addEventListener('mouseleave', () => {
    items.forEach(item => {
      item.style.transform = '';
    });
  });
}

function initDock() {
  initDockMagnification();

  document.querySelectorAll('.dock .dock-item[data-app]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const appName = item.getAttribute('data-app');
      if (appName === 'Fullscreen') {
        toggleMacFullscreen();
        return;
      }
      if (appName && appDefinitions[appName]) {
        item.classList.add('bouncing');
        setTimeout(() => item.classList.remove('bouncing'), 600);
        setInteractive(true);
        spawnOrFocusWindow(appName);
      }
    });
  });

  document.getElementById('mac-exit-fullscreen')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMacFullscreen(false);
  });

  document.getElementById('mac-fullscreen-backdrop')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMacFullscreen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isMacFullscreen) toggleMacFullscreen(false);
      else if (isMacInteractive) setInteractive(false);
    } else if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
      e.preventDefault();
      if (isMacInteractive) toggleSpotlight();
    } else if ((e.metaKey || e.ctrlKey) && (e.key === 'w' || e.key === 'W')) {
      if (isMacInteractive) {
        const activeWin = document.querySelector('.desktop .window.active-window');
        if (activeWin) {
          e.preventDefault();
          const appName = activeWin.getAttribute('data-app-name');
          const inst = openWindows.get(appName);
          if (inst) closeWindow(inst);
        }
      }
    } else if ((e.metaKey || e.ctrlKey) && (e.key === 'm' || e.key === 'M')) {
      if (isMacInteractive) {
        const activeWin = document.querySelector('.desktop .window.active-window');
        if (activeWin) {
          e.preventDefault();
          const appName = activeWin.getAttribute('data-app-name');
          const inst = openWindows.get(appName);
          if (inst) minimizeWindow(inst);
        }
      }
    }
  });
}

function initInteractiveListeners() {
  function getMac() {
    return document.getElementById('imagurrrr') || document.querySelector('.image-container');
  }

  const mac = getMac();
  if (mac) {
    mac.addEventListener('click', (e) => {
      // If clicking the Mac when not in fullscreen mode, zoom into fullscreen!
      if (!isMacFullscreen) {
        if (e.target.closest('#mac-exit-fullscreen')) return;
        toggleMacFullscreen(true);
      }
    });
  }

  document.addEventListener('mousedown', (e) => {
    const m = getMac();
    if (!m) return;

    const isInsideMac = m.contains(e.target) || e.target.closest('#imagurrrr') || e.target.closest('.macos-container');
    const isCard = e.target.closest('.cardage');
    const isExitBtn = e.target.closest('#mac-exit-fullscreen');

    if (isInsideMac || isExitBtn) {
      setInteractive(true);
    } else if (!isCard && !isMacFullscreen) {
      setInteractive(false);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Bootstrap
// ═══════════════════════════════════════════════════════════════════════════════
export function initMacUI() {
  updateClock();
  initDock();
  initMenuInteractions();
  initInteractiveListeners();

  // Initial setup: spawn Terminal by default on start
  if (desktop && openWindows.size === 0) {
    spawnOrFocusWindow('Terminal');
  }
}
