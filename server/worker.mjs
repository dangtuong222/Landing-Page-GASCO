import { answerChat } from './chat.mjs';
import { ChatError, generate } from './gemini.mjs';

// The deployed worker receives its private knowledge in the server bundle.
// No route serves that bundle, documents, policies or credentials.
export function createWorker(knowledge, { provider, allowedOrigins = ['https://dangtuong222.github.io'], rateLimit = 20, maxConcurrent = 4 } = {}) {
  const clients = new Map();
  let active = 0;
  return {
    async fetch(request, env = {}) {
      const url = new URL(request.url);
      const origin = request.headers.get('origin');
      const accepted = origin && (origin === url.origin || allowedOrigins.includes(origin));
      const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff', Vary: 'Origin' };
      if (accepted) Object.assign(headers, { 'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '600' });
      const json = (status, data) => new Response(JSON.stringify(data), { status, headers });
      try {
        if (!url.pathname.startsWith('/api/')) throw new ChatError(404, 'NOT_FOUND', 'Không tìm thấy trang.');
        if (origin && !accepted) throw new ChatError(403, 'ORIGIN_DENIED', 'Nguồn yêu cầu không được phép.');
        if (request.method === 'OPTIONS') {
          if (!accepted || !['GET', 'POST'].includes(request.headers.get('access-control-request-method'))
              || (request.headers.get('access-control-request-headers') || '').split(',').some(h => h.trim() && h.trim().toLowerCase() !== 'content-type')) {
            throw new ChatError(403, 'ORIGIN_DENIED', 'Nguồn yêu cầu không được phép.');
          }
          return new Response(null, { status: 204, headers });
        }
        const model = env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
        if (url.pathname === '/api/health' && request.method === 'GET') {
          return json(200, { ok: true, configured: Boolean(env.GEMINI_API_KEY), model,
            documents: knowledge.data.documents.length, updatedAt: knowledge.data.generatedAt });
        }
        if (url.pathname === '/api/services' && request.method === 'GET') {
          return json(200, { services: knowledge.data.services.map(({ id, page, title, internal, documentCount }) => ({ id, page, title, internal, documentCount })) });
        }
        if (url.pathname !== '/api/chat') throw new ChatError(404, 'NOT_FOUND', 'Không tìm thấy API.');
        if (request.method !== 'POST') throw new ChatError(405, 'METHOD_NOT_ALLOWED', 'API chat chỉ nhận POST.');
        if (!request.headers.get('content-type')?.startsWith('application/json')) throw new ChatError(415, 'CONTENT_TYPE', 'Yêu cầu cần JSON.');
        if (Number(request.headers.get('content-length')) > 100000) throw new ChatError(413, 'BODY_LIMIT', 'Yêu cầu quá lớn.');
        const now = Date.now();
        for (const [ip, entry] of clients) if (entry.until < now) clients.delete(ip);
        // Cloudflare supplies this header; browser-supplied forwarded headers are ignored.
        const ip = request.headers.get('cf-connecting-ip') || 'unknown';
        const entry = clients.get(ip) || { count: 0, until: now + 60000 };
        clients.set(ip, entry);
        if (++entry.count > rateLimit) throw new ChatError(429, 'RATE_LIMIT', 'Bạn gửi quá nhiều câu hỏi. Vui lòng đợi một phút.');
        if (active >= maxConcurrent) throw new ChatError(429, 'SERVER_BUSY', 'Trợ lý đang bận. Vui lòng thử lại sau.');
        const reader = request.body?.getReader();
        if (!reader) throw new ChatError(400, 'INVALID_JSON', 'JSON không hợp lệ.');
        const parts = [];
        let bytes = 0;
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          if (bytes > 100000) { await reader.cancel(); throw new ChatError(413, 'BODY_LIMIT', 'Yêu cầu quá lớn.'); }
          parts.push(value);
        }
        const buffer = new Uint8Array(bytes);
        let offset = 0;
        for (const part of parts) { buffer.set(part, offset); offset += part.byteLength; }
        let body;
        try { body = JSON.parse(new TextDecoder().decode(buffer)); } catch { throw new ChatError(400, 'INVALID_JSON', 'JSON không hợp lệ.'); }
        if (active >= maxConcurrent) throw new ChatError(429, 'SERVER_BUSY', 'Trợ lý đang bận. Vui lòng thử lại sau.');
        active++;
        try {
          const result = await answerChat(knowledge, body, provider || (payload => generate(payload, { apiKey: env.GEMINI_API_KEY || '', model })));
          return json(200, { ...result, model });
        } finally { active--; }
      } catch (error) {
        if (error.retryAfterSeconds) headers['Retry-After'] = String(error.retryAfterSeconds);
        return json(error instanceof ChatError ? error.status : 500, {
          error: error instanceof ChatError ? error.message : 'Máy chủ gặp lỗi. Vui lòng thử lại.',
          code: error instanceof ChatError ? error.code : 'SERVER_ERROR',
          ...(error.retryAfterSeconds ? { retryAfterSeconds: error.retryAfterSeconds } : {}) });
      }
    },
  };
}
