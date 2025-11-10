# Project 1: CLI Task Manager

A command-line task management application built with TypeScript featuring interactive prompts, colored output, and file-based persistence.

## 📋 Project Overview

**Difficulty**: ⭐⭐ Beginner-Intermediate
**Estimated Time**: 8-12 hours
**Technologies**: Node.js, TypeScript, Commander.js, Inquirer, Chalk, Node File System

## 🎯 Learning Objectives

- Build a complete CLI application from scratch
- Work with Node.js file system APIs
- Implement command-line argument parsing
- Create interactive terminal prompts
- Handle user input validation
- Implement data persistence with JSON
- Use third-party libraries with TypeScript
- Package a Node.js application

## ✨ Features

### Core Features
- ✅ Add, list, update, and delete tasks
- ✅ Mark tasks as complete/incomplete
- ✅ Set task priorities (low, medium, high)
- ✅ Add due dates to tasks
- ✅ Tag tasks for organization
- ✅ Filter tasks by status, priority, or tag
- ✅ Search tasks by title or description
- ✅ Persistent storage with JSON

### Enhanced Features
- ✅ Interactive mode with prompts
- ✅ Colored output (completed tasks in green, overdue in red)
- ✅ ASCII art table display
- ✅ Task statistics and summary
- ✅ Export tasks to different formats
- ✅ Import tasks from CSV/JSON

## 🏗️ Architecture

```
cli-task-manager/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── commands/             # Command implementations
│   │   ├── add.ts
│   │   ├── list.ts
│   │   ├── update.ts
│   │   ├── delete.ts
│   │   ├── complete.ts
│   │   └── interactive.ts
│   ├── models/               # Data models
│   │   └── Task.ts
│   ├── services/             # Business logic
│   │   ├── TaskService.ts
│   │   └── StorageService.ts
│   ├── utils/                # Utilities
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── colors.ts
│   └── types/                # Type definitions
│       └── index.ts
├── tests/
│   ├── unit/
│   └── integration/
├── docs/
│   ├── architecture.md
│   └── usage.md
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## 📦 Setup

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone or navigate to project directory
cd modules/09-projects/01-cli-tool

# Install dependencies
npm install

# Build TypeScript
npm run build

# Link for global usage (optional)
npm link

# Run in development
npm run dev
```

### Dependencies

```json
{
  "dependencies": {
    "commander": "^11.0.0",
    "inquirer": "^9.2.0",
    "chalk": "^5.3.0",
    "date-fns": "^3.0.0",
    "cli-table3": "^0.6.3"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/inquirer": "^9.0.0",
    "typescript": "^5.3.0",
    "ts-node": "^10.9.0",
    "vitest": "^1.0.0"
  }
}
```

## 💻 Usage

### Command-Line Mode

```bash
# Add a task
tasks add "Complete TypeScript module" --priority high --due "2025-01-20"

# List all tasks
tasks list

# List by status
tasks list --status todo
tasks list --status done

# List by priority
tasks list --priority high

# Complete a task
tasks complete 1

# Update a task
tasks update 1 --title "New title" --priority medium

# Delete a task
tasks delete 1

# Show statistics
tasks stats

# Search tasks
tasks search "typescript"

# Filter by tag
tasks list --tag learning
```

### Interactive Mode

```bash
# Launch interactive mode
tasks interactive

# Or simply
tasks

# Follow the prompts
? What would you like to do? (Use arrow keys)
❯ Add new task
  List all tasks
  Update a task
  Complete a task
  Delete a task
  View statistics
  Exit
```

## 🔧 Implementation Guide

### Step 1: Setup Project

```bash
# Initialize project
npm init -y

# Install dependencies
npm install commander inquirer chalk date-fns cli-table3
npm install -D typescript @types/node @types/inquirer ts-node vitest

# Initialize TypeScript
npx tsc --init
```

### Step 2: Define Data Models

```typescript
// src/models/Task.ts
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  tags: string[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface TaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  tags?: string[];
  dueDate?: Date;
}
```

