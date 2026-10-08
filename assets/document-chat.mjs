// This module runs on GitHub Pages and in the private backend. It contains no credentials.
export const normalizeChat = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
const ignored = new Set('toi ban anh chi la va cua cho ve cac mot co khong nao gi nay voi duoc trong khi de the thi bao nhieu hay can xin vui long dich vu huong dan'.split(' '));
const words = value => [...new Set(normalizeChat(value).match(/[a-z0-9]+/g)?.filter(w => w.length > 1 && !ignored.has(w)) || [])];

// Customer-facing subjects, rather than document titles or agent configuration.
export const serviceSubjects = {
  S0296: 'ứng dụng UAV để dự báo và hỗ trợ khắc phục lũ lụt',
  S0297: 'giám sát sạt lở và mái dốc đường miền núi bằng UAV và IoT',
  S0291: 'lập bản đồ dấu chân carbon bằng UAV',
  S0295: 'đo lường và theo dõi giảm phát thải CO2 từ mái xanh',
  S0301: 'khảo sát rò rỉ methane bằng UAV và cảm biến TDLAS',
  S0300: 'khảo sát rừng bằng UAV và LiDAR phục vụ quản lý rừng và carbon',
  S0289: 'quan trắc chất lượng không khí bằng UAV đa cảm biến khí',
  S0298: 'lập bản đồ bụi mịn đô thị trong không gian 3D bằng UAV',
  S0299: 'làm sạch bụi trên pin mặt trời bằng UAV và vi hạt tích điện',
  S0303: 'sàng lọc phát thải tàu biển bằng UAV đo SO2 và CO2',
  S0302: 'khảo sát khí nhà kính tại khu công nghiệp bằng UAV đa cảm biến',
  S0294: 'định lượng methane tại bãi chôn lấp bằng UAV',
  S0075: 'tìm hiểu đề xuất UAV VTOL tuần tra biên giới',
  S0064: 'tìm hiểu đề xuất giám sát nhiệt và khí tại kho đạn, kho nhiên liệu',
  S0061: 'tìm hiểu đề xuất kiểm tra hồng ngoại nhà máy năng lượng quốc phòng',
};

export function customerText(text) {
  // Also cleans replies from an older backend during a rolling deployment.
  return text.replace(/\s*\[\d+(?:\s*,\s*\d+)*\]/g, '')
    .replace(/^Theo hồ sơ(?: dịch vụ)?(?: S\d{4})?[,.:]?\s*/i, '')
    .trim();
}

export function guidanceReply(serviceId, message, services = []) {
  const query = normalizeChat(message).replace(/[.!?,]+/g, ' ').trim();
  const other = message.toUpperCase().match(/\bS\d{4}\b/g)?.find(id => id !== serviceId);
  const reply = answer => ({ answer, sources: [], serviceId, grounded: false, mode: 'guidance' });
  if (other) {
    const target = services.find(s => s.id === other);
    return { ...reply(target ? `Bạn đang hỏi về ${other}. Hãy mở trang ${target.page} để trợ lý tra cứu đúng hồ sơ dịch vụ đó.` : `Trợ lý này chỉ hỗ trợ hồ sơ ${serviceId}. Mã ${other} chưa có trong kho 15 dịch vụ.`), handoff: true };
  }
  if (/^(chao( ban| anh| chi)?|xin chao( ban)?|hello|hi|alo|cam on( ban)?|thank you)$/.test(query)) {
    if (/cam on|thank you/.test(query)) return reply('Rất vui được hỗ trợ bạn! Bạn còn muốn tìm hiểu điều gì về dịch vụ này?');
    return reply(`Chào bạn! Tôi là trợ lý ${serviceId}, hỗ trợ bạn tìm hiểu về ${serviceSubjects[serviceId]}. Bạn đang có nhu cầu gì?`);
  }
  const commercial = normalizeChat(message.normalize('NFC').replace(/giả|già/gi, ' '))
    .replace(/danh gia|gia tri|gia dinh|tham gia|chuyen gia|tac gia|quoc gia|gia tang|gia lap|gia su/g, '');
  if (/\bgia\b|bao gia|chi phi|bao nhieu tien|don gia|chiet khau|discount|price|pricing|cost|vnd|\busd\b|\bdong\b.*\b(tinh|tong|phi)\b/.test(commercial)) {
    return { ...reply('Thông tin thương mại cần được Sales/Finance GASCOLAE rà soát và phê duyệt. Trợ lý không cung cấp hoặc tính toán số tiền. Bạn có thể chuẩn bị phạm vi khảo sát, quy mô, sản phẩm bàn giao và thời gian dự kiến để trao đổi báo giá.'), handoff: true };
  }
  if (/^(ban|em|tro ly)( la ai| ten (la )?gi)|^gioi thieu (ve )?(ban|em|minh)|^who are you\b/.test(query)) {
    return reply(`Tôi là trợ lý ${serviceId} của GASCOLAE, hỗ trợ bạn về ${serviceSubjects[serviceId]}. Bạn có thể trao đổi với tôi về nhu cầu, cách thực hiện và kết quả của dịch vụ này.${['S0075', 'S0064', 'S0061'].includes(serviceId) ? ' Dịch vụ hiện ở giai đoạn đề xuất, chưa xác nhận triển khai.' : ''} Bạn muốn bắt đầu từ đâu?`);
  }
  if (/^(ban|em|tro ly) (co the )?(giup|ho tro|lam duoc)( gi| duoc gi)|^toi (co the )?hoi (gi|nhung gi)|^what can you/.test(query)) {
    return reply(`Tôi có thể giúp bạn hiểu ${serviceSubjects[serviceId]}, trao đổi xem nhu cầu của bạn có phù hợp, giải thích quy trình và các gói dịch vụ, hoặc làm rõ kết quả bạn nhận được. Bạn đang muốn giải quyết vấn đề nào?`);
  }
  return null;
}

