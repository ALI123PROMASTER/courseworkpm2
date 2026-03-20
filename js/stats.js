document.addEventListener('DOMContentLoaded', () => {

    const data = getData(); // From storage.js

    // Настройка Intersection Observer для анимаций при скролле элементов с классом animate-on-scroll
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    // --- 1. ВЫЧИСЛЕНИЕ KPI (Ключевые показатели эффективности) ---
    const totalProjectsEl = document.getElementById('kpi-total-projects');
    const totalBudgetEl = document.getElementById('kpi-total-budget');
    const successRateEl = document.getElementById('kpi-success-rate');

    const totalProjects = data.length;
    const totalBudget = data.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

    let completedCount = data.filter(item => item.status === 'Готово').length;
    let successRate = totalProjects > 0 ? Math.round((completedCount / totalProjects) * 100) : 0;

    function animateValue(obj, objPrefix, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 5);
            const current = Math.floor(start + (end - start) * easeOut);

            if (objPrefix === '$') {
                obj.textContent = `$${current.toLocaleString('en-US')}`;
            } else if (objPrefix === '%') {
                obj.textContent = `${current}%`;
            } else {
                obj.textContent = current;
            }

            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    // Запускаем анимации чисел с небольшой задержкой для "вау-эффекта" при загрузке страницы
    setTimeout(() => {
        animateValue(totalProjectsEl, '', 0, totalProjects, 1500);
        animateValue(totalBudgetEl, '$', 0, totalBudget, 2000);
        animateValue(successRateEl, '%', 0, successRate, 1500);
    }, 300);

    // --- 2. ПРОГРЕСС БАРЫ ПО КАТЕГОРИЯМ ---
    const categoryBarsContainer = document.getElementById('category-bars');

    // Агрегация данных (подсчет количества проектов в каждой категории)
    const categoryCounts = {};
    data.forEach(item => {
        const cat = item.category || 'Other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(categoryCounts), 1); // Избегаем деления на 0, если проектов нет

    // Отрисовка прогресс баров
    categoryBarsContainer.innerHTML = '';
    Object.entries(categoryCounts).forEach(([cat, count], index) => {
        const percentage = Math.round((count / maxCount) * 100);

        const wrap = document.createElement('div');
        wrap.className = 'progress-wrap';

        wrap.innerHTML = `
            <div class="progress-info">
                <span>${cat}</span>
                <span style="color: var(--accent-1); font-weight: 700;">${count}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="bar-${index}" style="width: 0%;"></div>
            </div>
        `;
        categoryBarsContainer.appendChild(wrap);

        // Trigger width animation
        setTimeout(() => {
            document.getElementById(`bar-${index}`).style.width = `${percentage}%`;
        }, 500 + (index * 150)); // stagger
    });

    // --- 3. КРУГОВАЯ ДИАГРАММА (Распределение бюджета) ---
    const circleChart = document.getElementById('circle-chart');
    const chartLegend = document.getElementById('chart-legend');
    const topSphereEl = document.getElementById('top-sphere');

    // Суммирование бюджета по категориям
    const budgetCounts = {};
    data.forEach(item => {
        const cat = item.category || 'Other';
        budgetCounts[cat] = (budgetCounts[cat] || 0) + (Number(item.price) || 0);
    });

    const sortedBudgets = Object.entries(budgetCounts).sort((a, b) => b[1] - a[1]);

    if (sortedBudgets.length > 0) {
        topSphereEl.textContent = sortedBudgets[0][0]; // the one with highest budget
    }

    // Colors
    const colors = ['var(--accent-1)', 'var(--accent-2)', 'var(--success)', 'var(--warning)', '#ec4899'];

    let currentAngle = 0;
    let gradientStops = [];

    chartLegend.innerHTML = '';

    // Calculate angles
    sortedBudgets.forEach(([cat, budget], index) => {
        const percentage = budget / totalBudget;
        const degrees = percentage * 360;
        const color = colors[index % colors.length];

        // Legend
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `<div class="legend-color" style="background: ${color}"></div> ${cat} ($${(budget / 1000).toFixed(1)}k)`;
        chartLegend.appendChild(legendItem);

        // Gradient
        const startAngle = currentAngle;
        const endAngle = currentAngle + degrees;

        gradientStops.push(`${color} ${startAngle}deg ${endAngle}deg`);
        currentAngle = endAngle;
    });

    // Применяем градиент для круговой диаграммы с помощью conic-gradient (конический градиент)
    // CSS-трюк: анимируем вращение от -180 до 0 градусов и масштаб от 0 до 1 для красивого появления
    circleChart.style.background = `conic-gradient(${gradientStops.join(', ')})`;
    circleChart.style.transform = `scale(0) rotate(-180deg)`;
    circleChart.style.transition = `transform 1.5s cubic-bezier(0.22, 1, 0.36, 1)`;

    setTimeout(() => {
        circleChart.style.transform = `scale(1) rotate(0deg)`;
    }, 400);

});
