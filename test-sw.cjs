const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function worker(scope = 'https://example.test/fractal-focus/') {
  const handlers = {}, deleted = [], added = [], fetched = [];
  const prefix = `fractal-focus:${scope}:`;
  const cached = new Map();
  const cache = { addAll: async urls => added.push(...urls), match: async url => cached.get(url) };
  const context = { URL, self: { registration: { scope }, clients: { claim: async () => {} },
    addEventListener: (kind, fn) => handlers[kind] = fn },
    caches: { open: async () => cache, keys: async () => [prefix+'v1', prefix+'v2', 'other-app', 'fractal-focus-v1'], delete: async name => deleted.push(name) },
    fetch: async request => { fetched.push(request.url); return 'network'; } };
  vm.runInNewContext(fs.readFileSync(__dirname+'/sw.js','utf8'), context);
  return { handlers, deleted, added, fetched, cached, scope };
}
async function dispatch(w, kind, request) {
  let result;
  w.handlers[kind]({ request, waitUntil: p => result = p, respondWith: p => result = p });
  return result;
}
test('installs shell under subpath', async () => { const w=worker(); await dispatch(w,'install'); assert.equal(w.added.length,3); assert.ok(w.added.every(x=>x.startsWith(w.scope))); });
test('supports root install', async () => { const w=worker('https://example.test/'); await dispatch(w,'install'); assert.ok(w.added.includes(w.scope+'index.html')); });
test('deletes only obsolete owned caches', async () => { const w=worker(); await dispatch(w,'activate'); assert.deepEqual(w.deleted,[`fractal-focus:${w.scope}:v1`]); });
test('offline index and root return cached shell', async () => { const w=worker(); w.cached.set(w.scope+'index.html','offline'); for(const suffix of ['', 'index.html']) assert.equal(await dispatch(w,'fetch',{method:'GET',url:w.scope+suffix}),'offline'); assert.equal(w.fetched.length,0); });
test('known uncached asset falls back to network', async () => { const w=worker(); assert.equal(await dispatch(w,'fetch',{method:'GET',url:w.scope+'privacy.html'}),'network'); });
for(const [name,method,url] of [['POST','POST','https://example.test/fractal-focus/index.html'],['external','GET','https://other.test/index.html'],['sibling','GET','https://example.test/other/index.html'],['query','GET','https://example.test/fractal-focus/index.html?private=1'],['API','GET','https://example.test/fractal-focus/api/data']]) test(`does not intercept ${name}`,async()=>{const w=worker();assert.equal(await dispatch(w,'fetch',{method,url}),undefined);assert.equal(w.fetched.length,0);});
