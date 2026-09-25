(() => {
  "use strict";

  // Keep mobile menu controls in sync with the menu's visual state.
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("button[aria-controls][aria-expanded]");
    if (!trigger) return;

    requestAnimationFrame(() => {
      const panel = document.getElementById(trigger.getAttribute("aria-controls"));
      const expanded = Boolean(
        panel &&
          (panel.classList.contains("active") ||
            panel.classList.contains("open") ||
            (panel.style.display && panel.style.display !== "none"))
      );
      trigger.setAttribute("aria-expanded", String(expanded));
    });
  });

  const match = window.location.pathname.match(/landing_page_(\d{2})/i);
  if (!match || document.querySelector(".gascolae-hub-nav")) return;

  const current = Number(match[1]);
  if (!Number.isInteger(current) || current < 1 || current > 12) return;

  const next = current === 12 ? 1 : current + 1;
  const nextFolder = String(next).padStart(2, "0");
  const nav = document.createElement("nav");
  nav.className = "gascolae-hub-nav";
  nav.setAttribute("aria-label", "Điều hướng trung tâm dịch vụ");
  nav.innerHTML = `
    <a class="gascolae-hub-home" href="../" aria-label="Quay về trung tâm 12 dịch vụ">
      <span class="gascolae-hub-mark" aria-hidden="true">⌂</span>
      <span class="gascolae-hub-copy">
        <strong>Trung tâm dịch vụ</strong>
        <small>Quay về dashboard</small>
      </span>
    </a>
    <span class="gascolae-hub-count" aria-label="Dịch vụ ${current} trên 12">${String(current).padStart(2, "0")} / 12</span>
    <a class="gascolae-hub-next" href="../landing_page_${nextFolder}/" aria-label="Xem dịch vụ tiếp theo">
      Tiếp theo <span aria-hidden="true">→</span>
    </a>
  `;

  document.body.append(nav);
})();
