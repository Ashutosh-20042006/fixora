import { ProblemApi } from "./db.js";

const totalProblemsEl = document.getElementById("totalProblems");
const solvedByYouEl = document.getElementById("solvedByYou");
const problemListEl = document.getElementById("problemList");
const searchInputEl = document.getElementById("searchInput");
const categoryFilterEl = document.getElementById("categoryFilter");

function updateStats(items) {
  totalProblemsEl.textContent = String(items.length);
  solvedByYouEl.textContent = String(items.filter((item) => item.solvedByYou).length);
}

function renderProblems(items) {
  if (items.length === 0) {
    problemListEl.innerHTML = '<li class="empty-state">No problems found for this search/filter.</li>';
    return;
  }

  problemListEl.innerHTML = items.map((item) => {
    const categoryLabel = item.category.charAt(0).toUpperCase() + item.category.slice(1);
    return `
      <li class="problem-item">
        <div class="problem-head">
          <p class="problem-title">${item.title}</p>
          <span class="category-tag">${categoryLabel}</span>
        </div>
        <p class="problem-meta">Reported by: ${item.reporter}</p>
        <p class="problem-desc">${item.description}</p>
      </li>
    `;
  }).join("");
}

function applyFilters() {
  const problems = ProblemApi.getProblems();
  const query = searchInputEl.value.trim().toLowerCase();
  const category = categoryFilterEl.value;

  const filtered = problems.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);
    const matchCategory = category === "all" || item.category === category;
    return matchSearch && matchCategory;
  });

  updateStats(filtered);
  renderProblems(filtered);
}

searchInputEl.addEventListener("input", applyFilters);
categoryFilterEl.addEventListener("change", applyFilters);
window.addEventListener("focus", applyFilters);

applyFilters();
