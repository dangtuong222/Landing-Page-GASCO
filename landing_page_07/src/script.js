const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress span');

toggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
});

nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
}));

const syncScrollDetails = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress?.style.setProperty('transform', `scaleX(${Math.min(1, ratio)})`);
  header?.classList.toggle('scrolled', window.scrollY > 24);
};

syncScrollDetails();
window.addEventListener('scroll', syncScrollDetails, { passive: true });

document.querySelectorAll('.faq-item button').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const wasOpen = item.classList.contains('active');

    document.querySelectorAll('.faq-item').forEach(entry => {
      entry.classList.remove('active');
      entry.querySelector('button')?.setAttribute('aria-expanded', 'false');
      const icon = entry.querySelector('button > b');
      if (icon) icon.textContent = '+';
    });

    if (!wasOpen) {
      item.classList.add('active');
      button.setAttribute('aria-expanded', 'true');
      const icon = button.querySelector(':scope > b');
      if (icon) icon.textContent = '−';
    }
  });
});

document.querySelector('#lead-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const message = event.currentTarget.querySelector('.form-message');
  message.textContent = 'Bản demo đã hoàn tất. Thông tin chưa được gửi tới GASCOLAE.';
  event.currentTarget.reset();
});

/* Intersection Reveal */
const revealTargets = document.querySelectorAll(
  '.metrics-grid > *, .intro > *, .gas-inspector, .visual-story > *, .problem-grid article, .section-heading, .capability-layout, .use-grid article, .workflow-visual, .workflow-steps, .workflow-steps article, .levels > *, .faq-layout > *, .agent-layout > *, .contact > *'
);

revealTargets.forEach(element => element.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach(element => observer.observe(element));
} else {
  revealTargets.forEach(element => element.classList.add('is-visible'));
}

/* 1. Particle Canvas in Hero */
const initHeroParticles = () => {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  const resize = () => {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  };

  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < 45; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4 - 0.2,
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(106, 227, 211, ${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };
  draw();
};
initHeroParticles();

/* 2. Interactive Gas Spectrum Live Inspector */
const gasData = {
  co2: {
    val: "418.5",
    unit: "ppm",
    tech: "Cảm biến quang học NDIR kép (Dual NDIR)",
    target: "Lập bản đồ Carbon & rà soát Plume KCN",
    status: "✓ Dữ liệu chuẩn QA/QC",
    line: "M0,70 Q125,20 250,80 T500,40",
    area: "M0,140 L0,70 Q125,20 250,80 T500,40 L500,140 Z"
  },
  nox: {
    val: "42.8",
    unit: "µg/m³",
    tech: "Cảm biến Điện hóa NO2/NOx độ nhạy cao",
    target: "Đo mặt cắt Plume ống khói & giao thông",
    status: "✓ Đối chiếu trạm tham chiếu",
    line: "M0,90 Q100,10 230,110 T500,20",
    area: "M0,140 L0,90 Q100,10 230,110 T500,20 L500,140 Z"
  },
  voc: {
    val: "1.24",
    unit: "mg/m³",
    tech: "Cảm biến Ion hóa Quang học PID 10.6 eV",
    target: "Rà soát rò rỉ Fenceline KCN & kho bồn",
    status: "✓ Khoanh vùng điểm nóng nghi vấn",
    line: "M0,110 Q140,30 270,95 T500,30",
    area: "M0,140 L0,110 Q140,30 270,95 T500,30 L500,140 Z"
  }
};

document.querySelectorAll('.gas-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.gas-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    const key = tab.getAttribute('data-gas');
    const info = gasData[key];
    if (!info) return;

    document.getElementById('gas-val').textContent = info.val;
    document.getElementById('gas-unit').textContent = info.unit;
    document.getElementById('gas-tech').textContent = info.tech;
    document.getElementById('gas-target').textContent = info.target;
    document.getElementById('gas-status').textContent = info.status;

    const linePath = document.querySelector('.spectrum-line');
    const areaPath = document.querySelector('.spectrum-area');
    if (linePath) linePath.setAttribute('d', info.line);
    if (areaPath) areaPath.setAttribute('d', info.area);
  });
});

/* 3. AI Agent Interactive Prompts */
const agentResponses = {
  "Cấp độ Level 2 cung cấp những gì?": "✦ **Level 2 - Định lượng & đối chiếu**: Bao gồm hiệu chuẩn cảm biến, collocation với thiết bị tham chiếu, phân tích mặt cắt plume và ước lượng phát thải kèm báo cáo độ không đảm bảo đo.",
  "Khảo sát rò rỉ VOCs ở KCN triển khai ra sao?": "✦ **Rà soát rò rỉ VOCs KCN**: Bay fenceline kết hợp đo ranh giới và nội vi bằng cảm biến PID, lập heatmap GIS định vị chính xác khu vực nghi ngờ rò rỉ.",
  "Bản đồ GIS 3D bàn giao định dạng nào?": "✦ **Định dạng dữ liệu bàn giao**: Hồ sơ bàn giao chuẩn GIS gồm file GeoTIFF 2D, mô hình khối 3D (.LAS/GeoJSON) tích hợp mượt mà vào ArcGIS, QGIS hoặc hệ thống quản lý KCN."
};

document.querySelectorAll('.prompt-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const prompt = chip.getAttribute('data-prompt');
    const chatContainer = document.getElementById('agent-demo-chat');
    if (chatContainer && agentResponses[prompt]) {
      chatContainer.style.opacity = '0';
      setTimeout(() => {
        chatContainer.innerHTML = `<strong>❓ ${prompt}</strong><br><br>${agentResponses[prompt]}`;
        chatContainer.style.opacity = '1';
      }, 150);
    }
  });
});

/* 4. 3D Tilt Effect on Cards */
document.querySelectorAll('.problem-grid article, .use-grid article:not(.featured), .level-grid article').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    card.style.transform = `perspective(1000px) rotateX(${-y / 25}deg) rotateY(${x / 25}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
