/**
 * GASCOLAE S0295 - MRV GIẢM PHÁT THẢI CO2 MÁI NHÀ XANH BẰNG UAV
 * Interactive Scripts & AI Agent Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initFAQ();
  initLeadForm();
  initAIAgent();
  initSmoothScroll();
});

/* Navbar Scroll & Mobile Toggle */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      mobileToggle.textContent = navMenu.classList.contains('open') ? '✕' : '☰';
    });
  }

  // Close menu on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      if (mobileToggle) mobileToggle.textContent = '☰';
    });
  });
}

/* FAQ Accordion */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(el => el.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* Consultation Lead Form Submission */
function initLeadForm() {
  const form = document.getElementById('consultationForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const company = document.getElementById('company').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const area = document.getElementById('greenRoofArea').value.trim();

    if (!fullName || !email || !phone) {
      showToast('⚠️ Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại!');
      return;
    }

    // Submit animation & feedback
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Đang gửi yêu cầu...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      form.reset();

      showToast(`Bản demo hoàn tất, ${fullName}. Thông tin S0295 chưa được gửi tới GASCOLAE.`);
    }, 1200);
  });
}

/* AI Agent Assistant Engine (AGENT_S0295) */
function initAIAgent() {
  const chatBody = document.getElementById('aiChatBody');
  const chatInput = document.getElementById('aiChatInput');
  const sendBtn = document.getElementById('aiSendBtn');
  const suggestBtns = document.querySelectorAll('.suggest-btn');

  if (!chatBody || !chatInput || !sendBtn) return;

  function appendMessage(text, sender = 'bot') {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message', sender);
    msgDiv.textContent = text;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function handleUserQuery(queryText) {
    if (!queryText || queryText.trim() === '') return;
    
    // User message
    appendMessage(queryText, 'user');
    chatInput.value = '';

    // Simulate AI thinking & reply according to AGENT_S0295 Knowledge Base & Guardrails
    setTimeout(() => {
      const botResponse = generateAgentReply(queryText.toLowerCase());
      appendMessage(botResponse, 'bot');
    }, 600);
  }

  sendBtn.addEventListener('click', () => {
    handleUserQuery(chatInput.value);
  });

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleUserQuery(chatInput.value);
    }
  });

  suggestBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      handleUserQuery(btn.textContent.trim());
    });
  });
}

/* Agent Knowledge Engine Rules */
function generateAgentReply(query) {
  if (query.includes('giá') || query.includes('chi phí') || query.includes('bao nhiêu tiền') || query.includes('bảng giá')) {
    return 'Dịch vụ tính theo diện tích mái xanh (m²) và gói dịch vụ Level 1/2/3. Hiện đơn giá niêm yết chính thức đang ở trạng thái [CẦN XÁC MINH] từ bộ phận Sales & Finance của GASCOLAE. Bạn vui lòng gửi yêu cầu qua Form tư vấn bên cạnh để nhận báo giá chi tiết nhé!';
  }
  
  if (query.includes('đo toàn bộ') || query.includes('đất') || query.includes('rễ') || query.includes('uav đo được')) {
    return 'Không. UAV đo gián tiếp sinh khối thực vật trên mặt đất bằng cảm biến RGB/đa phổ/LiDAR. Carbon trong rễ và giá thể (đất) được đo đạc chính xác qua các ô mẫu thực địa mặt đất – dịch vụ luôn kết hợp phương án lai UAV + ô mẫu để số liệu đạt chuẩn kiểm toán!';
  }
  
  if (query.includes('level') || query.includes('gói') || query.includes('khác nhau')) {
    return 'Dịch vụ gồm 3 Level: \n- Level 1 (Baseline Mapping): Bản đồ thực vật & độ che phủ bằng UAV.\n- Level 2 (Carbon Monitoring & MRV): Thêm ô mẫu mặt đất + mô hình carbon tCO₂e định kỳ.\n- Level 3 (Carbon Credit Readiness): Hồ sơ phương pháp luận & phối hợp bên xác minh tín chỉ carbon.';
  }
  
  if (query.includes('chuẩn bị') || query.includes('điều kiện') || query.includes('bay')) {
    return 'Bạn cần cung cấp quyền tiếp cận mái, hồ sơ tòa nhà (as-built, loại mái xanh, loài thực vật, độ dày giá thể). Đội ngũ GASCOLAE sẽ hỗ trợ thủ tục cấp phép bay UAV và kiểm tra an toàn mái (JSA) trước chuyến khảo sát.';
  }
  
  if (query.includes('tín chỉ') || query.includes('bán tín chỉ') || query.includes('phát hành')) {
    return 'Dữ liệu MRV tạo nền tảng hồ sơ sẵn sàng cho chương trình tín chỉ. Thị trường carbon nội địa Việt Nam dự kiến vận hành chính thức từ 2029 theo Nghị định 06/2022/NĐ-CP & Quyết định 232/QĐ-TTg. Việc công nhận tín chỉ phụ thuộc vào phương pháp luận được duyệt.';
  }
  
  if (query.includes('nào') || query.includes('phù hợp') || query.includes('tòa nhà')) {
    return 'Dịch vụ S0295 phù hợp với Chủ tòa nhà văn phòng/thương mại, Ban quản lý Facility, Quản lý ESG cần số liệu kiểm toán cho báo cáo phát triển bền vững/GHG inventory và Đơn vị phát triển dự án carbon.';
  }

  return 'Cảm ơn câu hỏi của bạn! Dịch vụ S0295 kết hợp khảo sát UAV với ô mẫu mặt đất để đo đếm hấp thụ carbon mái xanh theo chuẩn ISO 14064-2/IPCC. Bạn có thể gửi câu hỏi cụ thể hơn hoặc để lại thông tin trên Form tư vấn để chuyên gia tư vấn trực tiếp nhé!';
}

/* Smooth Scrolling */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const navHeight = 80;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* Global Toast Notification */
function showToast(message) {
  let toast = document.querySelector('.modal-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'modal-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}
