/* ==========================================================================
   GASCOLAE PLATFORM - SERVICE S0302 LANDING PAGE INTERACTION SCRIPT
   Pure Vanilla JS + Three.js 3D Particles Matrix Background
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
  // 2. THREE.JS 3D PARTICLE MATRIX BACKGROUND
  // ------------------------------------------------------------------------
  function initThreeCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 250;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Geometry
    const particleCount = 750;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color(0x00d4ff);
    const emeraldColor = new THREE.Color(0x06d6a0);
    const purpleColor = new THREE.Color(0xa78bfa);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 650;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 450;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 450;

      const mixFactor = Math.random();
      let color = cyanColor.clone();
      if (mixFactor > 0.65) color = purpleColor.clone();
      else if (mixFactor > 0.35) color = emeraldColor.clone();

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Canvas Texture for Glowing Laser Particles
    const createParticleTexture = () => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 16; pCanvas.height = 16;
      const ctx = pCanvas.getContext('2d');
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.4, 'rgba(0, 212, 255, 0.6)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
      const texture = new THREE.Texture(pCanvas);
      texture.needsUpdate = true;
      return texture;
    };

    const material = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      map: createParticleTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animation Loop with interactive mouse rotation
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
      particles.rotation.x = elapsedTime * 0.02;

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
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  fadeElements.forEach(el => fadeObserver.observe(el));


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
          const target = parseInt(counter.getAttribute('data-target'), 10);
          const duration = 1500;
          const stepTime = 25;
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
  // 5. 3D HOVER TILT EFFECT FOR CAPABILITY CARDS
  // ------------------------------------------------------------------------
  const tiltCards = document.querySelectorAll('.hover-tilt');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });


  // ------------------------------------------------------------------------
  // 6. LIGHTBOX MEDIA MODAL
  // ------------------------------------------------------------------------
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxOverlay = document.getElementById('lightbox-overlay');
  const lightboxWrapper = document.getElementById('lightbox-img-wrapper');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxTriggers = document.querySelectorAll('.lightbox-trigger, .cap-card[data-img]');

  const openLightbox = (imgSrc, captionText) => {
    if (!lightboxModal) return;
    if (imgSrc) {
      lightboxWrapper.innerHTML = `
        <div style="position:relative; width:100%; max-height:80vh; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:12px; border:1px solid var(--primary); box-shadow: 0 0 35px rgba(0, 212, 255, 0.35);">
          <img src="src/assets/${imgSrc}" alt="${captionText || 'S0302'}" style="max-width:100%; max-height:75vh; object-fit:contain; display:block; border-radius:8px;" />
        </div>
      `;
    } else {
      lightboxWrapper.innerHTML = `
        <div style="width:100%; height:100%; background:#0b172a; display:flex; align-items:center; justify-content:center; border-radius:8px; border:1px solid var(--primary-glow); padding:2rem; text-align:center; color:var(--primary); font-family:var(--font-heading);">
          <div>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:1rem;"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <h3 style="font-size:1.4rem; margin-bottom:0.5rem;">[MÔ PHỎNG DỮ LIỆU UAV S0302]</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">${captionText || 'Dữ liệu khảo sát không gian UAV & Giám sát khí nhà kính S0302'}</p>
          </div>
        </div>
      `;
    }
    lightboxCaption.innerText = captionText || 'Hình ảnh mô phỏng dữ liệu UAV đa cảm biến S0302 - GASCOLAE Platform';
    lightboxModal.classList.add('active');
  };

  const closeLightbox = () => {
    if (lightboxModal) lightboxModal.classList.remove('active');
  };

  lightboxTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const imgSrc = trigger.getAttribute('data-img');
      const caption = trigger.getAttribute('data-caption') || trigger.querySelector('.cap-title')?.innerText;
      openLightbox(imgSrc, caption);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);


  // ------------------------------------------------------------------------
  // 7. FAQ ACCORDION
  // ------------------------------------------------------------------------
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(q => {
    q.addEventListener('click', () => {
      const isExpanded = q.getAttribute('aria-expanded') === 'true';

      faqQuestions.forEach(otherQ => {
        otherQ.setAttribute('aria-expanded', 'false');
      });

      q.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    });
  });


  // ------------------------------------------------------------------------
  // 8. AI AGENT SIMULATOR (Trợ lý thông tin S0302)
  // ------------------------------------------------------------------------
  const chatBox = document.getElementById('chat-box');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chipBtns = document.querySelectorAll('.chip-btn');

  // Exact Knowledge Base rules & responses for S0302
  const aiKnowledgeBase = [
    {
      keywords: ['level 1', 'level 2', 'level 3', 'khác nhau', 'so sánh gói', 'cấp độ'],
      response: 'Dịch vụ S0302 bao gồm 3 cấp độ: (1) **Level 1**: Sàng lọc CH4 / LDAR screening bằng UAV + TDLAS; (2) **Level 2**: Giám sát đa khí (CH4, CO2...) và MRV cơ bản; (3) **Level 3**: Flux/ESG & AI có điều kiện (chỉ mở sau khi đạt phê duyệt các cổng kiểm soát data, method, validation và uncertainty; nếu gate fail chỉ thực hiện mapping-only).'
    },
    {
      keywords: ['deliverable', 'đầu ra', 'bản giao', 'sản phẩm', 'báo cáo'],
      response: 'Các sản phẩm bàn giao kỹ thuật của S0302 bao gồm: (1) **Bản đồ phân bố khí** (CH4/CO2 có tham chiếu không gian theo lớp GIS); (2) **Báo cáo giám sát KNK/MRV** (tóm tắt phạm vi, phương pháp, điều kiện đo, kết quả & giới hạn); (3) **Dữ liệu & danh sách điểm bất thường / Hotspot** (theo scope & phân loại bảo mật được duyệt).'
    },
    {
      keywords: ['pháp lý', 'hse', 'điều kiện', 'chuẩn bị', 'bay', 'căn cứ'],
      response: 'Trước khi khảo sát cần xác nhận: (1) Mục tiêu, ranh giới và quyền tiếp cận site; (2) Đầu mối HSE và kế hoạch an toàn; (3) Hồ sơ xin phép bay & phối hợp tác chiến; (4) Phiếu Mission Limits Sheet & kiểm tra GO/NO-GO trước ca bay. Lưu ý: Chi tiết nhạy cảm chỉ trao đổi qua kênh bảo mật được duyệt, không nhập vào form công khai.'
    },
    {
      keywords: ['cems', 'thay thế', 'pháp lý', 'kiểm kê chính thức', 'hồ sơ'],
      response: 'Không. Dữ liệu UAV S0302 hỗ trợ khảo sát nguồn phát tán và lập bản đồ phân bố không gian. Việc sử dụng trong hồ sơ chính thức hoặc thẩm định pháp lý phụ thuộc vào quy định hiện hành, phương pháp luận và cơ quan thẩm định áp dụng. [Nguồn: SRC-02, CODE_01, CODE_02]'
    },
    {
      keywords: ['giá', 'báo giá', 'chi phí', 'bao nhiêu', 'bảng giá', 'pricing'],
      response: 'Trang thông tin và Trợ lý AI không hiển thị, tính toán, ước tính hoặc suy ra giá dịch vụ. Báo giá chính thức chỉ do bộ phận Sales/Finance của GASCOLAE lập và phát hành sau khi xác nhận phạm vi, điều kiện hạ tầng và chính sách áp dụng. Vui lòng gửi Yêu cầu tư vấn phạm vi để nhận thông tin.'
    },
    {
      keywords: ['ch4', 'methane', 'tdlas', 'laser'],
      response: 'Công nghệ TDLAS (Tunable Diode Laser Absorption Spectroscopy) trên UAV hỗ trợ quét và phát hiện các dải hấp thụ methane (CH4) theo không gian, giúp khoanh vùng các vị trí bồn bể, đường ống hoặc khu vực có nguy cơ bất thường tại KCN.'
    },
    {
      keywords: ['co2', 'đa khí', 'cảm biến'],
      response: 'S0302 tích hợp các mô-đun cảm biến khí tượng và đa cảm biến (CO2, CH4...) giúp ghi nhận hiện trạng nồng độ khí theo tọa độ bay và phân khu nhà máy, phục vụ báo cáo MRV nội bộ.'
    }
  ];

  const appendMessage = (sender, text) => {
    if (!chatBox) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}-message`;
    msgDiv.innerHTML = `<div class="msg-content">${text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  const showTypingIndicator = () => {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot-message typing-indicator-msg';
    typingDiv.innerHTML = `
      <div class="msg-content">
        <div class="typing-dots"><span></span><span></span><span></span></div>
      </div>
    `;
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingDiv;
  };

  const processQuery = (userQuery) => {
    appendMessage('user', userQuery);
    const typingEl = showTypingIndicator();

    setTimeout(() => {
      if (typingEl) typingEl.remove();

      const normalized = userQuery.toLowerCase();
      let matchedResponse = null;

      for (const item of aiKnowledgeBase) {
        if (item.keywords.some(kw => normalized.includes(kw))) {
          matchedResponse = item.response;
          break;
        }
      }

      if (matchedResponse) {
        appendMessage('bot', matchedResponse);
      } else {
        appendMessage('bot', 'Cảm ơn bạn đã đặt câu hỏi. Nội dung này nằm ngoài thông tin công khai đã duyệt của S0302. Trợ lý AI sẽ chuyển yêu cầu của bạn đến chuyên viên tư vấn GASCOLAE. Vui lòng bấm vào nút **"Kết nối chuyên viên tư vấn"** hoặc gửi yêu cầu qua Form bên dưới!');
      }
    }, 900);
  };

  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (text) {
        processQuery(text);
        chatInput.value = '';
      }
    });
  }

  chipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const qText = btn.getAttribute('data-question') || btn.innerText;
      processQuery(qText);
    });
  });


  // ------------------------------------------------------------------------
  // 9. CONTACT FORM VALIDATION & SUBMISSION
  // ------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      const requiredInputs = contactForm.querySelectorAll('input[required]');

      requiredInputs.forEach(input => {
        const formGroup = input.parentElement;
        if (!input.value.trim()) {
          formGroup.classList.add('is-invalid');
          isValid = false;
        } else {
          formGroup.classList.remove('is-invalid');
        }
      });

      const emailInput = document.getElementById('email');
      if (emailInput && emailInput.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
          emailInput.parentElement.classList.add('is-invalid');
          isValid = false;
        }
      }

      if (isValid) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Đang tiếp nhận thông tin tư vấn...</span>`;

        setTimeout(() => {
          alert('Cảm ơn bạn! Yêu cầu tư vấn dịch vụ S0302 đã được gửi thành công. Chuyên viên GASCOLAE sẽ liên hệ lại trong thời gian sớm nhất.');
          contactForm.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }, 1200);
      }
    });
  }

  // Smooth scroll for all inner anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.startsWith('#')) {
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

});
