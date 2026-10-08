import { readFileSync } from 'node:fs';
import { ChatError } from './gemini.mjs';

export const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
export function compactLocator(locator) {
  const parts = locator.split(' → ');
  if (parts.length < 2) return locator;
  const first = parts[0].match(/^(.*? · (?:đoạn|dòng)) (\d+)$/);
  const last = parts.at(-1).match(/^(.*? · (?:đoạn|dòng)) (\d+)$/);
  return first && last && first[1] === last[1] ? `${first[1]} ${first[2]}–${last[2]}` : `${parts[0]} → ${parts.at(-1)}`;
}
const stop = new Set('toi ban anh chi la va cua cho ve cac mot co khong nao gi nay voi duoc trong khi de the thi bao nhieu hay can xin vui long dich vu'.split(' '));
export function tokens(value) {
  return normalize(value).match(/[a-z0-9]+/g)?.filter(t => t.length > 1 && !stop.has(t)) || [];
}

export class Knowledge {
  constructor(data) {
    if (data.version !== 1 || data.services?.length !== 15 || data.failures?.length || !data.chunks?.length) {
      throw new Error('Kho kiến thức chưa đầy đủ. Chạy scripts/ingest.py trước.');
    }
    this.data = data;
    this.services = new Map(data.services.map(s => [s.id, s]));
    this.byService = new Map();
    for (const service of data.services) {
      // Evaluation input is never used as factual knowledge; Pricing stays private.
      const chunks = data.chunks.filter(c => c.service === service.id && !c.evaluation && !c.pricing && !/07_Service_/.test(c.file)
        && !/sheet .*test_cases/i.test(c.locator));
      const frequency = new Map();
      const indexed = chunks.map(chunk => {
        const words = tokens(chunk.text);
        const counts = new Map();
        for (const word of words) counts.set(word, (counts.get(word) || 0) + 1);
        for (const word of counts.keys()) frequency.set(word, (frequency.get(word) || 0) + 1);
        return { chunk, counts, length: words.length };
      });
      this.byService.set(service.id, { indexed, frequency, avg: indexed.reduce((sum, c) => sum + c.length, 0) / indexed.length });
    }
  }
  static load(path) {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    data.publicReference = JSON.parse(readFileSync(new URL('../assets/service-faq.json', import.meta.url), 'utf8'));
    return new Knowledge(data);
  }
  service(id) {
    const service = this.services.get(id);
    if (!service) throw new ChatError(400, 'INVALID_SERVICE', 'Mã dịch vụ không hợp lệ.');
    return service;
  }
  retrieve(id, message, history = [], budget = 32000) {
    this.service(id);
    const { indexed, frequency, avg } = this.byService.get(id);
    const latest = new Set(tokens(message));
    const previous = new Set(tokens(history.filter(h => h.role === 'user').slice(-2).map(h => h.text).join(' ')));
    const query = new Set([...latest, ...previous]);
    const ranked = indexed.map(item => {
      let score = 0;
      for (const word of query) {
        const tf = item.counts.get(word) || 0;
        if (!tf) continue;
        const df = frequency.get(word) || 0;
        const idf = Math.log(1 + (indexed.length - df + 0.5) / (df + 0.5));
        score += (latest.has(word) ? 1 : 0.22) * idf * (tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * item.length / avg));
      }
      if (/01_Service_Knowledge|02_Service_Profile/.test(item.chunk.file)) score *= 1.2;
      return { chunk: item.chunk, score };
    }).sort((a, b) => b.score - a.score);
    // Stable overview fallback and source diversity; score-only retrieval loses the service introduction.
    const overview = indexed.find(i => /02_Service_Profile/.test(i.chunk.file))?.chunk;
    const selected = overview ? [overview] : [];
    // Gap review prompts require the whole dependency table, including proposed owners.
    if (/\bgap\b|research gap|khoang trong nghien cuu/i.test(normalize(message))) {
      for (const { chunk } of indexed) {
        if (/05_GAP_CONTEXT|03_RESEARCH_GAP/.test(chunk.locator) && !selected.some(c => c.id === chunk.id)) selected.push(chunk);
      }
    }
    let used = selected.reduce((sum, c) => sum + c.text.length, 0);
    for (const { chunk, score } of ranked) {
      if (score <= 0 || selected.some(c => c.id === chunk.id)) continue;
      if (used + chunk.text.length > budget) continue;
      selected.push(chunk);
      used += chunk.text.length;
      if (selected.length >= 16) break;
    }
    return selected;
  }
}
