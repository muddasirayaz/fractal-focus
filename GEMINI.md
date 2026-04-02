# GEMINI.md — Fractal Focus Project Instructions

## Project Overview
Fractal Focus is a single-file Progressive Web App (PWA) Pomodoro timer. The entire application lives in `index.html` — all HTML, CSS, and JavaScript are inline. There are no external dependencies, no build tools, no package.json, and no framework.

## Architecture Rules (NEVER violate these)
1. **Single file only.** Everything must remain in `index.html`. Never create separate .css or .js files.
2. **Zero external dependencies.** No CDN links except Google Fonts. No npm packages. No imported libraries.
3. **Offline-capable.** The inline service worker and localStorage persistence must always work.
4. **Mobile-first.** All UI must work at 375px width. All tap targets must be at least 44px.
5. **No build step.** The file must open directly in a browser with zero tooling.

## Tech Stack
- Vanilla HTML5, CSS3, JavaScript (ES6+)
- Canvas API for the fractal tree and progress ring
- Web Audio API for completion chimes
- localStorage for data persistence
- Inline blob-based service worker for offline caching
- Google Fonts: DM Sans (body) + JetBrains Mono (timer digits)

## Visual Design
- **Theme:** Tesla-inspired dark UI. Background #08080d, near-black cards, minimal borders.
- **Focus mode:** Electric blue (#14b8f6) accent, blue-to-purple-to-orange gradient on the progress ring.
- **Break mode:** Emerald green (#10b981) accent, green gradient on the progress ring.
- **Sphere:** Radial gradient orb in the center, pulses when timer is running.
- **Fractal tree:** Background canvas, grows from bottom-center. Branch depth increases with timer progress (2 branches at start, up to 11 at completion). Leaves appear after 30% progress. Gentle sway animation while running.

## Data Model
```javascript
// Settings (localStorage key: ff_c)
{ work: 25, shortBreak: 5, longBreak: 15, rounds: 4, sound: true, vib: true, ab: false, af: false }

// History entries (localStorage key: ff_h, max 200)
[{ t: 'work'|'break', d: minutes, ts: timestamp }]

// Aggregate stats (localStorage key: ff_s)
{ ts: totalSessions, tm: totalMinutes }
```

## Screens (3 total, tab navigation)
1. **Timer** — Phase label, sphere with countdown, play/pause/reset/skip controls, session dots
2. **Stats** — Today count, total sessions, hours focused, streak, 14-day grid, recent session history
3. **Settings** — Duration adjusters (work/short break/long break/rounds), toggles (sound/vibration/auto-start), reset data

## Key Behaviors
- Pomodoro cycle: Work → Short Break → Work → Short Break → ... → Long Break (after N sessions)
- Visibility API corrects timer drift when the browser tab is backgrounded
- Completion triggers: Web Audio chime (3-note ascending) + vibration pattern
- Session dots fill as work sessions complete within a cycle
- All data persists across page reloads via localStorage

## When Making Changes
- Always test that the file opens directly in Chrome with no errors in the console
- Always verify mobile responsiveness at 375px width
- Always verify offline mode (toggle airplane mode after first load)
- Never introduce external dependencies
- Never split into multiple files
- Keep CSS class names short (this is intentional for file size)

## Common Tasks

### "Add a new feature"
Add the HTML in the appropriate screen section, CSS in the `<style>` block, and JS in the `<script>` block. Keep it all in index.html.

### "Fix a bug"
Read the error, locate the relevant function in the `<script>` block, fix it. Run in browser to verify.

### "Change the visual design"
All styles are in the single `<style>` block using CSS custom properties (`:root`). Change variables there for global changes.

### "Add a new screen"
1. Add a new `<div class="scr">` in the HTML
2. Add a new `<button class="nb">` in the nav
3. The navigation JS already handles screen switching via the `data-s` attribute

## Brand
This app is part of the ContentFlip portfolio. The brand name appears in the settings footer only. No other branding in the UI.
