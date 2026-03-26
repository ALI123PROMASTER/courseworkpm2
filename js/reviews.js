document.addEventListener("DOMContentLoaded", () => {
  // =============================
  // Константы и стартовые данные
  // =============================
  const REVIEWS_KEY = "premium_reviews";
  const reviewsGrid = document.getElementById("reviews-grid");
  const reviewForm = document.getElementById("review-form");

  const defaultReviews = [
    {
      id: "r1",
      name: "Алексей Смирнов",
      rating: 5,
      text: "Отличная работа! Лендинг сделали в срок, дизайн превзошел все ожидания. Конверсия выросла на 40% в первый месяц.",
      date: "10.03.2026",
    },
    {
      id: "r2",
      name: "Елена Ковальчук",
      rating: 5,
      text: "Профессиональный подход к разработке корпоративной системы. Очень порадовала глубокая проработка интерфейсов и внимание к деталям.",
      date: "15.02.2026",
    },
    {
      id: "r3",
      name: "Дмитрий Иванов",
      rating: 4,
      text: "Все супер, ребята молодцы. Был небольшой сдвиг по срокам на пару дней, но качество кода и итоговый результат — на высоте.",
      date: "28.01.2026",
    },
  ];

  let reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY)) || defaultReviews;

  // =============================
  // Работа с хранилищем
  // =============================
  function saveReviews() {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  }

  if (!localStorage.getItem(REVIEWS_KEY)) {
    saveReviews();
  }

  // =============================
  // Отрисовка списка
  // =============================
  function renderReviews() {
    if (!reviewsGrid) return;
    reviewsGrid.innerHTML = "";

    reviews.forEach((review) => {
      const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
      const safeName = window.escapeHTML(review.name);
      const safeText = window.escapeHTML(review.text);

      const card = document.createElement("div");
      card.className = "review-card animate-on-scroll";
      card.innerHTML = `
                <div class="review-header">
                    <div class="review-author-info">
                        <div class="review-avatar">${safeName.charAt(0)}</div>
                        <div>
                            <span class="review-author">${safeName}</span>
                            <span class="review-date">${review.date}</span>
                        </div>
                    </div>
                    <div class="review-rating">${stars}</div>
                </div>
                <p class="review-text">"${safeText}"</p>
            `;

      reviewsGrid.appendChild(card);
    });
  }

  // =============================
  // Форма добавления отзыва
  // =============================
  if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("review-name");
      const ratingInput = document.getElementById("review-rating");
      const textInput = document.getElementById("review-text");

      if (
        !nameInput.value.trim() ||
        !ratingInput.value ||
        !textInput.value.trim()
      ) {
        window.showToast?.("Пожалуйста, заполните все поля", "error");
        return;
      }

      const newReview = {
        id: crypto.randomUUID(),
        name: nameInput.value.trim(),
        rating: parseInt(ratingInput.value, 10),
        text: textInput.value.trim(),
        date: new Date().toLocaleDateString("ru-RU"),
      };

      reviews.unshift(newReview);
      saveReviews();
      renderReviews();
      reviewForm.reset();
      window.showToast?.("Спасибо! Ваш отзыв добавлен.", "success");
    });
  }

  renderReviews();
});
