/* ==========================================================================
   GASCOLAE PLATFORM - S0300 LANDING PAGE INTERACTIVE SCRIPT
   Vanilla JavaScript for High Performance & Dynamic Image Rendering
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
    initNavbarScroll();
    initMobileMenu();
    initAccordions();
    initFaqAccordion();
    initUseCaseTabs();
    initSmoothScroll();
});

/* 1. NAVBAR SCROLL EFFECT */
function initNavbarScroll() {
    const header = document.getElementById('header');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            header.style.padding = '4px 0';
            header.style.background = 'rgba(4, 8, 6, 0.95)';
            header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        } else {
            header.style.padding = '0';
            header.style.background = 'rgba(7, 15, 11, 0.85)';
            header.style.boxShadow = 'none';
        }
    });
}

/* 2. MOBILE MENU TOGGLE */
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (btn && navLinks) {
        btn.addEventListener('click', function () {
            const isOpen = navLinks.style.display === 'flex';
            navLinks.style.display = isOpen ? 'none' : 'flex';
            if (!isOpen) {
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.flexDirection = 'column';
                navLinks.style.background = 'rgba(7, 15, 11, 0.98)';
                navLinks.style.padding = '20px';
                navLinks.style.borderBottom = '1px solid rgba(52, 211, 153, 0.2)';
            }
        });
    }
}

/* 3. BENEFITS ACCORDION WITH DYNAMIC IMAGE RENDERING */
function initAccordions() {
    const accItems = document.querySelectorAll('.benefits-accordion .accordion-item');
    const accMainImg = document.getElementById('accMainImg');
    const accSubImg = document.getElementById('accSubImg');

    accItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            accItems.forEach(i => i.classList.remove('active'));
            
            // Always set clicked item active
            item.classList.add('active');

            // Get image paths from data attributes
            const mainSrc = item.getAttribute('data-img-main');
            const subSrc = item.getAttribute('data-img-sub');
            const mainAlt = item.getAttribute('data-alt-main') || 'Minh họa giải pháp GASCOLAE';
            const subAlt = item.getAttribute('data-alt-sub') || 'Chi tiết giải pháp GASCOLAE';

            // Smooth image transition rendering
            if (accMainImg && mainSrc) {
                accMainImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
                accMainImg.style.opacity = '0';
                accMainImg.style.transform = 'scale(0.96)';

                if (accSubImg) {
                    accSubImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
                    accSubImg.style.opacity = '0';
                    accSubImg.style.transform = 'scale(0.96)';
                }

                setTimeout(() => {
                    accMainImg.src = mainSrc;
                    accMainImg.alt = mainAlt;

                    if (accSubImg && subSrc) {
                        accSubImg.src = subSrc;
                        accSubImg.alt = subAlt;
                    }

                    accMainImg.style.opacity = '1';
                    accMainImg.style.transform = 'scale(1)';
                    if (accSubImg) {
                        accSubImg.style.opacity = '1';
                        accSubImg.style.transform = 'scale(1)';
                    }
                }, 200);
            }
        });
    });
}

/* 4. FAQ ACCORDION TOGGLE */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all
            faqItems.forEach(i => i.classList.remove('active'));
            
            // Open clicked if not previously active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/* 5. USE CASE TABS SWITCHING */
function initUseCaseTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');

            // Deactivate all buttons & panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Activate target button & pane
            btn.classList.add('active');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

