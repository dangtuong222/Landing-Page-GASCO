/* ==========================================================================
   GASCOLAE PLATFORM - SERVICE S0294 LANDING PAGE INTERACTION SCRIPT
   Pure Vanilla JS + Three.js 3D Methane Plume & Particle Matrix Background
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------------------------------------------------
  // 1. NAVBAR SCROLL & MOBILE MENU TOGGLE
  // ------------------------------------------------------------------------
  const navbar = document.getElementById('main-nav');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  // Active Link Highlight via IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => navObserver.observe(section));


  // ------------------------------------------------------------------------
  // 2. THREE.JS 3D PARTICLE MATRIX & ATMOSPHERIC GRID BACKGROUND
  // ------------------------------------------------------------------------
  function initThreeCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 220;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Geometry for Atmospheric Methane Molecules
    const particleCount = 650;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color(0x00f2fe);
    const blueColor = new THREE.Color(0x0055ff);
    const purpleColor = new THREE.Color(0xa78bfa);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 600;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;

      const mixFactor = Math.random();
      let color = cyanColor.clone();
      if (mixFactor > 0.6) color = purpleColor.clone();
      else if (mixFactor > 0.35) color = blueColor.clone();

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circular particle texture creation
    const createParticleTexture = () => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 16; pCanvas.height = 16;
      const ctx = pCanvas.getContext('2d');
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.5, 'rgba(0, 242, 254, 0.5)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
      const texture = new THREE.Texture(pCanvas);
      texture.needsUpdate = true;
      return texture;
    };

    const material = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      map: createParticleTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse Interaction
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.04;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.04;
    });

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      particles.rotation.y = elapsedTime * 0.04;
      particles.rotation.x = elapsedTime * 0.015;

      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
      if (!canvas) return;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
  }

  initThreeCanvas();


  // ------------------------------------------------------------------------
  // 3. SCROLL FADE-UP ANIMATIONS
  // ------------------------------------------------------------------------
  const fadeElements = document.querySelectorAll('.animate-fade-up');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(25px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(el);
  });


  // ------------------------------------------------------------------------
  // 4. ANIMATED STAT COUNTERS
  // ------------------------------------------------------------------------
  const counterElements = document.querySelectorAll('.counter[data-target]');
  let counted = false;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        counterElements.forEach(counter => {
          const targetStr = counter.getAttribute('data-target');
          const target = parseInt(targetStr, 10);
          if (isNaN(target)) return;

          const duration = 1500;
          const stepTime = 20;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.innerText = target;
              clearInterval(timer);
            } else {
              counter.innerText = Math.floor(current);
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.5 });

  const heroStatsSection = document.querySelector('.hero-stats');
  if (heroStatsSection) counterObserver.observe(heroStatsSection);


  // ------------------------------------------------------------------------
  // 5. USE CASES TABS TOGGLE
  // ------------------------------------------------------------------------
  const ucTabBtns = document.querySelectorAll('.uc-tab-btn');
  const ucPanels = document.querySelectorAll('.uc-panel');

  ucTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetUc = btn.getAttribute('data-uc');

      ucTabBtns.forEach(b => b.classList.remove('active'));
      ucPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(`panel-${targetUc}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });


  // ------------------------------------------------------------------------
  // 6. 3D HOVER TILT EFFECT (CAPABILITY CARDS)
  // ------------------------------------------------------------------------
  const tiltCards = document.querySelectorAll('.hover-tilt');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 12;
      const rotateY = (centerX - x) / 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });


  // ------------------------------------------------------------------------
  // 7. FAQ ACCORDION TOGGLE
  // ------------------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach(i => i.classList.remove('active'));

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });


  // ------------------------------------------------------------------------
  // 8. LEAD CONSULTATION FORM SUBMISSION
  // ------------------------------------------------------------------------
  const leadForm = document.getElementById('lead-form');
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('lead-name').value;
      const org = document.getElementById('lead-org').value;
      const email = document.getElementById('lead-email').value;

      // Display Modal Confirmation
      showLightboxModal(
        'Bản demo hoàn tất — thông tin S0294 chưa được gửi',
        `<div style="text-align: center; padding: 1.5rem 0;">
          <div style="width: 54px; height: 54px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h4 style="font-size: 1.2rem; color: #f8fafc; margin-bottom: 0.5rem;">Cảm ơn ${name} (${org})!</h4>
          <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.6;">Đây chỉ là mô phỏng trên trang. Thông tin S0294 chưa được gửi tới GASCOLAE. Vui lòng liên hệ qua kênh chính thức để nhận tư vấn.</p>
        </div>`,
        'Mô phỏng form tư vấn S0294.'
      );

      leadForm.reset();
    });
  }


  // ------------------------------------------------------------------------
  // 9. INTERACTIVE AI AGENT CHAT SIMULATION ("Landfill Methane MRV Assistant")
  // ------------------------------------------------------------------------
  const chatMessages = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chipBtns = document.querySelectorAll('.chip-btn');

  const knowledgeResponses = [
    {
      keywords: ['phù hợp', 'trường hợp', 'bãi rác', 'dùng khi nào', 'usecase', 'use case'],
      answer: `Service S0294 phù hợp với 6 trường hợp ứng dụng chính tại bãi chôn lấp:
1. <strong>UC1 - Baseline trước đầu tư hệ thống khí:</strong> Cung cấp đường cơ sở kỹ thuật cho nhà đầu tư.
2. <strong>UC2 - Lập bản đồ theo mùa/đợt:</strong> So sánh sự biến động vệt phát tán qua các chiến dịch.
3. <strong>UC3 - Đối chiếu trước-sau sửa chữa:</strong> Đánh giá hiệu quả sau khi can thiệp hệ thống khí.
4. <strong>UC4 - Kiểm tra độ bao phủ dữ liệu:</strong> Nhận diện các vùng phát tán SCADA chưa ghi nhận.
5. <strong>UC5 - Hỗ trợ hồ sơ MRV:</strong> Cung cấp dữ liệu thực địa & ma trận nguồn cho kiểm kê GHG.
6. <strong>UC6 - Điều tra bất thường CH₄:</strong> Khoanh vùng tín hiệu phát thải tăng vọt.`
    },
    {
      keywords: ['level', 'gói', 'level 1', 'level 2', 'level 3', 'khác nhau'],
      answer: `Các cấp độ dịch vụ S0294 bao gồm:
• <strong>Level 1 (Screening):</strong> Sàng lọc phát thải bề mặt & điểm nóng. Sản phẩm: D1, D2, D7. Không mặc định tính flux kg CH₄/h.
• <strong>Level 2 (Vertical Profile & Quantify):</strong> Level 1 + bay transect downwind nhiều cao độ, ước tính flux kg CH₄/h theo chiến dịch & ngân sách bất định. Sản phẩm: D1-D5, D7.
• <strong>Level 3 (MRV Reporting):</strong> Level 2 + kế hoạch đại diện thời gian, dữ liệu hoạt động bãi rác, ma trận truy xuất & báo cáo MRV. Sản phẩm đầy đủ: D1-D7.
<em>*Giá tất cả gói dịch vụ được tư vấn riêng qua Sales/Finance.</em>`
    },
    {
      keywords: ['deliverable', 'bàn giao', 'sản phẩm', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'],
      answer: `Danh mục 7 sản phẩm bàn giao kỹ thuật của S0294:
• <strong>D1:</strong> Dữ liệu thô/xử lý, từ điển dữ liệu, cờ chất lượng QA/QC.
• <strong>D2:</strong> Bản đồ điểm nóng, transect bay & vệt phát tán (plume).
• <strong>D3:</strong> Ước tính kg CH₄/h theo chiến dịch khi đủ điều kiện.
• <strong>D4:</strong> Ngân sách độ không đảm bảo & độ đầy đủ dữ liệu.
• <strong>D5:</strong> Báo cáo đối chiếu hệ thống khí thu gom/flare.
• <strong>D6:</strong> Báo cáo kỹ thuật hỗ trợ hồ sơ MRV (không phải tín chỉ carbon).
• <strong>D7:</strong> Danh mục hành động khuyến nghị & Khuyến nghị kỹ thuật.`
    },
    {
      keywords: ['chuẩn bị', 'thông tin', 'trước khi', 'yêu cầu', 'cần gì'],
      answer: `Trước khi trao đổi tư vấn với GASCOLAE, bạn nên chuẩn bị:
1. Thông tin quy mô & loại bãi chôn lấp (đang hoạt động hay đã đóng cửa).
2. Mục tiêu kỹ thuật chính (Baseline, kiểm tra đối chiếu hay làm hồ sơ MRV).
3. Quyền tiếp cận hiện trường & khả năng cung cấp dữ liệu vận hành (thu gom-flare, SCADA) nếu có.
<em>Lưu ý: Bạn KHÔNG cần và KHÔNG NÊN cung cấp tọa độ chính xác, sơ đồ mật hay tài liệu bảo mật trên kênh public.</em>`
    },
    {
      keywords: ['giá', 'chi phí', 'báo giá', 'bao nhiêu', 'bảng giá', 'tiền', 'cost', 'price'],
      answer: `<strong>Guardrail Restriction:</strong> Landfill Methane MRV Assistant không hiển thị, xác nhận, tính toán, quy đổi hoặc suy ra bất kỳ con số giá nào. Mọi yêu cầu báo giá dự án bắt buộc được chuyển cho tuyến <strong>GASCOLAE Sales / Finance</strong> xử lý trực tiếp.`
    }
  ];

  function addChatMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender === 'user' ? 'message-user' : 'message-agent');

    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

    msgDiv.innerHTML = `
      <div class="msg-bubble">${text}</div>
      <span class="msg-time">${timeStr}</span>
    `;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function handleUserQuery(queryText) {
    addChatMessage('user', queryText);

    setTimeout(() => {
      const queryLower = queryText.toLowerCase();

      if (queryLower.includes('giá') || queryLower.includes('báo giá') || queryLower.includes('chi phí') || queryLower.includes('bao nhiêu tiền')) {
        addChatMessage('agent', knowledgeResponses[4].answer);
        return;
      }

      let matched = false;
      for (const item of knowledgeResponses) {
        if (item.keywords.some(kw => queryLower.includes(kw))) {
          addChatMessage('agent', item.answer);
          matched = true;
          break;
        }
      }

      if (!matched) {
        addChatMessage('agent', `Cảm ơn bạn đã hỏi về: "${queryText}". 
Tôi chỉ có thể trả lời các nội dung liên quan tới phạm vi kỹ thuật S0294 (Vertical Profiling Methane bãi rác, 6 Use Cases, Level 1-3, Deliverables D1-D7 và giới hạn phương pháp). Đối với thắc mắc này, tôi khuyên bạn nên kết nối với <strong>GASCOLAE Technical / Sales Specialist</strong> qua Form Tư Vấn bên trên!`);
      }
    }, 600);
  }

  chipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-question');
      handleUserQuery(q);
    });
  });

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = chatInput.value.trim();
      if (val) {
        handleUserQuery(val);
        chatInput.value = '';
      }
    });
  }


  // ------------------------------------------------------------------------
  // 10. LIGHTBOX MODAL HANDLER
  // ------------------------------------------------------------------------
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxOverlay = document.getElementById('lightbox-overlay');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxBody = document.getElementById('lightbox-body');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');

  function showLightboxModal(title, bodyHtml, desc) {
    if (lightboxTitle) lightboxTitle.innerText = title;
    if (lightboxBody) lightboxBody.innerHTML = bodyHtml;
    if (lightboxDesc) lightboxDesc.innerHTML = desc || '';
    if (lightboxModal) lightboxModal.classList.add('active');
  }

  function hideLightboxModal() {
    if (lightboxModal) lightboxModal.classList.remove('active');
  }

  lightboxTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const title = trigger.getAttribute('data-title') || 'Sơ đồ minh họa S0294';
      const desc = trigger.getAttribute('data-desc') || '';
      const imgPath = trigger.getAttribute('data-img');
      const svgElem = trigger.querySelector('svg');

      if (imgPath) {
        showLightboxModal(title, `<img src="${imgPath}" alt="${title}" style="width:100%; height:auto; border-radius:12px;" />`, desc);
      } else if (svgElem) {
        const svgClone = svgElem.cloneNode(true);
        showLightboxModal(title, svgClone.outerHTML, desc);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', hideLightboxModal);
  if (lightboxOverlay) lightboxOverlay.addEventListener('click', hideLightboxModal);

});
