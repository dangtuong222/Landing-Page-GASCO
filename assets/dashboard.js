(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  const searchInput = document.querySelector("[data-service-search]");
  const cards = Array.from(document.querySelectorAll(".service-card"));
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const filterJumps = Array.from(document.querySelectorAll("[data-filter-jump]"));
  const resultCount = document.querySelector("[data-result-count]");
  const emptyState = document.querySelector("[data-empty-state]");
  const resetButton = document.querySelector("[data-reset-filter]");
  const currentYear = document.querySelector("[data-current-year]");

  let activeFilter = "all";

  const normalizeText = (value) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  const setActiveButton = (filter) => {
    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const applyFilters = () => {
    const query = normalizeText(searchInput?.value ?? "");
    let visibleCount = 0;

    cards.forEach((card) => {
      const categories = (card.dataset.categories ?? "").split(/\s+/);
      const searchableText = normalizeText(`${card.dataset.search ?? ""} ${card.textContent ?? ""}`);
      const matchesCategory = activeFilter === "all" || categories.includes(activeFilter);
      const matchesQuery = !query || searchableText.includes(query);
      const isVisible = matchesCategory && matchesQuery;

      card.hidden = !isVisible;
      card.setAttribute("aria-hidden", String(!isVisible));
      if (isVisible) visibleCount += 1;
    });

    if (resultCount) resultCount.textContent = String(visibleCount).padStart(2, "0");
    if (emptyState) emptyState.hidden = visibleCount !== 0;
  };

  const selectFilter = (filter) => {
    activeFilter = filter;
    setActiveButton(filter);
    applyFilters();
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => selectFilter(button.dataset.filter ?? "all"));
  });

  filterJumps.forEach((link) => {
    link.addEventListener("click", () => {
      selectFilter(link.dataset.filterJump ?? "all");
    });
  });

  searchInput?.addEventListener("input", applyFilters);

  resetButton?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    selectFilter("all");
    searchInput?.focus();
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

    if (event.key === "/" && !isTyping && searchInput) {
      event.preventDefault();
      searchInput.focus();
    }

    if (event.key === "Escape" && document.activeElement === searchInput && searchInput) {
      searchInput.value = "";
      applyFilters();
      searchInput.blur();
    }
  });

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
      card.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
    });
  });

  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
  applyFilters();
})();
