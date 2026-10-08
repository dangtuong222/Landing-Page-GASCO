import { createServer } from '../server/index.mjs';
import { Knowledge } from '../server/knowledge.mjs';
import { writeFile, mkdir } from 'node:fs/promises';

const knowledge = Knowledge.load('.knowledge/index.json');
const server = createServer(knowledge);
const PORT = 8089;

await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
console.log(`[QA Test Suite] Test Server running on http://127.0.0.1:${PORT}`);

const services = knowledge.data.services;
const testResults = [];

const questions = {
  S0289: 'Dịch vụ S0289 hỗ trợ phát hiện rò rỉ khí metan như thế nào và quy trình kiểm kê ra sao?',
  S0291: 'Quy trình đo đạc lượng phát thải KNK và carbon sinh khối bằng UAV của S0291 gồm những bước nào?',
  S0294: 'Dịch vụ S0294 giám sát sự cố sạt lở và biến dạng công trình bằng công nghệ nào?',
  S0295: 'Sản phẩm bàn giao của dịch vụ S0295 bao gồm các loại bản đồ và báo cáo gì?',
  S0296: 'Dịch vụ S0296 có thể ứng dụng trong các dự án năng lượng tái tạo như thế nào?',
  S0297: 'Hãy mô tả phạm vi tư vấn và hỗ trợ lập báo cáo giảm phát thải KNK của S0297.',
  S0298: 'Dịch vụ S0298 kiểm tra và giám sát đường ống dẫn khí bằng cảm biến OGI như thế nào?',
  S0299: 'Các cấp độ Level trong dịch vụ S0299 phân loại theo các tiêu chí gì?',
  S0300: 'Dịch vụ S0300 hỗ trợ công tác kiểm kê rác thải và quản lý bãi chôn lấp ra sao?',
  S0301: 'Quy trình thu thập dữ liệu không ảnh và tạo mô hình 3D cho S0301 thực hiện thế nào?',
  S0302: 'Dịch vụ S0302 cung cấp giải pháp đo đạc chất lượng không khí diện rộng như thế nào?',
  S0303: 'Dịch vụ S0303 hỗ trợ phân tích dữ liệu viễn thám phục vụ nông nghiệp thông minh ra sao?',
  S0061: 'Mô tả hồ sơ dịch vụ S0061 và mục tiêu nghiên cứu của dịch vụ này.',
  S0064: 'Dịch vụ S0064 cung cấp giải pháp gì cho các công trình hạ tầng trọng điểm?',
  S0075: 'Trợ lý S0075 có vai trò gì trong việc review hồ sơ nghiên cứu nội bộ S0075?'
};

let passCount = 0;
let failCount = 0;

console.log('\n--- BẮT ĐẦU KIỂM THỬ CALL API CHO 15 DỊCH VỤ ---\n');

for (const s of services) {
  const serviceId = s.id;
  const question = questions[serviceId] || `Hãy tóm tắt phạm vi dịch vụ và sản phẩm bàn giao của ${serviceId}?`;
  const startTime = Date.now();

  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Host': `127.0.0.1:${PORT}`
      },
      body: JSON.stringify({
        serviceId,
        message: question
      })
    });

    const durationMs = Date.now() - startTime;
    const status = res.status;
    const data = await res.json();

    const isApiCall = data.mode === 'gemini';
    const hasAnswer = typeof data.answer === 'string' && data.answer.length > 50;
    const hasSources = Array.isArray(data.sources) && data.sources.length > 0;
    const correctService = data.serviceId === serviceId;

    const pass = status === 200 && isApiCall && hasAnswer && correctService;

    if (pass) passCount++;
    else failCount++;

    const resultRecord = {
      serviceId,
      serviceTitle: s.title,
      page: s.page,
      question,
      httpStatus: status,
      durationMs,
      mode: data.mode,
      model: data.model || 'gemini-3.5-flash-lite',
      grounded: data.grounded,
      answerLength: data.answer?.length || 0,
      sourcesCount: data.sources?.length || 0,
      sources: data.sources,
      pass,
      answerSnippet: data.answer ? data.answer.substring(0, 180).replace(/\n/g, ' ') + '...' : ''
    };

    testResults.push(resultRecord);

    console.log(`[${pass ? 'PASS' : 'FAIL'}] Dịch vụ ${serviceId} (${s.page})`);
    console.log(`       HTTP: ${status} | Thời gian: ${durationMs}ms | Mode: ${data.mode} | Model: ${data.model || 'gemini-3.5-flash-lite'}`);
    console.log(`       Độ dài câu trả lời: ${data.answer?.length || 0} ký tự | Nguồn trích dẫn: ${data.sources?.length || 0}`);
    console.log(`       Trích đoạn trả lời API: "${resultRecord.answerSnippet}"\n`);
  } catch (err) {
    failCount++;
    console.error(`[FAIL] Dịch vụ ${serviceId}: Lỗi kết nối API - ${err.message}`);
    testResults.push({
      serviceId,
      serviceTitle: s.title,
      page: s.page,
      question,
      pass: false,
      error: err.message
    });
  }
}

