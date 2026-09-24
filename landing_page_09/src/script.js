/* ==========================================================================
   GASCOLAE S0299 LANDING PAGE INTERACTION & VISUAL ANIMATION SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const usecaseTabs = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    const faqItems = document.querySelectorAll('.faq-item');
    
    const leadModal = document.getElementById('leadModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalDoneBtn = document.getElementById('modalDoneBtn');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const consultationForm = document.getElementById('consultationForm');
    const formSuccessMsg = document.getElementById('formSuccessMsg');
    const targetLevelSelect = document.getElementById('targetLevel');

    /* --------------------------------------------------------------------------
       1. Mobile Menu Toggle
       -------------------------------------------------------------------------- */
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (mobileToggle.querySelector('i')) {
                    mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
                }
            });
        });
    }

    /* --------------------------------------------------------------------------
       2. Sticky Navbar Scroll & Floating Widget Behavior
       -------------------------------------------------------------------------- */
    const floatingDrone = document.getElementById('floatingDroneWidget');

    const handleScroll = () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active Link Highlight
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', handleScroll);

    if (floatingDrone) {
        floatingDrone.addEventListener('click', () => {
            // Scroll to top or open modal
            const heroSection = document.getElementById('hero');
            if (heroSection) heroSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    /* --------------------------------------------------------------------------
       3. Interactive Before/After Drag Comparison Slider
       -------------------------------------------------------------------------- */
    const sliderContainer = document.getElementById('beforeAfterSlider');
    const beforeLayer = document.getElementById('beforeLayer');
    const sliderHandle = document.getElementById('sliderHandle');

    if (sliderContainer && beforeLayer && sliderHandle) {
        let isDragging = false;
        const beforeImg = beforeLayer.querySelector('img');

        const syncSliderWidth = () => {
            if (sliderContainer && beforeImg) {
                beforeImg.style.width = `${sliderContainer.offsetWidth}px`;
            }
        };

        window.addEventListener('resize', syncSliderWidth);
        syncSliderWidth();

        const updateSliderPosition = (clientX) => {
            const rect = sliderContainer.getBoundingClientRect();
            let x = clientX - rect.left;

            // Constrain x within 0 and width
            if (x < 0) x = 0;
            if (x > rect.width) x = rect.width;

            const percentage = (x / rect.width) * 100;
            beforeLayer.style.width = `${percentage}%`;
            sliderHandle.style.left = `${percentage}%`;
        };

        sliderContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateSliderPosition(e.clientX);
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateSliderPosition(e.clientX);
            }
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch support for mobile
        sliderContainer.addEventListener('touchstart', (e) => {
            isDragging = true;
            if (e.touches[0]) updateSliderPosition(e.touches[0].clientX);
        });

        window.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches[0]) {
                updateSliderPosition(e.touches[0].clientX);
            }
        });

        window.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    /* --------------------------------------------------------------------------
       4. HTML5 Canvas Electrostatic Spray Simulation
       -------------------------------------------------------------------------- */
    const canvas = document.getElementById('electrostaticCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let animId = null;
        let isRunning = true;

        // Resize canvas internally to container
        const resizeCanvas = () => {
            canvas.width = canvas.parentElement.clientWidth || 500;
            canvas.height = 250;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        let particles = [];
        const particleCount = 45;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: 80 + Math.random() * 30,
                y: 60 + Math.random() * 120,
                vx: 3 + Math.random() * 4,
                vy: (Math.random() - 0.5) * 1.5,
                size: 2 + Math.random() * 3,
                charge: '+5kV',
                opacity: 0.7 + Math.random() * 0.3
            });
        }

        const drawFrame = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Grounded Glass Target Surface (Right)
            ctx.fillStyle = 'rgba(2, 132, 199, 0.25)';
            ctx.fillRect(canvas.width - 60, 20, 40, canvas.height - 40);
            ctx.strokeStyle = '#06B6D4';
            ctx.lineWidth = 2;
            ctx.strokeRect(canvas.width - 60, 20, 40, canvas.height - 40);

            // Glass Label
            ctx.fillStyle = '#94A3B8';
            ctx.font = '11px sans-serif';
            ctx.fillText('PV Glass (0V)', canvas.width - 55, canvas.height - 10);

            // Nozzle Emitter (Left)
            ctx.fillStyle = '#334155';
            ctx.fillRect(20, canvas.height / 2 - 30, 40, 60);
            ctx.strokeStyle = '#F59E0B';
            ctx.strokeRect(20, canvas.height / 2 - 30, 40, 60);

            // Nozzle Label
            ctx.fillStyle = '#F59E0B';
            ctx.fillText('+5kV Nozzle', 15, canvas.height / 2 + 45);

            // Draw Particles with Electric Field Lines
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(6, 182, 212, ${p.opacity})`;
                ctx.shadowColor = '#06B6D4';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Move toward glass
                if (isRunning) {
                    p.x += p.vx;
                    p.y += p.vy;

                    if (p.x > canvas.width - 60) {
                        p.x = 60 + Math.random() * 20;
                        p.y = 80 + Math.random() * 90;
                    }
                }
            });

            if (isRunning) {
                animId = requestAnimationFrame(drawFrame);
            }
        };

        drawFrame();

        const toggleBtn = document.getElementById('toggleParticleAnim');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                isRunning = !isRunning;
                if (isRunning) {
                    toggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Tạm Dừng Mô Phỏng';
                    drawFrame();
                } else {
                    toggleBtn.innerHTML = '<i class="fa-solid fa-play"></i> Chạy Mô Phỏng';
                    if (animId) cancelAnimationFrame(animId);
                }
            });
        }
    }

    /* --------------------------------------------------------------------------
       5. Use Cases Tab Switcher
       -------------------------------------------------------------------------- */
    if (usecaseTabs.length && tabPanes.length) {
        usecaseTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');

                usecaseTabs.forEach(t => t.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                tab.classList.add('active');
                const activePane = document.getElementById(targetTab);
                if (activePane) activePane.classList.add('active');
            });
        });
    }

    /* --------------------------------------------------------------------------
       6. FAQ Accordion Logic
       -------------------------------------------------------------------------- */
    if (faqItems.length) {
        faqItems.forEach(item => {
            const questionBtn = item.querySelector('.faq-question');
            if (questionBtn) {
                questionBtn.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');

                    faqItems.forEach(i => i.classList.remove('active'));

                    if (!isActive) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    /* --------------------------------------------------------------------------
       7. Lead Generation Modal & Pricing Request Modal
       -------------------------------------------------------------------------- */
    const openModal = (levelName) => {
        if (leadModal) {
            leadModal.classList.add('active');
            document.body.style.overflow = 'hidden';

            if (levelName && targetLevelSelect) {
                for (let option of targetLevelSelect.options) {
                    if (option.value === levelName) {
                        option.selected = true;
                        break;
                    }
                }
            }
        }
    };

    const closeModal = () => {
        if (leadModal) {
            leadModal.classList.remove('active');
            document.body.style.overflow = '';

            setTimeout(() => {
                if (consultationForm) consultationForm.classList.remove('hidden');
                if (formSuccessMsg) formSuccessMsg.classList.add('hidden');
            }, 300);
        }
    };

    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const level = btn.getAttribute('data-level');
            openModal(level);
        });
    });

    const openDelivBtns = document.querySelectorAll('.open-deliv-modal');
    openDelivBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const delivId = btn.getAttribute('data-deliv');
            openModal(`Yêu cầu Mẫu Báo cáo ${delivId}`);
        });
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalDoneBtn) modalDoneBtn.addEventListener('click', closeModal);

    if (leadModal) {
        leadModal.addEventListener('click', (e) => {
            if (e.target === leadModal) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && leadModal.classList.contains('active')) {
            closeModal();
        }
    });

    /* --------------------------------------------------------------------------
       8. Form Submission Handling
       -------------------------------------------------------------------------- */
    if (consultationForm) {
        consultationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = consultationForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang Gửi Yêu Cầu...';
            submitBtn.disabled = true;

            setTimeout(() => {
                consultationForm.classList.add('hidden');
                formSuccessMsg.classList.remove('hidden');

                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                consultationForm.reset();
            }, 1000);
        });
    }

    /* --------------------------------------------------------------------------
       9. Scroll Reveal Observer
       -------------------------------------------------------------------------- */
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.problem-card, .process-step, .package-card, .deliv-card, .oem-card, .demo-card');
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(el);
    });

    /* --------------------------------------------------------------------------
       10. AI Agent Assistant Interactive Widget Logic (#ai-agent-container)
       -------------------------------------------------------------------------- */
    const aiAgentTrigger = document.getElementById('aiAgentTrigger');
    const aiAgentWindow = document.getElementById('aiAgentWindow');
    const aiAgentCloseBtn = document.getElementById('aiAgentCloseBtn');
    const aiAgentForm = document.getElementById('aiAgentForm');
    const aiAgentInput = document.getElementById('aiAgentInput');
    const aiAgentMessages = document.getElementById('aiAgentMessages');
    const promptChips = document.querySelectorAll('.prompt-chip');

    if (aiAgentTrigger && aiAgentWindow) {
        aiAgentTrigger.addEventListener('click', () => {
            aiAgentWindow.classList.toggle('hidden');
            if (!aiAgentWindow.classList.contains('hidden') && aiAgentInput) {
                aiAgentInput.focus();
            }
        });
    }

    if (aiAgentCloseBtn && aiAgentWindow) {
        aiAgentCloseBtn.addEventListener('click', () => {
            aiAgentWindow.classList.add('hidden');
        });
    }

    const appendChatMessage = (sender, text, isUser = false) => {
        if (!aiAgentMessages) return;
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`;

        const senderDiv = document.createElement('div');
        senderDiv.className = 'bubble-sender';
        senderDiv.innerHTML = isUser ? '<i class="fa-solid fa-user"></i> Bạn' : '<i class="fa-solid fa-robot text-cyan"></i> AI Agent S0299';

        const textDiv = document.createElement('div');
        textDiv.className = 'bubble-text';
        textDiv.innerHTML = text;

        bubble.appendChild(senderDiv);
        bubble.appendChild(textDiv);
        aiAgentMessages.appendChild(bubble);
        aiAgentMessages.scrollTop = aiAgentMessages.scrollHeight;
    };

    const processAiQuestion = (question) => {
        appendChatMessage('User', question, true);
        const qLower = question.toLowerCase();

        let aiReply = "Cảm ơn bạn đã đặt câu hỏi! Chuyên viên O&M GASCOLAE sẽ đối chiếu thông tin địa bàn và phản hồi chi tiết.";

        if (qLower.includes('soiling') || qLower.includes('sr')) {
            aiReply = "<strong>Soiling Ratio (SR)</strong> là tỷ số soiling giữa điện năng sản xuất từ module bị bám bụi so với module sạch. Dịch vụ S0299 đo SR chuẩn <strong>IEC 61724-1:2021</strong> giúp minh bạch hiệu quả làm sạch.";
        } else if (qLower.includes('level 2') || qLower.includes('gói') || qLower.includes('phun')) {
            aiReply = "<strong>Gói Level 2 (Vệ sinh UAV Theo Đợt)</strong> là giải pháp đề xuất chính: Bao gồm khảo sát baseline, thử nghiệm vùng kiểm soát, UAV phun vi hạt tích điện tuyến tự động và bộ Deliverables D1–D5, D7.";
        } else if (qLower.includes('288') || qLower.includes('pháp lý') || qLower.includes('phép bay')) {
            aiReply = "Hoạt động bay UAV tuân thủ <strong>Nghị định 288/2025/NĐ-CP</strong> & <strong>Luật 49/2024/QH15</strong>. GASCOLAE chuẩn bị bộ hồ sơ kỹ thuật D1 hỗ trợ xin cấp phép bay chính thức.";
        } else if (qLower.includes('báo giá') || qLower.includes('giá') || qLower.includes('m2') || qLower.includes('chi phí')) {
            aiReply = "Báo giá thương mại do Sales/Finance GASCOLAE chốt dựa trên diện tích xử lý thực tế ($m^2$). Bạn có thể nhấn <strong>'Đặt Lịch Tư Vấn'</strong> trên màn hình để gửi thông tin dự án!";
        }

        setTimeout(() => {
            appendChatMessage('AI Agent', aiReply, false);
        }, 500);
    };

    if (promptChips) {
        promptChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const q = chip.getAttribute('data-question') || chip.textContent;
                processAiQuestion(q);
            });
        });
    }

    if (aiAgentForm && aiAgentInput) {
        aiAgentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = aiAgentInput.value.trim();
            if (text) {
                processAiQuestion(text);
                aiAgentInput.value = '';
            }
        });
    }
});
