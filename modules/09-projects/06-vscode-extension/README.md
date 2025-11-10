# Project 6: VS Code Extension - Code Snippets Manager

Build a VS Code extension using TypeScript to manage custom code snippets with cloud sync.

## Overview

Create a feature-rich VS Code extension with:
- Custom snippet creation and management
- Snippet search and filtering
- Cloud sync across devices
- Snippet sharing with teams
- Variable placeholders
- Multi-language support

**Duration:** 2-3 weeks
**Difficulty:** ⭐⭐⭐ (Intermediate-Advanced)

---

## Features

1. **Snippet Management**: Create, edit, delete snippets
2. **Quick Access**: Command palette integration
3. **Smart Search**: Search snippets by name, tags, language
4. **Variables**: Support for placeholders like `$1`, `$2`, `${TM_FILENAME}`
5. **Cloud Sync**: Sync snippets across devices
6. **Sharing**: Share snippets with team via URL
7. **Import/Export**: Import snippets from JSON/VS Code format

---

## Project Structure

```
vscode-snippet-manager/
├── package.json
├── src/
│   ├── extension.ts
│   ├── commands/
│   │   ├── createSnippet.ts
│   │   ├── insertSnippet.ts
│   │   └── syncSnippets.ts
│   ├── providers/
│   │   ├── SnippetTreeProvider.ts
│   │   └── SnippetCompletionProvider.ts
│   ├── views/
│   │   ├── SnippetPanel.ts
│   │   └── webview/
│   ├── services/
│   │   ├── SnippetService.ts
│   │   ├── StorageService.ts
│   │   └── SyncService.ts
│   └── types/
│       └── snippet.ts
├── media/
│   ├── styles.css
│   └── icons/
└── README.md
```

---

## Setup

### Initialize Extension

```bash
# Install Yeoman and VS Code Extension generator
npm install -g yo generator-code

# Generate extension
yo code

# Choose:
# - New Extension (TypeScript)
# - Name: snippet-manager
# - Identifier: snippet-manager
# - Description: Manage and sync code snippets
# - Initialize git: Yes
# - Package manager: npm

cd snippet-manager
npm install
```

### Package.json Configuration

```json
{
  "name": "snippet-manager",
  "displayName": "Snippet Manager",
  "description": "Manage and sync code snippets",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": [
    "Snippets",
    "Other"
  ],
  "activationEvents": [
    "onCommand:snippetManager.createSnippet",
    "onCommand:snippetManager.insertSnippet",
    "onView:snippetManager.snippetsView"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "snippetManager.createSnippet",
        "title": "Create New Snippet",
        "category": "Snippet Manager"
      },
      {
        "command": "snippetManager.insertSnippet",
        "title": "Insert Snippet",
        "category": "Snippet Manager"
      },
      {
        "command": "snippetManager.editSnippet",
        "title": "Edit Snippet",
        "category": "Snippet Manager"
      },
      {
        "command": "snippetManager.deleteSnippet",
        "title": "Delete Snippet",
        "category": "Snippet Manager"
      },
      {
        "command": "snippetManager.syncSnippets",
        "title": "Sync Snippets",
        "category": "Snippet Manager"
      }
    ],
    "views": {
      "explorer": [
        {
          "id": "snippetManager.snippetsView",
          "name": "Snippets"
        }
      ]
    },
    "viewsWelcome": [
      {
        "view": "snippetManager.snippetsView",
        "contents": "No snippets found.\n[Create Snippet](command:snippetManager.createSnippet)"
      }
    ],
    "menus": {
      "view/item/context": [
        {
          "command": "snippetManager.editSnippet",
          "when": "view == snippetManager.snippetsView"
        },
        {
          "command": "snippetManager.deleteSnippet",
          "when": "view == snippetManager.snippetsView"
        }
      ]
    },
    "configuration": {
      "title": "Snippet Manager",
      "properties": {
        "snippetManager.cloudSync": {
          "type": "boolean",
          "default": false,
          "description": "Enable cloud synchronization"
        },
        "snippetManager.apiKey": {
          "type": "string",
          "default": "",
          "description": "API key for cloud sync"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "pretest": "npm run compile"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "@types/vscode": "^1.80.0",
    "typescript": "^5.0.0"
  }
}
```

---

## Extension Entry Point

