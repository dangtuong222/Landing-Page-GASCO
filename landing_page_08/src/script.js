/* ==========================================================================
   GASCOLAE S0298 - Urban 3D Fine Dust Profiling Landing Page JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileMenu();
    init3DSimulator();
    initTabs();
    initFAQAccordion();
    initScrollSpy();
});

/* 1. Dynamic Theme Toggle */
function initThemeToggle() {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (!themeBtn) return;

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const icon = themeBtn.querySelector('i');
        if (document.body.classList.contains('light-theme')) {
            icon.className = 'fa-solid fa-sun';
            themeBtn.title = 'Chuyển sang Giao diện Tối';
        } else {
            icon.className = 'fa-solid fa-moon';
            themeBtn.title = 'Chuyển sang Giao diện Sáng';
        }
    });
}

/* 2. Mobile Navigation Toggle */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    });

    // Close mobile menu when clicking link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuBtn.querySelector('i').className = 'fa-solid fa-bars';
        });
    });
}

/* 3. Interactive 3D Altitude Profile Simulator */
function init3DSimulator() {
    const altRange = document.getElementById('altitudeRange');
    const altDisplay = document.getElementById('altDisplay');
    const hudAlt = document.getElementById('hudAltitude');
    const scenarioSelect = document.getElementById('scenarioSelect');
    const pm25Val = document.getElementById('pm25Val');
    const qcvnStatus = document.getElementById('qcvnStatus');
    const whoVal = document.getElementById('whoVal');
    const whoStatus = document.getElementById('whoStatus');

    if (!altRange) return;

    function updateSimulation() {
        const alt = parseInt(altRange.value, 10);
        const scenario = scenarioSelect.value;
        
        altDisplay.textContent = `${alt} m`;
        if (hudAlt) hudAlt.textContent = `${alt}m`;

        let pm25 = 0;

        if (scenario === 'construction') {
            // High PM2.5 near top levels (~100m)
            if (alt >= 80 && alt <= 150) {
                pm25 = 65 + Math.sin(alt / 10) * 8;
            } else if (alt > 150) {
                pm25 = 35 + (500 - alt) * 0.05;
            } else {
                pm25 = 45 + (100 - alt) * 0.1;
            }
        } else if (scenario === 'inversion') {
            // Smog trapped around 150m - 280m
            if (alt >= 150 && alt <= 280) {
                pm25 = 78 - Math.abs(215 - alt) * 0.4;
            } else {
                pm25 = 25 + Math.random() * 5;
            }
        } else {
            // Industrial corridor - high ground & mid-level plume
            pm25 = 55 - (alt * 0.06);
        }

        pm25 = Math.max(10, Math.round(pm25 * 10) / 10);
        pm25Val.textContent = `${pm25} µg/m³`;

        // Check QCVN 05:2023 limit (45 µg/m³ 24h limit starting 2026)
        if (pm25 > 45) {
            qcvnStatus.textContent = 'Vượt QCVN 24h (45 µg/m³ từ 2026)';
            qcvnStatus.className = 'readout-status status-alert';
        } else {
            qcvnStatus.textContent = 'Trong ngưỡng QCVN 24h (45 µg/m³)';
            qcvnStatus.className = 'readout-status text-success';
        }

        // Check WHO limit (15 µg/m³ 24h)
        const whoMultiple = (pm25 / 15).toFixed(1);
        whoVal.textContent = `${whoMultiple}x WHO`;
        if (whoMultiple > 1.0) {
            whoVal.className = 'readout-value text-danger';
        } else {
            whoVal.className = 'readout-value text-success';
        }
        whoStatus.textContent = `AQG WHO 24h = 15 µg/m³`;
    }

    altRange.addEventListener('input', updateSimulation);
    scenarioSelect.addEventListener('change', updateSimulation);
    updateSimulation();
}

/* 4. Use Cases Tabs Switcher */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetEl = document.getElementById(target);
            if (targetEl) targetEl.classList.add('active');
        });
    });
}

/* 5. FAQ Accordion Toggle */
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close other FAQs
            faqItems.forEach(i => i.classList.remove('active'));

            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/* 6. QCVN & WHO Compliance Threshold Checker Tool */
