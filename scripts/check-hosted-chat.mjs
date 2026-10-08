import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const api = new URL(process.argv[2]);
const origin = 'https://dangtuong222.github.io';
const health = await fetch(new URL('health', api), { headers: { origin } });
assert.equal(health.status, 200);
assert.equal(health.headers.get('access-control-allow-origin'), origin);
const healthData = await health.json();
assert.equal(healthData.configured, true);
assert.equal(healthData.documents, 170);
const options = await fetch(new URL('chat', api), { method: 'OPTIONS', headers: { origin,
  'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type' } });
assert.equal(options.status, 204);
assert.equal(options.headers.get('access-control-allow-origin'), origin);
const report = { api: api.href, time: new Date().toISOString(), health: healthData, results: [] };
for (const message of ['Khách hàng nhận được sản phẩm bàn giao nào của S0300?', 'Hướng dẫn tôi nấu phở bò', 'S0296 có gì?']) {
  const response = await fetch(new URL('chat', api), { method: 'POST', headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify({ serviceId: 'S0300', message, history: [] }), signal: AbortSignal.timeout(55000) });
  const result = await response.json();
  report.results.push({ message, status: response.status, cors: response.headers.get('access-control-allow-origin'), ...result });
  console.log(JSON.stringify({ status: response.status, service: result.serviceId, sourceCount: result.sources?.length, message, answer: result.answer || result.error }));
  if (response.status === 429) {
    await mkdir('test-results', { recursive: true });
    await writeFile('test-results/hosted-smoke.json', JSON.stringify(report, null, 2));
    throw new Error('Hosted smoke test incomplete: provider or server rate limit.');
  }
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.equal(result.serviceId, 'S0300');
  assert.ok(result.sources.every(source => source.service === 'S0300'));
}
await mkdir('test-results', { recursive: true });
await writeFile('test-results/hosted-smoke.json', JSON.stringify(report, null, 2));
