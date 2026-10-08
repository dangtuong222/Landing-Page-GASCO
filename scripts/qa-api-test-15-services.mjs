import { createServer } from '../server/index.mjs';
import { Knowledge } from '../server/knowledge.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import { once } from 'node:events';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
export const questions = {
  S0296: 'Dịch vụ S0296 hỗ trợ dự báo và khảo sát lũ lụt như thế nào?',
  S0297: 'Dịch vụ S0297 giám sát sạt lở taluy đường đèo bằng UAV và IoT như thế nào?',
  S0291: 'Dịch vụ S0291 lập bản đồ carbon footprint bằng UAV và bàn giao dữ liệu gì?',
  S0295: 'Dịch vụ S0295 hỗ trợ MRV giảm phát thải CO2 mái nhà xanh và bàn giao kết quả gì?',
  S0301: 'Dịch vụ S0301 giám sát rò rỉ methane bằng UAV-TDLAS như thế nào?',
  S0300: 'Dịch vụ S0300 đo carbon rừng bằng UAV-LiDAR và ô mẫu mặt đất như thế nào?',
  S0289: 'Dịch vụ S0289 quan trắc đa khí bằng UAV và bàn giao dữ liệu gì?',
  S0298: 'Dịch vụ S0298 quan trắc bụi mịn 3D đô thị bằng UAV như thế nào?',
  S0299: 'Các cấp độ Level của dịch vụ S0299 kiểm soát bụi bám tấm pin mặt trời khác nhau thế nào?',
  S0303: 'Dịch vụ S0303 giám sát khí thải tàu biển bằng UAV và SO2/CO2 như thế nào?',
  S0302: 'Dịch vụ S0302 giám sát khí nhà kính khu công nghiệp bằng UAV đa cảm biến như thế nào?',
  S0294: 'Dịch vụ S0294 quan trắc và định lượng methane tại bãi rác như thế nào?',
  S0075: 'Hồ sơ nghiên cứu S0075 đề xuất phạm vi quan sát biên giới bằng VTOL như thế nào?',
  S0064: 'Hồ sơ nghiên cứu S0064 đề xuất giám sát kho đạn dược và nhiên liệu bằng cảm biến nhiệt và khí như thế nào?',
  S0061: 'Hồ sơ nghiên cứu S0061 đề xuất kiểm tra nhà máy điện bằng cảm biến hồng ngoại như thế nào?',
};

export function assessResponse(status, data, serviceId, requireGemini = false) {
  const mode = data.mode;
  const sources = data.sources;
  const scoped = Array.isArray(sources) && sources.length > 0 && sources.every(s => s.service === serviceId);
  const usable = status === 200 && data.serviceId === serviceId && typeof data.answer === 'string'
    && data.answer.trim().length > 0 && data.grounded === true && scoped;
  return { pass: usable && (requireGemini ? mode === 'gemini' : ['gemini', 'document_lookup'].includes(mode)),
    mode, grounded: data.grounded === true, sourceScopePass: scoped,
    degraded: mode === 'document_lookup', providerIssue: data.providerIssue || data.code || null };
}

export async function runQa({ knowledge = Knowledge.load(new URL('../.knowledge/index.json', import.meta.url)),
  provider, requireGemini = false, log = console.log } = {}) {
  const server = createServer(knowledge, { provider });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const report = { executedAt: new Date().toISOString(),
    testEnvironment: 'Local Node HTTP API; does not establish GitHub Pages browser connectivity',
    requireGemini, limitation: 'Checks valid responses, citations and service scope. Semantic correctness still requires review.',
    serviceTestResults: [], edgeCaseResults: [] };
  async function ask(input) {
    const start = Date.now();
    const response = await fetch(`${base}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input), signal: AbortSignal.timeout(55000) });
    return { status: response.status, data: await response.json(), durationMs: Date.now() - start };
  }
  try {
    for (const service of knowledge.data.services) {
      const question = questions[service.id];
      try {
        const { status, data, durationMs } = await ask({ serviceId: service.id, message: question });
        const assessment = assessResponse(status, data, service.id, requireGemini);
        report.serviceTestResults.push({ serviceId: service.id, serviceTitle: service.title, page: service.page, question,
          httpStatus: status, durationMs, ...assessment, model: data.mode === 'gemini' ? data.model : null,
          answer: data.answer, sources: data.sources, error: data.error });
        log(`${service.id}: ${assessment.pass ? 'PASS' : 'FAIL'}; mode=${data.mode || 'error'}; sources=${data.sources?.length || 0}; ${durationMs}ms`);
      } catch (error) {
        report.serviceTestResults.push({ serviceId: service.id, question, pass: false, error: error.message });
        log(`${service.id}: FAIL; request did not complete`);
      }
    }
    const edgeCases = [
      { name: 'Cross-service routing', input: { serviceId: 'S0291', message: 'Dịch vụ S0301 làm gì?' },
        check: (status, data) => status === 200 && data.handoff === true && data.mode === 'guidance' && data.sources.length === 0 },
      { name: 'Commercial pricing', input: { serviceId: 'S0291', message: 'Báo giá gói L2 hết bao nhiêu tiền?' },
        check: (status, data) => status === 200 && data.handoff === true && /Sales\/Finance/.test(data.answer) && data.sources.length === 0 },
      { name: 'Oversized message', input: { serviceId: 'S0291', message: 'A'.repeat(4500) },
        check: (status, data) => status === 400 && data.code === 'INVALID_MESSAGE' },
    ];
    for (const { name, input, check } of edgeCases) {
      try {
        const { status, data } = await ask(input);
        const pass = check(status, data);
        report.edgeCaseResults.push({ caseName: name, pass, httpStatus: status, mode: data.mode, code: data.code });
        log(`${name}: ${pass ? 'PASS' : 'FAIL'}`);
      } catch (error) { report.edgeCaseResults.push({ caseName: name, pass: false, error: error.message }); }
    }
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
  const results = report.serviceTestResults;
  report.summary = {
    totalServicesTested: results.length,
    passedServices: results.filter(r => r.pass).length,
    failedServices: results.filter(r => !r.pass).length,
    geminiResponses: results.filter(r => r.mode === 'gemini').length,
    documentLookupResponses: results.filter(r => r.mode === 'document_lookup').length,
    edgeCasesTested: report.edgeCaseResults.length,
    edgeCasesPassed: report.edgeCaseResults.filter(r => r.pass).length,
  };
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const report = await runQa({ requireGemini: process.argv.includes('--require-gemini') });
    const output = path.join(root, 'test-results', 'qa-api-test-report.json');
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report.summary, null, 2));
    if (report.summary.failedServices || report.summary.edgeCasesPassed !== report.summary.edgeCasesTested) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
