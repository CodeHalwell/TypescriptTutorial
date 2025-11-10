/**
 * Exercise 6: Real-World Application - Task Management System
 *
 * This solution demonstrates:
 * - Union types for enums
 * - Interface composition
 * - Utility types (Partial, Omit)
 * - Class implementation
 * - Private properties
 * - Method chaining
 * - Error handling
 * - JSON serialization
 */

// Type definitions
type Priority = "low" | "medium" | "high";
type Status = "todo" | "in_progress" | "done";

interface Task {
  id: number;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task Manager class for managing tasks
 */
class TaskManager {
  private tasks: Task[] = [];
  private nextId: number = 1;

  /**
   * Add a new task
   * @param task - Task data without ID
   * @returns Created task
   */
  addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
    const now = new Date();
    const newTask: Task = {
      ...task,
      id: this.nextId++,
      createdAt: now,
      updatedAt: now
    };
    this.tasks.push(newTask);
    return newTask;
  }

  /**
   * Update an existing task
   * @param id - Task ID
   * @param updates - Partial task updates
   * @returns Updated task or null if not found
   */
  updateTask(id: number, updates: Partial<Omit<Task, "id" | "createdAt">>): Task | null {
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      return null;
    }

    Object.assign(task, updates, { updatedAt: new Date() });
    return task;
  }

  /**
   * Delete a task
   * @param id - Task ID
   * @returns True if deleted, false if not found
   */
  deleteTask(id: number): boolean {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      return false;
    }
    this.tasks.splice(index, 1);
    return true;
  }

  /**
   * Get tasks with optional filtering
   * @param filter - Optional filter criteria
   * @returns Filtered tasks
   */
  getTasks(filter?: { status?: Status; priority?: Priority }): Task[] {
    return this.tasks.filter(task => {
      if (filter?.status && task.status !== filter.status) {
        return false;
      }
      if (filter?.priority && task.priority !== filter.priority) {
        return false;
      }
      return true;
    });
  }

  /**
   * Get tasks by tag
   * @param tag - Tag to search for
   * @returns Tasks containing the tag
   */
  getTasksByTag(tag: string): Task[] {
    return this.tasks.filter(task => task.tags.includes(tag));
  }

  /**
   * Get overdue tasks
   * @returns Tasks past their due date
   */
  getOverdueTasks(): Task[] {
    const now = new Date();
    return this.tasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate < now && task.status !== "done";
    });
  }

  /**
   * Sort tasks by priority
   * @param tasks - Tasks to sort
   * @returns Sorted tasks (high to low priority)
   */
  sortByPriority(tasks: Task[]): Task[] {
    const priorityOrder: Record<Priority, number> = {
      high: 3,
      medium: 2,
      low: 1
    };

    return [...tasks].sort((a, b) => {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Sort tasks by due date
   * @param tasks - Tasks to sort
   * @returns Sorted tasks (earliest first, tasks without due date last)
   */
  sortByDueDate(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }

  /**
   * Save tasks to JSON string
   * @returns JSON representation of tasks
   */
  saveToJSON(): string {
    return JSON.stringify({
      tasks: this.tasks,
      nextId: this.nextId
    }, null, 2);
  }

  /**
   * Load tasks from JSON string
   * @param json - JSON string
   * @throws Error if JSON is invalid
   */
  loadFromJSON(json: string): void {
    try {
      const data = JSON.parse(json);

      // Validate data structure
      if (!Array.isArray(data.tasks) || typeof data.nextId !== "number") {
        throw new Error("Invalid data structure");
      }

      // Convert date strings back to Date objects
      this.tasks = data.tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined
      }));

      this.nextId = data.nextId;
    } catch (error) {
      throw new Error(`Failed to load tasks: ${error}`);
    }
  }

  /**
   * Get task statistics
   * @returns Statistics object
   */
  getStatistics() {
    const total = this.tasks.length;
    const byStatus = {
      todo: this.tasks.filter(t => t.status === "todo").length,
      in_progress: this.tasks.filter(t => t.status === "in_progress").length,
      done: this.tasks.filter(t => t.status === "done").length
    };
    const byPriority = {
      high: this.tasks.filter(t => t.priority === "high").length,
      medium: this.tasks.filter(t => t.priority === "medium").length,
      low: this.tasks.filter(t => t.priority === "low").length
    };
    const overdue = this.getOverdueTasks().length;

    return {
      total,
      byStatus,
      byPriority,
      overdue
    };
  }
}

