const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');
let server, base;
test.before(async () => {
  server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)); });
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => new Promise(resolve => server.close(resolve)));
const call = (path, options) => fetch(base + path, options);
const json = (method, data) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
test('GET тізім және іздеу', async () => {
  const r = await call('/api/courses?search=web');
  assert.equal(r.status, 200);
  const items = await r.json();
  assert.equal(items.length, 1);
});
test('GET id және жоқ id', async () => {
  assert.equal((await call('/api/courses/1')).status, 200);
  assert.equal((await call('/api/courses/999')).status, 404);
});
test('POST, PUT, PATCH, DELETE', async () => {
  let r = await call('/api/courses', json('POST', { name: 'Python', teacher: 'Асқар', credits: 3 }));
  assert.equal(r.status, 201);
  const { id } = await r.json();
  r = await call(`/api/courses/${id}`, json('PUT', { name: 'Python 2', teacher: 'Асқар', credits: 4 }));
  assert.equal(r.status, 200);
  r = await call(`/api/courses/${id}`, json('PATCH', { credits: 5 }));
  assert.equal(r.status, 200);
  assert.equal((await r.json()).credits, 5);
  assert.equal((await call(`/api/courses/${id}`, { method: 'DELETE' })).status, 204);
  assert.equal((await call(`/api/courses/${id}`)).status, 404);
});
test('400 және 404 қателері', async () => {
  assert.equal((await call('/api/courses', json('POST', { name: '', teacher: 'A', credits: '3' }))).status, 400);
  assert.equal((await call('/api/courses', json('POST', { name: 'A', teacher: 'B', credits: 3.5 }))).status, 400);
  assert.equal((await call('/api/courses?page=0')).status, 400);
  assert.equal((await call('/api/unknown')).status, 404);
});