// Kiểm thử các API Edge Cases
console.log('\n--- BẮT ĐẦU KIỂM THỬ API EDGE CASES & GUARDRAILS ---\n');

const edgeCases = [];

// Edge Case 1: Cross-service question
try {
  const res = await fetch(`http://127.0.0.1:${PORT}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceId: 'S0291', message: 'Dịch vụ S0301 làm gì?' })
  });
  const data = await res.json();
  const pass = res.status === 200 && data.handoff === true && data.mode === 'guidance';
  edgeCases.push({ caseName: 'Cross-service Routing (Chuyển tiếp dịch vụ)', pass, status: res.status, mode: data.mode, handoff: data.handoff });
  console.log(`[${pass ? 'PASS' : 'FAIL'}] Cross-service Routing: Handoff=${data.handoff}, Mode=${data.mode}`);
} catch (e) {
  edgeCases.push({ caseName: 'Cross-service Routing', pass: false, error: e.message });
}

// Edge Case 2: Commercial Pricing question
try {
  const res = await fetch(`http://127.0.0.1:${PORT}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceId: 'S0291', message: 'Báo giá chi tiết gói L2 hết bao nhiêu tiền?' })
  });
  const data = await res.json();
  const pass = res.status === 200 && data.handoff === true && data.answer.includes('Sales/Finance');
  edgeCases.push({ caseName: 'Commercial Pricing Guardrail (Bảo vệ giá cả)', pass, status: res.status, mode: data.mode });
  console.log(`[${pass ? 'PASS' : 'FAIL'}] Commercial Guardrail: Mẫu phản lưu hướng Sales/Finance thành công.`);
} catch (e) {
  edgeCases.push({ caseName: 'Commercial Pricing Guardrail', pass: false, error: e.message });
}

// Edge Case 3: Oversized Payload (>4000 chars)
try {
  const res = await fetch(`http://127.0.0.1:${PORT}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceId: 'S0291', message: 'A'.repeat(4500) })
  });
  const data = await res.json();
  const pass = res.status === 400 && data.code === 'INVALID_MESSAGE';
  edgeCases.push({ caseName: 'Oversized Input Validation (>4000 chars)', pass, status: res.status, code: data.code });
  console.log(`[${pass ? 'PASS' : 'FAIL'}] Payload Boundary Check: HTTP Status=${res.status}, Error Code=${data.code}`);
} catch (e) {
  edgeCases.push({ caseName: 'Oversized Input Validation', pass: false, error: e.message });
}

server.close();

const finalReport = {
  executedAt: new Date().toISOString(),
  testEnvironment: 'Node.js Backend Local API Server + Gemini Live API',
  summary: {
    totalServicesTested: services.length,
    passedApiServices: passCount,
    failedApiServices: failCount,
    passRate: `${((passCount / services.length) * 100).toFixed(1)}%`,
    edgeCasesTested: edgeCases.length,
    edgeCasesPassed: edgeCases.filter(e => e.pass).length
  },
  serviceTestResults: testResults,
  edgeCaseResults: edgeCases
};

await mkdir('test-results', { recursive: true });
await writeFile('test-results/qa-api-test-report.json', JSON.stringify(finalReport, null, 2));

console.log('\n==================================================');
console.log(` TỔNG KẾT KIỂM THỬ CHATBOT API (15 DỊCH VỤ)`);
console.log(` - Tổng số dịch vụ đã test: ${services.length}`);
console.log(` - Số dịch vụ Call API THÀNH CÔNG: ${passCount} / ${services.length}`);
console.log(` - Tỷ lệ Đạt (Pass Rate): ${finalReport.summary.passRate}`);
console.log(` - Tổng số Edge Cases đạt: ${finalReport.summary.edgeCasesPassed} / ${edgeCases.length}`);
console.log(` Báo cáo chi tiết đã lưu tại: test-results/qa-api-test-report.json`);
console.log('==================================================\n');
