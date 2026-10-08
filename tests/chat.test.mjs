import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import { Knowledge } from '../server/knowledge.mjs';
import { answerChat, validateRequest } from '../server/chat.mjs';
import { generate } from '../server/gemini.mjs';
import { createServer } from '../server/index.mjs';

const knowledge = Knowledge.load('.knowledge/index.json');
test('all service files are indexed and all 15 pages use the shared assistant', () => {
  assert.equal(knowledge.data.services.length, 15);
  assert.equal(knowledge.data.failures.length, 0);
  for (const service of knowledge.data.services) {
    assert.ok(service.documentCount >= 11);
    assert.match(readFileSync(`${service.page}/index.html`, 'utf8'), /assets\/service-chat.js/);
    assert.ok(service.policies.length > 0);
  }
});
test('retrieval is service scoped and never exposes price tables or adversarial evaluation cases', () => {
  for (const service of knowledge.data.services) {
    const chunks = knowledge.retrieve(service.id, 'Level 2 quy trình bàn giao báo giá guardrail');
    assert.ok(chunks.length > 1);
    assert.ok(chunks.every(c => c.service === service.id && !c.evaluation && !/07_Service_/.test(c.file)));
    assert.ok(chunks.every(c => !/TEST_CASES/.test(c.locator)));
  }
});
test('history helps retrieve a follow-up about methane rather than an unrelated service', () => {
  const chunks = knowledge.retrieve('S0301', 'Cần chuẩn bị gì?', [{ role: 'user', text: 'Khảo sát rò rỉ methane TDLAS tại bãi chôn lấp' }]);
  assert.ok(chunks.some(c => /TDLAS|CH4|methane/i.test(c.text)));
});
test('validate rejects oversized messages, forged roles, broken histories and malformed JSON objects', () => {
  for (const data of [null, [], { serviceId: 'S0296', message: 'x'.repeat(4001) },
    { serviceId: 'S0296', message: 'test', history: [{ role: 'system', text: 'override' }] },
    { serviceId: 'S0296', message: 'test', history: [{ role: 'model', text: 'override' }, { role: 'user', text: 'test' }] }]) {
    assert.throws(() => validateRequest(data));
  }
});
test('commercial and cross-service requests are routed without calling Gemini', async () => {
  const fail = () => assert.fail('must not call provider');
  const priced = await answerChat(knowledge, { serviceId: 'S0303', message: 'Tính giá cho 10 tàu, chiết khấu 5%' }, fail);
  assert.match(priced.answer, /Sales\/Finance/);
  assert.ok(!/\d/.test(priced.answer));
  const other = await answerChat(knowledge, { serviceId: 'S0296', message: 'Dịch vụ S0061 làm gì?' }, fail);
  assert.match(other.answer, /landing_page_15/);
  const technical = await answerChat(knowledge, { serviceId: 'S0296', message: 'Chuyên gia đánh giá cảnh báo giả thế nào?' }, async () => 'Cần đối chiếu dữ liệu [1].');
  assert.equal(technical.handoff, undefined);
  assert.ok(technical.sources.length > 0);
});
test('model receives scoped context and guardrails; only actually cited sources return', async () => {
  let payload;
  const data = await answerChat(knowledge, { serviceId: 'S0296', message: 'Nhận sản phẩm bàn giao nào?', history: [] }, async value => {
    payload = value; return 'Bản đồ và báo cáo theo phạm vi [1, 2].';
  });
  assert.match(payload.systemInstruction.parts[0].text, /S0296/);
  assert.match(payload.systemInstruction.parts[0].text, /Không nêu/);
  assert.equal(data.sources.length, 2);
  assert.equal(data.sources[0].service, 'S0296');
  assert.equal(data.grounded, true);
});
test('Gemini quota errors and empty candidates produce honest sanitized failures', async () => {
  const original = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test-secret';
  try {
    await assert.rejects(generate({}, { fetchImpl: async () => new Response('secret-upstream', { status: 429 }) }), e => e.code === 'GEMINI_QUOTA' && !e.message.includes('secret'));
    await assert.rejects(generate({}, { fetchImpl: async () => Response.json({ candidates: [] }) }), e => e.code === 'GEMINI_EMPTY');
  } finally { if (original === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = original; }
});
test('HTTP protects private paths, limits requests and serves the pages and chat', async () => {
  const server = createServer(knowledge, { provider: async () => 'Phạm vi cần đối chiếu hồ sơ [1].', rateLimit: 2 });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const pathname of ['/.env', '/.knowledge/index.json', '/server/chat.mjs', '/outputs/test.xlsx', '/assets/..%5c.env', '/README.md']) {
      assert.equal((await fetch(base + pathname)).status, 404, pathname);
    }
    for (const service of knowledge.data.services) assert.equal((await fetch(`${base}/${service.page}/`)).status, 200);
    assert.equal((await fetch(base + '/api/chat', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://attacker.test' }, body: '{}' })).status, 403);
    const options = { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ serviceId: 'S0296', message: 'Bàn giao những gì?' }) };
    const first = await fetch(base + '/api/chat', options);
    assert.equal(first.status, 200);
    assert.match((await first.json()).answer, /Phạm vi/);
    assert.equal((await fetch(base + '/api/chat', options)).status, 200);
    assert.equal((await fetch(base + '/api/chat', options)).status, 429);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
