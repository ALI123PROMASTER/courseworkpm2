document.addEventListener("DOMContentLoaded", () => {
  // =============================
  // НАСТРОЙКИ / СОСТОЯНИЕ
  // =============================
  const data = getData();

  // =============================
  // БЛОК KPI
  // =============================
  const totalProjectsEl = document.getElementById("kpi-total-projects");
  const totalBudgetEl = document.getElementById("kpi-total-budget");
  const successRateEl = document.getElementById("kpi-success-rate");

  const totalProjects = data.length;
  const totalBudget = data.reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0,
  );
  const completedCount = data.filter((item) => item.status === "Готово").length;
  const successRate =
    totalProjects > 0 ? Math.round((completedCount / totalProjects) * 100) : 0;

  // =============================
  // UI: ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // =============================
  function animateValue(obj, objPrefix, start, end, duration) {
    if (!obj) return;

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 5);
      const current = Math.floor(start + (end - start) * easeOut);

      if (objPrefix === "$") {
        obj.textContent = `$${current.toLocaleString("en-US")}`;
      } else if (objPrefix === "%") {
        obj.textContent = `${current}%`;
      } else {
        obj.textContent = current;
      }

      if (progress < 1) window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  }

  setTimeout(() => {
    animateValue(totalProjectsEl, "", 0, totalProjects, 1500);
    animateValue(totalBudgetEl, "$", 0, totalBudget, 2000);
    animateValue(successRateEl, "%", 0, successRate, 1500);
  }, 300);

  // =============================
  // ПОЛОСЫ ПО КАТЕГОРИЯМ
  // =============================
  const categoryBarsContainer = document.getElementById("category-bars");
  const categoryCounts = {};

  data.forEach((item) => {
    const category = item.category || "Other";
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(categoryCounts), 1);

  if (categoryBarsContainer) {
    categoryBarsContainer.innerHTML = "";

    Object.entries(categoryCounts).forEach(([category, count], index) => {
      const percentage = Math.round((count / maxCount) * 100);

      const wrap = document.createElement("div");
      wrap.className = "progress-wrap";
      wrap.innerHTML = `
                <div class="progress-info">
                    <span>${category}</span>
                    <span style="color: var(--accent-1); font-weight: 700;">${count}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="bar-${index}" style="width: 0%;"></div>
                </div>
            `;

      categoryBarsContainer.appendChild(wrap);

      setTimeout(
        () => {
          const bar = document.getElementById(`bar-${index}`);
          if (bar) bar.style.width = `${percentage}%`;
        },
        500 + index * 150,
      );
    });
  }

  // =============================
  // КРУГОВАЯ ДИАГРАММА БЮДЖЕТА
  // =============================
  const circleChart = document.getElementById("circle-chart");
  const chartLegend = document.getElementById("chart-legend");
  const topSphereEl = document.getElementById("top-sphere");

  const budgetCounts = {};
  data.forEach((item) => {
    const category = item.category || "Other";
    budgetCounts[category] =
      (budgetCounts[category] || 0) + (Number(item.price) || 0);
  });

  const sortedBudgets = Object.entries(budgetCounts).sort(
    (a, b) => b[1] - a[1],
  );
  if (topSphereEl && sortedBudgets.length > 0) {
    topSphereEl.textContent = sortedBudgets[0][0];
  }

  const colors = [
    "var(--accent-1)",
    "var(--accent-2)",
    "var(--success)",
    "var(--warning)",
    "#ec4899",
  ];

  if (chartLegend) {
    chartLegend.innerHTML = "";
  }

  let currentAngle = 0;
  const gradientStops = [];

  sortedBudgets.forEach(([category, budget], index) => {
    const percentage = totalBudget > 0 ? budget / totalBudget : 0;
    const degrees = percentage * 360;
    const color = colors[index % colors.length];

    if (chartLegend) {
      const legendItem = document.createElement("div");
      legendItem.className = "legend-item";
      legendItem.innerHTML = `<div class="legend-color" style="background: ${color}"></div> ${category} ($${(
        budget / 1000
      ).toFixed(1)}k)`;
      chartLegend.appendChild(legendItem);
    }

    const startAngle = currentAngle;
    const endAngle = currentAngle + degrees;
    gradientStops.push(`${color} ${startAngle}deg ${endAngle}deg`);
    currentAngle = endAngle;
  });

  if (circleChart) {
    circleChart.style.background = `conic-gradient(${gradientStops.join(", ")})`;
    circleChart.style.transform = "scale(0) rotate(-180deg)";
    circleChart.style.transition =
      "transform 1.5s cubic-bezier(0.22, 1, 0.36, 1)";

    setTimeout(() => {
      circleChart.style.transform = "scale(1) rotate(0deg)";
    }, 400);
  }

  // =============================
  // ИНИЦИАЛИЗАЦИЯ
  // =============================
});
