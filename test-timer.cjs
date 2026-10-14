// Timer behavior of index.html's inline app script, run in a VM with stubbed DOM and a fake clock.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const app = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function boot() {
  let now = Date.UTC(2026, 9, 14, 12, 0, 0);
  let nextId = 1;
  const timers = new Map();
  const noop = () => {};
  const elements = new Map();
  const listeners = { document: {}, window: {} };
  const classList = () => ({ add: noop, remove: noop, toggle: noop, contains: () => false });
  // Every canvas method returns the stub itself, so gradients and chained calls resolve.
  const ctx2d = new Proxy({}, { get: (_t, p) => (typeof p === 'string' && /width|height/i.test(p) ? 300 : () => ctx2d) });
  const element = (id) => {
    if (!elements.has(id)) {
      elements.set(id, {
        id, textContent: '', innerHTML: '', value: '', checked: false, style: {}, dataset: {},
        clientWidth: 300, clientHeight: 300, width: 300, height: 300, classList: classList(),
        getContext: () => ctx2d, addEventListener: (k, fn) => { (elements.get(id).handlers ||= {})[k] = fn; },
        appendChild: noop, querySelector: () => null, querySelectorAll: () => [], setAttribute: noop,
        getBoundingClientRect: () => ({ width: 300, height: 300, left: 0, top: 0 }),
      });
    }
    return elements.get(id);
  };
  class FakeDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const document = {
    hidden: false, fullscreenElement: null, body: element('body'), documentElement: element('html'),
    getElementById: element, createElement: () => element('anon-' + nextId++),
    querySelector: () => null, querySelectorAll: () => [],
    addEventListener: (k, fn) => { listeners.document[k] = fn; },
  };
  const sandbox = {
    console, Math, JSON, Object, Array, Number, String, Boolean, RegExp, Promise, Map, Set, Symbol, Error,
    parseInt, parseFloat, isNaN, isFinite, Date: FakeDate,
    setInterval: (fn, ms) => { const id = nextId++; timers.set(id, { fn, ms, at: now + ms, every: ms }); return id; },
    clearInterval: (id) => timers.delete(id),
    setTimeout: (fn, ms) => { const id = nextId++; timers.set(id, { fn, ms, at: now + (ms || 0) }); return id; },
    clearTimeout: (id) => timers.delete(id),
    requestAnimationFrame: () => 0, cancelAnimationFrame: noop, devicePixelRatio: 1,
    confirm: () => false, alert: noop,
    document, navigator: {},
    localStorage: { s: {}, getItem(k) { return this.s[k] ?? null; }, setItem(k, v) { this.s[k] = String(v); }, removeItem(k) { delete this.s[k]; } },
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  sandbox.addEventListener = (k, fn) => { listeners.window[k] = fn; };
  vm.createContext(sandbox);
  vm.runInContext(app, sandbox, { filename: 'index.html#app', timeout: 2000 });

  // Advance the fake clock. With `firing: false` timers do not run (an iOS app in the background).
  // `lateBy` delays every interval tick (a busy or throttled main thread).
  const advance = (ms, { firing = true, lateBy = 0 } = {}) => {
    const end = now + ms;
    if (!firing) { now = end; return; }
    for (;;) {
      const due = [...timers.entries()].filter(([, t]) => t.at + lateBy <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      const [id, t] = due;
      now = t.at + lateBy;
      if (t.every) t.at = now + t.every; else timers.delete(id);
      t.fn();
    }
    now = end;
  };
  const setHidden = (hidden) => { document.hidden = hidden; listeners.document.visibilitychange?.(); };
  const click = (id) => element(id).handlers.click();
  const shown = () => element('tdisp').textContent;
  return { advance, setHidden, click, shown };
}

test('start, pause, resume, reset and skip drive the visible countdown', () => {
  const t = boot();
  assert.equal(t.shown(), '25:00');
  t.click('orb'); t.advance(5000); assert.equal(t.shown(), '24:55');
  t.click('orb'); t.advance(10000); assert.equal(t.shown(), '24:55', 'paused time must not count');
  t.click('orb'); t.advance(3000); assert.equal(t.shown(), '24:52');
  t.click('breset'); assert.equal(t.shown(), '25:00');
  t.click('bskip'); assert.equal(t.shown(), '05:00', 'skipping a work session starts the short break');
});

test('a running session finishes and moves to the break', () => {
  const t = boot();
  t.click('orb'); t.advance(25 * 60 * 1000 + 1000);
  assert.equal(t.shown(), '05:00');
});

test('time spent in a background tab counts once, whether or not the interval kept firing', () => {
  for (const firing of [true, false]) {
    const t = boot();
    t.click('orb');
    t.setHidden(true); t.advance(60000, { firing }); t.setHidden(false);
    assert.equal(t.shown(), '24:00', `60 s hidden (interval ${firing ? 'firing' : 'suspended'})`);
  }
});

test('remaining time follows the wall clock when interval ticks arrive late', () => {
  const t = boot();
  t.click('orb');
  t.advance(30000, { lateBy: 500 });
  assert.equal(t.shown(), '24:30');
});

test('running time between ticks is kept across pauses', () => {
  const t = boot();
  // Ten runs of 0.6 s, each paused before a tick, then one full second: 7 s of running time.
  for (let i = 0; i < 10; i++) { t.click('orb'); t.advance(600); t.click('orb'); t.advance(5000); }
  t.click('orb'); t.advance(1000);
  assert.equal(t.shown(), '24:53');
});
