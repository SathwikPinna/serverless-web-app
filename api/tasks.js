const { v4: uuidv4 } = require("uuid");

// In-memory storage for demo purposes.
// Note: data may reset whenever the serverless function cold-starts or redeploys.
const defaultTasks = [
  {
    id: uuidv4(),
    task: "Deploy the Vercel to-do app",
    completed: false,
    created_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    priority: "high"
  }
];

if (!globalThis.todoTasks) {
  globalThis.todoTasks = defaultTasks;
}

const ALLOWED_PRIORITIES = ["low", "medium", "high"];

/**
 * Sends a consistent JSON response.
 */
const sendJson = (res, statusCode, payload) => {
  res.status(statusCode).json(payload);
};

/**
 * Validates task input for create and update operations.
 */
const validateTask = ({ task, due_date, priority, completed }, isUpdate = false) => {
  if (!isUpdate || task !== undefined) {
    if (typeof task !== "string" || task.trim().length === 0) {
      return "The 'task' field is required and must be a non-empty string.";
    }
  }

  if (!isUpdate || due_date !== undefined) {
    if (typeof due_date !== "string" || due_date.trim().length === 0) {
      return "The 'due_date' field is required and must be a non-empty string.";
    }
  }

  if (!isUpdate || priority !== undefined) {
    if (!ALLOWED_PRIORITIES.includes(priority)) {
      return "The 'priority' field must be one of: low, medium, high.";
    }
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    return "The 'completed' field must be a boolean value.";
  }

  return null;
};

/**
 * Returns tasks in newest-first order.
 */
const getSortedTasks = () =>
  [...globalThis.todoTasks].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

module.exports = async (req, res) => {
  if (req.method === "GET") {
    return sendJson(res, 200, {
      message: "Tasks fetched successfully.",
      tasks: getSortedTasks()
    });
  }

  if (req.method === "POST") {
    const validationError = validateTask(req.body);

    if (validationError) {
      return sendJson(res, 400, { message: validationError });
    }

    const newTask = {
      id: uuidv4(),
      task: req.body.task.trim(),
      completed: req.body.completed ?? false,
      created_at: new Date().toISOString(),
      due_date: req.body.due_date,
      priority: req.body.priority
    };

    globalThis.todoTasks.unshift(newTask);

    return sendJson(res, 201, {
      message: "Task created successfully.",
      task: newTask
    });
  }

  if (req.method === "PUT") {
    const { id } = req.query;

    if (!id) {
      return sendJson(res, 400, { message: "Task id is required in the query string." });
    }

    const validationError = validateTask(req.body, true);
    if (validationError) {
      return sendJson(res, 400, { message: validationError });
    }

    const taskIndex = globalThis.todoTasks.findIndex((item) => item.id === id);

    if (taskIndex === -1) {
      return sendJson(res, 404, { message: "Task not found." });
    }

    const existingTask = globalThis.todoTasks[taskIndex];
    const updatedTask = {
      ...existingTask,
      ...(req.body.task !== undefined ? { task: req.body.task.trim() } : {}),
      ...(req.body.completed !== undefined ? { completed: req.body.completed } : {}),
      ...(req.body.due_date !== undefined ? { due_date: req.body.due_date } : {}),
      ...(req.body.priority !== undefined ? { priority: req.body.priority } : {})
    };

    globalThis.todoTasks[taskIndex] = updatedTask;

    return sendJson(res, 200, {
      message: "Task updated successfully.",
      task: updatedTask
    });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;

    if (!id) {
      return sendJson(res, 400, { message: "Task id is required in the query string." });
    }

    const taskIndex = globalThis.todoTasks.findIndex((item) => item.id === id);

    if (taskIndex === -1) {
      return sendJson(res, 404, { message: "Task not found." });
    }

    const deletedTask = globalThis.todoTasks[taskIndex];
    globalThis.todoTasks.splice(taskIndex, 1);

    return sendJson(res, 200, {
      message: "Task deleted successfully.",
      task: deletedTask
    });
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  return sendJson(res, 405, {
    message: `Method ${req.method} is not allowed.`
  });
};
