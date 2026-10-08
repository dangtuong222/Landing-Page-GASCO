// This module runs on GitHub Pages and in the private backend. It contains no credentials.
export const normalizeChat = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
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
  // An outage is not a reason to substitute keyword matches for a conversation.
  return { serviceId, mode: 'unavailable', providerIssue, grounded: false, sources: [],
    answer: `Tôi hỗ trợ ${serviceSubjects[serviceId] || serviceId}, nhưng hiện chưa kết nối được AI để trao đổi chi tiết về câu hỏi này. Bạn vui lòng thử lại sau. Tôi vẫn có thể giới thiệu dịch vụ nếu bạn muốn.` };
}
