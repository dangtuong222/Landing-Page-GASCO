// Read-only model verification. Never print credentials or raw upstream errors.
import { generate } from '../server/gemini.mjs';
const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
try {
  const response = await generate({ contents: [{ role: 'user', parts: [{ text: 'Chỉ trả lời: Kết nối thành công.' }] }] });
  console.log(JSON.stringify({ model, ok: true, answer: response }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ model, ok: false, code: error.code, message: error.message }, null, 2));
  process.exitCode = 1;
}
