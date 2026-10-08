// This module runs on GitHub Pages and in the private backend. It contains no credentials.
export const normalizeChat = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
const ignored = new Set('toi ban anh chi la va cua cho ve cac mot co khong nao gi nay voi duoc trong khi de the thi bao nhieu hay can xin vui long dich vu huong dan'.split(' '));
const words = value => [...new Set(normalizeChat(value).match(/[a-z0-9]+/g)?.filter(w => w.length > 1 && !ignored.has(w)) || [])];

export function guidanceReply(serviceId, message, services = []) {
  const query = normalizeChat(message).replace(/[.!?,]+/g, ' ').trim();
  const other = message.toUpperCase().match(/\bS\d{4}\b/g)?.find(id => id !== serviceId);
  const reply = answer => ({ answer, sources: [], serviceId, grounded: false, mode: 'guidance' });
  if (other) {
    const target = services.find(s => s.id === other);
    return { ...reply(target ? `Bạn đang hỏi về ${other}. Hãy mở trang ${target.page} để trợ lý tra cứu đúng hồ sơ dịch vụ đó.` : `Trợ lý này chỉ hỗ trợ hồ sơ ${serviceId}. Mã ${other} chưa có trong kho 15 dịch vụ.`), handoff: true };
  }
  if (/^(chao( ban| anh| chi)?|xin chao( ban)?|hello|hi|alo|cam on( ban)?|thank you)$/.test(query)) {
    return reply(`Xin chào! Tôi là trợ lý ${serviceId}. Bạn có thể hỏi về phạm vi dịch vụ, các gói Level, quy trình, sản phẩm bàn giao hoặc thông tin cần chuẩn bị. Bạn muốn tìm hiểu phần nào?`);
  }
  const commercial = normalizeChat(message.normalize('NFC').replace(/giả|già/gi, ' '))
    .replace(/danh gia|gia tri|gia dinh|tham gia|chuyen gia|tac gia|quoc gia|gia tang|gia lap|gia su/g, '');
  if (/\bgia\b|bao gia|chi phi|bao nhieu tien|don gia|chiet khau|discount|price|pricing|cost|vnd|\busd\b|\bdong\b.*\b(tinh|tong|phi)\b/.test(commercial)) {
    return { ...reply('Thông tin thương mại cần được Sales/Finance GASCOLAE rà soát và phê duyệt. Trợ lý không cung cấp hoặc tính toán số tiền. Bạn có thể chuẩn bị phạm vi khảo sát, quy mô, sản phẩm bàn giao và thời gian dự kiến để trao đổi báo giá.'), handoff: true };
  }
  return null;
}

export function documentReply(data, serviceId, message, history = [], providerIssue = 'GEMINI_UNAVAILABLE') {
  const guidance = guidanceReply(serviceId, message, data.services);
  if (guidance) return guidance;
  const result = { serviceId, mode: 'document_lookup', providerIssue, grounded: false, sources: [] };
  const unknown = () => ({ ...result, answer: `Tôi chỉ hỗ trợ hồ sơ ${serviceId} và chưa tìm thấy thông tin đủ phù hợp cho câu hỏi này trong nội dung tra cứu hiện có. Bạn có thể hỏi rõ hơn về phạm vi, Level, quy trình, sản phẩm bàn giao hoặc điều kiện triển khai.` });
  const service = data.services.find(s => s.id === serviceId);
  const query = normalizeChat(message);
  if (!service || /api.?key|system prompt|khoa api|huong dan he thong|nau pho|pho bo|tong thong|role[xs]|bitcoin/.test(query)) return unknown();
  let intent = '';
  if (/ban giao|dau ra|nhan duoc|deliverable/.test(query)) intent = 'deliverable';
  else if (/\blevel\b|\bl[1-4]\b|cac goi|cap do/.test(query)) intent = 'level';
  else if (/chuan bi|truoc khi|dieu kien/.test(query)) intent = 'prepare';
  else if (/quy trinh|cac buoc|\bsop\b/.test(query)) intent = 'workflow';
  else if (/pham vi|phu hop|lam gi|la gi|tong quan/.test(query) && words(message).length <= 4) intent = 'overview';
  const patterns = { deliverable: /ban giao|dau ra|deliverable|ket qua/, level: /level|\bl[1-4]\b|cac goi|cap do|cau hinh goi/,
    prepare: /chuan bi|dieu kien|quy trinh|workflow|sop/, workflow: /quy trinh|workflow|how it works|sop|lo trinh/,
    overview: /tong quan|giai phap|pham vi|hero|overview/ };
  let terms = words(message).filter(w => w !== serviceId.toLowerCase());
  if (!terms.length && history.length) terms = words(history.filter(h => h.role === 'user').at(-1)?.text || '');
  const entries = service.entries;
  const frequency = new Map();
  for (const entry of entries) for (const w of words(entry.text)) frequency.set(w, (frequency.get(w) || 0) + 1);
  const ranked = entries.map(entry => {
    const text = normalizeChat(`${entry.title}\n${entry.text}`);
    const present = new Set(words(text));
    let score = 0, matched = 0;
    for (const term of terms) if (present.has(term)) {
      matched++;
      score += Math.log(1 + (entries.length + 1) / (1 + (frequency.get(term) || 0)));
      if (normalizeChat(entry.title).includes(term)) score += 1.5;
    }
    const topic = intent && patterns[intent].test(normalizeChat(`${entry.anchor.replaceAll('-', ' ')} ${entry.title}`));
    if (topic) score += 12;
    if (entry.faq) score += 3;
    return { entry, score, eligible: topic || (matched >= Math.min(2, terms.length) && matched / Math.max(terms.length, 1) >= 0.55) };
  }).filter(r => r.eligible && r.score > 0).sort((a, b) => b.score - a.score);
  if (!ranked.length) return unknown();
  const selected = ranked.slice(0, intent === 'level' ? 3 : 1).map(r => r.entry);
  return { ...result, grounded: true,
    answer: `Theo hồ sơ ${serviceId}, dưới đây là trích đoạn liên quan trong nội dung dịch vụ:\n\n${selected.map((e, i) => `${e.title}\n${e.text} [${i + 1}]`).join('\n\n')}\n\nBạn có thể hỏi tiếp về một nội dung cụ thể.`,
    sources: selected.map((e, i) => ({ number: i + 1, file: e.file, locator: e.title, anchor: e.anchor, service: serviceId })) };
}
