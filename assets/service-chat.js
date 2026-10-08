(() => {
  'use strict';
  const ids = ['S0296', 'S0297', 'S0291', 'S0295', 'S0301', 'S0300', 'S0289', 'S0298', 'S0299', 'S0303', 'S0302', 'S0294', 'S0075', 'S0064', 'S0061'];
  const match = location.pathname.match(/landing_page_(\d{2})(?:\/|$)/);
  if (!match || document.querySelector('gascolae-chat')) return;
  const serviceId = ids[Number(match[1]) - 1];
  if (!serviceId) return;
  const internal = Number(match[1]) >= 13;
  const scriptUrl = new URL(document.currentScript.src);
  const configuredApi = ['localhost', '127.0.0.1'].includes(location.hostname) ? '' : document.currentScript.dataset.apiBase;
  const api = new URL(configuredApi || '../api/', scriptUrl);
  // Public page excerpts keep the widget usable on static GitHub Pages.
  const documents = Promise.all([
    import(new URL('document-chat.mjs?v=20261008-chat-5', scriptUrl)),
    fetch(new URL('service-faq.json?v=20261008-chat-5', scriptUrl)).then(response => {
      if (!response.ok) throw new Error('Chưa tải được nội dung dịch vụ.');
      return response.json();
    }),
  ]);
  // Observe startup rejection; send() reports it if the static reference fails.
  documents.catch(() => {});
  const host = document.createElement('gascolae-chat');
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `
    <style>
      :host { position:fixed; right:22px; bottom:24px; z-index:10001; font:14px/1.6 system-ui,sans-serif; color:#e9f3ff; text-align:left; }
      * { box-sizing:border-box; } [hidden] { display:none!important; }
      button,input { font:inherit; } button { cursor:pointer; } button:disabled { cursor:wait; opacity:.65; }
      button:focus-visible,input:focus-visible { outline:3px solid #67e8f9; outline-offset:3px; }
      .launcher { border:0; border-radius:30px; padding:14px 22px; background:#00ce83; color:#00291c; font-weight:700; box-shadow:0 8px 30px #0005; }
      .panel { width:min(440px,calc(100vw - 32px)); height:min(640px,calc(100dvh - 150px)); min-height:330px; background:#0b1729; border:1px solid #3a526b; border-radius:20px; box-shadow:0 18px 70px #0009; display:flex; flex-direction:column; overflow:hidden; }
      header { padding:16px 18px; display:flex; align-items:center; gap:12px; border-bottom:1px solid #2a4058; background:#10283d; }
      h2 { margin:0; font-size:17px; } .subtitle { font-size:12px; color:#9bd9e8; } .actions { margin-left:auto; display:flex; gap:6px; }
      .actions button { background:transparent; color:#d4e5f8; border:1px solid #486078; border-radius:9px; padding:3px 9px; }
      .status { color:#c1d3e5; padding:8px 18px; font-size:12px; border-bottom:1px solid #24364b; }
      .messages { overflow-y:auto; flex:1; min-height:0; padding:16px; overscroll-behavior:contain; }
      .message { margin:0 0 14px; padding:12px 14px; border-radius:14px; background:#162a40; overflow-wrap:anywhere; }
      .message.user { background:#194958; margin-left:30px; } .message.error { border:1px solid #f5ba7b; color:#ffe2bd; }
      .label { display:block; font-size:11px; color:#a1d8e3; margin-bottom:5px; } .text { white-space:pre-wrap; }
      details { margin-top:10px; font-size:11px; color:#b6cee3; } summary { cursor:pointer; color:#73deef; } ol { padding-left:20px; } li { margin:7px 0; }
      .chips { padding:0 16px 12px; display:flex; flex-wrap:wrap; gap:6px; } .chips button { background:#142c42; border:1px solid #3d5e72; color:#cfedf5; border-radius:16px; padding:5px 10px; font-size:12px; }
      form { padding:12px 16px; border-top:1px solid #2a4058; display:flex; gap:8px; }
      input { min-width:0; flex:1; border:1px solid #456179; border-radius:10px; background:#091322; color:#fff; padding:10px; }
      form button { border:0; border-radius:10px; background:#77dded; color:#092134; padding:8px 14px; font-weight:700; }
      .note { padding:0 16px 12px; font-size:11px; color:#a8bbcd; }
      .retry { margin-top:10px; border:1px solid #dec59e; border-radius:8px; padding:4px 10px; background:#24384b; color:#fff; }
      @media(max-width:600px) { :host { left:12px; right:12px; bottom:16px; text-align:right; } .panel { width:100%; height:calc(100dvh - 32px); min-height:0; text-align:left; } .launcher { padding:10px 14px; } }
    </style>
    <button class="launcher" aria-expanded="false" aria-controls="chat-panel">🤖 Hỏi Trợ lý AI ${serviceId}</button>
    <section class="panel" id="chat-panel" role="dialog" aria-label="Trợ lý dịch vụ ${serviceId}" hidden>
      <header><div><h2>Trợ lý ${serviceId}</h2><div class="subtitle">GASCOLAE · Tra cứu hồ sơ dịch vụ</div></div><div class="actions"><button class="reset" aria-label="Bắt đầu hội thoại mới" title="Hội thoại mới">↺</button><button class="close" aria-label="Đóng trợ lý">×</button></div></header>
      <div class="status" role="status">Đang kiểm tra kết nối…</div>
      <div class="messages" role="log" aria-live="polite" aria-relevant="additions"></div>
      <div class="chips"><button data-query="Dịch vụ này phù hợp với nhu cầu nào?">Phạm vi dịch vụ</button><button data-query="So sánh Level 1, 2 và 3 của dịch vụ này">Các gói Level</button><button data-query="Khách hàng nhận được sản phẩm bàn giao nào?">Sản phẩm bàn giao</button><button data-query="Cần chuẩn bị thông tin gì trước khi khảo sát?">Cần chuẩn bị gì?</button></div>
      <form><input aria-label="Câu hỏi cho trợ lý" placeholder="Nhập câu hỏi của bạn…" maxlength="4000" autocomplete="off" required><button type="submit">Gửi</button></form>
      <div class="note">${internal ? 'Chế độ review nội bộ · Hồ sơ chưa được duyệt công bố.' : 'Trả lời theo tài liệu · Thông tin thương mại qua Sales/Finance.'} Nội dung chat được gửi tới Gemini để trả lời.</div>
    </section>`;
  document.body.append(host);
  const $ = selector => root.querySelector(selector);
  const messages = $('.messages'), input = $('input'), launcher = $('.launcher'), panel = $('.panel');
  const history = [];
  let busy = false, returnFocus = launcher, documentModeUntil = 0, answered = false;

  function open(origin = launcher) {
    returnFocus = origin;
    panel.hidden = false;
    launcher.hidden = true;
    launcher.setAttribute('aria-expanded', 'true');
    input.focus();
  }
  function close() {
    panel.hidden = true;
    launcher.hidden = false;
    launcher.setAttribute('aria-expanded', 'false');
    returnFocus?.focus();
  }
  function append(role, text, sources = []) {
    const node = document.createElement('div');
    node.className = `message ${role}`;
    const label = document.createElement('span'); label.className = 'label';
    label.textContent = role === 'user' ? 'Bạn' : role === 'error' ? 'Thông báo kết nối' : `Trợ lý ${serviceId}`;
    const body = document.createElement('div'); body.className = 'text';
    // Format common Markdown without interpreting HTML, links or model-provided scripts.
    const parts = text.replace(/^#{1,6}\s+/gm, '').replace(/`([^`]+)`/g, '$1').split(/(\*\*[^*]+\*\*)/g);
    for (const part of parts) {
      if (part.startsWith('**') && part.endsWith('**')) {
        const strong = document.createElement('strong'); strong.textContent = part.slice(2, -2); body.append(strong);
      } else body.append(document.createTextNode(part));
    }
    node.append(label, body);
    if (sources.length) {
      const details = document.createElement('details'), summary = document.createElement('summary'), list = document.createElement('ol');
      summary.textContent = `${sources.length} nguồn được trích dẫn`;
      for (const source of sources) {
        const item = document.createElement('li'); item.textContent = `[${source.number}] ${source.file} · ${source.locator}`; list.append(item);
      }
      details.append(summary, list); node.append(details);
    }
    messages.append(node); messages.scrollTop = messages.scrollHeight;
    return node;
  }
  function welcome() { append('model', `Xin chào! Tôi hỗ trợ tìm hiểu hồ sơ ${serviceId}: phạm vi, quy trình, các Level, đầu ra và điều kiện triển khai. Bạn muốn tìm hiểu nội dung nào?`); }
  function setBusy(value) {
    busy = value;
    root.querySelectorAll('form button, .chips button, .reset').forEach(b => { b.disabled = value; });
    input.disabled = value;
  }
  async function send(text, retry = false) {
    if (busy || !text.trim()) return;
    if (text.length > 4000) { append('error', 'Vui lòng đặt câu hỏi tối đa 4.000 ký tự.'); return; }
    open();
    input.value = '';
    if (!retry) append('user', text);
    setBusy(true);
    const pending = append('model', 'Đang tra cứu tài liệu và soạn câu trả lời…');
    try {
      const [lookup, reference] = await documents;
      let data = lookup.guidanceReply(serviceId, text, reference.services);
      if (!data) {
        if (Date.now() < documentModeUntil) {
          data = lookup.documentReply(reference, serviceId, text, history.slice(-12));
        } else {
          try {
            const response = await fetch(new URL('chat', api), { method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ serviceId, message: text, history: history.slice(-12) }), signal: AbortSignal.timeout(15000) });
            data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Máy chủ chưa sẵn sàng.');
          } catch {
            documentModeUntil = Date.now() + 600000;
            data = lookup.documentReply(reference, serviceId, text, history.slice(-12));
          }
        }
      }
      if (typeof data.answer !== 'string') throw new Error('Phản hồi chưa hợp lệ.');
      pending.remove();
      append('model', data.answer, data.sources || []);
      history.push({ role: 'user', text }, { role: 'model', text: data.answer.slice(0, 8000) });
      answered = true;
      if (data.mode === 'document_lookup') {
        documentModeUntil = Date.now() + 600000;
        $('.status').textContent = `Tra cứu tài liệu · ${serviceId}`;
        $('.note').textContent = 'Đang dùng trích đoạn nội dung dịch vụ. Gemini hiện chưa khả dụng; câu trả lời này không do AI tổng hợp.';
      } else if (data.mode === 'gemini') {
        $('.status').textContent = 'Gemini đã kết nối · Trả lời theo hồ sơ dịch vụ';
        $('.note').textContent = 'Trả lời theo tài liệu · Thông tin thương mại qua Sales/Finance. Nội dung chat được gửi tới Gemini để trả lời.';
      } else $('.status').textContent = `Trợ lý ${serviceId} · Sẵn sàng nhận câu hỏi`;
    } catch (error) {
      pending.remove();
      const node = append('error', error instanceof TypeError || error.name === 'TimeoutError' || error instanceof SyntaxError
        ? 'Chưa kết nối được trợ lý. Vui lòng thử lại sau.' : error.message);
      const button = document.createElement('button'); button.className = 'retry'; button.textContent = 'Thử lại câu hỏi';
      button.addEventListener('click', () => { node.remove(); send(text, true); }); node.append(button);
      $('.status').textContent = 'Kết nối đang gặp lỗi';
    } finally { setBusy(false); if (!panel.hidden) input.focus(); }
  }
  launcher.addEventListener('click', () => open());
  $('.close').addEventListener('click', close);
  $('.reset').addEventListener('click', () => { history.length = 0; messages.replaceChildren(); welcome(); input.focus(); });
  $('form').addEventListener('submit', e => { e.preventDefault(); send(input.value.trim()); });
  root.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => send(button.dataset.query)));
  root.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab' && !panel.hidden) {
      const focusable = [...panel.querySelectorAll('button:not(:disabled), input:not(:disabled), summary')];
      const first = focusable[0], last = focusable.at(-1);
      if (e.shiftKey && root.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && root.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  welcome();
  fetch(new URL('health', api), { signal: AbortSignal.timeout(8000) }).then(async response => {
    if (!response.ok) throw new Error();
    const data = await response.json();
    if (!answered) $('.status').textContent = data.configured ? `Kho hồ sơ đã kết nối · ${data.documents} tài liệu / 15 dịch vụ` : `Tra cứu nội dung ${serviceId}`;
  }).catch(() => {
    documentModeUntil = Date.now() + 600000;
    if (!answered) $('.status').textContent = `Tra cứu nội dung ${serviceId}`;
  });

  // Connect existing page entry points to one real conversation. Capture prevents the old mock handlers from replying.
  const inputSelector = '#chat-input,#aiChatInput,#chatInput,#ai-user-input,#aiAgentInput,#agent-input-text,.chat-disabled-input';
  const promptSelector = '.chip-btn[data-question],.agent-chip[data-question],.prompt-chip,.suggest-btn,.suggested-btn,.q-chip,.qs-btn';
  const triggerSelector = '#ai-trigger-btn,#floatingAiBtn,#aiAgentTrigger,#agent-fab-btn,#open-agent-header-btn,.floating-agent,[data-open-service-chat]';
  const sendSelector = '#aiSendBtn,button[onclick*="sendChatMessage"],button[onclick*="sendDemoMessage"],.agent-placeholder-footer button';
  function consume(e) { e.preventDefault(); e.stopImmediatePropagation(); }
  document.querySelectorAll(inputSelector).forEach(field => {
    field.disabled = false; field.maxLength = 4000;
    field.placeholder = `Hỏi trợ lý ${serviceId} theo tài liệu…`;
  });
  document.querySelectorAll('.agent-placeholder-footer button').forEach(button => { button.disabled = false; });
  document.querySelectorAll('.agent-embed-tag').forEach(label => { label.textContent = 'Hỏi đáp theo tài liệu'; });
  document.addEventListener('click', e => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;
    const prompt = target.closest(promptSelector);
    if (prompt) {
      consume(e);
      send(prompt.dataset.question || prompt.dataset.prompt || prompt.getAttribute('onclick')?.match(/askPresetQ\('([^']+)'\)/)?.[1] || prompt.textContent.trim());
      return;
    }
    const trigger = target.closest(triggerSelector);
    if (trigger) { consume(e); open(trigger); return; }
    const button = target.closest(sendSelector);
    if (button) {
      consume(e);
      const field = document.querySelector(inputSelector);
      if (field) { send(field.value.trim()); field.value = ''; }
    }
  }, true);
  document.addEventListener('submit', e => {
    const field = e.target.querySelector?.(inputSelector);
    if (field) { consume(e); send(field.value.trim()); field.value = ''; }
  }, true);
  for (const type of ['keydown', 'keypress']) document.addEventListener(type, e => {
    if (e.key === 'Enter' && !e.isComposing && e.target.matches?.(inputSelector)) {
      consume(e); if (type === 'keydown') { send(e.target.value.trim()); e.target.value = ''; }
    }
  }, true);
  // Hide duplicate floating shells, retaining all inline questions and form entry points.
  document.querySelectorAll('#ai-widget-modal,#agent-chat-modal,#aiAgentWindow,#ai-trigger-btn,#floatingAiBtn,#aiAgentTrigger,#agent-fab-btn,.floating-agent').forEach(el => {
    el.hidden = true;
    // Page styles declare display:flex, which overrides the browser's default [hidden] rule.
    el.style.setProperty('display', 'none', 'important');
  });
  // Inline sections invite users into the same conversation; they do not contain a second chat UI.
  document.querySelectorAll('#chat-box,#chat-messages,#aiChatBody,#agentPlaceholderChat,#agent-demo-chat,.chat-sample-msg').forEach(el => {
    el.style.setProperty('display', 'none', 'important');
  });
  document.querySelectorAll(inputSelector).forEach(field => {
    const oldForm = field.closest('form') || field.parentElement;
    if (!oldForm || oldForm.closest('#ai-widget-modal,#agent-chat-modal,#aiAgentWindow')) return;
    oldForm.style.setProperty('display', 'none', 'important');
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.openServiceChat = '';
    button.className = 'btn btn-primary'; button.textContent = `Hỏi Trợ lý AI ${serviceId}`;
    oldForm.after(button);
  });
  // Expose the existing page-3 suggested questions through the shared assistant without opening its mock modal.
  const inline = document.querySelector('#user-ai-agent-embed-slot');
  if (inline) {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.openServiceChat = '';
    button.className = 'btn btn-primary'; button.textContent = `Mở trợ lý ${serviceId}`;
    inline.replaceChildren(button);
  }
})();
