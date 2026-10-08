export class ChatError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function generate(payload, { fetchImpl = fetch, timeoutMs = 45000,
  apiKey = globalThis.process?.env?.GEMINI_API_KEY,
  model = globalThis.process?.env?.GEMINI_MODEL || 'gemini-3.5-flash-lite' } = {}) {
  const key = apiKey;
  if (!key) throw new ChatError(503, 'MISSING_KEY', 'Máy chủ chưa cấu hình khóa Gemini.');
  if (!/^[a-zA-Z0-9._-]+$/.test(model)) throw new ChatError(503, 'INVALID_MODEL', 'Tên model Gemini không hợp lệ.');
  let response;
  try {
    response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new ChatError(504, 'GEMINI_TIMEOUT', 'Kết nối Gemini bị gián đoạn hoặc quá thời gian chờ. Vui lòng thử lại.');
  }
  if (!response.ok) {
    // Do not relay upstream payloads: they can contain secrets, internal project IDs or documents.
    const messages = {
      400: ['GEMINI_REQUEST', 'Gemini từ chối cấu hình yêu cầu. Cần kiểm tra model hoặc khóa API ở máy chủ.'],
      401: ['GEMINI_AUTH', 'Khóa API chưa được Gemini chấp nhận.'],
      403: ['GEMINI_PERMISSION', 'Khóa API chưa có quyền sử dụng Gemini hoặc bị hạn chế.'],
      404: ['GEMINI_MODEL', 'Model Gemini được cấu hình chưa khả dụng cho khóa API này.'],
      429: ['GEMINI_QUOTA', 'Gemini đang giới hạn lượt sử dụng. Vui lòng thử lại sau.'],
    };
    const [code, message] = messages[response.status] || ['GEMINI_UNAVAILABLE', 'Gemini tạm thời chưa sẵn sàng. Vui lòng thử lại sau.'];
    const error = new ChatError(response.status === 429 ? 429 : 502, code, message);
    if (response.status === 429) {
      let details;
      try { details = (await response.json()).error?.details || []; } catch { details = []; }
      const delay = details.find(d => d['@type']?.endsWith('RetryInfo'))?.retryDelay;
      const seconds = Number.parseFloat(delay);
      error.retryAfterSeconds = Math.ceil(Number.isFinite(seconds) ? Math.max(1, Math.min(seconds, 3600)) : 60);
      const quotas = details.find(d => d['@type']?.endsWith('QuotaFailure'))?.violations || [];
      error.quotaScope = quotas.some(q => /perday|per_day/i.test(q.quotaId || q.quotaMetric || '')) ? 'daily' : 'rate';
    }
    throw error;
  }
  let data;
  try { data = await response.json(); } catch { throw new ChatError(502, 'GEMINI_RESPONSE', 'Gemini trả về dữ liệu không hợp lệ.'); }
  const answer = data.candidates?.[0]?.content?.parts?.filter(p => p.text && !p.thought).map(p => p.text).join('\n').trim();
  if (!answer) throw new ChatError(502, 'GEMINI_EMPTY', 'Gemini chưa trả về câu trả lời phù hợp. Vui lòng diễn đạt lại câu hỏi.');
  return answer;
}