```typescript
// src/extension.ts
import * as vscode from 'vscode';
import { SnippetTreeProvider } from './providers/SnippetTreeProvider';
import { SnippetService } from './services/SnippetService';
import { StorageService } from './services/StorageService';
import { createSnippetCommand } from './commands/createSnippet';
import { insertSnippetCommand } from './commands/insertSnippet';
import { syncSnippetsCommand } from './commands/syncSnippets';

export function activate(context: vscode.ExtensionContext) {
  console.log('Snippet Manager is now active!');

  // Initialize services
  const storageService = new StorageService(context);
  const snippetService = new SnippetService(storageService);

  // Register tree view
  const treeProvider = new SnippetTreeProvider(snippetService);
  vscode.window.registerTreeDataProvider('snippetManager.snippetsView', treeProvider);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'snippetManager.createSnippet',
      () => createSnippetCommand(snippetService, treeProvider)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'snippetManager.insertSnippet',
      () => insertSnippetCommand(snippetService)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'snippetManager.editSnippet',
      (snippet) => editSnippet(snippet, snippetService, treeProvider)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'snippetManager.deleteSnippet',
      (snippet) => deleteSnippet(snippet, snippetService, treeProvider)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'snippetManager.syncSnippets',
      () => syncSnippetsCommand(snippetService, context)
    )
  );

  // Register status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = '$(list-unordered) Snippets';
  statusBarItem.command = 'snippetManager.insertSnippet';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
}

export function deactivate() {}

async function editSnippet(
  item: any,
  service: SnippetService,
  provider: SnippetTreeProvider
) {
  const snippet = await service.getSnippet(item.id);
  if (!snippet) return;

  const name = await vscode.window.showInputBox({
    prompt: 'Snippet name',
    value: snippet.name,
  });

  if (!name) return;

  const prefix = await vscode.window.showInputBox({
    prompt: 'Snippet prefix (trigger)',
    value: snippet.prefix,
  });

  if (!prefix) return;

  const body = await vscode.window.showInputBox({
    prompt: 'Snippet body',
    value: snippet.body,
    validateInput: (value) => {
      return value.length === 0 ? 'Body cannot be empty' : null;
    },
  });

  if (!body) return;

  await service.updateSnippet(snippet.id, { name, prefix, body });
  provider.refresh();
  vscode.window.showInformationMessage('Snippet updated!');
}

async function deleteSnippet(
  item: any,
  service: SnippetService,
  provider: SnippetTreeProvider
) {
  const confirm = await vscode.window.showWarningMessage(
    `Delete snippet "${item.label}"?`,
    'Yes',
    'No'
  );

  if (confirm === 'Yes') {
    await service.deleteSnippet(item.id);
    provider.refresh();
    vscode.window.showInformationMessage('Snippet deleted!');
  }
}
```

---

## Snippet Types

```typescript
// src/types/snippet.ts
export interface Snippet {
  id: string;
  name: string;
  prefix: string;
  body: string;
  description?: string;
  language?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface SnippetFolder {
  id: string;
  name: string;
  snippets: Snippet[];
}
```

---

## Snippet Service

```typescript
// src/services/SnippetService.ts
import { Snippet } from '../types/snippet';
import { StorageService } from './StorageService';

export class SnippetService {
  constructor(private storage: StorageService) {}

  async getAllSnippets(): Promise<Snippet[]> {
    return await this.storage.getSnippets();
  }

  async getSnippet(id: string): Promise<Snippet | undefined> {
    const snippets = await this.getAllSnippets();
    return snippets.find(s => s.id === id);
  }

  async createSnippet(snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Snippet> {
    const newSnippet: Snippet = {
      ...snippet,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const snippets = await this.getAllSnippets();
    snippets.push(newSnippet);
    await this.storage.saveSnippets(snippets);

    return newSnippet;
  }

  async updateSnippet(id: string, updates: Partial<Snippet>): Promise<void> {
    const snippets = await this.getAllSnippets();
    const index = snippets.findIndex(s => s.id === id);

    if (index !== -1) {
      snippets[index] = {
        ...snippets[index],
        ...updates,
        updatedAt: Date.now(),
      };
      await this.storage.saveSnippets(snippets);
    }
  }

  async deleteSnippet(id: string): Promise<void> {
    const snippets = await this.getAllSnippets();
    const filtered = snippets.filter(s => s.id !== id);
    await this.storage.saveSnippets(filtered);
  }

  async searchSnippets(query: string): Promise<Snippet[]> {
    const snippets = await this.getAllSnippets();
    const lowercaseQuery = query.toLowerCase();

    return snippets.filter(snippet =>
      snippet.name.toLowerCase().includes(lowercaseQuery) ||
      snippet.prefix.toLowerCase().includes(lowercaseQuery) ||
      snippet.body.toLowerCase().includes(lowercaseQuery) ||
      snippet.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}
```

---

## Storage Service

```typescript
// src/services/StorageService.ts
import * as vscode from 'vscode';
import { Snippet } from '../types/snippet';

export class StorageService {
  constructor(private context: vscode.ExtensionContext) {}

  async getSnippets(): Promise<Snippet[]> {
    return this.context.globalState.get<Snippet[]>('snippets', []);
  }

  async saveSnippets(snippets: Snippet[]): Promise<void> {
    await this.context.globalState.update('snippets', snippets);
  }

  async clearSnippets(): Promise<void> {
    await this.context.globalState.update('snippets', []);
  }
}
```

---

## Tree View Provider

