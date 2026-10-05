(() => {
  "use strict";

  // Content and all level panels remain readable if JavaScript is unavailable.
  document.documentElement.classList.add("js");
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.getElementById("service-menu");
  const setMenuOpen = (open) => {
    if (!menuButton || !menu) return;
    menu.classList.toggle("active", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.textContent = open ? "Đóng ✕" : "Menu ☰";
  };

  menuButton?.addEventListener("click", () => {
    setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
  });
  menu?.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='#']");
    if (!link) return;
    setMenuOpen(false);
    const target = document.getElementById(link.hash.slice(1));
    if (target) {
      target.setAttribute("tabindex", "-1");
      requestAnimationFrame(() => target.focus({ preventScroll: true }));
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) setMenuOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuButton.focus();
    }
  });
  window.matchMedia("(max-width: 1000px)").addEventListener("change", () => setMenuOpen(false));

  // Keep the location visible while reading a long page, without moving focus.
  const sectionLinks = Array.from(menu?.querySelectorAll("a[href^='#']") || []);
  const sections = sectionLinks.map((link) => document.getElementById(link.hash.slice(1)));
  const progress = document.querySelector(".reading-progress");
  const backToTop = document.querySelector(".back-to-top");
  let scrollFrame = 0;
  const updateReadingPosition = () => {
    scrollFrame = 0;
    const offset = (document.querySelector(".site-header")?.offsetHeight || 80) + 130;
    let current = -1;
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= offset) current = index;
    });
    sectionLinks.forEach((link, index) => {
      if (index === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    const length = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${length > 0 ? Math.min(1, Math.max(0, window.scrollY / length)) : 0})`;
    if (backToTop) backToTop.hidden = window.scrollY < 700;
  };
  const scheduleReadingPosition = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateReadingPosition);
  };
  window.addEventListener("scroll", scheduleReadingPosition, { passive: true });
  window.addEventListener("resize", scheduleReadingPosition);
  window.addEventListener("load", scheduleReadingPosition);
  updateReadingPosition();

  // Native dialog provides Escape handling, focus containment and restoration.
  const imageDialog = document.querySelector(".image-dialog");
  const imageButton = document.querySelector("[data-open-image]");
  if (imageDialog && imageButton && typeof imageDialog.showModal === "function") {
    imageButton.hidden = false;
    imageButton.addEventListener("click", () => {
      imageDialog.showModal();
      document.documentElement.classList.add("image-open");
    });
    imageDialog.querySelector("[data-close-image]")?.addEventListener("click", () => imageDialog.close());
    imageDialog.addEventListener("click", (event) => {
      if (event.target !== imageDialog) return;
      const rect = imageDialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) imageDialog.close();
    });
    imageDialog.addEventListener("close", () => {
      document.documentElement.classList.remove("image-open");
      imageButton.focus({ preventScroll: true });
    });
  }

  document.querySelectorAll("[data-level-tabs]").forEach((tabList) => {
    const tabs = Array.from(tabList.querySelectorAll("button[data-panel]"));
    const panels = tabs.map((tab) => document.getElementById(tab.dataset.panel));
    if (!tabs.length || panels.some((panel) => !panel)) return;

    const selectTab = (index, moveFocus = false) => {
      tabs.forEach((tab, tabIndex) => {
        const selected = index === tabIndex;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[tabIndex].hidden = !selected;
      });
      if (moveFocus) tabs[index].focus();
      scheduleReadingPosition();
    };

    tabList.hidden = false;
    tabList.setAttribute("role", "tablist");
    tabs.forEach((tab, index) => {
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panels[index].id);
      panels[index].setAttribute("role", "tabpanel");
      panels[index].setAttribute("aria-labelledby", tab.id);
      panels[index].tabIndex = 0;
      tab.addEventListener("click", () => selectTab(index));
      tab.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next !== undefined) {
          event.preventDefault();
          selectTab(next, true);
        }
      });
    });
    selectTab(0);
  });
})();