function checkCompliance() {
    const param = document.getElementById('paramSelect').value;
    const val = parseFloat(document.getElementById('valInput').value);
    
    const qcvnResVal = document.getElementById('qcvnResVal');
    const qcvnBadge = document.getElementById('qcvnBadge');
    const whoResVal = document.getElementById('whoResVal');
    const whoBadge = document.getElementById('whoBadge');

    if (isNaN(val) || val < 0) {
        alert('Vui lòng nhập nồng độ hợp lệ (số lớn hơn hoặc bằng 0).');
        return;
    }

    // Reference thresholds (QCVN 05:2023 vs WHO 2021)
    const thresholds = {
        pm25: { name: 'PM2,5', qcvnNow: 50, qcvn2026: 45, who: 15, unit: 'µg/m³' },
        pm10: { name: 'PM10', qcvnNow: 100, qcvn2026: 100, who: 45, unit: 'µg/m³' },
        no2:  { name: 'NO2', qcvnNow: 100, qcvn2026: 100, who: 25, unit: 'µg/m³' },
        so2:  { name: 'SO2', qcvnNow: 125, qcvn2026: 125, who: 40, unit: 'µg/m³' },
        co:   { name: 'CO', qcvnNow: 10000, qcvn2026: 10000, who: 4000, unit: 'µg/m³' },
        o3:   { name: 'O3', qcvnNow: 120, qcvn2026: 120, who: 100, unit: 'µg/m³' }
    };

    const target = thresholds[param];

    // QCVN Check
    let qText = `Nồng độ: ${val} ${target.unit} | Giới hạn QCVN 24h: ${target.qcvn2026} ${target.unit}`;
    qcvnResVal.textContent = qText;

    if (val > target.qcvn2026) {
        qcvnBadge.textContent = `VƯỢT CHUẨN: Cao hơn giới hạn QCVN 05:2023 (${(val - target.qcvn2026).toFixed(1)} ${target.unit})`;
        qcvnBadge.className = 'res-badge badge-danger';
    } else {
        qcvnBadge.textContent = `ĐẠT CHUẨN: Dưới giới hạn QCVN 05:2023 (${target.qcvn2026} ${target.unit})`;
        qcvnBadge.className = 'res-badge badge-success';
    }

    // WHO Check
    let wText = `Nồng độ: ${val} ${target.unit} | Hướng dẫn WHO AQG 24h: ${target.who} ${target.unit}`;
    whoResVal.textContent = wText;

    const whoRatio = (val / target.who).toFixed(1);
    if (val > target.who) {
        whoBadge.textContent = `VƯỢT KHUYẾN NGHỊ: Gấp ${whoRatio} lần ngưỡng WHO AQG 2021`;
        whoBadge.className = 'res-badge badge-warning';
    } else {
        whoBadge.textContent = `ĐẠT KHUYẾN NGHỊ: An toàn theo hướng dẫn WHO 2021`;
        whoBadge.className = 'res-badge badge-success';
    }
}

/* 7. Consultation Modal Popup Handlers */
function openConsultModal(packageName) {
    const modal = document.getElementById('consultModal');
    const input = document.getElementById('modalPackageName');
    if (!modal) return;

    if (packageName && input) {
        input.value = packageName;
    }
    modal.classList.add('active');
}

function closeConsultModal() {
    const modal = document.getElementById('consultModal');
    if (modal) modal.classList.remove('active');
}

function handleModalSubmit(e) {
    e.preventDefault();
    closeConsultModal();
    const refCode = 'S0298-' + Math.floor(100000 + Math.random() * 900000);
    alert(`✅ Đăng ký thành công!\nMã hồ sơ tư vấn của bạn: ${refCode}\nChuyên viên GASCOLAE sẽ liên hệ qua SĐT/Email bạn đã cung cấp.`);
}

function handleFormSubmit(e) {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const orgName = document.getElementById('orgName').value;
    const refCode = 'S0298-' + Math.floor(100000 + Math.random() * 900000);
    
    alert(`🎉 Cảm ơn ${fullName} từ ${orgName}!\nYêu cầu tư vấn đợt quan trắc bụi mịn 3D S0298 đã được gửi thành công.\nMã hồ sơ: ${refCode}\nBộ phận Sales/Finance GASCOLAE sẽ phát hành phương án kỹ thuật và báo giá chính thức cho bạn.`);
    
    document.getElementById('leadConsultForm').reset();
}

/* 8. ScrollSpy Active Nav Link */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}
