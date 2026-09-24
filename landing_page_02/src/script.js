// ===== THREE.JS 3D WEBGL TERRAIN BACKGROUND (GPU-OPTIMIZED) =====
function init3DTerrain() {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 15, 35);
  camera.lookAt(0, 0, 0);

  // FIX 1: Tắt antialias + giới hạn pixelRatio=1 để giảm tải GPU
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(1); // Không dùng devicePixelRatio để tránh quá tải VRAM

  // FIX 2: Giảm segments từ 50 xuống 28 (polygon count giảm ~68%)
  const width = 80;
  const height = 80;
  const segments = 28;
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
  geometry.rotateX(-Math.PI / 2.5);

  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = Math.sin(x * 0.15) * Math.cos(y * 0.15) * 5 + Math.sin(x * 0.05 + y * 0.05) * 8;
    pos.setZ(i, z);
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    wireframe: true,
    transparent: true,
    opacity: 0.22
  });

  const terrain = new THREE.Mesh(geometry, material);
  scene.add(terrain);

  const pointsMat = new THREE.PointsMaterial({
    color: 0x06d6a0,
    size: 0.35,
    transparent: true,
    opacity: 0.6
  });
  const pointCloud = new THREE.Points(geometry, pointsMat);
  scene.add(pointCloud);

  const laserGeom = new THREE.PlaneGeometry(80, 1);
  laserGeom.rotateX(-Math.PI / 2.5);
  const laserMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.65
  });
  const laserMesh = new THREE.Mesh(laserGeom, laserMat);
  scene.add(laserMesh);

  // FIX 3: Throttle mousemove bằng RAF — không re-render mỗi event raw
  let mouseX = 0, mouseY = 0;
  let pendingMouseX = 0, pendingMouseY = 0;
  let mousePending = false;
  window.addEventListener('mousemove', (e) => {
    pendingMouseX = (e.clientX / window.innerWidth - 0.5) * 0.4;
    pendingMouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    mousePending = true;
  }, { passive: true });

  // FIX 4: Biến kiểm soát vòng lặp — dừng khi tab ẩn hoặc hero ngoài viewport
  let animRunning = true;
  let animId = null;
  let clock = new THREE.Clock();

  function animate() {
    if (!animRunning) return;
    animId = requestAnimationFrame(animate);

    // Cập nhật mouse position theo tick của RAF (không theo từng event)
    if (mousePending) {
      mouseX = pendingMouseX;
      mouseY = pendingMouseY;
      mousePending = false;
    }

    const elapsed = clock.getElapsedTime();

    // FIX 5: Giảm tốc độ animation (laser sweep chậm hơn, ít tải GPU hơn)
    terrain.rotation.z = Math.sin(elapsed * 0.08) * 0.05;
    pointCloud.rotation.z = Math.sin(elapsed * 0.08) * 0.05;
    laserMesh.position.z = Math.sin(elapsed * 0.9) * 20; // Từ 1.5 xuống 0.9

    camera.position.x += (mouseX * 10 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 10 + 15 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  // FIX 6: Dừng render khi tab bị ẩn (Page Visibility API)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      animRunning = false;
      if (animId) cancelAnimationFrame(animId);
      clock.stop();
    } else {
      animRunning = true;
      clock.start();
      animate();
    }
  });

  // FIX 7: Dừng render khi hero section không visible (cuộn khỏi tầm nhìn)
  const heroSection = document.getElementById('hero');
  if (heroSection && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!animRunning) {
            animRunning = true;
            clock.start();
            animate();
          }
        } else {
          animRunning = false;
          if (animId) cancelAnimationFrame(animId);
          clock.stop();
        }
      });
    }, { threshold: 0.05 });
    heroObserver.observe(heroSection);
  }

  animate();

  // Debounced resize để không resize liên tục
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 200);
  });
}

// ===== NAVBAR SCROLL BEHAVIOR =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== HAMBURGER MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ===== DYNAMIC SOLUTION TECHNOLOGY TABS =====
document.querySelectorAll('.tech-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tech-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    
    tab.classList.add('active');
    const targetId = tab.getAttribute('data-target');
    const pane = document.getElementById(targetId);
    if (pane) pane.classList.add('active');
  });
});

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ===== ANIMATED STAT COUNTERS =====
const countObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target') || el.textContent);
      const suffix = el.getAttribute('data-suffix') || '';
      let count = 0;
      const step = Math.max(1, Math.floor(target / 20));
      
      const timer = setInterval(() => {
        count += step;
        if (count >= target) {
          count = target;
          clearInterval(timer);
        }
        el.textContent = count + suffix;
      }, 50);

      observer.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-target]').forEach(el => {
  countObserver.observe(el);
});

// ===== 3D CARD HOVER TILT EFFECT =====
document.querySelectorAll('.hover-tilt').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  });
});