/* 6. SMOOTH SCROLLING FOR ANCHOR LINKS */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElem = document.querySelector(targetId);
            if (targetElem) {
                const headerOffset = 80;
                const elementPosition = targetElem.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* 7. SCROLL TO AI AGENT AREA */
function scrollToAiAgent() {
    const agentSection = document.getElementById('ai-agent-area');
    if (agentSection) {
        const headerOffset = 80;
        const elementPosition = agentSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

/* 8. AI AGENT DEMO INTERACTION (SUGGESTED QUESTIONS & DEMO CHAT) */
const demoAnswers = {
    "Dịch vụ này phù hợp với loại rừng nào?": "Dịch vụ S0300 áp dụng hiệu quả cho cả rừng trồng (keo, bạch đàn, cao su, thông, tràm) và rừng tự nhiên lá rộng, rừng ngập mặn (Blue Carbon). Khảo sát UAV-LiDAR giúp đo đạc liên tục chính xác.",
    "Tôi cần chuẩn bị gì để bắt đầu dự án tín chỉ carbon?": "Anh/chị cần chuẩn bị ranh giới khu vực khảo sát (bản đồ/trích lục lô), hồ sơ rừng và mục tiêu dự án (ARR/REDD+). GASCOLAE sẽ hỗ trợ tháo gỡ thủ tục phép bay theo NĐ 288/2025 và thiết kế ô mẫu chuẩn VM0047.",
    "Bao lâu nên đo lại một lần?": "Theo quy định phương pháp luận tín chỉ (VM0047, CDM), ô mẫu mặt đất đo lặp tối thiểu 5 năm/lần. GASCOLAE khuyến nghị chu kỳ bay đo lặp từ 2–5 năm tùy tốc độ tăng trưởng.",
    "Dữ liệu có dùng được cho EUDR không?": "Có! Bản đồ ranh giới lô, tọa độ địa lý thửa đất sản xuất và hiện trạng thảm phủ do GASCOLAE cung cấp hoàn toàn đáp ứng Tuyên bố thẩm định EUDR (DDS) và Thông tư 26/2025/TT-BNNMT.",
    "Chi phí dịch vụ tính thế nào?": "Chi phí được tính theo diện tích (VND/ha), Cấp độ dịch vụ (Level 1 Baseline / Level 2 MRV / Level 3 Credit Readiness) và số đợt đo. Vui lòng liên hệ Đội ngũ Sales/Finance GASCOLAE để nhận báo giá chi tiết theo dự án.",
    "Các Level dịch vụ (L1-L3) khác nhau như thế nào?": "Level 1: Kiểm kê & lập bản đồ carbon nền (dùng 1 lần). Level 2: Gói MRV định kỳ & giám sát biến động. Level 3: Chuẩn hóa hồ sơ tín chỉ carbon (VM0047/IPCC) & truy xuất EUDR cho Verifier VVB."
};

function handleQuestionClick(buttonElem) {
    const questionText = buttonElem.innerText.trim();
    appendChatMessage('user', questionText);
    
    setTimeout(() => {
        const answerText = demoAnswers[questionText] || "Cảm ơn anh/chị đã quan tâm! Tôi sẽ chuyển câu hỏi này tới Chuyên gia Lâm nghiệp & MRV Carbon GASCOLAE để hỗ trợ chi tiết nhất.";
        appendChatMessage('agent', answerText);
    }, 400);
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendDemoMessage();
    }
}

function sendDemoMessage() {
    const inputElem = document.getElementById('chatInput');
    if (!inputElem) return;
    const text = inputElem.value.trim();
    if (!text) return;
    
    appendChatMessage('user', text);
    inputElem.value = '';
    
    setTimeout(() => {
        appendChatMessage('agent', "Cảm ơn câu hỏi của anh/chị! Dữ liệu S0300 được chuẩn hóa theo khung IPCC & Verra VM0047. Để nhận được tư vấn kỹ thuật chính xác nhất cho diện tích rừng của mình, anh/chị hãy điền mẫu Đăng ký Tư vấn bên dưới hoặc liên hệ hotline GASCOLAE nhé!");
    }, 500);
}

function appendChatMessage(sender, text) {
    const chatContainer = document.getElementById('agentPlaceholderChat');
    if (!chatContainer) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.innerHTML = `<div class="msg-bubble">${escapeHtml(text)}</div>`;
    
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* 9. LEAD FORM SUBMISSION HANDLER */
function handleFormSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('fullName').value.trim();
    const org = document.getElementById('organization').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    
    if (!name || !phone || !email) {
        alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
        return;
    }

    alert(`Bản demo hoàn tất, ${name}. Thông tin tư vấn S0300 chưa được gửi tới GASCOLAE.`);
    
    document.getElementById('leadForm').reset();
}
