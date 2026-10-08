import test from 'node:test';
import assert from 'node:assert/strict';
import { Knowledge } from '../server/knowledge.mjs';
import { createWorker } from '../server/worker.mjs';

const knowledge = Knowledge.load('.knowledge/index.json');
const origin = 'https://dangtuong222.github.io';
const api = 'https://chat.example.test/api/';
test('GitHub Pages CORS preflight is allowed, attacker origins are denied', async () => {
  const worker = createWorker(knowledge);
  const preflight = await worker.fetch(new Request(api + 'chat', { method: 'OPTIONS', headers: {
    origin, 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type' } }));
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
  for (const method of ['OPTIONS', 'POST', 'GET']) {
    const denied = await worker.fetch(new Request(api + 'chat', { method, headers: { origin: 'https://attacker.test' } }));
    assert.equal(denied.status, 403);
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
  }
});
test('15 assistants remain service scoped, including history and cross-service questions', async () => {
  const worker = createWorker(knowledge, { provider: async payload => {
    const id = payload.systemInstruction.parts[0].text.match(/dịch vụ (S\d{4})/)[1];
    assert.ok(payload.contents[0].parts[0].text.startsWith(`DỮ LIỆU THAM KHẢO CHO ${id}`));
    return `Hồ sơ ${id} có các sản phẩm bàn giao [1].`;
  } });
  for (const service of knowledge.data.services) {
    const response = await worker.fetch(new Request(api + 'chat', { method: 'POST', headers: { origin, 'content-type': 'application/json' },
      body: JSON.stringify({ serviceId: service.id, message: 'Sản phẩm bàn giao nào?', history: [] }) }));
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.serviceId, service.id);
    assert.ok(result.sources.every(s => s.service === service.id));
    assert.equal(response.headers.get('access-control-allow-origin'), origin);
  }
  const response = await worker.fetch(new Request(api + 'chat', { method: 'POST', headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify({ serviceId: 'S0300', message: 'S0296 có gì?' }) }));
  assert.equal((await response.json()).handoff, true);
});
test('worker hides private data, bounds streamed bodies and returns CORS on failures', async () => {
  const worker = createWorker(knowledge);
  for (const pathname of ['/.env', '/src/worker.mjs', '/.knowledge/index.json']) {
    assert.equal((await worker.fetch(new Request('https://chat.example.test' + pathname))).status, 404);
  }
  const health = await worker.fetch(new Request(api + 'health', { headers: { origin } }), { GEMINI_API_KEY: 'never-return-this-key' });
  assert.equal((await health.clone().json()).configured, true);
  assert.ok(!(await health.text()).includes('never-return-this-key'));
  const large = await worker.fetch(new Request(api + 'chat', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: 'x'.repeat(100001) }));
  assert.equal(large.status, 413);
  assert.equal(large.headers.get('access-control-allow-origin'), origin);
  const missing = await worker.fetch(new Request(api + 'chat', { method: 'POST', headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify({ serviceId: 'S0300', message: 'Dịch vụ làm gì?' }) }));
  assert.equal(missing.status, 503);
  assert.equal((await missing.json()).code, 'MISSING_KEY');
});
