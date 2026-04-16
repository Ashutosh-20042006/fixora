import { ProblemApi } from "./db.js";

const problemTextEl = document.getElementById("problemText");
const postButtonEl = document.getElementById("postButton");
const statusEl = document.getElementById("postStatus");
const menuButtonEl = document.getElementById("menuButton");
const menuDropdownEl = document.getElementById("menuDropdown");
const menuOverlayEl = document.getElementById("menuOverlay");
const notificationButtonEl = document.getElementById("notificationButton");
const notificationPanelEl = document.getElementById("notificationPanel");
const notificationOverlayEl = document.getElementById("notificationOverlay");
const notificationListEl = document.getElementById("notificationList");
const menuNotificationsLinkEl = document.getElementById("menuNotificationsLink");
const menuFeedbackLinkEl = document.getElementById("menuFeedbackLink");
const feedbackPanelEl = document.getElementById("feedbackPanel");
const feedbackOverlayEl = document.getElementById("feedbackOverlay");
const feedbackTextEl = document.getElementById("feedbackText");
const feedbackStatusEl = document.getElementById("feedbackStatus");
const feedbackCloseBtnEl = document.getElementById("feedbackCloseBtn");
const feedbackSubmitBtnEl = document.getElementById("feedbackSubmitBtn");
const LAST_SEEN_KEY = "fixora_notifications_last_seen";

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#ff9ea8" : "#9fd5ff";
}

function renderNotifications() {
  if (!notificationListEl) {
    return;
  }

  const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY) || "0");
  const unreadProblems = ProblemApi.getProblems()
    .filter((problem) => (problem.createdAt || 0) > lastSeen)
    .slice(0, 8);

  if (unreadProblems.length === 0) {
    notificationListEl.innerHTML = '<li class="notification-empty">No notification</li>';
    return;
  }

  notificationListEl.innerHTML = unreadProblems.map((problem) => `
    <li class="notification-item">
      <p>New problem posted: ${problem.title}</p>
      <span>${problem.reporter} • ${problem.category}</span>
    </li>
  `).join("");
}

function setNotificationPanelState(open) {
  if (!notificationPanelEl || !notificationButtonEl) {
    return;
  }
  notificationPanelEl.classList.toggle("open", open);
  if (notificationOverlayEl) {
    notificationOverlayEl.classList.toggle("open", open);
  }
  notificationButtonEl.setAttribute("aria-expanded", String(open));
}

function setFeedbackPanelState(open) {
  if (!feedbackPanelEl || !feedbackOverlayEl) {
    return;
  }

  feedbackPanelEl.classList.toggle("open", open);
  feedbackOverlayEl.classList.toggle("open", open);

  if (open) {
    feedbackStatusEl.textContent = "";
    setTimeout(() => feedbackTextEl?.focus(), 0);
  }
}

postButtonEl.addEventListener("click", () => {
  const description = problemTextEl.value.trim();

  if (!description) {
    setStatus("Please write your problem before posting.", true);
    return;
  }

  try {
    ProblemApi.addProblem({
      description,
      category: "everyday",
      reporter: "Community User"
    });

    problemTextEl.value = "";
    setStatus("Problem posted successfully. It is now visible on the developer page.");
    renderNotifications();
  } catch (error) {
    setStatus(error.message || "Could not post the problem.", true);
  }
});

if (menuButtonEl && menuDropdownEl) {
  function setMenuState(open) {
    if (open) {
      setNotificationPanelState(false);
      setFeedbackPanelState(false);
    }
    menuDropdownEl.classList.toggle("open", open);
    menuDropdownEl.style.transform = open ? "translateX(0)" : "translateX(-100%)";
    menuDropdownEl.style.opacity = open ? "1" : "0";
    menuDropdownEl.style.visibility = open ? "visible" : "hidden";
    menuDropdownEl.style.pointerEvents = open ? "auto" : "none";
    menuButtonEl.classList.toggle("open", open);
    menuButtonEl.setAttribute("aria-expanded", String(open));
    if (menuOverlayEl) {
      menuOverlayEl.classList.toggle("open", open);
    }
  }

  menuButtonEl.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menuButtonEl.getAttribute("aria-expanded") !== "true";
    setMenuState(isOpen);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const clickedInsideMenu =
      target.closest("#menuButton") ||
      target.closest("#menuDropdown");

    if (!clickedInsideMenu && menuDropdownEl.classList.contains("open")) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuDropdownEl.classList.contains("open")) {
      setMenuState(false);
    }
  });

  if (menuOverlayEl) {
    menuOverlayEl.addEventListener("click", () => setMenuState(false));
  }

  if (menuNotificationsLinkEl) {
    menuNotificationsLinkEl.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setMenuState(false);
      renderNotifications();
      setNotificationPanelState(true);
    });
  }

  if (menuFeedbackLinkEl) {
    menuFeedbackLinkEl.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setMenuState(false);
      setFeedbackPanelState(true);
    });
  }
}

if (notificationButtonEl && notificationPanelEl) {
  notificationButtonEl.addEventListener("click", (event) => {
    event.stopPropagation();
    const nextState = !notificationPanelEl.classList.contains("open");
    if (nextState) {
      if (menuDropdownEl?.classList.contains("open")) {
        menuDropdownEl.classList.remove("open");
        menuButtonEl?.classList.remove("open");
        menuButtonEl?.setAttribute("aria-expanded", "false");
        menuOverlayEl?.classList.remove("open");
      }
      renderNotifications();
    }
    setNotificationPanelState(nextState);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const clickedInsideNotifications =
      target.closest("#notificationButton") ||
      target.closest("#notificationPanel");

    if (!clickedInsideNotifications && notificationPanelEl.classList.contains("open")) {
      setNotificationPanelState(false);
    }
  });

  if (notificationOverlayEl) {
    notificationOverlayEl.addEventListener("click", () => setNotificationPanelState(false));
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && notificationPanelEl.classList.contains("open")) {
      setNotificationPanelState(false);
    }
  });

  renderNotifications();
}

if (feedbackCloseBtnEl && feedbackSubmitBtnEl) {
  feedbackCloseBtnEl.addEventListener("click", () => setFeedbackPanelState(false));

  feedbackSubmitBtnEl.addEventListener("click", () => {
    const text = (feedbackTextEl?.value || "").trim();
    if (!text) {
      feedbackStatusEl.textContent = "Please write feedback before submit.";
      feedbackStatusEl.style.color = "#ff9ea8";
      return;
    }

    localStorage.setItem("fixora_last_feedback", text);
    feedbackStatusEl.textContent = "Feedback submitted. Thank you!";
    feedbackStatusEl.style.color = "#9fd5ff";
    if (feedbackTextEl) {
      feedbackTextEl.value = "";
    }
  });

  feedbackOverlayEl?.addEventListener("click", () => setFeedbackPanelState(false));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && feedbackPanelEl?.classList.contains("open")) {
      setFeedbackPanelState(false);
    }
  });
}
