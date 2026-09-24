/**
 * GASCOLAE S0301 - GIÁM SÁT RÒ RỈ METHANE BẰNG UAV-TDLAS & TRẠM KHÍ TƯỢNG
 * Interactive Scripts & AI Agent Engine (AGENT_S0301 - Methane Pilot)
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initTechTabs();
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

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      mobileToggle.textContent = navMenu.classList.contains('open') ? '✕' : '☰';
    });

    // Close menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        if (mobileToggle) mobileToggle.textContent = '☰';
      });
    });
  }
}

/* Technology Showcase Tabs */
function initTechTabs() {
  const tabBtns = document.querySelectorAll('.tech-tab-btn');
  const tabContents = document.querySelectorAll('.tech-tab-content');

  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeContent = document.getElementById(targetTab);
      if (activeContent) {
        activeContent.classList.add('active');
      }
    });
  });
}

/* FAQ Accordion */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;
    
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
    const infraType = document.getElementById('infraType').value;
    const scope = document.getElementById('scope').value.trim();

    if (!fullName || !email || !phone || !company || !infraType) {
      alert('⚠️ Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
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

      alert(`🎉 Cảm ơn ${fullName}! Yêu cầu khảo sát thí điểm dịch vụ S0301 cho cơ sở ${company} (${infraType}) đã được gửi tới bộ phận Sales/BD của GASCOLAE.`);
    }, 1200);
  });
}

/* AI Agent Assistant Engine (AGENT_S0301 - METHANE PILOT) */
function initAIAgent() {
  const chatBody = document.getElementById('aiChatBody');
  const chatInput = document.getElementById('aiChatInput');
  const sendBtn = document.getElementById('aiSendBtn');
  const suggestBtns = document.querySelectorAll('.suggest-btn');

  if (!chatBody || !chatInput || !sendBtn) return;

  function appendMessage(text, sender = 'bot') {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message', sender);
    msgDiv.innerHTML = text;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function handleUserQuery(queryText) {
    if (!queryText || queryText.trim() === '') return;
    
    // User message
    appendMessage(escapeHtml(queryText), 'user');
    chatInput.value = '';

    // Simulate AI thinking & reply according to AGENT_S0301 Knowledge Base & Guardrails
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

/* Agent Knowledge Engine Rules for S0301 */
function generateAgentReply(query) {
  if (query.includes('giá') || query.includes('chi phí') || query.includes('bao nhiêu tiền') || query.includes('bảng giá')) {
    return 'Chi phí khảo sát dịch vụ S0301 được tính theo quy mô hạ tầng (số km tuyến ống, diện tích bãi chôn lấp) và cấp độ Level 1/2/3. Hiện báo giá chuẩn hóa đang ở trạng thái [CẦN XÁC MINH] bởi bộ phận Sales & Finance của GASCOLAE. Bạn có thể gửi yêu cầu ở Form bên dưới để nhận ước tính chi phí nhé!';
  }
  
  if (query.includes('ogi') || query.includes('camera') || query.includes('khác gì')) {
    return 'Cảm biến TDLAS trên UAV đo nồng độ cột CH₄ (ppm·m) với độ nhạy mức ppb và kết hợp mô hình Plume định lượng được lưu lượng kg/h và tCO₂e/năm. Camera OGI truyền thống chỉ cho hình ảnh quan sát định tính chứ không định lượng được.';
  }

  if (query.includes('level') || query.includes('cấp độ') || query.includes('gói')) {
    return 'Dịch vụ S0301 cung cấp 3 Cấp độ:<br>• <strong>Level 1</strong>: Rà soát định kỳ (Screening)<br>• <strong>Level 2</strong>: Phát hiện & Định lượng kg/h (Repair verification)<br>• <strong>Level 3</strong>: Hồ sơ MRV & Tín chỉ Carbon audit-ready.';
  }

  if (query.includes('thời tiết') || query.includes('gió') || query.includes('no-go')) {
    return 'Trạng thái tạm hoãn bay NO-GO được kích hoạt khi vận tốc gió hiện trường > 5m/s (hoặc 8m/s tùy cấu hình UAV/địa hình), có mưa, sương mù dày đạc hoặc không được cấp phép bay an toàn.';
  }

  if (query.includes('carbon') || query.includes('tín chỉ') || query.includes('chấp nhận')) {
    return 'Bộ hồ sơ MRV của S0301 được thiết kế tuân thủ tiêu chuẩn kiểm kê ISO 14064, hướng dẫn OGMP 2.0 và quy chuẩn tín chỉ carbon quốc tế (VCS / CDM / Article 6 Paris Agreement), sẵn sàng cho thẩm định viên độc lập (Verifier) kiểm toán.';
  }

  return 'Xin chào! Tôi là Methane Pilot - Trợ lý AI của dịch vụ S0301. Tôi có thể tư vấn chi tiết cho bạn về 3 Cấp độ khảo sát (Level 1–3), quy trình bay SOP, mô hình định lượng Plume hay hồ sơ tín chỉ carbon. Bạn cần hỗ trợ thêm thông tin nào?';
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}

/* Smooth Scrolling */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
