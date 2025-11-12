# Installation and Setup

Learn how to set up your TypeScript development environment and create your first TypeScript project.

## Table of Contents

- [Why Proper Setup Matters](#why-proper-setup-matters)
- [Installing Node.js](#installing-nodejs)
- [Installing TypeScript](#installing-typescript)
- [Setting Up VS Code](#setting-up-vs-code)
- [Creating Your First Project](#creating-your-first-project)
- [Understanding Compilation](#understanding-compilation)
- [TypeScript vs JavaScript](#typescript-vs-javascript)

---

## Why Proper Setup Matters

Before diving into TypeScript, let's understand what we're setting up and why:

**💡 What is TypeScript?**

TypeScript is a programming language that adds types to JavaScript. Think of it like JavaScript with a safety net:

```javascript
// JavaScript - no warnings!
function add(a, b) {
  return a + b;
}

add(5, "hello"); // Returns "5hello" - probably not what you wanted!
```

```typescript
// TypeScript - catches the mistake!
function add(a: number, b: number): number {
  return a + b;
}

add(5, "hello"); // ❌ Error: Argument of type 'string' is not assignable to parameter of type 'number'
```

**💡 Real-world analogy:** Think of TypeScript like spell-check for code:
- **JavaScript** = Writing without spell-check (mistakes found when you read it)
- **TypeScript** = Writing with spell-check (mistakes caught as you type)

**🎯 What we're setting up:**

1. **Node.js** - The engine that runs JavaScript (and compiles TypeScript)
2. **TypeScript Compiler** - Converts TypeScript to JavaScript
3. **VS Code** - A code editor with excellent TypeScript support
4. **Your First Project** - A working TypeScript project structure

**📝 Note for absolute beginners:**
- Don't worry if these terms are new! We'll explain each step
- You don't need prior experience with command line tools
- This setup is one-time - after this, you'll be ready to code!

---

## Installing Node.js

### What is Node.js?

**💡 Simple explanation:** Node.js is a program that runs JavaScript on your computer (not just in browsers).

Why do we need it?
- TypeScript is written in JavaScript
- The TypeScript compiler needs Node.js to run
- Many development tools use Node.js

**💡 Real-world analogy:** Node.js is like having a JavaScript interpreter on your computer, similar to how you need Python installed to run Python programs.

### Check if Node.js is Installed

Open your terminal (or command prompt on Windows) and run:

```bash
node --version
npm --version
```

**💡 What this does:**
- `node --version` - Checks if Node.js is installed and shows its version
- `npm --version` - Checks if npm (Node Package Manager) is installed

**What you should see:**
```
v18.17.0  (or similar - the exact version doesn't matter much)
9.6.7     (or similar)
```

**🤔 Common Question: What is npm?**

**npm** (Node Package Manager) installs automatically with Node.js. It's like an app store for JavaScript code:
- You use it to install TypeScript
- You use it to install other tools and libraries
- It's essential for modern JavaScript/TypeScript development

### Install Node.js

If the commands above didn't work, you need to install Node.js:

1. Go to [nodejs.org](https://nodejs.org/)
2. You'll see two big download buttons:
   - **LTS** (Long Term Support) - ✅ **Choose this one!** (stable, recommended)
   - **Current** - Latest features, but might be less stable
3. Download and run the installer
4. Follow the installation wizard (click "Next" through the prompts)
5. Restart your terminal after installation

**Verify installation:**
```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show v9.0.0 or higher
```

**💡 Explanation:** The LTS version is like choosing the "stable" channel for software updates - it's tested and reliable!

**📝 Troubleshooting:**
- **"command not found"**: Restart your terminal/computer after installation
- **Old version**: Uninstall the old version and download the latest LTS from nodejs.org
- **Permission errors on Mac/Linux**: You may need to use `sudo` (we'll cover this later if needed)

### Alternative Package Managers (Optional)

These are alternatives to npm. **Skip this section if you're a beginner** - npm works great!

**pnpm** (faster, saves disk space):
```bash
npm install -g pnpm
pnpm --version
```

**yarn** (popular alternative):
```bash
npm install -g yarn
yarn --version
```

**💡 Explanation:**
- `-g` means "global" - installs the tool for use anywhere on your computer
- You can use pnpm or yarn instead of npm if you want
- For beginners, stick with npm (it comes with Node.js)

---

## Installing TypeScript

Now that you have Node.js and npm, let's install TypeScript!

### What is the TypeScript Compiler?

**💡 Simple explanation:** The TypeScript Compiler (command: `tsc`) is a program that:
1. Reads your TypeScript code
2. Checks for type errors
3. Converts it to JavaScript

**💡 Real-world analogy:** It's like a translator that also checks for mistakes:
- Input: TypeScript (with types)
- Output: JavaScript (types removed, ready to run)
- Bonus: Catches errors before you run the code!

### Global Installation (Optional)

Install TypeScript globally to use `tsc` command anywhere:

```bash
npm install -g typescript
```

**💡 What this does:**
- `npm install` - Tells npm to install a package
- `-g` - Installs globally (available everywhere on your computer)
- `typescript` - The package name

**Verify installation:**
```bash
tsc --version  # Should show Version 5.3.0 or higher
```

**🤔 Common Question: Should I install globally?**

**Pros:**
- ✅ Can use `tsc` command anywhere
- ✅ Convenient for quick experiments

**Cons:**
- ❌ Every project uses the same TypeScript version
- ❌ Can cause version conflicts

**💡 Recommendation:** Install globally for learning, but use local installation for real projects (see next section).

### Local Installation (Recommended for Projects)

For each project, install TypeScript as a dev dependency:

```bash
npm install --save-dev typescript
```

**💡 What this does:**
- `npm install` - Installs a package
- `--save-dev` (or `-D`) - Saves it as a development dependency
- `typescript` - The package to install

**💡 Explanation:** "Development dependency" means the package is only needed during development, not when the app is running. TypeScript compiles to JavaScript, so the final app only needs JavaScript!

**Why local installation is better:**
- ✅ Different projects can use different TypeScript versions
- ✅ All team members automatically get the same version (from `package.json`)
- ✅ CI/CD pipelines use the correct version
- ✅ No global version conflicts

**🎯 Real-world example:**
- Project A uses TypeScript 4.9 (older, stable)
- Project B uses TypeScript 5.3 (newer features)
- Local installation lets both coexist!

---

## Setting Up VS Code

### Why VS Code?

**Visual Studio Code** (VS Code) is a free code editor from Microsoft with excellent TypeScript support.

**💡 Why we recommend it:**
- **Built-in TypeScript support** - Works out of the box!
- **Free and open source** - No cost, works on Windows, Mac, Linux
- **Lightweight and fast** - Starts quickly, doesn't use much memory
- **Made by the TypeScript team** - Microsoft makes both VS Code and TypeScript
- **Extensions** - Tons of plugins to enhance your experience

**🤔 Can I use another editor?**

Yes! You can use:
- **WebStorm** (great but paid)
- **Sublime Text** (lightweight)
- **Atom** (similar to VS Code)
- **Vim/Neovim** (if you're already a Vim user)

But VS Code has the best TypeScript support with zero configuration!

### Install VS Code

1. Go to [code.visualstudio.com](https://code.visualstudio.com/)
2. Click the big download button
3. Install and open VS Code

**💡 First-time setup:**
- When you first open VS Code, it may ask to install recommended extensions - click "Install"!
- Familiarize yourself with the sidebar (Explorer, Search, Git, Extensions)

### Essential Extensions

Extensions add superpowers to VS Code. Here are the must-haves for TypeScript:

**1. TypeScript and JavaScript Language Features (Built-in)**
- Comes with VS Code automatically
- Provides syntax highlighting, IntelliSense, error checking
- No installation needed!

**2. ESLint (Code Quality)**

Install from VS Code:
1. Click Extensions icon in sidebar (or press `Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search for "ESLint"
3. Click "Install" on the one by "Microsoft"

Or install from terminal:
```bash
code --install-extension dbaeumer.vscode-eslint
```

**💡 What it does:** Finds code quality issues and bad patterns (like unused variables, inconsistent formatting)

**3. Prettier (Code Formatter)**

Search "Prettier" in Extensions, or:
```bash
code --install-extension esbenp.prettier-vscode
```

**💡 What it does:** Automatically formats your code to look nice and consistent (indentation, spacing, etc.)

**4. Error Lens (Better Error Messages)**

Makes errors appear inline as you type:
```bash
code --install-extension usernamehw.errorlens
```

**💡 What it does:** Shows error messages right next to the problematic code (instead of just red squiggles)

**5. Pretty TypeScript Errors (Optional but Helpful)**

Makes TypeScript errors more readable:
```bash
code --install-extension yoavbls.pretty-ts-errors
```

**💡 What it does:** Formats complex TypeScript errors in an easier-to-understand way

**📝 Note for beginners:** You don't need to install all of these right away. Start with just Prettier and ESLint!

### Recommended VS Code Settings

Create a `.vscode` folder in your project with a `settings.json` file:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

**💡 What each setting does:**

- `"editor.formatOnSave": true` - Automatically format code when you save
- `"editor.defaultFormatter"` - Use Prettier for formatting
- `"source.fixAll.eslint"` - Auto-fix ESLint issues when saving
- `"typescript.suggest.autoImports"` - Suggest imports as you type
- `"typescript.updateImportsOnFileMove"` - Update imports when you move files
- `"typescript.preferences.importModuleSpecifier"` - Use relative paths (e.g., `./utils` not `utils`)

**📝 Don't worry if you don't understand these yet!** They just make your coding experience smoother.

---

## Creating Your First Project

Let's create a real TypeScript project from scratch!

### Manual Setup (Step by Step)

**💡 We'll create a simple project structure. Follow along exactly:**

**Step 1: Create a project directory**

```bash
mkdir my-typescript-project
cd my-typescript-project
```

**💡 What this does:**
- `mkdir` = "make directory" - creates a new folder
- `cd` = "change directory" - moves into that folder

**Step 2: Initialize npm**

```bash
npm init -y
```

**💡 What this does:**
- `npm init` - Creates a `package.json` file (describes your project)
- `-y` - Automatically says "yes" to all questions (uses defaults)

**You should now have a `package.json` file!**

**Step 3: Install TypeScript**

```bash
npm install --save-dev typescript
```

**💡 What happens:**
- npm downloads TypeScript
- Creates `node_modules/` folder (contains TypeScript and its dependencies)
- Updates `package.json` to list TypeScript as a dev dependency

**Step 4: Create TypeScript configuration**

```bash
npx tsc --init
```

**💡 What this does:**
- `npx` - Runs a command from `node_modules` (uses the locally installed `tsc`)
- `tsc --init` - Creates `tsconfig.json` with default settings

**You should now have a `tsconfig.json` file!**

**🤔 Common Question: What is tsconfig.json?**

This file tells TypeScript how to compile your code:
- Which files to compile
- What JavaScript version to target
- Where to put the compiled files
- How strict to be with types

We'll explore this in detail in a later module!

**Step 5: Create source directory**

```bash
mkdir src
```

**💡 Explanation:** It's a convention to put your TypeScript source files in a `src/` folder.

**Step 6: Create your first TypeScript file**

Create `src/index.ts` and add this code:

```typescript
// src/index.ts
function greet(name: string): string {
  return `Hello, ${name}!`;
}

const message = greet("TypeScript");
console.log(message);
```

**💡 Explanation of the code:**
- `function greet(name: string): string` - A function that takes a string and returns a string
- `name: string` - The parameter must be a string (this is the type annotation!)
- `: string` after parentheses - The function returns a string
- This function works exactly like JavaScript, but with type safety!

**Step 7: Compile TypeScript**

```bash
npx tsc
```

**💡 What this does:**
- Reads `tsconfig.json` to see what to compile
- Finds all `.ts` files
- Checks for type errors
- Converts TypeScript to JavaScript
- Puts the output in the location specified by `tsconfig.json` (usually same folder or `dist/`)

**You should now see `src/index.js`!** Let's look at it:

```javascript
// src/index.js (generated)
function greet(name) {
  return `Hello, ${name}!`;
}

const message = greet("TypeScript");
console.log(message);
```

**💡 Notice:** The types are gone! TypeScript types only exist during development.

**Step 8: Run the compiled JavaScript**

```bash
node src/index.js
```

**Output:**
```
Hello, TypeScript!
```

**🎉 Success!** You've written TypeScript, compiled it, and run it!

### Quick Start with ts-node

**💡 Problem:** It's annoying to run `npx tsc` every time you change code.

**💡 Solution:** **ts-node** runs TypeScript directly without pre-compilation!

**1. Install ts-node:**

```bash
npm install --save-dev ts-node @types/node
```

**💡 What this installs:**
- `ts-node` - Run TypeScript files directly
- `@types/node` - Type definitions for Node.js (so TypeScript knows about `console.log`, etc.)

**2. Run TypeScript directly:**

```bash
npx ts-node src/index.ts
```

**Output:**
```
Hello, TypeScript!
```

**💡 Explanation:** ts-node compiles and runs the file in one step! Much faster for development.

**3. Add scripts to package.json:**

Add this to your `package.json`:

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

**💡 Now you can use these commands:**

```bash
npm run dev    # Run with ts-node (for development)
npm run build  # Compile TypeScript (for production)
npm start      # Run compiled JavaScript (for production)
```

**💡 Explanation:**
- `npm run dev` - Quick development mode (compiles on-the-fly)
- `npm run build` - Compile everything to JavaScript files
- `npm start` - Run the final compiled code

**🎯 Real-world usage:**
- During development: `npm run dev` (fast, auto-compiles)
- For production: `npm run build` then `npm start` (optimized)

### Quick Start with Vite (Modern Alternative)

**💡 For web applications,** [Vite](https://vitejs.dev/) is even better than ts-node!

Create a new Vite project with TypeScript:

```bash
npm create vite@latest my-app -- --template vanilla-ts
cd my-app
npm install
npm run dev
```

**💡 What this does:**
- Creates a complete TypeScript project with hot-reload
- Opens a browser with your app
- Changes to code instantly appear in the browser!

**📝 Note:** Vite is great for web apps. For Node.js/backend projects, stick with ts-node.

---

## Understanding Compilation

### What is Compilation?

**💡 Simple explanation:** Compilation is converting TypeScript to JavaScript.

The process:
```
TypeScript (.ts) → [TypeScript Compiler] → JavaScript (.js)
```

**💡 Real-world analogy:** Think of it like a translator:
- You write in TypeScript (English)
- The compiler translates to JavaScript (Spanish)
- The browser/Node.js "speaks" JavaScript

### Why Do We Compile?

**🤔 Common Question: Why can't we just run TypeScript directly?**

Three reasons:

**1. Browsers and Node.js don't understand TypeScript**
- They only understand JavaScript
- We must convert TypeScript → JavaScript

**2. Type checking**
- The compiler checks for type errors
- Catches mistakes before you run the code

**3. Transpilation (bonus)**
- Converts modern JavaScript to older versions
- Ensures your code works in older browsers

**💡 Think of it this way:**
- TypeScript = source code (what you write)
- JavaScript = compiled code (what actually runs)
- Types = safety guardrails (removed after compilation)

### Compilation Process Example

Let's see what happens during compilation:

**Input: src/index.ts**
```typescript
const greet = (name: string): string => {
  return `Hello, ${name}!`;
};

console.log(greet("World"));
```

**Compile:**
```bash
npx tsc src/index.ts
```

**Output: src/index.js**
```javascript
const greet = (name) => {
  return `Hello, ${name}!`;
};

console.log(greet("World"));
```

**💡 Notice what changed:**
- `: string` annotations are **removed**
- The logic is **identical**
- The code is now plain JavaScript

**💡 Key insight:** Types are only for **development** and **compile-time checking**. They disappear in the final JavaScript!

### Watch Mode (Auto-Compile)

**💡 Problem:** Running `npx tsc` after every change is tedious.

**💡 Solution:** Watch mode automatically recompiles when files change!

```bash
npx tsc --watch
# or
npx tsc -w
```

**What happens:**
```
Starting compilation in watch mode...
Found 0 errors. Watching for file changes.
```

Now when you save a `.ts` file, it automatically recompiles!

**💡 How to use it:**
1. Open a terminal and run `npx tsc --watch`
2. Leave it running
3. Edit your TypeScript files
4. See compiled JavaScript update automatically!

**Press Ctrl+C to stop watch mode.**

**🎯 Real-world workflow:**
- Terminal 1: `npx tsc --watch` (auto-compile)
- Terminal 2: `node src/index.js` (run the code after changes)

Or use `ts-node` for even faster development!

---

## TypeScript vs JavaScript

### Similarities

TypeScript and JavaScript are closely related:

**💡 Key facts:**
- **JavaScript IS TypeScript**: All valid JavaScript is valid TypeScript
- **Same runtime**: TypeScript compiles to JavaScript, then runs as JavaScript
- **Same ecosystem**: Use all npm packages, libraries, frameworks
- **Same syntax**: Most JavaScript code works as-is in TypeScript

**🎯 Example:**

```javascript
// This is valid JavaScript
function add(a, b) {
  return a + b;
}

// This is also valid TypeScript!
// (TypeScript just warns about missing types)
function add(a, b) {
  return a + b;
}
```

### Key Differences

| Aspect | JavaScript | TypeScript |
|--------|-----------|------------|
| **Type System** | Dynamic (runtime) | Static (compile-time) |
| **Error Detection** | Runtime (when code runs) | Compile-time (before running) |
| **IDE Support** | Basic autocomplete | Advanced IntelliSense, refactoring |
| **Learning Curve** | Easier initially | Steeper, but pays off |
| **File Extension** | `.js` | `.ts` (or `.tsx` for React) |
| **Compilation** | Not required | Required (converts to .js) |
| **Type Annotations** | Not available | Required/optional |

**💡 Detailed Explanations:**

**Type System:**
- JavaScript: Types are checked when the code runs (runtime)
- TypeScript: Types are checked before the code runs (compile-time)

**Error Detection:**
```javascript
// JavaScript - error only found when code runs
function divide(a, b) {
  return a / b;
}

divide(10, "hello"); // NaN (Not a Number) - runs but gives wrong result
```

```typescript
// TypeScript - error found immediately in editor
function divide(a: number, b: number): number {
  return a / b;
}

divide(10, "hello"); // ❌ Compile error before you even run it!
```

### Philosophy

**💡 TypeScript's core idea:** Add **optional static typing** to JavaScript.

```javascript
// JavaScript - types inferred at runtime
function add(a, b) {
  return a + b;
}

add(5, 3);       // 8 ✅
add("5", "3");   // "53" ⚠️ String concatenation (might not be intended!)
add(5, "3");     // "53" ⚠️ JavaScript coerces types
```

```typescript
// TypeScript - types declared upfront
function add(a: number, b: number): number {
  return a + b;
}

add(5, 3);       // 8 ✅
add("5", "3");   // ❌ Compile error: Argument of type 'string' is not assignable to parameter of type 'number'
add(5, "3");     // ❌ Compile error
```

**💡 Real-world analogy:**
- **JavaScript** = Building without a blueprint (flexible but risky)
- **TypeScript** = Building with a blueprint (structured and safe)

### Benefits of TypeScript

**1. Catch Errors Early**
```typescript
function getUserName(user: { name: string }) {
  return user.name;
}

getUserName({ age: 25 }); // ❌ Error: Property 'name' is missing
// In JavaScript, this would crash at runtime!
```

**2. Better IDE Support**

Your editor knows what properties and methods exist:
```typescript
const user = { name: "Alice", age: 25 };
user. // ← Your editor shows: name, age
```

**3. Self-Documenting Code**

```typescript
// The types tell you exactly what this function needs!
function createUser(name: string, age: number, email: string): User {
  // ...
}

// In JavaScript, you'd need comments or documentation
```

**4. Safer Refactoring**

Rename a property:
```typescript
interface User {
  userName: string; // Renamed from 'name'
}

// TypeScript shows errors everywhere 'name' is still used!
// In JavaScript, you'd have to search manually
```

**5. Better Collaboration**

```typescript
// Clear contract - other developers know exactly what to pass
function calculateTax(price: number, rate: number): number {
  return price * rate;
}

// Without types, they'd have to read the implementation
```

**6. Scales Better**

As projects grow:
- JavaScript gets harder to maintain (no safety net)
- TypeScript stays manageable (types catch issues)

**🎯 Real-world comparison:**
- **Small script (50 lines)**: JavaScript is fine
- **Medium project (1,000 lines)**: TypeScript helps
- **Large project (10,000+ lines)**: TypeScript is essential!

---

## Project Structure Best Practices

Here's a recommended structure for TypeScript projects:

```
my-typescript-project/
├── src/                  # TypeScript source files
│   ├── index.ts         # Entry point
│   ├── utils/
│   │   └── helpers.ts   # Utility functions
│   └── types/
│       └── index.ts     # Type definitions
├── dist/                # Compiled JavaScript (generated by tsc)
├── node_modules/        # Dependencies (installed by npm)
├── .gitignore          # Files to ignore in git
├── package.json        # Project metadata and dependencies
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

**💡 What each folder is for:**

- `src/` - Your TypeScript code (what you edit)
- `dist/` - Compiled JavaScript (generated, don't edit)
- `node_modules/` - Installed packages (generated, don't edit)
- `types/` - Shared type definitions for your project

### Sample .gitignore

Create a `.gitignore` file to exclude generated files from git:

```
# Dependencies
node_modules/

# Compiled output
dist/
*.js
*.js.map
*.d.ts

# Except configuration files
!jest.config.js

# Environment and secrets
.env

# OS files
.DS_Store
Thumbs.db
```

**💡 Why we ignore these:**
- `node_modules/` - Too large, can be reinstalled with `npm install`
- `dist/` - Generated from TypeScript, shouldn't be in version control
- `.env` - Contains secrets (API keys, passwords)

---

## Quick Reference

### Essential Commands

```bash
# Initialize TypeScript config
npx tsc --init

# Compile a specific file
npx tsc file.ts

# Compile entire project (uses tsconfig.json)
npx tsc

# Watch mode (auto-recompile on changes)
npx tsc --watch

# Run TypeScript directly
npx ts-node file.ts

# Check types without generating files
npx tsc --noEmit
```

**💡 Command explanations:**

- `npx` - Runs a command from `node_modules/.bin/`
- `tsc` - TypeScript compiler
- `--init` - Create a default config file
- `--watch` - Watch files for changes
- `--noEmit` - Only check types, don't create .js files

### Common npm Scripts

Add these to `package.json` for convenience:

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "watch": "tsc --watch",
    "type-check": "tsc --noEmit"
  }
}
```

**💡 What each script does:**

- `npm run dev` - Quick development (uses ts-node)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript
- `npm run watch` - Auto-compile on file changes
- `npm run type-check` - Check for errors without compiling

---

## Next Steps

Now that you have TypeScript set up, proceed to [02. Basic Types](../02-basic-types/README.md) to learn about TypeScript's type system.

**🎉 Congratulations!** You've set up a complete TypeScript development environment!

---

## Troubleshooting

### "tsc: command not found"

**Problem:** Terminal doesn't recognize the `tsc` command.

**Solutions:**
1. Use `npx tsc` instead of `tsc` (uses local installation)
2. Install TypeScript globally: `npm install -g typescript`
3. Restart your terminal after installing

**💡 Explanation:** `npx` runs commands from `node_modules`, even if not installed globally.

### "Cannot find module 'typescript'"

**Problem:** TypeScript isn't installed in the project.

**Solution:**
```bash
npm install
# or if package.json doesn't have TypeScript:
npm install --save-dev typescript
```

**💡 Explanation:** `npm install` reads `package.json` and installs all dependencies.

### VS Code Not Showing Errors

**Problem:** TypeScript errors don't appear in VS Code.

**Solutions:**
1. **Use workspace TypeScript version:**
   - Press `Cmd/Ctrl + Shift + P`
   - Type "TypeScript: Select TypeScript Version"
   - Choose "Use Workspace Version"

2. **Reload VS Code:**
   - `Cmd/Ctrl + Shift + P` → "Developer: Reload Window"

3. **Check VS Code is using the right TypeScript:**
   - Look at the bottom right corner
   - Should say "TypeScript" with a version number
   - Click it to change versions

4. **Ensure `tsconfig.json` exists** in your project root

**💡 Explanation:** VS Code has its own TypeScript version but should use your project's version for consistency.

### Compilation is Slow

**Problem:** `tsc` takes a long time to compile.

**Solutions:**

1. **Use incremental compilation:**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "incremental": true
     }
   }
   ```

2. **Skip library type checking:**
   ```json
   {
     "compilerOptions": {
       "skipLibCheck": true
     }
   }
   ```

3. **Exclude unnecessary files:**
   ```json
   {
     "exclude": ["node_modules", "dist", "**/*.test.ts"]
   }
   ```

4. **Use ts-node or Vite for development** (faster than `tsc --watch`)

**💡 Explanation:** These optimizations make TypeScript compile only what's necessary.

### "TS2307: Cannot find module 'X'"

**Problem:** TypeScript can't find a module you installed.

**Solutions:**

1. **Install the package:**
   ```bash
   npm install X
   ```

2. **Install type definitions:**
   ```bash
   npm install --save-dev @types/X
   ```

3. **Restart VS Code** after installing

**💡 Explanation:**
- Some packages include TypeScript types
- Some need separate `@types/package-name` packages
- Example: `express` needs `@types/express`

---

**Next**: [Basic Types →](../02-basic-types/README.md)
