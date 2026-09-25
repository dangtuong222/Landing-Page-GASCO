/* ==========================================================================
   GASCOLAE PLATFORM - SERVICE S0291 LANDING PAGE SCRIPT
   Service: Bản đồ carbon footprint sử dụng UAV (S0291)
   Interactive Logic: High-Tech HUD Scanner Modal, Canvas Radar, Nav, Tabs, FAQ, AI Widget
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Header Scroll Effect & Mobile Nav Toggle
  const header = document.getElementById('site-header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    updateActiveNav();
  }, { passive: true });

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const link = document.querySelector(`.nav-link[href*="${sectionId}"]`);

      if (link) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }

  // 2. Lightweight IntersectionObserver for Scroll Reveal (Zero Overhead Once Triggered)
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  // 3. Metric Number Counter Animation
  const heroMetrics = document.querySelector('.hero-metrics');
  let counterAnimated = false;

  if (heroMetrics && 'IntersectionObserver' in window) {
    const metricObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !counterAnimated) {
          counterAnimated = true;
          animateMetrics();
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    metricObserver.observe(heroMetrics);
  }

  function animateMetrics() {
    const r2El = document.getElementById('metric-r2');
    if (!r2El) return;

    let start = 0.0;
    const end = 0.89;
    const duration = 1200;
    const startTime = performance.now();

    function updateCounter(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = (start + (end - start) * easedProgress).toFixed(2);
      r2El.textContent = `R² ${currentVal}`;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }
    requestAnimationFrame(updateCounter);
  }

  // 4. Lightweight Canvas Radar Sweep Overlay for Hero (Low-Spec Optimized)
  const canvas = document.getElementById('hero-radar-canvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let animRunning = true;
    let animId = null;
    let angle = 0;

    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    function drawRadar() {
      if (!animRunning) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width * 0.7;
      const cy = canvas.height * 0.65;
      const radius = Math.min(canvas.width, canvas.height) * 0.35;

      // Draw subtle radar circle
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + 0.35);
      ctx.lineTo(cx, cy);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.fill();

      angle += 0.02;

      animId = requestAnimationFrame(drawRadar);
    }

    // Pause canvas animation when hero is out of view or tab hidden
    const heroSec = document.getElementById('hero');
    if (heroSec && 'IntersectionObserver' in window) {
      const canvasObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!animRunning) {
              animRunning = true;
              drawRadar();
            }
          } else {
            animRunning = false;
            if (animId) cancelAnimationFrame(animId);
          }
        });
      }, { threshold: 0.1 });
      canvasObserver.observe(heroSec);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        animRunning = false;
        if (animId) cancelAnimationFrame(animId);
      } else {
        animRunning = true;
        drawRadar();
      }
    });

    drawRadar();
  }

  // 5. FAQ Accordion Toggle
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      const isOpen = faqItem.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        const icon = item.querySelector('.faq-toggle-icon');
        if (icon) icon.textContent = '+';
      });

      if (!isOpen) {
        faqItem.classList.add('active');
        const icon = question.querySelector('.faq-toggle-icon');
        if (icon) icon.textContent = '−';
      }
    });
  });

  // 6. Lead Form Submission Handler
  const leadForm = document.getElementById('consultation-form');
  const toast = document.getElementById('toast-msg');

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('fullName').value;
      const company = document.getElementById('companyName').value;

      if (toast) {
        toast.textContent = `Bản demo hoàn tất cho ${name} (${company}). Thông tin S0291 chưa được gửi tới GASCOLAE.`;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 5000);
      }
      leadForm.reset();
    });
  }

  // 7. Floating AI Chat Widget Toggle
  const aiTriggerBtn = document.getElementById('ai-trigger-btn');
  const aiModal = document.getElementById('ai-widget-modal');
  const aiCloseBtn = document.getElementById('ai-close-btn');

  if (aiTriggerBtn && aiModal) {
    aiTriggerBtn.addEventListener('click', () => {
      aiModal.classList.toggle('active');
    });
  }

  if (aiCloseBtn && aiModal) {
    aiCloseBtn.addEventListener('click', () => {
      aiModal.classList.remove('active');
    });
  }

  // Close modal on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMediaModal();
      if (aiModal) aiModal.classList.remove('active');
    }
  });

});

// 8. Technical Media Preview Modal Logic (Inspired by 02_S0297)
function openMediaModal(imgSrc, titleText) {
  const modal = document.getElementById('media-modal');
  const modalImg = document.getElementById('modal-media-img');
  const modalTitle = document.getElementById('modal-media-title');

  if (modal && modalImg) {
    modalImg.src = imgSrc;
    modalImg.hidden = false;
    if (modalTitle) modalTitle.textContent = titleText || 'Chẩn đoán Dữ liệu Cảm biến S0291';
    modal.classList.add('active');
  }
}

function closeMediaModal() {
  const modal = document.getElementById('media-modal');
  if (modal) modal.classList.remove('active');
}

// 9. Use Case Tab Switching Function
function switchTab(tabId) {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => btn.classList.remove('active'));

  const activeBtn = Array.from(tabBtns).find(btn => btn.getAttribute('onclick').includes(tabId));
  if (activeBtn) activeBtn.classList.add('active');

  const panels = document.querySelectorAll('.tab-content-panel');
  panels.forEach(panel => panel.classList.remove('active'));

  const targetPanel = document.getElementById(`tab-${tabId}`);
  if (targetPanel) targetPanel.classList.add('active');
}

// 10. Interactive AI Demo Chat Logic
function askPresetQ(questionText) {
  const input = document.getElementById('ai-user-input');
  if (input) {
    input.value = questionText;
    sendChatMessage();
  }
}

function handleKeyPress(e) {
  if (e.key === 'Enter') {
    sendChatMessage();
  }
}

function sendChatMessage() {
  const input = document.getElementById('ai-user-input');
  const chatBody = document.getElementById('ai-chat-body');
  if (!input || !chatBody) return;

  const text = input.value.trim();
  if (!text) return;

  const userDiv = document.createElement('div');
  userDiv.className = 'chat-msg user';
  userDiv.textContent = text;
  chatBody.appendChild(userDiv);

  input.value = '';
  chatBody.scrollTop = chatBody.scrollHeight;

  setTimeout(() => {
    const agentDiv = document.createElement('div');
    agentDiv.className = 'chat-msg agent';
    
    let reply = '';
    const qLower = text.toLowerCase();

    if (qLower.includes('đo được những gì') || qLower.includes('đo được gì')) {
      reply = "Dịch vụ S0291 đo đạc 2 nhóm chính: (1) Phát thải khí nhà kính (Metan CH4 rò rỉ, phát thải bề mặt bãi chôn lấp, nguồn dầu khí quy đổi tCO2e); (2) Trữ lượng & hấp thụ carbon sinh khối (rừng, ngập mặn, đất nông nghiệp) theo chuẩn IPCC 2006/2019 & ISO 14064.";
    } else if (qLower.includes('bãi chôn lấp') || qLower.includes('25 ha') || qLower.includes('level')) {
      reply = "Đối với bãi chôn lấp ~25 ha, gói phù hợp nhất là Level 2 (Định lượng & Bản đồ chi tiết). Gói này bao gồm bay TDLAS/OGI đo CH4 bề mặt theo lưới, đo nền khí (background), lập ô mẫu GCP và xuất báo cáo kiểm kê chuẩn IPCC/ISO 14064.";
    } else if (qLower.includes('kiểm kê') || qLower.includes('knk') || qLower.includes('chính thức')) {
      reply = "Tại VN, kiểm kê KNK cấp cơ sở tuân theo NĐ 06/2022 và Thông tư 17/2022. Dữ liệu UAV cung cấp nguồn đo đạc bổ trợ độ phân giải cao; việc thẩm định báo cáo do đơn vị xác minh bên thứ ba theo ISO 14064-3 thực hiện.";
    } else if (qLower.includes('phép bay') || qLower.includes('xin phép')) {
      reply = "Có. Bay UAV tại Việt Nam cần đăng ký phương tiện và cấp phép bay cho từng hoạt động theo NĐ 288/2025/NĐ-CP. GASCOLAE và đối tác vận hành chịu trách nhiệm làm toàn bộ thủ tục xin phép bay.";
    } else if (qLower.includes('giá') || qLower.includes('bao nhiêu tiền') || qLower.includes('chi phí')) {
      reply = "⚠️ Lưu ý: Bảng giá dịch vụ hiện là tham khảo từ tài liệu nguồn và cần được bộ phận Sales/Finance GASCOLAE phê duyệt chính thức theo từng dự án cụ thể. Vui lòng để lại thông tin tại Form tư vấn để nhận báo giá chi tiết!";
    } else {
      reply = "Cảm ơn bạn đã quan tâm! Dịch vụ Bản đồ carbon footprint bằng UAV (S0291) hỗ trợ đo đạc phát thải CH4 và carbon sinh khối theo chuẩn IPCC/ISO 14064. Bạn có muốn chuyên gia GASCOLAE liên hệ tư vấn trực tiếp không?";
    }

    agentDiv.textContent = reply;
    chatBody.appendChild(agentDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 400);
}
