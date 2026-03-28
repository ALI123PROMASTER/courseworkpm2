document.addEventListener("DOMContentLoaded", () => {
  // =============================
  // НАСТРОЙКИ / ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // =============================
  // =============================
  // Общие утилиты
  // =============================
  const getIconHref = window.getIconHref
    ? window.getIconHref
    : (symbolId) => `media/icons/${symbolId}.svg#${symbolId}`;

  const createIcon = (symbolId, attributes) =>
    `<svg ${attributes}><use href="${getIconHref(symbolId)}"></use></svg>`;

  function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icon =
      type === "success"
        ? createIcon(
            "check",
            'fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20"',
          )
        : createIcon(
            "alert",
            'fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20"',
          );

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  function formatNumber(num) {
    return new Intl.NumberFormat("en-US").format(num);
  }

  // =============================
  // HERO Scroll Cue (hide on scroll)
  // =============================
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

  // =============================
  // НАВИГАЦИЯ (Scroll Spy)
  // =============================
  const sections = document.querySelectorAll("section[id]");
  const sectionNavLinks = document.querySelectorAll('.nav__list a[href^="#"]');

  function highlightNavigation() {
    if (sectionNavLinks.length === 0) return;

    const scrollY = window.pageYOffset;

    if (scrollY < 100) {
      sectionNavLinks.forEach((link) => {
        link.classList.remove("nav__link--active");
        if (link.getAttribute("href") === "#home") {
          link.classList.add("nav__link--active");
        }
      });
      return;
    }

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 150;
      const sectionId = section.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        sectionNavLinks.forEach((link) => {
          link.classList.remove("nav__link--active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("nav__link--active");
          }
        });
      }
    });
  }

  // На страницах с обычными ссылками между HTML-файлами scroll-spy не нужен.
  if (sections.length > 0 && sectionNavLinks.length > 0) {
    window.addEventListener("scroll", highlightNavigation);
    highlightNavigation();
  }

  // =============================
  // ПРОЕКТЫ (рендер + фильтры)
  // =============================
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

  function matchesActiveFilters(project) {
    const { searchTerm, filterCategory } = getActiveFilters();
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm);
    const matchesCategory =
      filterCategory === "all" || project.category === filterCategory;
    return matchesSearch && matchesCategory;
  }

  function createProjectCard(project, forceVisible = false) {
    const card = document.createElement("div");
    card.className = "card glass animate-on-scroll";
    card.id = `card-${project.id}`;

    if (forceVisible) {
      card.classList.add("is-visible");
    }

    const isChecked = project.status === "Готово" ? "checked" : "";
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
        <span style="font-size: 0.85rem; color: var(--text-secondary);">Статус: <strong style="color: ${isChecked ? "var(--success)" : "var(--warning)"}">${safeStatus}</strong></span>
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
    const { searchTerm, filterCategory } = getActiveFilters();

    const filteredData = data.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm);
      const matchesCategory =
        filterCategory === "all" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    projectsGrid.innerHTML = "";

    if (filteredData.length === 0) {
      if (noResults) noResults.style.display = "block";
      return;
    }

    if (noResults) noResults.style.display = "none";

    filteredData.forEach((project) => {
      projectsGrid.appendChild(createProjectCard(project));
    });

    window.initScrollAnimations?.();
  }

  if (searchInput) searchInput.addEventListener("input", renderCards);
  if (categoryFilter) categoryFilter.addEventListener("change", renderCards);

  // =============================
  // МОДАЛЬНОЕ ОКНО (редактирование)
  // =============================
  const modal = document.getElementById("edit-modal");
  const closeBtn = document.getElementById("close-modal");
  const cancelBtn = document.getElementById("cancel-modal");
  const editForm = document.getElementById("edit-form");
  const editId = document.getElementById("edit-id");
  const editTitle = document.getElementById("edit-title");
  const editCategory = document.getElementById("edit-category");
  const editPrice = document.getElementById("edit-price");
  const editDesc = document.getElementById("edit-desc");

  function openModal(id) {
    if (!modal) return;

    const data = getData();
    const project = data.find((item) => item.id === id);
    if (!project) return;

    editId.value = project.id;
    editTitle.value = project.title;
    editCategory.value = project.category;
    editPrice.value = project.price || 0;
    editDesc.value = project.description || "";

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const id = Number(editId.value);
      const data = getData();
      const index = data.findIndex((item) => item.id === id);

      if (index === -1) return;

      data[index].title = editTitle.value.trim();
      data[index].category = editCategory.value;
      data[index].price = Number(editPrice.value);
      data[index].description = editDesc.value.trim();

      saveData(data);
      syncSingleCard(data[index]);
      closeModal();
      showToast("Проект успешно обновлен!");
    });
  }

  // =============================
  // СОБЫТИЯ ПРОЕКТОВ
  // =============================
  if (projectsGrid) {
    projectsGrid.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest(".btn-delete");
      const editBtn = e.target.closest(".btn-edit");

      if (deleteBtn) {
        const id = Number(deleteBtn.getAttribute("data-id"));
        if (
          confirm(
            "Вы уверены, что хотите удалить этот проект? Это действие необратимо.",
          )
        ) {
          const nextData = getData().filter((item) => item.id !== id);
          saveData(nextData);
          const card = document.getElementById(`card-${id}`);
          if (card) card.remove();
          updateEmptyState();
          showToast("Проект удален");
        }
      }

      if (editBtn) {
        const id = Number(editBtn.getAttribute("data-id"));
        openModal(id);
      }
    });

    projectsGrid.addEventListener("change", (e) => {
      if (!e.target.classList.contains("status-checkbox")) return;

      const id = Number(e.target.getAttribute("data-id"));
      const isChecked = e.target.checked;
      const data = getData();
      const index = data.findIndex((item) => item.id === id);

      if (index === -1) return;

      data[index].status = isChecked ? "Готово" : "В работе";
      saveData(data);
      syncSingleCard(data[index]);
      showToast(`Статус изменен на "${data[index].status}"`);
    });
  }

  // =============================
  // FAQ (АККОРДЕОН)
  // =============================
  const accordionHeaders = document.querySelectorAll(".accordion-header");
  accordionHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      const content = item.querySelector(".accordion-content");

      document.querySelectorAll(".accordion-item").forEach((otherItem) => {
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

  // =============================
  // ИНИЦИАЛИЗАЦИЯ
  // =============================
  renderCards();
});