export function documentReply(data, serviceId, message, history = [], providerIssue = 'GEMINI_UNAVAILABLE') {
  const guidance = guidanceReply(serviceId, message, data.services);
  if (guidance) return guidance;
  const result = { serviceId, mode: 'document_lookup', providerIssue, grounded: false, sources: [] };
  const unknown = () => ({ ...result, answer: `Tôi chỉ hỗ trợ ${serviceSubjects[serviceId] || serviceId}. Hiện kết nối AI đang gián đoạn nên tôi chưa thể trả lời chi tiết câu hỏi này. Bạn có thể thử lại sau hoặc hỏi về phạm vi, quy trình và sản phẩm bàn giao.` });
  const service = data.services.find(s => s.id === serviceId);
  const query = normalizeChat(message);
  if (!service || /api.?key|system prompt|khoa api|huong dan he thong|nau pho|pho bo|tong thong|role[xs]|bitcoin/.test(query)) return unknown();
  let intent = '';
  if (/ban giao|dau ra|nhan duoc|deliverable/.test(query)) intent = 'deliverable';
  else if (/\blevel\b|\bl[1-4]\b|cac goi|cap do/.test(query)) intent = 'level';
  else if (/chuan bi|truoc khi|dieu kien/.test(query)) intent = 'prepare';
  else if (/quy trinh|cac buoc|\bsop\b/.test(query)) intent = 'workflow';
  else if (/pham vi|phu hop|lam gi|la gi|tong quan/.test(query) && words(message).length <= 4) intent = 'overview';
  const patterns = { deliverable: /ban giao|dau ra|deliverable|nhan duoc|san pham/, level: /level|\bl[1-4]\b|cac goi|cap do|cau hinh goi/,
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
    // An output question must prefer the actual deliverables section over a FAQ
    // that merely mentions results, legal use or uncertainty.
    if (intent === 'deliverable' && /deliverables|ban-giao/.test(entry.anchor)) score += 24;
    if (entry.faq) score += 3;
    return { entry, score, eligible: topic || (matched >= Math.min(2, terms.length) && matched / Math.max(terms.length, 1) >= 0.55) };
  }).filter(r => r.eligible && r.score > 0).sort((a, b) => b.score - a.score);
  if (!ranked.length) return unknown();
  const selected = ranked.slice(0, intent === 'level' ? 3 : 1).map(r => r.entry);
  return { ...result, grounded: true,
    answer: customerText(selected.map(e => e.text.replace(/^\s*\d+[.)]\s*[^\n]*\?\s*/u, '').trim()).join('\n\n')),
    sources: selected.map((e, i) => ({ number: i + 1, file: e.file, locator: e.title, anchor: e.anchor, service: serviceId })) };
}
