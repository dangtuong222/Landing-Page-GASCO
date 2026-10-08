import test from 'node:test';
import assert from 'node:assert/strict';
import { questions, assessResponse, runQa } from '../scripts/qa-api-test-15-services.mjs';
import { ChatError } from '../server/gemini.mjs';

test('QA questions use the actual forest, maritime and landfill service topics', () => {
  assert.equal(Object.keys(questions).length, 15);
  assert.match(questions.S0300, /carbon rừng/);
  assert.match(questions.S0303, /khí thải tàu biển/);
  assert.match(questions.S0294, /methane.*bãi rác/);
  assert.match(questions.S0297, /sạt lở taluy/);
});

test('QA rejects ungrounded or cross-service replies and distinguishes static lookup from Gemini', () => {
  const result = { mode: 'gemini', answer: 'Hồ sơ có sản phẩm bàn giao [1].', serviceId: 'S0300',
    grounded: true, sources: [{ number: 1, service: 'S0300' }] };
  assert.equal(assessResponse(200, result, 'S0300').pass, true);
  assert.equal(assessResponse(500, result, 'S0300').pass, false);
  for (const change of [{ sources: [] }, { grounded: false }, { sources: [{ service: 'S0303' }] }, { mode: 'guidance' }, { answer: '' }]) {
    assert.equal(assessResponse(200, { ...result, ...change }, 'S0300').pass, false);
  }
  const fallback = { ...result, mode: 'document_lookup', providerIssue: 'GEMINI_REGION' };
  assert.equal(assessResponse(200, fallback, 'S0300').pass, false);
  assert.equal(assessResponse(200, fallback, 'S0300', true).pass, false);
});

test('QA report does not claim Gemini success when all 15 services use regional fallback', async () => {
  const report = await runQa({ provider: async () => { throw new ChatError(502, 'GEMINI_REGION', 'Unsupported region'); }, log: () => {} });
  assert.equal(report.summary.geminiResponses, 0);
  assert.equal(report.summary.documentLookupResponses, 0);
  assert.equal(report.summary.unavailableResponses, 15);
  assert.equal(report.summary.passedServices, 0);
  assert.ok(report.serviceTestResults.every(r => r.providerIssue === 'GEMINI_REGION'));
  assert.equal(report.summary.edgeCasesPassed, 3);
});