// Example usage
console.log("=== Task Management System ===\n");

const manager = new TaskManager();

// Add tasks
console.log("Adding tasks...");
const task1 = manager.addTask({
  title: "Complete TypeScript module",
  description: "Finish all exercises and examples",
  priority: "high",
  status: "in_progress",
  dueDate: new Date("2025-01-15"),
  tags: ["learning", "typescript"]
});

const task2 = manager.addTask({
  title: "Review pull requests",
  priority: "medium",
  status: "todo",
  dueDate: new Date("2025-01-10"),
  tags: ["code-review", "team"]
});

const task3 = manager.addTask({
  title: "Update documentation",
  description: "Add examples to README",
  priority: "low",
  status: "todo",
  tags: ["documentation"]
});

const task4 = manager.addTask({
  title: "Fix critical bug",
  description: "Memory leak in production",
  priority: "high",
  status: "todo",
  dueDate: new Date("2025-01-08"),
  tags: ["bug", "production"]
});

console.log(`Added ${manager.getTasks().length} tasks\n`);

// Update task
console.log("Updating task...");
manager.updateTask(task4.id, { status: "in_progress" });
console.log("Task 4 status updated to in_progress\n");

// Get tasks by status
console.log("Tasks in progress:");
const inProgress = manager.getTasks({ status: "in_progress" });
inProgress.forEach(task => {
  console.log(`- ${task.title} (Priority: ${task.priority})`);
});
console.log();

// Get high priority tasks
console.log("High priority tasks:");
const highPriority = manager.getTasks({ priority: "high" });
highPriority.forEach(task => {
  console.log(`- ${task.title} (Status: ${task.status})`);
});
console.log();

// Sort by due date
console.log("Tasks sorted by due date:");
const sortedTasks = manager.sortByDueDate(manager.getTasks());
sortedTasks.forEach(task => {
  const dueStr = task.dueDate
    ? task.dueDate.toLocaleDateString()
    : "No due date";
  console.log(`- ${task.title} - Due: ${dueStr}`);
});
console.log();

// Get overdue tasks (assuming current date is after some due dates)
console.log("Overdue tasks:");
const overdue = manager.getOverdueTasks();
if (overdue.length === 0) {
  console.log("No overdue tasks");
} else {
  overdue.forEach(task => {
    console.log(`- ${task.title}`);
  });
}
console.log();

// Get tasks by tag
console.log("Tasks tagged 'typescript':");
const typescriptTasks = manager.getTasksByTag("typescript");
typescriptTasks.forEach(task => {
  console.log(`- ${task.title}`);
});
console.log();

// Statistics
console.log("=== Statistics ===");
const stats = manager.getStatistics();
console.log(`Total tasks: ${stats.total}`);
console.log(`By status: Todo: ${stats.byStatus.todo}, In Progress: ${stats.byStatus.in_progress}, Done: ${stats.byStatus.done}`);
console.log(`By priority: High: ${stats.byPriority.high}, Medium: ${stats.byPriority.medium}, Low: ${stats.byPriority.low}`);
console.log(`Overdue: ${stats.overdue}\n`);

// Test JSON serialization
console.log("=== Testing JSON Persistence ===");
const json = manager.saveToJSON();
console.log("Saved to JSON (first 100 chars):", json.substring(0, 100) + "...\n");

const newManager = new TaskManager();
newManager.loadFromJSON(json);
console.log(`Loaded ${newManager.getTasks().length} tasks from JSON`);

// Delete a task
console.log("\n=== Testing Delete ===");
const deleted = manager.deleteTask(task3.id);
console.log(`Task ${task3.id} deleted: ${deleted}`);
console.log(`Remaining tasks: ${manager.getTasks().length}`);

export { TaskManager, Task, Priority, Status };
