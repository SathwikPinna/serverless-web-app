const taskForm = document.getElementById("task-form");
const taskIdInput = document.getElementById("task-id");
const taskNameInput = document.getElementById("task-name");
const dueDateInput = document.getElementById("due-date");
const priorityInput = document.getElementById("priority");
const completedInput = document.getElementById("completed");
const cancelButton = document.getElementById("cancel-button");
const saveButton = document.getElementById("save-button");
const formTitle = document.getElementById("form-title");
const taskList = document.getElementById("task-list");
const statusMessage = document.getElementById("status-message");

let currentTasks = [];

/**
 * Shows feedback to the user.
 */
const showMessage = (message, type = "success") => {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
};

/**
 * Clears the feedback message.
 */
const clearMessage = () => {
  statusMessage.textContent = "";
  statusMessage.className = "status-message";
};

/**
 * Resets the form back to create mode.
 */
const resetForm = () => {
  taskForm.reset();
  taskIdInput.value = "";
  completedInput.checked = false;
  priorityInput.value = "medium";
  formTitle.textContent = "Add a new task";
  saveButton.textContent = "Save task";
  cancelButton.classList.add("hidden");
};

/**
 * Prevents simple HTML injection in task text.
 */
const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Makes labels look nicer in the UI.
 */
const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Loads all tasks from the Vercel API route.
 */
const loadTasks = async () => {
  clearMessage();
  taskList.innerHTML = '<div class="empty-state">Loading tasks...</div>';

  try {
    const response = await fetch("/api/tasks");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load tasks.");
    }

    currentTasks = data.tasks || [];
    renderTasks(currentTasks);
  } catch (error) {
    taskList.innerHTML =
      '<div class="empty-state">Could not load tasks. Make sure the Vercel API is running.</div>';
    showMessage(error.message, "error");
  }
};

/**
 * Renders tasks into the page.
 */
const renderTasks = (tasks) => {
  if (tasks.length === 0) {
    taskList.innerHTML = '<div class="empty-state">No tasks yet. Add your first one above.</div>';
    return;
  }

  taskList.innerHTML = tasks
    .map(
      (item) => `
        <article class="task-item">
          <div class="task-top-row">
            <div>
              <h3 class="task-title">${escapeHtml(item.task)}</h3>
              <div class="task-meta">
                <span>Due: ${escapeHtml(item.due_date)}</span>
                <span>Created: ${new Date(item.created_at).toLocaleString()}</span>
              </div>
            </div>
            <div class="task-meta">
              <span class="badge priority-${item.priority}">${capitalize(item.priority)}</span>
              <span class="badge ${item.completed ? "completed" : "pending"}">
                ${item.completed ? "Completed" : "Pending"}
              </span>
            </div>
          </div>
          <div class="task-actions">
            <button class="edit-button" data-id="${item.id}">Edit</button>
            <button class="delete-button" data-id="${item.id}">Delete</button>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelectorAll(".edit-button").forEach((button) => {
    button.addEventListener("click", () => startEdit(button.dataset.id));
  });

  document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", () => removeTask(button.dataset.id));
  });
};

/**
 * Starts editing a task by populating the form.
 */
const startEdit = (taskId) => {
  const selectedTask = currentTasks.find((item) => item.id === taskId);

  if (!selectedTask) {
    showMessage("Could not find the selected task.", "error");
    return;
  }

  taskIdInput.value = selectedTask.id;
  taskNameInput.value = selectedTask.task;
  dueDateInput.value = selectedTask.due_date;
  priorityInput.value = selectedTask.priority;
  completedInput.checked = selectedTask.completed;
  formTitle.textContent = "Edit task";
  saveButton.textContent = "Update task";
  cancelButton.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

/**
 * Deletes a task from the Vercel API route.
 */
const removeTask = async (taskId) => {
  const confirmed = window.confirm("Do you want to delete this task?");
  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`/api/tasks?id=${encodeURIComponent(taskId)}`, {
      method: "DELETE"
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete task.");
    }

    showMessage("Task deleted successfully.");
    await loadTasks();
  } catch (error) {
    showMessage(error.message, "error");
  }
};

/**
 * Creates or updates a task when the form is submitted.
 */
taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const taskId = taskIdInput.value;
  const payload = {
    task: taskNameInput.value.trim(),
    due_date: dueDateInput.value,
    priority: priorityInput.value,
    completed: completedInput.checked
  };

  if (!payload.task || !payload.due_date) {
    showMessage("Task and due date are required.", "error");
    return;
  }

  const isEditing = Boolean(taskId);
  const requestUrl = isEditing
    ? `/api/tasks?id=${encodeURIComponent(taskId)}`
    : "/api/tasks";
  const method = isEditing ? "PUT" : "POST";

  try {
    const response = await fetch(requestUrl, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to save task.");
    }

    showMessage(isEditing ? "Task updated successfully." : "Task created successfully.");
    resetForm();
    await loadTasks();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

cancelButton.addEventListener("click", resetForm);

loadTasks();
