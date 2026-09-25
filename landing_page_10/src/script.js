/**
 * GASCOLAE PLATFORM - SERVICE S0303 LANDING PAGE INTERACTIVE SCRIPT
 * Functionality: Mobile Navigation, FAQ Accordion, Use Case Tabs, Lead Form, AI Agent Modal Simulator
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Mobile Navigation Menu Toggle
       ========================================================================== */
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            const isExpanded = mainNav.style.display === 'block';
            mainNav.style.display = isExpanded ? 'none' : 'block';
            if (!isExpanded) {
                mainNav.style.position = 'absolute';
                mainNav.style.top = '100%';
                mainNav.style.left = '0';
                mainNav.style.right = '0';
                mainNav.style.background = '#0F172A';
                mainNav.style.padding = '20px';
                mainNav.style.borderBottom = '1px solid var(--border-color)';
                mainNav.style.zIndex = '999';
                mainNav.querySelector('ul').style.flexDirection = 'column';
                mainNav.querySelector('ul').style.gap = '14px';
            }
        });
    }

    /* ==========================================================================
       2. Use Cases Tabs Switcher
       ========================================================================== */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');

            // Remove active class from all buttons and panes
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active class to clicked button and target pane
            btn.classList.add('active');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       3. FAQ Accordion Toggle
       ========================================================================== */
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(q => {
        q.addEventListener('click', () => {
            const isExpanded = q.getAttribute('aria-expanded') === 'true';
            const answerEl = q.nextElementSibling;

            // Close all open FAQs
            faqQuestions.forEach(otherQ => {
                otherQ.setAttribute('aria-expanded', 'false');
                if (otherQ.nextElementSibling) {
                    otherQ.nextElementSibling.style.maxHeight = null;
                }
            });

            // Open clicked FAQ if it wasn't open
            if (!isExpanded) {
                q.setAttribute('aria-expanded', 'true');
                if (answerEl) {
                    answerEl.style.maxHeight = answerEl.scrollHeight + 'px';
                }
            }
        });
    });

    /* ==========================================================================
       4. Lead Contact Form Submission Handler
       ========================================================================== */
    const leadForm = document.getElementById('service-lead-form');
    const formResponseMsg = document.getElementById('form-response-msg');

    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('lead-name').value.trim();
            const email = document.getElementById('lead-email').value.trim();
            const org = document.getElementById('lead-org').value.trim();

            if (!name || !email || !org) {
                alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
                return;
            }

            // Simulate form submission success
            const submitBtn = document.getElementById('submit-lead-btn');
            submitBtn.disabled = true;
            submitBtn.querySelector('span').innerText = 'Đang gửi thông tin...';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.querySelector('span').innerText = 'Gửi nhu cầu tư vấn';
                
                if (formResponseMsg) {
                    formResponseMsg.className = 'form-response-msg success';
                    formResponseMsg.innerHTML = `
                        <strong>Bản demo hoàn tất</strong><br>
                        Thông tin S0303 chưa được gửi tới GASCOLAE. Liên hệ qua kênh chính thức để tiếp tục tư vấn.
                    `;
                    formResponseMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                leadForm.reset();
            }, 800);
        });
    }

    /* ==========================================================================
       5. AI Agent Embedded Frame & Modal Simulation
       ========================================================================== */
    const agentFabBtn = document.getElementById('agent-fab-btn');
    const openAgentHeaderBtn = document.getElementById('open-agent-header-btn');
    const closeAgentBtn = document.getElementById('close-agent-btn');
    const agentChatModal = document.getElementById('agent-chat-modal');
    const agentChatForm = document.getElementById('agent-chat-form');
    const agentInputText = document.getElementById('agent-input-text');
    const agentChatBody = document.getElementById('agent-chat-body');
    const chipBtns = document.querySelectorAll('.chip-btn');

    // Developer hook for future backend AI agent API embedding:
    window.S0303_AI_AGENT_CONFIG = {
        serviceId: 'S0303',
        agentName: 'Trợ lý S0303 – Giám sát khí thải tàu biển',
        apiEndpoint: null, // User can assign their API URL here later: e.g. "https://api.gascolae.com/v1/agent/s0303"
        guardrails: {
            allowPricing: false,
            allowMARPOLCert: false,
            allowScrubberFSCInference: false
        }
    };

    function openAgentModal() {
        if (agentChatModal) {
            agentChatModal.classList.add('open');
            agentInputText.focus();
        }
    }

    function closeAgentModal() {
        if (agentChatModal) {
            agentChatModal.classList.remove('open');
        }
    }

    if (agentFabBtn) agentFabBtn.addEventListener('click', openAgentModal);
    if (openAgentHeaderBtn) openAgentHeaderBtn.addEventListener('click', openAgentModal);
    if (closeAgentBtn) closeAgentBtn.addEventListener('click', closeAgentModal);

    // Suggested Questions Chip Clicks
    chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.getAttribute('data-question');
            if (question) {
                handleUserQuestion(question);
            }
        });
    });

    // Form Submit Chat Input
    if (agentChatForm) {
        agentChatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = agentInputText.value.trim();
            if (text) {
                handleUserQuestion(text);
                agentInputText.value = '';
            }
        });
    }

    // Knowledge Base responses simulator conforming strictly to S0303 Guardrails
    function handleUserQuestion(questionText) {
        // Append User Message to UI
        appendChatMessage('user', questionText);

        // Show typing indicator
        const typingEl = document.createElement('div');
        typingEl.className = 'chat-message agent-message typing-indicator';
        typingEl.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-content"><em>Trợ lý đang truy xuất tri thức S0303...</em></div>`;
        agentChatBody.appendChild(typingEl);
        agentChatBody.scrollTop = agentChatBody.scrollHeight;

        setTimeout(() => {
            // Remove typing indicator
            if (typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);

            // Generate AI Agent response based on question keywords & S0303 guardrails
            const responseText = generateAgentResponse(questionText);
            appendChatMessage('agent', responseText);
        }, 800);
    }

    function appendChatMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}-message`;

        if (sender === 'user') {
            msgDiv.innerHTML = `<div class="msg-avatar">👤</div><div class="msg-content"><p>${escapeHtml(text)}</p></div>`;
        } else {
            msgDiv.innerHTML = `
                <div class="msg-avatar">🤖</div>
                <div class="msg-content">
                    ${text}
                </div>
            `;
        }

        agentChatBody.appendChild(msgDiv);
        agentChatBody.scrollTop = agentChatBody.scrollHeight;
    }

    function generateAgentResponse(query) {
        const q = query.toLowerCase();

        // 1. Pricing Guardrail Enforcement
        if (q.includes('giá') || q.includes('chi phí') || q.includes('bao nhiêu') || q.includes('báo giá') || q.includes('tốn') || q.includes('tiền')) {
            return `
                <p><strong>Thông tin về Báo giá & Chi phí:</strong></p>
                <p>Theo quy tắc <em>Pricing Guardrail</em> của dịch vụ S0303, Trợ lý AI không công bố, xác nhận hoặc tính toán bất kỳ số tiền nào cho mọi cấu hình.</p>
                <p>Quý khách vui lòng điền <a href="#lead-form" onclick="document.getElementById('agent-chat-modal').classList.remove('open')">Form yêu cầu tư vấn</a> trên Landing Page. Yêu cầu báo giá sẽ được chuyển tới bộ phận <strong>Sales & Finance</strong> để làm việc trực tiếp.</p>
            `;
        }

        // 2. What S0303 measures and limitations
        if (q.includes('đo được gì') || q.includes('không kết luận') || q.includes('giới hạn') || q.includes('phạt')) {
            return `
                <p><strong>Năng lực & Ranh giới của Dịch vụ S0303:</strong></p>
                <ul>
                    <li>✓ <strong>Năng lực đo:</strong> Cặp khí SO₂/CO₂ Sniffer trực tiếp, nhận dạng tàu qua AIS/GNSS, ảnh bối cảnh RGB/Thermal và kiểm soát bất định đo.</li>
                    <li>🚫 <strong>Ranh giới:</strong> Không xử phạt vi phạm hành chính, không cấp chứng nhận MARPOL Annex VI, không thay thế lấy mẫu dầu trực tiếp của PSC.</li>
                    <li>⚠️ <strong>Scrubber & NOx:</strong> Không suy FSC nhiên liệu gốc từ luồng khói sau Scrubber và không chứng nhận IMO Tier từ ppm.</li>
                </ul>
            `;
        }

        // 3. Service Levels comparison
        if (q.includes('level') || q.includes('gói') || q.includes('hành trình') || q.includes('tại bến')) {
            return `
                <p><strong>Phân cấp Dịch vụ (Service Levels):</strong></p>
                <ul>
                    <li><strong>Level 1 (Basic FSC):</strong> Phù hợp tàu đang hành trình (UC1) hoặc tại bến (UC2). Sản phẩm: Báo cáo D1.</li>
                    <li><strong>Level 2 (Multi-Gas):</strong> Thêm tùy chọn cảm biến CH₄/VOCs (UC3) & Bản đồ 3D D3 (UC4). Sản phẩm: D1, D2, D3.</li>
                    <li><strong>Level 3 (Cloud PSC Alert):</strong> Lưu trữ mây & Phiếu cảnh báo D4 (sau Human Review).</li>
                    <li><strong>Level 4 (Autonomous DiaB):</strong> Dự án nghiên cứu R&D, chưa thương mại.</li>
                </ul>
            `;
        }

        // 4. Deliverables comparison
        if (q.includes('d1') || q.includes('d2') || q.includes('d3') || q.includes('d4') || q.includes('d5') || q.includes('sản phẩm')) {
            return `
                <p><strong>Các Sản phẩm Bàn giao (Deliverables):</strong></p>
                <ul>
                    <li><strong>D1:</strong> Báo cáo FSC sàng lọc có QA flags & độ không đảm bảo đo.</li>
                    <li><strong>D2:</strong> Hồ sơ đa chỉ tiêu (CH₄/VOCs) & Ảnh bối cảnh.</li>
                    <li><strong>D3:</strong> Bản đồ phân bố 3D tùy chọn (kèm giả định sai số).</li>
                    <li><strong>D4:</strong> Phiếu cảnh báo nghi ngờ cho PSC (bắt buộc trải qua Human review).</li>
                    <li><strong>D5 (Dashboard):</strong> <em>Trạng thái: Chưa triển khai.</em></li>
                </ul>
            `;
        }

        // Default response for general query
        return `
            <p>Cảm ơn câu hỏi của bạn về dịch vụ <strong>S0303 (Giám sát khí thải tàu biển bằng UAV)</strong>.</p>
            <p>Tôi có thể giúp bạn giải đáp về các gói cấu hình (L1-L3), sản phẩm bàn giao (D1-D4) và điều kiện pháp lý bay theo Nghị định 288/2025/NĐ-CP.</p>
            <p>Nếu bạn có nhu cầu làm việc chi tiết với đội ngũ Kỹ thuật & Kinh doanh, vui lòng để lại thông tin tại <a href="#lead-form" onclick="document.getElementById('agent-chat-modal').classList.remove('open')">Form liên hệ khảo sát</a>.</p>
        `;
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

});
