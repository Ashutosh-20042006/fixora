import { ProblemApi } from "./db.js";

const LAST_SEEN_KEY = "fixora_notifications_last_seen";
const notificationListEl = document.getElementById("notificationList");
const totalCountEl = document.getElementById("totalCount");
const unreadCountEl = document.getElementById("unreadCount");
const todayCountEl = document.getElementById("todayCount");
const markReadBtnEl = document.getElementById("markReadBtn");

function formatRelativeTime(timestamp) {
  const deltaMs = Date.now() - timestamp;
  const deltaMin = Math.floor(deltaMs / 60000);
  if (deltaMin < 1) return "Just now";
  if (deltaMin < 60) return `${deltaMin} min ago`;
  const deltaHr = Math.floor(deltaMin / 60);
  if (deltaHr < 24) return `${deltaHr} hr ago`;
  const deltaDay = Math.floor(deltaHr / 24);
  return `${deltaDay} day ago`;
}

function isToday(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  return d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
}

function buildNotifications() {
  const problems = ProblemApi.getProblems();
  return problems.map((problem) => ({
    id: problem.id,
    title: `New problem reported: ${problem.title}`,
    description: problem.description,
    category: problem.category,
    createdAt: problem.createdAt || Date.now()
  }));
}

function render() {
  const notifications = buildNotifications();
  const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY) || "0");
  const unreadItems = notifications.filter((item) => item.createdAt > lastSeen);
  const todayItems = notifications.filter((item) => isToday(item.createdAt));

  totalCountEl.textContent = String(notifications.length);
  unreadCountEl.textContent = String(unreadItems.length);
  todayCountEl.textContent = String(todayItems.length);

  if (notifications.length === 0) {
    notificationListEl.innerHTML = '<li class="empty">No notifications yet.</li>';
    return;
  }

  notificationListEl.innerHTML = notifications.map((item) => {
    const unread = item.createdAt > lastSeen;
    const categoryLabel = item.category.charAt(0).toUpperCase() + item.category.slice(1);
    return `
      <li class="notification-item ${unread ? "unread" : ""}">
        <div class="row">
          <p class="title">${item.title}</p>
          <span class="pill">${categoryLabel}</span>
        </div>
        <p class="desc">${item.description}</p>
        <p class="meta">${formatRelativeTime(item.createdAt)}</p>
      </li>
    `;
  }).join("");
}

markReadBtnEl.addEventListener("click", () => {
  localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
  render();
});

render();