// ===== LIGHTBOX 3D DEMO MEDIA MODAL =====
const modal = document.getElementById('media-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const modalBackdrop = document.getElementById('modal-backdrop');

function openMediaModal(title, src) {
  if (!modal) return;
  modalTitle.textContent = title;
  modalBody.innerHTML = `<img src="${src}" alt="${title}" style="width:100%; border-radius:8px;">`;
  modal.classList.add('open');
}

function closeModal() {
  if (modal) modal.classList.remove('open');
  if (modalBody) modalBody.innerHTML = '';
}

if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

// Trigger modal from Capability cards button
document.querySelectorAll('.cap-card').forEach(card => {
  const btn = card.querySelector('.btn-demo-modal');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const title = card.getAttribute('data-title') || '3D Monitoring Visualizer';
      const mediaSrc = card.getAttribute('data-media') || 'src/assets/uav_lidar_3d_scan.png';
      openMediaModal(title, mediaSrc);
    });
  }
});

// Hero image expand trigger
const heroModalBtn = document.getElementById('open-hero-modal');
if (heroModalBtn) {
  heroModalBtn.addEventListener('click', () => {
    openMediaModal(
      'UAV LiDAR 3D Point Cloud Stream — Slope Scanning Demo',
      'src/assets/uav_lidar_3d_scan.png'
    );
  });
}

// ===== INTERACTIVE AI AGENT SIMULATOR CHAT =====
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

const aiKnowledgeBase = [
  {
    keywords: ['phù hợp', 'loại đèo', 'đối tượng', 'dự án'],
    response: "Dịch vụ **GASCOLAE S0297** thiết kế chuyên biệt cho các tuyến đường đèo dốc nguy cơ cao tại Việt Nam (như đèo Mã Pí Lèng, Hải Vân, Ngoạn Mục, Bảo Lộc...) với các mái taluy có nguy cơ trượt đất, đá lở trong mùa mưa bão."
  },
  {
    keywords: ['thời gian', 'bao lâu', 'triển khai', 'lắp đặt'],
    response: "Thời gian triển khai trung bình từ **7 — 14 ngày**: Khảo sát hiện trường & xin phép bay UAV (3-5 ngày), bay chụp quét 3D LiDAR & chôn cảm biến ngầm (3-5 ngày), kết nối Cloud AI GIS (2 ngày)."
  },
  {
    keywords: ['chi phí', 'giá', 'báo giá', '10km', 'level', 'gói'],
    response: "Gói **Level 2 (Giám sát kết hợp)** bao gồm xử lý ảnh InSAR, bay quét UAV 4 lần/năm, cảm biến IoT bề mặt (đo mưa, GNSS) và Dashboard GIS 3D. Chi phí chính xác phụ thuộc chiều dài tuyến đèo và số điểm xung yếu. Bạn vui lòng điền form **Liên hệ** bên dưới để nhận bảng dự toán chi tiết!"
  },
  {
    keywords: ['mưa bão', 'bão số', 'thời tiết', 'hoạt động'],
    response: "Hệ thống hoạt động **100% bền bỉ trong mưa bão**: Cảm biến chôn sâu trong đất bọc vỏ IP68 chống nước, truyền dữ liệu qua Vệ tinh IoT & LPWAN không lo đứt cáp, nguồn điện sạc bằng pin mặt trời tự lập."
  }
];

function addChatMessage(text, sender = 'bot') {
  if (!chatMessages) return;
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}-message`;
  msgDiv.innerHTML = `<div class="msg-bubble">${text}</div>`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function processUserQuery(query) {
  addChatMessage(query, 'user');
  
  // Typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot-message typing-indicator';
  typingDiv.innerHTML = `<div class="msg-bubble">🤖 AI đang suy nghĩ...</div>`;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  setTimeout(() => {
    chatMessages.removeChild(typingDiv);
    const queryLower = query.toLowerCase();
    let matchedResponse = "Cảm ơn bạn đã quan tâm! Kỹ sư tư vấn GASCOLAE S0297 sẽ trực tiếp phân tích yêu cầu này. Vui lòng để lại thông tin ở form Liên hệ để nhận tư vấn chuyên sâu.";

    for (const item of aiKnowledgeBase) {
      if (item.keywords.some(kw => queryLower.includes(kw))) {
        matchedResponse = item.response;
        break;
      }
    }
    addChatMessage(matchedResponse, 'bot');
  }, 1000);
}

if (chatForm && chatInput) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (text) {
      processUserQuery(text);
      chatInput.value = '';
    }
  });
}

// Clickable Agent Prompt Chips
document.querySelectorAll('.agent-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const question = chip.getAttribute('data-question') || chip.textContent;
    processUserQuery(question);
  });
});

// ===== CONTACT FORM SUBMISSION =====
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('#form-submit');
    submitBtn.textContent = '⚡ Đang gửi yêu cầu...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = '✓ Đã Gửi Thành Công! Kỹ sư sẽ liên hệ trong 24h.';
      submitBtn.style.background = 'linear-gradient(135deg, #06d6a0, #059669)';
      contactForm.reset();
      
      setTimeout(() => {
        submitBtn.textContent = 'Gửi yêu cầu khảo sát & Báo giá';
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 5000);
    }, 1200);
  });
}

// Initialize 3D WebGL Canvas
window.addEventListener('DOMContentLoaded', () => {
  init3DTerrain();
  console.log('GASCOLAE S0297 - 3D Landslide Monitoring Landing Page Ready');
});