```typescript
// src/providers/SnippetTreeProvider.ts
import * as vscode from 'vscode';
import { Snippet } from '../types/snippet';
import { SnippetService } from '../services/SnippetService';

export class SnippetTreeProvider implements vscode.TreeDataProvider<SnippetTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SnippetTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private snippetService: SnippetService) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: SnippetTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: SnippetTreeItem): Promise<SnippetTreeItem[]> {
    if (!element) {
      // Root level - show all snippets
      const snippets = await this.snippetService.getAllSnippets();
      return snippets.map(snippet => new SnippetTreeItem(snippet));
    }
    return [];
  }
}

class SnippetTreeItem extends vscode.TreeItem {
  constructor(public snippet: Snippet) {
    super(snippet.name, vscode.TreeItemCollapsibleState.None);

    this.id = snippet.id;
    this.description = snippet.prefix;
    this.tooltip = snippet.body;
    this.contextValue = 'snippet';

    this.command = {
      command: 'snippetManager.insertSnippet',
      title: 'Insert Snippet',
      arguments: [snippet],
    };

    this.iconPath = new vscode.ThemeIcon('symbol-snippet');
  }
}
```

---

## Create Snippet Command

```typescript
// src/commands/createSnippet.ts
import * as vscode from 'vscode';
import { SnippetService } from '../services/SnippetService';
import { SnippetTreeProvider } from '../providers/SnippetTreeProvider';

export async function createSnippetCommand(
  service: SnippetService,
  provider: SnippetTreeProvider
) {
  // Get selected text
  const editor = vscode.window.activeTextEditor;
  const selectedText = editor?.document.getText(editor.selection);

  // Get snippet details
  const name = await vscode.window.showInputBox({
    prompt: 'Snippet name',
    placeHolder: 'My Snippet',
  });

  if (!name) return;

  const prefix = await vscode.window.showInputBox({
    prompt: 'Snippet prefix (trigger)',
    placeHolder: 'mysnippet',
  });

  if (!prefix) return;

  const body = await vscode.window.showInputBox({
    prompt: 'Snippet body',
    value: selectedText || '',
    validateInput: (value) => {
      return value.length === 0 ? 'Body cannot be empty' : null;
    },
  });

  if (!body) return;

  const language = editor?.document.languageId;

  // Create snippet
  await service.createSnippet({
    name,
    prefix,
    body,
    language,
    tags: [],
  });

  provider.refresh();
  vscode.window.showInformationMessage(`Snippet "${name}" created!`);
}
```

---

## Insert Snippet Command

```typescript
// src/commands/insertSnippet.ts
import * as vscode from 'vscode';
import { SnippetService } from '../services/SnippetService';
import { Snippet } from '../types/snippet';

export async function insertSnippetCommand(
  service: SnippetService,
  snippet?: Snippet
) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  let selectedSnippet = snippet;

  if (!selectedSnippet) {
    // Show quick pick
    const snippets = await service.getAllSnippets();

    const items = snippets.map(s => ({
      label: s.name,
      description: s.prefix,
      detail: s.body,
      snippet: s,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a snippet to insert',
    });

    if (!selected) return;
    selectedSnippet = selected.snippet;
  }

  // Insert snippet
  const snippetString = new vscode.SnippetString(selectedSnippet.body);
  editor.insertSnippet(snippetString);
}
```

---

## Sync Service

```typescript
// src/services/SyncService.ts
import * as vscode from 'vscode';
import { Snippet } from '../types/snippet';

export class SyncService {
  private apiUrl = 'https://api.snippetmanager.com';

  async syncSnippets(
    snippets: Snippet[],
    apiKey: string
  ): Promise<{ uploaded: number; downloaded: number }> {
    try {
      // Upload local snippets
      const response = await fetch(`${this.apiUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ snippets }),
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const data = await response.json();
      return {
        uploaded: snippets.length,
        downloaded: data.snippets?.length || 0,
      };
    } catch (error) {
      throw new Error(`Sync failed: ${(error as Error).message}`);
    }
  }
}
```

---

## Build and Test

```bash
# Compile
npm run compile

# Run extension
# Press F5 to open Extension Development Host

# Package extension
npm install -g vsce
vsce package

# This creates snippet-manager-1.0.0.vsix
```

---

## Testing

```typescript
// src/test/extension.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';
import { SnippetService } from '../services/SnippetService';

suite('Snippet Service Test Suite', () => {
  test('Create snippet', async () => {
    const service = new SnippetService(/* mock storage */);

    const snippet = await service.createSnippet({
      name: 'Test Snippet',
      prefix: 'test',
      body: 'console.log("test");',
    });

    assert.strictEqual(snippet.name, 'Test Snippet');
    assert.strictEqual(snippet.prefix, 'test');
  });

  test('Search snippets', async () => {
    const service = new SnippetService(/* mock storage */);

    await service.createSnippet({
      name: 'React Component',
      prefix: 'rfc',
      body: 'function Component() {}',
    });

    const results = await service.searchSnippets('react');
    assert.strictEqual(results.length, 1);
  });
});
```

---

## Publishing

```bash
# Create publisher account
# https://marketplace.visualstudio.com/manage

# Login
vsce login <publisher-name>

# Publish
vsce publish
```

---

## Next Steps

1. Add snippet templates
2. Implement team sharing
3. Add snippet categories/folders
4. Create snippet preview panel
5. Add IntelliSense support

**Estimated Time:** 2-3 weeks

---

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
