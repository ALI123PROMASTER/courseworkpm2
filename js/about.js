document.addEventListener('DOMContentLoaded', () => {
    // Темы и мобильное меню обрабатываются глобально в storage.js

    // Настройка анимации появления контента при скролле (Intersection Observer)
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    // ------------- ЛОГИКА КАЛЬКУЛЯТОРА СТОИМОСТИ ------------- //
    const typeSel = document.getElementById('calc-type');
    const pagesRange = document.getElementById('calc-pages');
    const pagesVal = document.getElementById('pages-val');
    const seoCheck = document.getElementById('calc-seo');
    const copyCheck = document.getElementById('calc-copy');
    const priceEl = document.getElementById('total-price');

    // Базовые ставки для разных типов сайтов
    const basePrices = {
        'landing': 500,
        'corporate': 1200,
        'ecommerce': 2500,
        'saas': 5000
    };

    let currentVal = 0;

    // Главная функция подсчета
    function calculateLogic() {
        if (!typeSel) return 0;
        const base = basePrices[typeSel.value] || 0;
        // Добавляем по $50 за каждую дополнительную страницу (предполагаем, что 1 страница включена в базовую цену)
        const extraPages = parseInt(pagesRange.value) - 1;
        const pagesCost = extraPages > 0 ? extraPages * 50 : 0;

        const seo = seoCheck.checked ? 300 : 0;
        const copy = copyCheck.checked ? 500 : 0;

        return base + pagesCost + seo + copy;
    }

    // Анимация бегущих цифр суммы (от start до end за duration мс)
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Математическая формула easeOutQuart для плавного замедления в конце анимации
            const easeOut = 1 - Math.pow(1 - progress, 4);
            const currentCalculated = Math.floor(start + (end - start) * easeOut);
            obj.textContent = currentCalculated.toLocaleString('en-US');

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // В самом конце убеждаемся, что цифра точная и правильно отформатирована с запятыми
                obj.textContent = end.toLocaleString('en-US');
            }
        };
        window.requestAnimationFrame(step);
    }

    function updatePrice(animate = true) {
        if (!priceEl) return;
        const newTotal = calculateLogic();
        pagesVal.textContent = pagesRange.value;

        if (animate && currentVal !== newTotal) {
            animateValue(priceEl, currentVal, newTotal, 800);
        } else {
            priceEl.textContent = newTotal.toLocaleString('en-US');
        }
        currentVal = newTotal;
    }

    if (typeSel) {
        // Слушатели событий изменений (чекбоксы и селект пересчитывают цену с анимацией)
        typeSel.addEventListener('change', () => updatePrice(true));
        seoCheck.addEventListener('change', () => updatePrice(true));
        copyCheck.addEventListener('change', () => updatePrice(true));

        // Для ползунка количества страниц мы считаем вживую без анимации, так как она будет дергаться при быстрых движениях ползунка
        pagesRange.addEventListener('input', () => {
            pagesVal.textContent = pagesRange.value;
            updatePrice(false); // пересчитываем сразу напрямую
        });

        // Первичный подсчет при загрузке страницы
        updatePrice(true);
    }
});
