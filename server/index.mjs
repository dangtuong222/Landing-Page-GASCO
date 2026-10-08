import http from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { Knowledge } from './knowledge.mjs';
import { answerChat } from './chat.mjs';
import { ChatError } from './gemini.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon' };

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(data));
}

export function createServer(knowledge, { provider, rateLimit = 20, maxConcurrent = 4 } = {}) {
  const clients = new Map();
  let active = 0;
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname.startsWith('/api/')) {
        // Same-origin only; never trust forwarded IPs unless a deployment explicitly configures a trusted proxy.
        const origin = req.headers.origin;
        if (origin && origin !== `http://${req.headers.host}` && origin !== `https://${req.headers.host}`) {
          throw new ChatError(403, 'ORIGIN_DENIED', 'Nguồn yêu cầu không được phép.');
        }
        if (req.headers['sec-fetch-site'] === 'cross-site') throw new ChatError(403, 'ORIGIN_DENIED', 'Nguồn yêu cầu không được phép.');
        if (url.pathname === '/api/health' && req.method === 'GET') {
          return json(res, 200, { ok: true, configured: Boolean(process.env.GEMINI_API_KEY),
            model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite', documents: knowledge.data.documents.length,
            updatedAt: knowledge.data.generatedAt });
        }
        if (url.pathname === '/api/services' && req.method === 'GET') {
          return json(res, 200, { services: knowledge.data.services.map(({ id, page, title, internal, documentCount }) => ({ id, page, title, internal, documentCount })) });
        }
        if (url.pathname !== '/api/chat') throw new ChatError(404, 'NOT_FOUND', 'Không tìm thấy API.');
        if (req.method !== 'POST') throw new ChatError(405, 'METHOD_NOT_ALLOWED', 'API chat chỉ nhận POST.');
        if (!req.headers['content-type']?.startsWith('application/json')) throw new ChatError(415, 'CONTENT_TYPE', 'Yêu cầu cần JSON.');
        if (Number(req.headers['content-length']) > 100000) throw new ChatError(413, 'BODY_LIMIT', 'Yêu cầu quá lớn.');
        const now = Date.now();
        for (const [ip, entry] of clients) if (entry.until < now) clients.delete(ip);
        const ip = req.socket.remoteAddress;
        const entry = clients.get(ip) || { count: 0, until: now + 60000 };
        if (++entry.count > rateLimit) throw new ChatError(429, 'RATE_LIMIT', 'Bạn gửi quá nhiều câu hỏi. Vui lòng đợi một phút.');
        clients.set(ip, entry);
        const buffers = [];
        let bytes = 0;
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 100000) throw new ChatError(413, 'BODY_LIMIT', 'Yêu cầu quá lớn.');
          buffers.push(chunk);
        }
        // Buffer decoding in one pass avoids corrupting Vietnamese across packet boundaries.
        let body;
        try { body = JSON.parse(Buffer.concat(buffers).toString('utf8')); } catch { throw new ChatError(400, 'INVALID_JSON', 'JSON không hợp lệ.'); }
        if (active >= maxConcurrent) throw new ChatError(429, 'SERVER_BUSY', 'Trợ lý đang bận. Vui lòng thử lại sau.');
        active++;
        try { return json(res, 200, await answerChat(knowledge, body, provider)); }
        finally { active--; }
      }
      if (!['GET', 'HEAD'].includes(req.method)) throw new ChatError(405, 'METHOD_NOT_ALLOWED', 'Phương thức không được phép.');
      let pathname;
      try { pathname = decodeURIComponent(url.pathname); } catch { throw new ChatError(400, 'INVALID_PATH', 'Đường dẫn không hợp lệ.'); }
      const segments = pathname.split('/').filter(Boolean);
      // Strict public allowlist: secrets, source docs, generated index, server and outputs can never be served.
      if (segments.some(s => s.startsWith('.') || s.includes('\\') || s.includes(':') || s.includes('\0'))
          || (segments[0] && !['index.html', '404.html', 'assets'].includes(segments[0]) && !/^landing_page_(0[1-9]|1[0-5])$/.test(segments[0]))) {
        throw new ChatError(404, 'NOT_FOUND', 'Không tìm thấy trang.');
      }
      if (!segments.length || pathname.endsWith('/')) segments.push('index.html');
      if (segments.length === 1 && /^landing_page_/.test(segments[0])) {
        res.writeHead(301, { Location: `${pathname}/${url.search}` }); return res.end();
      }
      const filename = path.resolve(ROOT, ...segments);
      if (!filename.startsWith(ROOT + path.sep) || !MIME[path.extname(filename)]) throw new ChatError(404, 'NOT_FOUND', 'Không tìm thấy trang.');
      let data;
      try {
        const resolved = await realpath(filename);
        if (!resolved.startsWith(ROOT + path.sep)) throw new Error('outside workspace');
        data = await readFile(filename);
      } catch { throw new ChatError(404, 'NOT_FOUND', 'Không tìm thấy trang.'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filename)], 'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch (error) {
      if (error.retryAfterSeconds) res.setHeader('Retry-After', String(error.retryAfterSeconds));
      if (!res.headersSent) json(res, error instanceof ChatError ? error.status : 500,
        { error: error instanceof ChatError ? error.message : 'Máy chủ gặp lỗi. Vui lòng thử lại.', code: error instanceof ChatError ? error.code : 'SERVER_ERROR',
          ...(error.retryAfterSeconds ? { retryAfterSeconds: error.retryAfterSeconds } : {}) });
      else res.end();
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const knowledge = Knowledge.load(process.env.KNOWLEDGE_PATH || path.join(ROOT, '.knowledge/index.json'));
    const port = Number(process.env.PORT || 8080);
    const host = process.env.HOST || '127.0.0.1';
    createServer(knowledge).listen(port, host, () => console.log(`GASCOLAE: http://${host}:${port} — ${knowledge.data.documents.length} tài liệu / 15 dịch vụ`));
  } catch (error) {
    console.error(error.message); process.exitCode = 1;
  }
}
