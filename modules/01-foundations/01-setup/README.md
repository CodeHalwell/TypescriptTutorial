# Installation and Setup

Learn how to set up your TypeScript development environment and create your first TypeScript project.

## Table of Contents

- [Installing Node.js](#installing-nodejs)
- [Installing TypeScript](#installing-typescript)
- [Setting Up VS Code](#setting-up-vs-code)
- [Creating Your First Project](#creating-your-first-project)
- [Understanding Compilation](#understanding-compilation)
- [TypeScript vs JavaScript](#typescript-vs-javascript)

---

## Installing Node.js

TypeScript requires Node.js to run the compiler.

### Check if Node.js is Installed

```bash
node --version
npm --version
```

If you see version numbers (e.g., `v18.17.0` and `9.6.7`), Node.js is installed.

### Install Node.js

If not installed, download from [nodejs.org](https://nodejs.org/):

- **LTS version** (recommended): Stable, long-term support
- **Current version**: Latest features

**Verify installation**:
```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show v9.0.0 or higher
```

### Alternative Package Managers

You can use alternative package managers:

**pnpm** (fast, disk-efficient):
```bash
npm install -g pnpm
pnpm --version
```

**yarn** (popular alternative):
```bash
npm install -g yarn
yarn --version
```

---

## Installing TypeScript

### Global Installation (Optional)

Install TypeScript globally to access the `tsc` command everywhere:

```bash
npm install -g typescript
# or
pnpm add -g typescript
# or
yarn global add typescript
```

**Verify installation**:
```bash
tsc --version  # Should show Version 5.3.0 or higher
```

### Local Installation (Recommended for Projects)

For each project, install TypeScript as a dev dependency:

```bash
npm install --save-dev typescript
# or
pnpm add -D typescript
# or
yarn add -D typescript
```

This ensures:
- Different projects can use different TypeScript versions
- All team members use the same version
- CI/CD pipelines use the correct version

---

## Setting Up VS Code

[Visual Studio Code](https://code.visualstudio.com/) is the recommended editor for TypeScript development.

### Why VS Code?

- **Built-in TypeScript support**: IntelliSense, error highlighting, refactoring
- **Fast and lightweight**
- **Extensive extension ecosystem**
- **Developed by Microsoft** (same team as TypeScript)

### Essential Extensions

Install these extensions for the best experience:

1. **TypeScript and JavaScript Language Features** (Built-in)
   - Syntax highlighting, IntelliSense, error checking

2. **ESLint** (dbaeumer.vscode-eslint)
   - Code quality and consistency
   ```bash
   code --install-extension dbaeumer.vscode-eslint
   ```

3. **Prettier** (esbenp.prettier-vscode)
   - Automatic code formatting
   ```bash
   code --install-extension esbenp.prettier-vscode
   ```

4. **Error Lens** (usernamehw.errorlens)
   - Inline error messages
   ```bash
   code --install-extension usernamehw.errorlens
   ```

5. **Pretty TypeScript Errors** (yoavbls.pretty-ts-errors)
   - More readable error messages
   ```bash
   code --install-extension yoavbls.pretty-ts-errors
   ```

### Recommended VS Code Settings

Create `.vscode/settings.json` in your project:

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

---

## Creating Your First Project

### Manual Setup

1. **Create a project directory**:
   ```bash
   mkdir my-typescript-project
   cd my-typescript-project
   ```

2. **Initialize npm**:
   ```bash
   npm init -y
   ```

3. **Install TypeScript**:
   ```bash
   npm install --save-dev typescript
   ```

4. **Create TypeScript configuration**:
   ```bash
   npx tsc --init
   ```

   This creates `tsconfig.json` with default settings.

5. **Create source directory**:
   ```bash
   mkdir src
   ```

6. **Create your first TypeScript file** (`src/index.ts`):
   ```typescript
   // src/index.ts
   function greet(name: string): string {
     return `Hello, ${name}!`;
   }

   const message = greet("TypeScript");
   console.log(message);
   ```

7. **Compile TypeScript**:
   ```bash
   npx tsc
   ```

   This creates `src/index.js` (or wherever your `outDir` is configured).

8. **Run the compiled JavaScript**:
   ```bash
   node src/index.js
   ```

   Output: `Hello, TypeScript!`

### Quick Start with ts-node

**ts-node** allows you to run TypeScript directly without pre-compilation:

1. **Install ts-node**:
   ```bash
   npm install --save-dev ts-node @types/node
   ```

2. **Run TypeScript directly**:
   ```bash
   npx ts-node src/index.ts
   ```

3. **Add script to package.json**:
   ```json
   {
     "scripts": {
       "dev": "ts-node src/index.ts",
       "build": "tsc",
       "start": "node dist/index.js"
     }
   }
   ```

   Now you can use:
   ```bash
   npm run dev    # Run with ts-node
   npm run build  # Compile TypeScript
   npm start      # Run compiled JavaScript
   ```

### Quick Start with Vite

For modern projects, use [Vite](https://vitejs.dev/):

```bash
npm create vite@latest my-app -- --template vanilla-ts
cd my-app
npm install
npm run dev
```

---

## Understanding Compilation

### What is Compilation?

TypeScript **compiles** (transpiles) to JavaScript:

```
TypeScript (.ts) → [TypeScript Compiler] → JavaScript (.js)
```

### Why Compile?

1. **Browsers don't understand TypeScript**: They only run JavaScript
2. **Type checking**: The compiler verifies types before generating JavaScript
3. **Transpilation**: Converts modern JavaScript to older versions for compatibility

### Compilation Process

```typescript
// Input: src/index.ts
const greet = (name: string): string => {
  return `Hello, ${name}!`;
};

console.log(greet("World"));
```

**Compile**:
```bash
npx tsc src/index.ts
```

**Output: src/index.js**:
```javascript
const greet = (name) => {
  return `Hello, ${name}!`;
};

console.log(greet("World"));
```

Notice:
- Type annotations are **removed**
- The logic remains **identical**
- Types are only for **development** and **compile-time checking**

### Watch Mode

Automatically recompile on file changes:

```bash
npx tsc --watch
# or
npx tsc -w
```

---

## TypeScript vs JavaScript

### Similarities

- **JavaScript is TypeScript**: All valid JavaScript is valid TypeScript
- **Same runtime**: TypeScript compiles to JavaScript
- **Same ecosystem**: Use all npm packages

### Key Differences

| Aspect | JavaScript | TypeScript |
|--------|-----------|------------|
| **Type System** | Dynamic (runtime) | Static (compile-time) |
| **Error Detection** | Runtime | Compile-time |
| **IDE Support** | Basic | Advanced (IntelliSense, refactoring) |
| **Learning Curve** | Easier initially | Steeper, but pays off |
| **File Extension** | `.js` | `.ts` (`.tsx` for React) |
| **Compilation** | Not required | Required |

### Philosophy

TypeScript adds **optional static typing** to JavaScript:

```javascript
// JavaScript - no type checking
function add(a, b) {
  return a + b;
}

add(5, 3);       // 8 ✅
add("5", "3");   // "53" ⚠️ Might not be intended
add(5, "3");     // "53" ⚠️ Type coercion
```

```typescript
// TypeScript - explicit types
function add(a: number, b: number): number {
  return a + b;
}

add(5, 3);       // 8 ✅
add("5", "3");   // ❌ Compile error
add(5, "3");     // ❌ Compile error
```

### Benefits of TypeScript

1. **Catch Errors Early**: Find bugs before runtime
2. **Better IDE Support**: Autocomplete, refactoring, navigation
3. **Self-Documenting Code**: Types serve as documentation
4. **Safer Refactoring**: Compiler catches breaking changes
5. **Better Collaboration**: Clear contracts between code
6. **Scales Better**: Easier to maintain large codebases

---

## Project Structure Best Practices

Recommended structure for TypeScript projects:

```
my-typescript-project/
├── src/
│   ├── index.ts          # Entry point
│   ├── utils/
│   │   └── helpers.ts
│   └── types/
│       └── index.ts      # Type definitions
├── dist/                 # Compiled output (gitignored)
├── node_modules/         # Dependencies (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### Sample .gitignore

```
node_modules/
dist/
*.js
*.js.map
*.d.ts
!jest.config.js
.env
.DS_Store
```

---

## Quick Reference

### Essential Commands

```bash
# Initialize TypeScript config
npx tsc --init

# Compile a file
npx tsc file.ts

# Compile project
npx tsc

# Watch mode
npx tsc --watch

# Run TypeScript directly
npx ts-node file.ts

# Check types without emitting files
npx tsc --noEmit
```

### Common npm Scripts

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

---

## Next Steps

Now that you have TypeScript set up, proceed to [02. Basic Types](../02-basic-types/README.md) to learn about TypeScript's type system.

---

## Troubleshooting

### "tsc: command not found"

- **Solution**: Install TypeScript globally or use `npx tsc`

### "Cannot find module 'typescript'"

- **Solution**: Run `npm install` to install dependencies

### VS Code Not Showing Errors

- **Solution**:
  1. Ensure you're using the workspace TypeScript version
  2. Reload VS Code: `Cmd/Ctrl + Shift + P` → "Reload Window"
  3. Check `.vscode/settings.json` configuration

### Compilation is Slow

- **Solutions**:
  1. Use `--incremental` flag
  2. Enable project references for monorepos
  3. Exclude unnecessary files in `tsconfig.json`
  4. Use `skipLibCheck: true` in `tsconfig.json`

---

**Next**: [Basic Types →](../02-basic-types/README.md)
