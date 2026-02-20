// Core Variables
const STORAGE_KEY = "minimalistTasksData";
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentSearch = "";
let currentFilter = "all";
let isAscending = true;

// Define Text instead of SVG symbols
const textSortAsc = "Urutkan &darr;";
const textSortDesc = "Urutkan &uarr;";

// DOM Retrieval
const el = {
  form: document.getElementById("addTaskForm"),
  titleInput: document.getElementById("taskNameInput"),
  dateInput: document.getElementById("taskDateInput"),
  searchInput: document.getElementById("searchInput"),
  filterSelect: document.getElementById("filterStatus"),
  sortBtn: document.getElementById("sortBtn"),
  deleteAllBtn: document.getElementById("deleteAllBtn"),
  listBody: document.getElementById("taskListBody"),
  emptyState: document.getElementById("emptyState"),
  metrics: {
    total: document.getElementById("totalTasks"),
    completed: document.getElementById("completedTasks"),
    pending: document.getElementById("pendingTasks"),
    progressText: document.getElementById("progressPercentage"),
    progressBar: document.getElementById("progressBar"),
  },
};

// Application Initialization
function initApp() {
  // Current date subtitle
  const dateObj = new Date();
  document.getElementById("dateSubtitle").textContent =
    dateObj.toLocaleDateString("id-ID", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  // Initial render
  renderApp();
  setupListeners();
}

function setupListeners() {
  el.form.addEventListener("submit", (evt) => {
    evt.preventDefault();

    const title = el.titleInput.value.trim();
    const date = el.dateInput.value;

    if (!title || !date) {
      alert("Silakan isi detail tugas dan tanggal.");
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title: title,
      date: date,
      isCompleted: false,
      createdAt: Date.now(),
    };

    tasks.push(newTask);
    saveAndRender();
    el.form.reset();
    el.titleInput.focus();
  });

  el.searchInput.addEventListener("input", (evt) => {
    currentSearch = evt.target.value.toLowerCase();
    renderApp();
  });

  el.filterSelect.addEventListener("change", (evt) => {
    currentFilter = evt.target.value;
    renderApp();
  });

  el.sortBtn.addEventListener("click", () => {
    isAscending = !isAscending;
    // Gunakan tulisan textSortAsc dan textSortDesc
    el.sortBtn.innerHTML = isAscending ? textSortAsc : textSortDesc;
    renderApp();
  });

  // Delete all logic via event delegation
  document.addEventListener("click", (evt) => {
    if (
      evt.target.id === "deleteAllBtn" ||
      evt.target.closest("#deleteAllBtn")
    ) {
      if (tasks.length === 0) return;
      if (confirm("Hapus semua tugas dalam daftar ini?")) {
        tasks = [];
        saveAndRender();
      }
    }
  });

  // Handle Native Checkbox
  document.addEventListener("change", (evt) => {
    if (evt.target.classList.contains("checkbox-native")) {
      const taskId = evt.target.getAttribute("data-id");
      window.toggleTask(taskId);
    }
  });
}

// Global actions for onclick functions
window.toggleTask = function (taskId) {
  tasks = tasks.map((t) =>
    t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t,
  );
  saveAndRender();
};

window.removeTask = function (taskId) {
  tasks = tasks.filter((t) => t.id !== taskId);
  saveAndRender();
};

// State Updates
function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  renderApp();
}

// Logic Display Module
function renderApp() {
  // 1. Process Data Filter and Search
  let filteredData = tasks.filter((task) => {
    const matchSearch = task.title.toLowerCase().includes(currentSearch);
    const matchFilter =
      currentFilter === "all"
        ? true
        : currentFilter === "completed"
          ? task.isCompleted
          : !task.isCompleted;
    return matchSearch && matchFilter;
  });

  // Data Sort Time
  filteredData.sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return isAscending ? timeA - timeB : timeB - timeA;
  });

  // 2. Compute Metrics Logic
  const total = tasks.length;
  const completed = tasks.filter((t) => t.isCompleted).length;
  const pending = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  el.metrics.total.textContent = total;
  el.metrics.completed.textContent = completed;
  el.metrics.pending.textContent = pending;
  el.metrics.progressText.textContent = `${progress}%`;
  el.metrics.progressBar.style.width = `${progress}%`;

  // 3. Render HTML Pipeline
  el.listBody.innerHTML = "";

  if (filteredData.length === 0) {
    el.emptyState.style.display = "flex";
  } else {
    el.emptyState.style.display = "none";

    filteredData.forEach((task) => {
      const li = document.createElement("li");
      li.className = `task-item ${task.isCompleted ? "is-completed" : ""}`;

      const formattedDate = new Date(task.date).toLocaleDateString("id-ID", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const badgeClass = task.isCompleted ? "badge-completed" : "badge-pending";
      const badgeText = task.isCompleted ? "Selesai" : "Tertunda";

      // Menggunakan struktur Native Checkbox dan Teks Tombol "Delete" murni
      li.innerHTML = `
                <div class="item-col-task task-content">
                    <input type="checkbox" class="checkbox-native" data-id="${task.id}" aria-label="Toggle Completion" ${task.isCompleted ? "checked" : ""}>
                    <span class="task-text">${task.title}</span>
                </div>
                <!-- Menampilkan Due Date -->
                <div class="item-col-date item-date">${formattedDate}</div>
                <!-- Status Badge -->
                <div class="item-col-status">
                    <span class="status-badge ${badgeClass}">${badgeText}</span>
                </div>
                <!-- Action Delete -->
                <div class="item-col-action">
                    <!-- Menggunakan text button biasa -->
                    <button type="button" class="btn-small-text" onclick="removeTask('${task.id}')" title="Hapus Tugas">
                        Hapus
                    </button>
                </div>
            `;
      el.listBody.appendChild(li);
    });
  }
}

// Start sequence
window.onload = initApp;
