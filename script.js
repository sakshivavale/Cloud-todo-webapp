// script.js - Supabase Auth + Task CRUD Logic
import { supabase } from "./supabase-config.js";

/* ---------------- 1. Get HTML elements ---------------- */
const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authMessage = document.getElementById("auth-message");
const userEmail = document.getElementById("user-email");
const taskForm = document.getElementById("task-form");
const taskMessage = document.getElementById("task-message");
const taskList = document.getElementById("task-list");
const emptyText = document.getElementById("empty-text");
const formTitle = document.getElementById("form-title");
const saveBtn = document.getElementById("save-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

/* ---------------- 2. App state ---------------- */
let currentUser = null;      
let allTasks = [];           
let currentFilter = "all";   
let editingTaskId = null;    

/* ---------------- 3. Helper functions ---------------- */
function showMessage(element, text, type) {
  element.textContent = text;
  element.className = "message " + type;
}

function formatDateTime(dateString) {
  if (!dateString) return "Saving...";
  return new Date(dateString).toLocaleString();
}

function formatDueDate(dateString) {
  if (!dateString) return "No due date";
  const [y, m, d] = dateString.split("-");
  return new Date(y, m - 1, d).toLocaleDateString();
}

/* ---------------- 4. Switch between Login and Register ---------------- */
document.getElementById("show-register").addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
  authMessage.textContent = "";
});
document.getElementById("show-login").addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  authMessage.textContent = "";
});

/* ---------------- 5. Authentication ---------------- */

// REGISTER
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;
  const confirm = document.getElementById("register-confirm").value;

  if (password !== confirm) {
    showMessage(authMessage, "Passwords do not match.", "error");
    return;
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    showMessage(authMessage, error.message, "error");
  } else {
    showMessage(authMessage, "Account created! You can now log in.", "success");
    registerForm.reset();
  }
});

// LOGIN
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showMessage(authMessage, error.message, "error");
  } else {
    loginForm.reset();
  }
});

// LOGOUT
document.getElementById("logout-btn").addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) alert(error.message);
});

// Auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    currentUser = session.user;
    userEmail.textContent = currentUser.email;
    authSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
    loadTasks();
  } else {
    currentUser = null;
    allTasks = [];
    taskList.innerHTML = "";
    resetTaskForm();
    dashboardSection.classList.add("hidden");
    authSection.classList.remove("hidden");
    authMessage.textContent = "";
  }
});

/* ---------------- 6. READ tasks ---------------- */
async function loadTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    showMessage(taskMessage, error.message, "error");
  } else {
    allTasks = data;
    renderTasks();
  }
}

/* ---------------- 7. CREATE / UPDATE task ---------------- */
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("task-title").value.trim();
  const description = document.getElementById("task-desc").value.trim();
  const dueDate = document.getElementById("task-due").value;

  if (!title) {
    showMessage(taskMessage, "Title is required.", "error");
    return;
  }

  if (editingTaskId) {
    // UPDATE
    const { error } = await supabase
      .from("tasks")
      .update({ title, description, due_date: dueDate || null })
      .eq("id", editingTaskId);

    if (error) {
      showMessage(taskMessage, error.message, "error");
    } else {
      showMessage(taskMessage, "Task updated successfully.", "success");
      resetTaskForm(true);
      loadTasks();
    }
  } else {
    // CREATE
    const { error } = await supabase.from("tasks").insert([
      {
        user_id: currentUser.id,
        title,
        description,
        due_date: dueDate || null,
        completed: false
      }
    ]);

    if (error) {
      showMessage(taskMessage, error.message, "error");
    } else {
      showMessage(taskMessage, "Task added successfully.", "success");
      resetTaskForm(true);
      loadTasks();
    }
  }
});

function resetTaskForm(keepMessage) {
  taskForm.reset();
  editingTaskId = null;
  formTitle.textContent = "Add New Task";
  saveBtn.textContent = "Add Task";
  cancelEditBtn.classList.add("hidden");
  if (!keepMessage) taskMessage.textContent = "";
}
cancelEditBtn.addEventListener("click", () => resetTaskForm());

/* ---------------- 8. Display tasks ---------------- */
function renderTasks() {
  const pending = allTasks.filter((t) => !t.completed).length;
  document.getElementById("count-all").textContent = allTasks.length;
  document.getElementById("count-pending").textContent = pending;
  document.getElementById("count-completed").textContent = allTasks.length - pending;

  let tasks = allTasks;
  if (currentFilter === "pending") tasks = allTasks.filter((t) => !t.completed);
  if (currentFilter === "completed") tasks = allTasks.filter((t) => t.completed);

  taskList.innerHTML = "";
  emptyText.classList.toggle("hidden", tasks.length > 0);

  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "task-card" + (task.completed ? " completed" : "");

    const header = document.createElement("div");
    header.className = "task-header";
    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = task.completed ? "Completed" : "Pending";
    header.append(title, badge);

    const desc = document.createElement("p");
    desc.className = "task-desc";
    desc.textContent = task.description || "No description";

    const meta = document.createElement("div");
    meta.className = "task-meta";
    const due = document.createElement("span");
    due.textContent = "📅 Due: " + formatDueDate(task.due_date);
    const created = document.createElement("span");
    created.textContent = "🕒 Created: " + formatDateTime(task.created_at);
    meta.append(due, created);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "btn small " + (task.completed ? "warning" : "success");
    toggleBtn.textContent = task.completed ? "Mark Pending" : "Mark Completed";
    toggleBtn.addEventListener("click", () => toggleTask(task));

    const editBtn = document.createElement("button");
    editBtn.className = "btn small primary";
    editBtn.style.width = "auto";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEdit(task));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn small danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteTask(task));

    actions.append(toggleBtn, editBtn, deleteBtn);
    card.append(header, desc, meta, actions);
    taskList.appendChild(card);
  });
}

/* ---------------- 9. Filter buttons ---------------- */
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

/* ---------------- 10. UPDATE status ---------------- */
async function toggleTask(task) {
  const { error } = await supabase
    .from("tasks")
    .update({ completed: !task.completed })
    .eq("id", task.id);

  if (error) {
    showMessage(taskMessage, error.message, "error");
  } else {
    loadTasks();
  }
}

/* ---------------- 11. Start editing ---------------- */
function startEdit(task) {
  editingTaskId = task.id;
  document.getElementById("task-title").value = task.title;
  document.getElementById("task-desc").value = task.description || "";
  document.getElementById("task-due").value = task.due_date || "";
  formTitle.textContent = "Edit Task";
  saveBtn.textContent = "Update Task";
  cancelEditBtn.classList.remove("hidden");
  taskMessage.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------------- 12. DELETE task ---------------- */
async function deleteTask(task) {
  if (!confirm('Delete the task "' + task.title + '"?')) return;
  const { error } = await supabase.from("tasks").delete().eq("id", task.id);

  if (error) {
    showMessage(taskMessage, error.message, "error");
  } else {
    if (editingTaskId === task.id) resetTaskForm();
    showMessage(taskMessage, "Task deleted.", "success");
    loadTasks();
  }
}