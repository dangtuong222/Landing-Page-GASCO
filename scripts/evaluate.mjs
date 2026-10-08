import { mkdir, writeFile } from 'node:fs/promises';
import { Knowledge } from '../server/knowledge.mjs';
import { answerChat } from '../server/chat.mjs';

const knowledge = Knowledge.load('.knowledge/index.json');
const live = process.argv.includes('--live');
const all = process.argv.includes('--all');
const resume = process.argv.includes('--resume');
const output = live ? (all ? 'test-results/source-cases-live.json' : 'test-results/live-smoke.json') : 'test-results/retrieval.json';
const prior = resume ? JSON.parse(await (await import('node:fs/promises')).readFile(output, 'utf8')) : null;
const defined = (knowledge.data.cases || []).filter(c => !c.placeholder);
const retrieval = defined.map(c => {
  const chunks = knowledge.retrieve(c.service, c.question);
  return { ...c, retrieved: chunks.map(({ file, locator, id }) => ({ file, locator, id })),
    scopePass: chunks.every(chunk => chunk.service === c.service && !chunk.evaluation && !chunk.pricing && !/07_Service_/.test(chunk.file)) };
});
const report = { generatedAt: new Date().toISOString(), documents: knowledge.data.documents.length,
  sourceCases: knowledge.data.cases?.length || 0, executableSourceCases: defined.length,
  placeholderCases: (knowledge.data.cases || []).filter(c => c.placeholder).length,
  retrievalChecks: retrieval, liveChecks: [],
  limitation: 'Retrieval scope checks do not establish semantic answer correctness. Live smoke checks verify responses and citations; source expected behavior is included for human review. No semantic PASS is inferred automatically.' };
if (live) {
  let selected = all ? defined : knowledge.data.services.map(s => {
    const source = defined.find(c => c.service === s.id && /happy|grounding|use case|overview/i.test(c.category));
    return source || { id: 'SMOKE', service: s.id, question: 'Dịch vụ này hỗ trợ nhu cầu nào và sản phẩm bàn giao gồm những gì?', expected: 'Tóm tắt đúng hồ sơ, có nguồn, không tự cam kết.' };
  });
  if (prior) {
    report.liveChecks = prior.liveChecks.filter(c => c.transportPass);
    selected = selected.filter(c => !report.liveChecks.some(p => p.service === c.service && p.id === c.id));
  }
  // Full runs are deliberately serial. Persist each batch and stop at the first quota response.
  const concurrency = all ? 1 : 3;
  for (let offset = 0; offset < selected.length; offset += concurrency) {
    const results = await Promise.all(selected.slice(offset, offset + concurrency).map(async c => {
      try {
        const result = await answerChat(knowledge, { serviceId: c.service, message: c.question });
        console.log(`${c.service}/${c.id}: response=${result.answer.length} chars, citations=${result.sources.length}`);
        return { ...c, ...result, transportPass: Boolean(result.answer), scopePass: result.sources.every(s => s.service === c.service) };
      } catch (error) {
        console.log(`${c.service}/${c.id}: ${error.code || 'FAILED'}`);
        return { ...c, error: error.message, code: error.code, retryAfterSeconds: error.retryAfterSeconds, transportPass: false };
      }
    }));
    report.liveChecks.push(...results);
    await mkdir('test-results', { recursive: true });
    await writeFile(output, JSON.stringify(report, null, 2));
    if (results.some(r => r.code === 'GEMINI_QUOTA')) {
      report.pendingCases = selected.slice(offset + concurrency);
      console.log('Gemini quota reached. Saved partial results; run with --resume after quota becomes available.');
      break;
    }
  }
}
await mkdir('test-results', { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ sourceCases: report.sourceCases, executable: defined.length, placeholders: report.placeholderCases,
  retrievalScopePass: retrieval.filter(r => r.scopePass).length, liveTransportPass: report.liveChecks.filter(r => r.transportPass).length,
  liveCount: report.liveChecks.length, output }, null, 2));
if (retrieval.some(r => !r.scopePass) || report.liveChecks.some(r => !r.transportPass || !r.scopePass)) process.exitCode = 1;
