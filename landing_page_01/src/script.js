/* ==========================================================================
   GASCOLAE PLATFORM - SERVICE S0296 LANDING PAGE INTERACTION SCRIPT
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
    const particleCount = 700;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color(0x00d4ff);
    const blueColor = new THREE.Color(0x0055ff);
    const purpleColor = new THREE.Color(0xa78bfa);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 600;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;

      const mixFactor = Math.random();
      let color = cyanColor.clone();
      if (mixFactor > 0.6) color = purpleColor.clone();
      else if (mixFactor > 0.3) color = blueColor.clone();

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Canvas Texture for Round Particles
    const createParticleTexture = () => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 16; pCanvas.height = 16;
      const ctx = pCanvas.getContext('2d');
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.5, 'rgba(0, 212, 255, 0.5)');
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

    // Animation Loop
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    });

    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      particles.rotation.y = elapsedTime * 0.05;
      particles.rotation.x = elapsedTime * 0.02;

      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }

    animate();

    // Window Resize Handler
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
  // 5. TECH TABS TOGGLE (SOLUTION SECTION)
  // ------------------------------------------------------------------------
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(`tab-${targetTab}`);
      if (targetContent) targetContent.classList.add('active');
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

      const rotateX = ((y - centerY) / centerY) * -6; // max +-6deg
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });


  // ------------------------------------------------------------------------
  // 7. LIGHTBOX MEDIA MODAL
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
        <div style="position:relative; width:100%; max-height:80vh; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:12px; border:1px solid var(--primary); box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);">
          <img src="src/assets/${imgSrc}" alt="${captionText || 'S0296'}" style="max-width:100%; max-height:75vh; object-fit:contain; display:block; border-radius:8px;" />
        </div>
      `;
    } else {
      lightboxWrapper.innerHTML = `
        <div style="width:100%; height:100%; background:#0b172a; display:flex; align-items:center; justify-content:center; border-radius:8px; border:1px solid var(--primary-glow); padding:2rem; text-align:center; color:var(--primary); font-family:var(--font-heading);">
          <div>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:1rem;"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <h3 style="font-size:1.4rem; margin-bottom:0.5rem;">[MÔ PHỎNG DỮ LIỆU UAV S0296]</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">${captionText || 'Hình ảnh khảo sát thực địa dã chiến UAV & Digital Twin 3D'}</p>
          </div>
        </div>
      `;
    }
    lightboxCaption.innerText = captionText || 'Dữ liệu mô phỏng dã chiến S0296 - GASCOLAE Platform';
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
  // 8. FAQ ACCORDION
  // ------------------------------------------------------------------------
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(q => {
    q.addEventListener('click', () => {
      const isExpanded = q.getAttribute('aria-expanded') === 'true';

      // Close all other questions
      faqQuestions.forEach(otherQ => {
        otherQ.setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked
      q.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    });
  });


  // ------------------------------------------------------------------------
  // 9. AI AGENT SIMULATOR
  // ------------------------------------------------------------------------
  const chatBox = document.getElementById('chat-box');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chipBtns = document.querySelectorAll('.chip-btn');

  // 9 Keyword-Response pairs from Step 1 FAQ & KB
  const aiKnowledgeBase = [
    {
      keywords: ['phù hợp', 'đối tượng', 'tổ chức', 'ai dùng', 'khách hàng'],
      response: 'Dịch vụ UAV S0296 phù hợp với: (1) Cơ quan phòng chống thiên tai PCTT, (2) Lực lượng cứu hộ cứu nạn khẩn cấp, (3) Chủ đầu tư hạ tầng & Đơn vị Quản lý đê điều, (4) Đơn vị Bảo hiểm Nông nghiệp & Doanh nghiệp Lâm nghiệp.'
    },
    {
      keywords: ['mưa', 'bão', 'thời tiết', 'gió', 'mây'],
      response: 'UAV dã chiến S0296 chịu được gió lên tới 10–12m/s và hoạt động tốt trong mưa nhẹ/vừa. Khi có bão cực lớn, kíp bay dã chiến sẽ chờ cửa sổ thời tiết safe-window hạ cấp để cất cánh an toàn. [Nguồn: Asset 09 - KB SRC-08]'
    },
    {
      keywords: ['vệ tinh', 'khác biệt', 'tại sao', 'so sánh'],
      response: 'Mùa bão lũ, ảnh vệ tinh thường bị che phủ 100% bởi mây mù và độ phân giải thấp. UAV S0296 bay dưới tầng mây, cho độ phân giải mây điểm centimet và truyền dữ liệu nhiệt real-time phục vụ cứu nạn tức thì.'
    },
    {
      keywords: ['bảo hiểm', 'bồi thường', 'pháp lý', 'giá trị'],
      response: 'Dữ liệu UAV S0296 có giá trị pháp lý cao nhờ gắn định vị RTK chính xác chuẩn centimet, dấu vết thời gian Timestamp và bản đồ chỉ số thực vật NDVI/NDRE minh bạch chứng minh tổn thất thực tế.'
    },
    {
      keywords: ['phép bay', 'thủ tục', 'nghị định', 'bộ tổng tham mưu'],
      response: 'Hoạt động bay tuân thủ Nghị định 36/2008/NĐ-CP và được GASCOLAE hỗ trợ xin cấp phép bay ưu tiên khẩn cấp qua Cục Tác chiến – Bộ Tổng Tham mưu.'
    },
    {
      keywords: ['level 2', 'level 3', 'so sánh gói', 'gói dịch vụ'],
      response: 'Level 2 tập trung vào Tác chiến khẩn cấp & Tìm kiếm cứu nạn (SAR) bằng Camera Nhiệt Radiometric + LiDAR. Level 3 bổ sung Mô phỏng AI Digital Twin 3D (24-72h) và Báo cáo kiểm toán Carbon d-MRV chuẩn Verra.'
    },
    {
      keywords: ['báo cáo', 'kết quả', 'bàn giao', 'định dạng'],
      response: 'Khách hàng nhận được: (1) Bản đồ 3D DEM/DTM (.GeoTIFF, .LAS), (2) Báo cáo đánh giá bồi thường Bảo hiểm (.PDF, .XLSX), (3) Báo cáo d-MRV Carbon Verra (.PDF), (4) Livestream tọa độ Hotspot cứu hộ.'
    },
    {
      keywords: ['mrv', 'carbon', 'verra', 'knk'],
      response: 'Dữ liệu viễn thám UAV kết hợp mẫu đo mặt đất tuân thủ tiêu chuẩn quốc tế Verra VM0042/VT0005 về d-MRV Carbon, đánh giá suy thoái sinh khối và phát thải KNK do lũ lụt.'
    },
    {
      keywords: ['digital twin', '3d', 'mô phỏng', 'thủy văn'],
      response: '[CẦN XÁC MINH] Hệ thống AI Digital Twin tái lập địa hình 3D và chạy mô hình thủy văn dự báo các kịch bản mực nước dâng và vùng bị cô lập trong 24–72 giờ tới.'
    }
  ];

  const appendMessage = (sender, text) => {
    if (!chatBox) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}-message`;
    msgDiv.innerHTML = `<div class="msg-content">${text}</div>`;
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
        appendMessage('bot', 'Cảm ơn bạn đã quan tâm. Câu hỏi của bạn chưa có sẵn trong cơ sở dữ liệu sơ bộ S0296. Vui lòng bấm vào nút **"Trao đổi trực tiếp với Chuyên gia GASCOLAE"** phía dưới hoặc để lại thông tin tại Form Đăng ký để được hỗ trợ chuyên sâu!');
      }
    }, 1000);
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
  // 10. CONTACT FORM VALIDATION & SMOOTH NAVIGATION
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
        submitBtn.innerHTML = `<span>Đang gửi thông tin khẩn cấp...</span>`;

        setTimeout(() => {
          alert('Bản demo đã hoàn tất. Yêu cầu S0296 chưa được gửi; vui lòng liên hệ GASCOLAE qua kênh chính thức để được hỗ trợ.');
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