### Step 3: Implement Storage Service

```typescript
// src/services/StorageService.ts
import fs from 'fs/promises';
import path from 'path';
import { Task } from '../models/Task';

export class StorageService {
  private dataPath: string;

  constructor(dataPath?: string) {
    this.dataPath = dataPath || path.join(process.env.HOME || '', '.tasks.json');
  }

  async load(): Promise<Task[]> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      return JSON.parse(data, this.dateReviver);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async save(tasks: Task[]): Promise<void> {
    await fs.writeFile(this.dataPath, JSON.stringify(tasks, null, 2));
  }

  private dateReviver(key: string, value: any): any {
    const dateFields = ['dueDate', 'createdAt', 'updatedAt', 'completedAt'];
    if (dateFields.includes(key) && typeof value === 'string') {
      return new Date(value);
    }
    return value;
  }
}
```

### Step 4: Implement Task Service

```typescript
// src/services/TaskService.ts
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskInput, Priority, Status } from '../models/Task';
import { StorageService } from './StorageService';

export class TaskService {
  private tasks: Task[] = [];
  private storage: StorageService;

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  async initialize(): Promise<void> {
    this.tasks = await this.storage.load();
  }

  async addTask(input: TaskInput): Promise<Task> {
    const task: Task = {
      id: uuidv4(),
      title: input.title,
      description: input.description,
      priority: input.priority || 'medium',
      status: 'todo',
      tags: input.tags || [],
      dueDate: input.dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.push(task);
    await this.storage.save(this.tasks);
    return task;
  }

  async listTasks(filters?: {
    status?: Status;
    priority?: Priority;
    tag?: string;
  }): Promise<Task[]> {
    let filtered = this.tasks;

    if (filters?.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters?.priority) {
      filtered = filtered.filter(t => t.priority === filters.priority);
    }

    if (filters?.tag) {
      filtered = filtered.filter(t => t.tags.includes(filters.tag));
    }

    return filtered;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return null;

    Object.assign(task, updates, { updatedAt: new Date() });
    await this.storage.save(this.tasks);
    return task;
  }

  async completeTask(id: string): Promise<Task | null> {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return null;

    task.status = 'done';
    task.completedAt = new Date();
    task.updatedAt = new Date();

    await this.storage.save(this.tasks);
    return task;
  }

  async deleteTask(id: string): Promise<boolean> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;

    this.tasks.splice(index, 1);
    await this.storage.save(this.tasks);
    return true;
  }

  getStatistics() {
    const total = this.tasks.length;
    const byStatus = {
      todo: this.tasks.filter(t => t.status === 'todo').length,
      in_progress: this.tasks.filter(t => t.status === 'in_progress').length,
      done: this.tasks.filter(t => t.status === 'done').length,
    };

    const overdue = this.tasks.filter(
      t => t.dueDate && t.dueDate < new Date() && t.status !== 'done'
    ).length;

    return { total, byStatus, overdue };
  }
}
```

### Step 5: Create CLI Interface

```typescript
// src/index.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { TaskService } from './services/TaskService';
import { StorageService } from './services/StorageService';

const program = new Command();
const storage = new StorageService();
const taskService = new TaskService(storage);

program
  .name('tasks')
  .description('CLI task manager')
  .version('1.0.0');

program
  .command('add <title>')
  .description('Add a new task')
  .option('-p, --priority <priority>', 'Task priority (low, medium, high)', 'medium')
  .option('-d, --due <date>', 'Due date')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .action(async (title, options) => {
    await taskService.initialize();

    const task = await taskService.addTask({
      title,
      priority: options.priority,
      dueDate: options.due ? new Date(options.due) : undefined,
      tags: options.tags ? options.tags.split(',') : [],
    });

    console.log(chalk.green('✓ Task added successfully'));
    console.log(chalk.gray(`ID: ${task.id}`));
  });

program
  .command('list')
  .description('List all tasks')
  .option('-s, --status <status>', 'Filter by status')
  .option('-p, --priority <priority>', 'Filter by priority')
  .option('-t, --tag <tag>', 'Filter by tag')
  .action(async (options) => {
    await taskService.initialize();

    const tasks = await taskService.listTasks({
      status: options.status,
      priority: options.priority,
      tag: options.tag,
    });

    if (tasks.length === 0) {
      console.log(chalk.yellow('No tasks found'));
      return;
    }

    // Display tasks (implementation in next step)
    displayTasks(tasks);
  });

program.parse();
```

