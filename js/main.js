document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // 01. БАЗОВЫЕ УТИЛИТЫ
  // ============================================================
  const getIconHref = window.getIconHref
    ? window.getIconHref
    : (symbolId) => `media/icons/${symbolId}.svg#${symbolId}`;

  const createIcon = (symbolId, attributes) =>
    `<svg ${attributes}><use href="${getIconHref(symbolId)}"></use></svg>`;

  function formatNumber(num) {
    return new Intl.NumberFormat("en-US").format(num);
  }

  // ============================================================
  // 02. HERO: SCROLL CUE
  // ============================================================
  const heroScrollCue = document.getElementById("hero-scroll-cue");

  function updateHeroScrollCueVisibility() {
    if (!heroScrollCue) return;
    if (window.scrollY > 80) {
      heroScrollCue.classList.add("is-hidden");
    } else {
      heroScrollCue.classList.remove("is-hidden");
    }
  }

  if (heroScrollCue) {
    window.addEventListener("scroll", updateHeroScrollCueVisibility, {
      passive: true,
    });
    updateHeroScrollCueVisibility();
  }

  // ============================================================
  // 03. ПРОЕКТЫ: РЕНДЕР И ФИЛЬТРЫ
  // ============================================================
  const projectsGrid = document.getElementById("projects-grid");
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const noResults = document.getElementById("no-results");

  function getActiveFilters() {
    return {
      searchTerm: searchInput ? searchInput.value.toLowerCase() : "",
      filterCategory: categoryFilter ? categoryFilter.value : "all",
    };
  }

  function matchesActiveFilters(project, filters = getActiveFilters()) {
    const { searchTerm, filterCategory } = filters;
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm);
    const matchesCategory =
      filterCategory === "all" || project.category === filterCategory;
    return matchesSearch && matchesCategory;
  }

  function getCategoryStyleClass(category) {
    switch (category) {
      case "Web Platform":
        return "card--web-platform";
      case "Mobile App":
        return "card--mobile-app";
      case "Enterprise System":
        return "card--enterprise-system";
      case "UI/UX Design":
        return "card--ui-ux-design";
      default:
        return "card--default";
    }
  }

  function createProjectCard(project, forceVisible = false) {
    const card = document.createElement("div");
    const categoryClass = getCategoryStyleClass(project.category);
    card.className = `card glass animate-on-scroll ${categoryClass}`;
    card.id = `card-${project.id}`;

    if (forceVisible) {
      card.classList.add("is-visible");
    }

    const isDone = project.status === "Готово";
    const isChecked = isDone ? "checked" : "";
    const statusClass = isDone
      ? "card__status-value--done"
      : "card__status-value--in-progress";
    const safeCategory = window.escapeHTML(project.category);
    const safeTitle = window.escapeHTML(project.title);
    const safeDesc = window.escapeHTML(project.description) || "Нет описания";
    const safeDate = window.escapeHTML(project.date);
    const safeStatus = window.escapeHTML(project.status);

    card.innerHTML = `
      <div class="card__header">
        <span class="badge badge--category">${safeCategory}</span>
        <div class="status-toggle" title="Отметить статус">
          <input type="checkbox" class="status-checkbox" data-id="${project.id}" ${isChecked} aria-label="Отметить проект как выполненный">
        </div>
      </div>
      <h3 class="card__title">${safeTitle}</h3>
      <p class="card__desc">${safeDesc}</p>

      <div class="card__meta">
        <span class="card__date">Срок: ${safeDate}</span>
        <span class="card__price">$${formatNumber(project.price || 0)}</span>
      </div>

      <div class="card__footer">
        <span class="card__status">Статус: <strong class="card__status-value ${statusClass}">${safeStatus}</strong></span>
        <div class="card__actions">
          <button class="btn-icon btn-edit" data-id="${project.id}" aria-label="Редактировать">
            ${createIcon("edit", 'fill="none" stroke="currentColor" viewBox="0 0 24 24"')}
          </button>
          <button class="btn-icon delete btn-delete" data-id="${project.id}" aria-label="Удалить">
            ${createIcon("trash", 'fill="none" stroke="currentColor" viewBox="0 0 24 24"')}
          </button>
        </div>
      </div>
    `;

    return card;
  }

  function updateEmptyState() {
    if (!noResults || !projectsGrid) return;
    noResults.style.display =
      projectsGrid.children.length === 0 ? "block" : "none";
  }

  function syncSingleCard(project) {
    if (!projectsGrid) return;

    const cardId = `card-${project.id}`;
    const existingCard = document.getElementById(cardId);
    const shouldBeVisible = matchesActiveFilters(project);

    if (!shouldBeVisible) {
      if (existingCard) existingCard.remove();
      updateEmptyState();
      return;
    }

    const newCard = createProjectCard(project, true);

    if (existingCard) {
      existingCard.replaceWith(newCard);
    } else {
      projectsGrid.prepend(newCard);
    }

    updateEmptyState();
  }

  function renderCards() {
    if (!projectsGrid) return;

    const data = getData();
    const activeFilters = getActiveFilters();
    const filteredData = data.filter((item) =>
      matchesActiveFilters(item, activeFilters),
    );

    projectsGrid.innerHTML = "";

    if (filteredData.length === 0) {
      if (noResults) noResults.style.display = "block";
      return;
    }

    if (noResults) noResults.style.display = "none";

    const fragment = document.createDocumentFragment();
    filteredData.forEach((project) => {
      fragment.appendChild(createProjectCard(project));
    });
    projectsGrid.appendChild(fragment);

    window.initScrollAnimations?.();
  }

  if (searchInput) searchInput.addEventListener("input", renderCards);
  if (categoryFilter) categoryFilter.addEventListener("change", renderCards);

  // ============================================================
  // 04. МОДАЛЬНОЕ ОКНО (РЕДАКТИРОВАНИЕ)
  // ============================================================
  const modal = document.getElementById("edit-modal");
  const closeBtn = document.getElementById("close-modal");
  const cancelBtn = document.getElementById("cancel-modal");
  const editForm = document.getElementById("edit-form");
  const editId = document.getElementById("edit-id");
  const editTitle = document.getElementById("edit-title");
  const editCategory = document.getElementById("edit-category");
  const editPrice = document.getElementById("edit-price");
  const editDesc = document.getElementById("edit-desc");
  let lastFocusedElement = null;

  function trapModalFocus(event) {
    if (!modal || !modal.classList.contains("active") || event.key !== "Tab") {
      return;
    }

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function openModal(id) {
    if (!modal) return;

    const data = getData();
    const targetId = String(id);
    const project = data.find((item) => String(item.id) === targetId);
    if (!project) return;

    lastFocusedElement = document.activeElement;
    editId.value = project.id;
    editTitle.value = project.title;
    editCategory.value = project.category;
    editPrice.value = project.price || 0;
    editDesc.value = project.description || "";

    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => editTitle?.focus());
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("active");
    document.body.style.overflow = "";

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("active")) return;

      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
        return;
      }

      trapModalFocus(e);
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const id = String(editId.value);
      const data = getData();
      const index = data.findIndex((item) => String(item.id) === id);

      if (index === -1) return;

      data[index].title = editTitle.value.trim();
      data[index].category = editCategory.value;
      data[index].price = Number(editPrice.value);
      data[index].description = editDesc.value.trim();

      saveData(data);
      syncSingleCard(data[index]);
      closeModal();
      window.showToast?.("Проект успешно обновлен!", "success");
    });
  }

  // ============================================================
  // 05. СОБЫТИЯ ПРОЕКТОВ
  // ============================================================
  if (projectsGrid) {
    projectsGrid.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest(".btn-delete");
      const editBtn = e.target.closest(".btn-edit");

      if (deleteBtn) {
        const id = String(deleteBtn.getAttribute("data-id"));
        if (
          confirm(
            "Вы уверены, что хотите удалить этот проект? Это действие необратимо.",
          )
        ) {
          const nextData = getData().filter((item) => String(item.id) !== id);
          saveData(nextData);
          const card = document.getElementById(`card-${id}`);
          if (card) card.remove();
          updateEmptyState();
          window.showToast?.("Проект удален", "success");
        }
      }

      if (editBtn) {
        const id = String(editBtn.getAttribute("data-id"));
        openModal(id);
      }
    });

    projectsGrid.addEventListener("change", (e) => {
      if (!e.target.classList.contains("status-checkbox")) return;

      const id = String(e.target.getAttribute("data-id"));
      const isChecked = e.target.checked;
      const data = getData();
      const index = data.findIndex((item) => String(item.id) === id);

      if (index === -1) return;

      data[index].status = isChecked ? "Готово" : "В работе";
      saveData(data);
      syncSingleCard(data[index]);
      window.showToast?.(
        `Статус изменен на "${data[index].status}"`,
        "success",
      );
    });
  }

  // ============================================================
  // 06. ГАЛЕРЕЯ: ФИЛЬТРЫ И ПРОСМОТР
  // ============================================================
  const galleryGrid = document.getElementById("gallery-grid");
  const galleryFilters = document.querySelectorAll(".gallery-filter");
  const galleryLightbox = document.getElementById("gallery-lightbox");
  const galleryLightboxImage = document.getElementById(
    "gallery-lightbox-image",
  );
  const galleryLightboxTitle = document.getElementById(
    "gallery-lightbox-title",
  );
  const galleryLightboxCat = document.getElementById("gallery-lightbox-cat");
  const galleryClose = document.getElementById("gallery-close");
  const galleryPrev = document.getElementById("gallery-prev");
  const galleryNext = document.getElementById("gallery-next");

  let activeGalleryItems = [];
  let activeGalleryIndex = 0;

  function getVisibleGalleryItems(allItems) {
    return allItems.filter((item) => !item.classList.contains("is-hidden"));
  }

  function applyGalleryFilter(filterValue, allItems) {
    allItems.forEach((item) => {
      const itemCategory = item.dataset.category || "all";
      const isVisible = filterValue === "all" || itemCategory === filterValue;
      item.classList.toggle("is-hidden", !isVisible);
    });

    activeGalleryItems = getVisibleGalleryItems(allItems);
    window.initScrollAnimations?.();
  }

  function fillLightbox(item) {
    if (
      !item ||
      !galleryLightboxImage ||
      !galleryLightboxTitle ||
      !galleryLightboxCat
    ) {
      return;
    }

    const image = item.querySelector(".gallery-img");
    if (!image) return;

    galleryLightboxImage.src = image.getAttribute("src") || "";
    galleryLightboxImage.alt = image.getAttribute("alt") || "Project image";
    galleryLightboxTitle.textContent = item.dataset.title || "Проект";
    galleryLightboxCat.textContent = item.dataset.cat || "";
  }

  function openGalleryLightbox(index) {
    if (!galleryLightbox || activeGalleryItems.length === 0) return;

    activeGalleryIndex = index;
    fillLightbox(activeGalleryItems[activeGalleryIndex]);
    galleryLightbox.classList.add("is-open");
    galleryLightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeGalleryLightbox() {
    if (!galleryLightbox) return;
    galleryLightbox.classList.remove("is-open");
    galleryLightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function shiftGallery(step) {
    if (activeGalleryItems.length === 0) return;
    activeGalleryIndex =
      (activeGalleryIndex + step + activeGalleryItems.length) %
      activeGalleryItems.length;
    fillLightbox(activeGalleryItems[activeGalleryIndex]);
  }

  if (galleryGrid) {
    const galleryItems = Array.from(
      galleryGrid.querySelectorAll(".gallery-item"),
    );
    activeGalleryItems = [...galleryItems];

    galleryFilters.forEach((filterBtn) => {
      filterBtn.addEventListener("click", () => {
        galleryFilters.forEach((btn) => btn.classList.remove("is-active"));
        filterBtn.classList.add("is-active");
        applyGalleryFilter(filterBtn.dataset.filter || "all", galleryItems);
      });
    });

    galleryItems.forEach((item) => {
      item.addEventListener("click", () => {
        activeGalleryItems = getVisibleGalleryItems(galleryItems);
        const index = activeGalleryItems.indexOf(item);
        if (index >= 0) openGalleryLightbox(index);
      });
    });

    galleryLightbox?.addEventListener("click", (event) => {
      if (event.target.dataset.close === "true") {
        closeGalleryLightbox();
      }
    });

    galleryClose?.addEventListener("click", closeGalleryLightbox);
    galleryPrev?.addEventListener("click", () => shiftGallery(-1));
    galleryNext?.addEventListener("click", () => shiftGallery(1));

    document.addEventListener("keydown", (event) => {
      if (!galleryLightbox?.classList.contains("is-open")) return;

      if (event.key === "Escape") {
        closeGalleryLightbox();
      }

      if (event.key === "ArrowLeft") {
        shiftGallery(-1);
      }

      if (event.key === "ArrowRight") {
        shiftGallery(1);
      }
    });
  }

  // ============================================================
  // 07. FAQ (АККОРДЕОН)
  // ============================================================
  const accordionHeaders = document.querySelectorAll(".accordion-header");
  const accordionItems = document.querySelectorAll(".accordion-item");
  accordionHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      const content = item.querySelector(".accordion-content");

      accordionItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active");
          otherItem.querySelector(".accordion-content").style.maxHeight = null;
        }
      });

      item.classList.toggle("active");
      if (item.classList.contains("active")) {
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        content.style.maxHeight = null;
      }
    });
  });

  // ============================================================
  // 08. ИНИЦИАЛИЗАЦИЯ
  // ============================================================
  renderCards();
});
