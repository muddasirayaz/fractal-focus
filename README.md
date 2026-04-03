# Fractal Focus

A Tesla-inspired Pomodoro timer with a growing fractal tree that visualizes your deep work. Single-file PWA, zero dependencies, works offline.

## Quick Start (just open it)

1. Double-click `index.html` in any browser
2. That's it. The app works.

## Deploy to GitHub Pages (make it live)

```bash
# 1. Create repo on GitHub named "fractal-focus"
# 2. Clone it locally
git clone https://github.com/YOURUSERNAME/fractal-focus.git
cd fractal-focus

# 3. Copy index.html into the repo (it's already here if you cloned this)
git add index.html
git commit -m "Initial release"
git push

# 4. On GitHub.com: repo > Settings > Pages > Source: main branch > Save
# 5. Live at: https://YOURUSERNAME.github.io/fractal-focus/
```

## Iterate with Gemini CLI

### First-time setup (once)

```bash
# Install Node.js 20+ from https://nodejs.org if you don't have it
# Then install Gemini CLI:
npm install -g @google/gemini-cli

# Navigate to this project
cd fractal-focus

# Launch Gemini CLI (it auto-reads GEMINI.md for project context)
gemini
```

### Example commands inside Gemini CLI

```
> Read index.html and list all the features

> Add a dark/light theme toggle to the settings screen

> The fractal tree disappears when I resize the window — fix it

> Add a daily goal setting where users can set a target number of sessions per day, show progress toward the goal on the timer screen

> Add a CSV export button to the stats screen that downloads all session history

> Change the color scheme to use red/amber instead of blue/orange for focus mode

> Add keyboard shortcuts: spacebar for play/pause, R for reset, S for skip

> Make the fractal tree more complex — add a fourth branch when progress is above 75%
```

### The GEMINI.md file

The `GEMINI.md` file in this directory is automatically read by Gemini CLI when you launch it from this folder. It contains all the architecture rules, data model, and design specs so Gemini understands the project without you explaining it every time.

If you want to change the project rules, edit GEMINI.md.

## Files

```
fractal-focus/
  index.html    — The entire app (HTML + CSS + JS, single file)
  GEMINI.md     — Project instructions for Gemini CLI
  README.md     — This file
```

## Features

- Pomodoro timer with configurable work/break durations
- Growing fractal tree that visualizes focus progress
- Glowing sphere with gradient progress ring (blue-to-orange for work, green for break)
- Session tracking with 14-day streak grid
- History of all completed sessions
- Completion chime (Web Audio API) + vibration
- Fully offline after first load (service worker)
- Installable as PWA on mobile
- Safe-area support for notched phones
- Timer accuracy maintained when tab is backgrounded (Visibility API)
- All data persists in localStorage

## Part of ContentFlip

This app is built using the ContentFlip pipeline — single-file PWAs deployed via GitHub Pages.