## 🧪 Testing

```typescript
// tests/unit/TaskService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TaskService } from '../../src/services/TaskService';
import { StorageService } from '../../src/services/StorageService';

describe('TaskService', () => {
  let taskService: TaskService;
  let storage: StorageService;

  beforeEach(async () => {
    storage = new StorageService(':memory:');
    taskService = new TaskService(storage);
    await taskService.initialize();
  });

  it('should add a task', async () => {
    const task = await taskService.addTask({
      title: 'Test task',
      priority: 'high',
    });

    expect(task.title).toBe('Test task');
    expect(task.priority).toBe('high');
    expect(task.status).toBe('todo');
  });

  it('should list tasks with filters', async () => {
    await taskService.addTask({ title: 'Task 1', priority: 'high' });
    await taskService.addTask({ title: 'Task 2', priority: 'low' });

    const highPriorityTasks = await taskService.listTasks({ priority: 'high' });

    expect(highPriorityTasks).toHaveLength(1);
    expect(highPriorityTasks[0].title).toBe('Task 1');
  });
});
```

## 📊 Expected Output

```
$ tasks list

╔═══╤════════════════════════════════╤══════════╤══════════╤═══════════╗
║ # │ Task                           │ Priority │ Status   │ Due Date  ║
╟───┼────────────────────────────────┼──────────┼──────────┼───────────╢
║ 1 │ Complete TypeScript module     │ HIGH     │ TODO     │ 2025-01-20║
║ 2 │ Review pull requests           │ MEDIUM   │ PROGRESS │ 2025-01-15║
║ 3 │ Update documentation           │ LOW      │ DONE     │ -         ║
╚═══╧════════════════════════════════╧══════════╧══════════╧═══════════╝

Tasks: 3 total | 1 todo | 1 in progress | 1 done | 0 overdue
```

## 🎓 Key Learnings

1. **CLI Design**: Creating intuitive command-line interfaces
2. **File I/O**: Reading and writing JSON files with type safety
3. **Error Handling**: Handling file system errors and user input
4. **Data Persistence**: Implementing simple database with JSON
5. **Testing**: Unit testing Node.js applications
6. **Third-Party Libraries**: Integrating and typing external libraries
7. **User Experience**: Creating colorful, interactive CLIs

## 🚀 Extensions

Challenge yourself by adding:

1. **Task Dependencies**: Tasks that depend on other tasks
2. **Recurring Tasks**: Daily, weekly, monthly tasks
3. **Subtasks**: Break tasks into smaller pieces
4. **Time Tracking**: Track time spent on tasks
5. **Cloud Sync**: Sync tasks across devices
6. **Notifications**: Desktop notifications for due tasks
7. **Templates**: Task templates for common workflows

## 📚 Resources

- [Commander.js Documentation](https://github.com/tj/commander.js)
- [Inquirer.js Documentation](https://github.com/SBoudrias/Inquirer.js)
- [Chalk Documentation](https://github.com/chalk/chalk)
- [Node.js File System](https://nodejs.org/api/fs.html)
- [cli-table3](https://github.com/cli-table/cli-table3)

## ✅ Completion Checklist

- [ ] Project set up with TypeScript
- [ ] All core features implemented
- [ ] Interactive mode working
- [ ] Tests written and passing
- [ ] Error handling implemented
- [ ] README documentation complete
- [ ] Can be installed globally with npm link

---

**Ready to build?** Start with the setup and work through each feature systematically!

**Need help?** Check the [Troubleshooting Guide](../../../resources/troubleshooting.md) or review the complete implementation in `/src`.
