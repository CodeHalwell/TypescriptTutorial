# TypeScript Configuration (tsconfig.json)

Master the TypeScript compiler configuration for optimal development experience and type safety.

## Table of Contents

- [What is tsconfig.json and Why Does It Matter?](#what-is-tsconfigjson-and-why-does-it-matter)
- [Creating tsconfig.json](#creating-tsconfigjson)
- [Essential Compiler Options](#essential-compiler-options)
- [Strict Mode](#strict-mode)
- [Module Options](#module-options)
- [Common Configurations](#common-configurations)
- [Best Practices](#best-practices)

---

## What is tsconfig.json and Why Does It Matter?

Every TypeScript project needs a `tsconfig.json` file - it's the control center for how TypeScript compiles your code.

**💡 Simple explanation:** `tsconfig.json` is a configuration file that tells the TypeScript compiler:
- Which files to compile
- What version of JavaScript to produce
- How strict to be with type checking
- Where to put the compiled files

**💡 Real-world analogy:** Think of `tsconfig.json` like settings on your car's dashboard:
- **target** = What fuel to use (regular, premium, electric)
- **strict** = How sensitive the safety features are
- **outDir** = Where to park when you're done

Without proper configuration, TypeScript uses defaults that might not fit your project!

**🎯 Why this matters:**
- **Control compilation** - Customize how TypeScript compiles your code
- **Enforce standards** - Set project-wide type safety rules
- **Improve developer experience** - Configure imports, paths, and tooling
- **Optimize performance** - Speed up compilation for large projects

**📝 Note for beginners:** Don't worry about memorizing all options! Start with a basic config and add options as you need them.

---

## Creating tsconfig.json

### Initialize Configuration

The easiest way to create a `tsconfig.json` is with the TypeScript compiler:

```bash
# Create tsconfig.json with defaults
npx tsc --init

# This creates a tsconfig.json with many options commented out
```

**💡 What this does:**
- Creates a `tsconfig.json` file in your current directory
- Includes common options with helpful comments
- Most options are commented out (you can uncomment them as needed)

**What you'll see:**

```json
{
  "compilerOptions": {
    /* Visit https://aka.ms/tsconfig to read more about this file */

    /* Language and Environment */
    "target": "es2016",                                  /* Set the JavaScript language version for emitted JavaScript... */

    /* Modules */
    "module": "commonjs",                                /* Specify what module code is generated. */

    // ... many more options (commented out)
  }
}
```

### Basic Structure

Here's a minimal, practical configuration:

```json
{
  "compilerOptions": {
    // Compiler options go here
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**💡 Explanation of structure:**

- `"compilerOptions"` - Settings for the TypeScript compiler
- `"include"` - Which files to compile (glob patterns)
- `"exclude"` - Which files to ignore (glob patterns)

**🤔 Common Question: What's a glob pattern?**

Glob patterns are file matching patterns:
- `"src/**/*"` - All files in `src/` and subdirectories
- `"**/*.ts"` - All `.ts` files anywhere
- `"src/*.ts"` - Only `.ts` files directly in `src/` (not subdirectories)

---

## Essential Compiler Options

### target

Specifies which version of JavaScript to compile to:

```json
{
  "compilerOptions": {
    "target": "ES2020" // ES3, ES5, ES6/ES2015, ES2016, ..., ES2022, ESNext
  }
}
```

**💡 What this means:**

Your TypeScript code gets compiled to a specific JavaScript version:
- Older versions (ES5) work in older browsers
- Newer versions (ES2020+) have more features but require modern browsers

**Common values:**

- `"ES5"` - Maximum compatibility (works in IE11 and all modern browsers)
- `"ES2015"` (ES6) - Modern browsers (classes, arrow functions, etc.)
- `"ES2020"` - Recent features (optional chaining `?.`, nullish coalescing `??`)
- `"ES2022"` - Latest stable features
- `"ESNext"` - Cutting edge (experimental features)

**🎯 How to choose:**

```json
// For web apps that need to support older browsers
{ "target": "ES5" }

// For modern web apps (Chrome, Firefox, Safari, Edge)
{ "target": "ES2020" }

// For Node.js projects (v14+)
{ "target": "ES2020" }

// For bleeding edge projects
{ "target": "ESNext" }
```

**💡 Example - What target does:**

```typescript
// Your TypeScript code
const greet = (name: string) => `Hello, ${name}!`;
```

With `"target": "ES5"`:
```javascript
// Compiled JavaScript (no arrow functions in ES5)
var greet = function(name) { return "Hello, " + name + "!"; };
```

With `"target": "ES2020"`:
```javascript
// Compiled JavaScript (arrow functions are supported)
const greet = (name) => `Hello, ${name}!`;
```

### module

Specifies which module system to use:

```json
{
  "compilerOptions": {
    "module": "commonjs" // commonjs, es2015, esnext, node16, nodenext
  }
}
```

**💡 What this means:**

JavaScript has different ways to import/export code. This tells TypeScript which system to use.

**Common values:**

- `"commonjs"` - Node.js default (uses `require` and `module.exports`)
- `"es2015"` or `"esnext"` - Modern ES modules (uses `import` and `export`)
- `"node16"` or `"nodenext"` - Node.js with ESM support

**🎯 How to choose:**

```json
// For Node.js projects (traditional)
{ "module": "commonjs" }

// For modern web apps (React, Vue, etc. with bundlers)
{ "module": "esnext" }

// For modern Node.js (with package.json "type": "module")
{ "module": "node16" }
```

**💡 Example - What module does:**

```typescript
// Your TypeScript code
import { helper } from './utils';
export function greet(name: string) { }
```

With `"module": "commonjs"`:
```javascript
// Compiled JavaScript
const utils_1 = require("./utils");
function greet(name) { }
exports.greet = greet;
```

With `"module": "esnext"`:
```javascript
// Compiled JavaScript
import { helper } from './utils';
export function greet(name) { }
```

### lib

Specify which built-in JavaScript/browser APIs TypeScript knows about:

```json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM"]
  }
}
```

**💡 What this means:**

TypeScript needs to know what built-in functions exist (like `console.log`, `document.getElementById`, etc.). The `lib` option tells it which APIs are available.

**Common libraries:**

- `"DOM"` - Browser APIs (document, window, fetch, etc.)
- `"DOM.Iterable"` - Array-like iteration on DOM collections
- `"ES2020"` - ES2020 JavaScript features (Promise.allSettled, etc.)
- `"ESNext"` - Latest JavaScript features

**🎯 How to choose:**

```json
// For browser apps
{ "lib": ["ES2020", "DOM", "DOM.Iterable"] }

// For Node.js apps (no browser APIs)
{ "lib": ["ES2020"] }

// For modern browser apps with latest features
{ "lib": ["ESNext", "DOM"] }
```

**⚠️ Common mistake:**

```typescript
// Without "DOM" in lib
document.getElementById("app"); // ❌ Error: Cannot find name 'document'

// With "DOM" in lib
document.getElementById("app"); // ✅ TypeScript knows about document
```

### outDir and rootDir

Control where compiled files go and where source files come from:

```json
{
  "compilerOptions": {
    "outDir": "./dist",      // Where to put compiled .js files
    "rootDir": "./src"       // Where your .ts files are
  }
}
```

**💡 What this means:**

- `outDir` - Output directory for compiled JavaScript
- `rootDir` - Root directory of your TypeScript source files

**💡 Real-world analogy:** Think of it like a factory:
- `rootDir` is where raw materials come from (your TypeScript)
- `outDir` is where finished products go (compiled JavaScript)

**Example:**

Your project structure:
```
my-project/
├── src/
│   ├── index.ts
│   └── utils/
│       └── helpers.ts
├── dist/          (will be created)
└── tsconfig.json
```

After running `npx tsc`:
```
my-project/
├── src/
│   ├── index.ts
│   └── utils/
│       └── helpers.ts
├── dist/
│   ├── index.js        ← Compiled!
│   └── utils/
│       └── helpers.js  ← Compiled!
└── tsconfig.json
```

**💡 Explanation:** TypeScript preserves your folder structure from `rootDir` to `outDir`.

**🤔 Common Question: What if I don't specify outDir?**

Without `outDir`, `.js` files are created next to `.ts` files:
```
src/
├── index.ts
├── index.js        ← Creates .js next to .ts
└── utils/
    ├── helpers.ts
    └── helpers.js  ← Creates .js next to .ts
```

This gets messy! Always use `outDir`.

### sourceMap

Generate source maps for debugging:

```json
{
  "compilerOptions": {
    "sourceMap": true,           // Generate .js.map files
    "inlineSourceMap": false,    // Don't inline source maps
    "sourceRoot": "/",           // Source root in source maps
    "mapRoot": "./"              // Location of map files
  }
}
```

**💡 What this means:**

Source maps let you debug TypeScript code in the browser/Node.js, even though JavaScript is actually running!

**💡 Real-world analogy:** Source maps are like a translation guide:
- Browser runs JavaScript (the translation)
- Source maps point back to TypeScript (the original)
- Debugger shows you TypeScript code, not JavaScript

**🎯 When to use:**

```json
// During development (easy debugging)
{ "sourceMap": true }

// For production (if you want to debug production issues)
{ "sourceMap": true }

// For production (if you don't want to expose source code)
{ "sourceMap": false }
```

**💡 What you get:**

With `"sourceMap": true`:
```
dist/
├── index.js
└── index.js.map  ← Source map file
```

When debugging, your browser/debugger shows:
- ✅ `src/index.ts` (your TypeScript code)
- Not: `dist/index.js` (compiled JavaScript)

---

## Strict Mode

### strict

Enable all strict type-checking options at once:

```json
{
  "compilerOptions": {
    "strict": true  // Enables ALL strict options below!
  }
}
```

**💡 What this means:**

`"strict": true` is like turning on maximum type safety. It enables multiple strict checks (explained below).

**💡 Recommendation:** **Always use `"strict": true` for new projects!**

**Benefits:**
- ✅ Catch more bugs at compile time
- ✅ Safer code
- ✅ Better TypeScript experience
- ✅ Less runtime errors

**When to disable:**
- ❌ Migrating JavaScript → TypeScript (too many errors at once)
- ❌ Working with legacy code

**🎯 For migrations, enable strict checks gradually:**

```json
{
  "compilerOptions": {
    "strict": false,  // Start with this
    "strictNullChecks": true,  // Enable one at a time
    // "noImplicitAny": true,  // Enable next
    // ... enable others gradually
  }
}
```

`"strict": true` is equivalent to enabling all of these options:

### strictNullChecks

Prevents `null` and `undefined` from being valid values unless explicitly allowed:

```json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

**Without strictNullChecks:**
```typescript
let name: string = null; // ✅ Allowed (but dangerous!)

function greet(name: string) {
  return name.toUpperCase(); // Might crash if name is null!
}

greet(null); // Compiles but crashes at runtime!
```

**With strictNullChecks:**
```typescript
let name: string = null; // ❌ Error: Type 'null' is not assignable to type 'string'

// ✅ Must be explicit about null
let name: string | null = null;

function greet(name: string) {
  return name.toUpperCase(); // Safe - name can't be null!
}

function greetMaybe(name: string | null) {
  if (name !== null) {
    return name.toUpperCase(); // ✅ Checked first!
  }
  return "Hello, stranger!";
}
```

**💡 Why this matters:** Prevents the infamous "Cannot read property 'X' of null" runtime error!

### noImplicitAny

Requires explicit types instead of implicitly using `any`:

```json
{
  "compilerOptions": {
    "noImplicitAny": true
  }
}
```

**Without noImplicitAny:**
```typescript
function greet(name) { // ✅ Implicitly 'any' (no type safety!)
  return `Hello, ${name}`;
}

greet(123); // ✅ Compiles (but probably wrong!)
```

**With noImplicitAny:**
```typescript
function greet(name) { // ❌ Error: Parameter 'name' implicitly has an 'any' type
  return `Hello, ${name}`;
}

// ✅ Must add type annotation
function greet(name: string) {
  return `Hello, ${name}`;
}
```

**💡 Why this matters:** `any` defeats the purpose of TypeScript! This ensures you actually use types.

### strictFunctionTypes

Ensures function parameter types are checked properly:

```json
{
  "compilerOptions": {
    "strictFunctionTypes": true
  }
}
```

**💡 What this means:**

This enables proper type checking for function parameters (especially important for callbacks).

**Example:**

```typescript
type Handler = (msg: string | number) => void;

// Without strictFunctionTypes: might accept wrong type
const handler: Handler = (msg: string) => {
  console.log(msg.toUpperCase()); // Could crash if msg is a number!
};

// With strictFunctionTypes: catches the mismatch
const handler: Handler = (msg: string) => { // ❌ Error!
  console.log(msg.toUpperCase());
};

// ✅ Correct: handle both types
const handler: Handler = (msg: string | number) => {
  if (typeof msg === "string") {
    console.log(msg.toUpperCase());
  } else {
    console.log(msg);
  }
};
```

**📝 Note:** This is advanced - don't worry if you don't fully understand it yet!

### strictBindCallApply

Checks types when using `.call()`, `.apply()`, or `.bind()`:

```json
{
  "compilerOptions": {
    "strictBindCallApply": true
  }
}
```

**Example:**

```typescript
function greet(name: string, age: number) {
  console.log(`${name} is ${age} years old`);
}

// With strictBindCallApply: true
greet.call(undefined, "Alice", 25); // ✅ Correct types
greet.call(undefined, "Alice", "25"); // ❌ Error: '25' should be number
greet.apply(undefined, ["Bob", 30]); // ✅ Correct types
```

**💡 Why this matters:** Prevents passing wrong types to `.call()` and `.apply()`.

### strictPropertyInitialization

Requires class properties to be initialized:

```json
{
  "compilerOptions": {
    "strictPropertyInitialization": true
  }
}
```

**Example:**

```typescript
class User {
  name: string; // ❌ Error: Property 'name' has no initializer

  // ✅ Solution 1: Initialize in declaration
  name: string = "";

  // ✅ Solution 2: Initialize in constructor
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  // ✅ Solution 3: Make it optional
  name?: string;

  // ✅ Solution 4: Definite assignment assertion (use carefully!)
  name!: string; // "I promise this will be assigned!"
}
```

**💡 Why this matters:** Prevents accessing uninitialized properties (which would be `undefined`).

### noImplicitThis

Requires explicit type for `this` in functions:

```json
{
  "compilerOptions": {
    "noImplicitThis": true
  }
}
```

**Example:**

```typescript
// Without noImplicitThis
function double() {
  return this.value * 2; // What is 'this'? We don't know!
}

// With noImplicitThis
function double() {
  return this.value * 2; // ❌ Error: 'this' implicitly has type 'any'
}

// ✅ Solution: Explicit this type
function double(this: { value: number }) {
  return this.value * 2;
}

// Usage
const obj = {
  value: 5,
  double: double
};
obj.double(); // 10
```

**📝 Note:** This is advanced - mainly important when working with older JavaScript patterns.

---

## Module Options

### Module Resolution

Controls how TypeScript finds modules:

```json
{
  "compilerOptions": {
    "moduleResolution": "node" // node, classic, node16, nodenext
  }
}
```

**💡 What this means:**

When you write `import { something } from "package"`, TypeScript needs to find where "package" is. This setting controls how it searches.

**Values:**

- `"node"` - Node.js style (looks in `node_modules/`)
- `"node16"` / `"nodenext"` - Modern Node.js (with package.json exports)
- `"classic"` - Legacy (don't use this)

**💡 Recommendation:** Use `"node"` for most projects.

### baseUrl and paths

Configure custom import paths (aliases):

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

**💡 What this means:**

Instead of ugly relative imports, you can use clean aliases!

**Without paths:**
```typescript
// Ugly nested imports
import { Button } from "../../../components/Button";
import { helper } from "../../../../utils/helpers";
```

**With paths:**
```typescript
// Clean imports!
import { Button } from "@components/Button";
import { helper } from "@utils/helpers";
```

**🎯 Common aliases:**

```json
{
  "paths": {
    "@/*": ["src/*"],           // @/utils/helper
    "@components/*": ["src/components/*"],
    "@utils/*": ["src/utils/*"],
    "@types/*": ["src/types/*"]
  }
}
```

**⚠️ Important:** Most bundlers (Vite, webpack) need separate configuration for aliases to work at runtime!

### esModuleInterop

Makes importing CommonJS modules easier:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

**💡 What this means:**

Some npm packages use CommonJS, others use ES modules. This makes them work together nicely.

**Without esModuleInterop:**
```typescript
// Have to import like this
import * as React from "react";
import * as express from "express";
```

**With esModuleInterop:**
```typescript
// Can import more naturally!
import React from "react";
import express from "express";
```

**💡 Recommendation:** Always enable this! Makes imports cleaner.

### resolveJsonModule

Allows importing JSON files:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

**Example:**

```typescript
// Without resolveJsonModule
import packageJson from "./package.json"; // ❌ Error

// With resolveJsonModule
import packageJson from "./package.json"; // ✅ Works!
console.log(packageJson.version); // TypeScript knows the structure!

// Also works with type safety
import config from "./config.json";
console.log(config.apiUrl); // ✅ Autocomplete works!
```

**💡 Why this is useful:** Import configuration files, package.json, etc. with full type safety!

---

## Common Configurations

### Node.js Project

Perfect for backend/CLI applications:

```json
{
  "compilerOptions": {
    "target": "ES2020",              // Modern JavaScript
    "module": "commonjs",            // Node.js standard
    "lib": ["ES2020"],               // No DOM, just Node APIs
    "outDir": "./dist",              // Output directory
    "rootDir": "./src",              // Source directory
    "strict": true,                  // Maximum type safety
    "esModuleInterop": true,         // Better imports
    "skipLibCheck": true,            // Faster compilation
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,       // Import JSON files
    "declaration": true,             // Generate .d.ts files
    "declarationMap": true,          // Source maps for .d.ts
    "sourceMap": true                // Debug support
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**💡 When to use:** Node.js servers, CLI tools, scripts

### React Project

For React applications (usually used with Vite/Create React App):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"], // Browser APIs
    "jsx": "react-jsx",              // React 17+ JSX
    "module": "esnext",              // Modern modules
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,         // Works with Babel/SWC
    "noEmit": true                   // Let Vite/webpack handle output
  },
  "include": ["src"]
}
```

**💡 When to use:** React, Vue, or other browser-based applications

**🤔 Common Question: Why `"noEmit": true`?**

Build tools like Vite handle compilation themselves. TypeScript just checks types!

### Library Project

For publishing npm packages:

```json
{
  "compilerOptions": {
    "target": "ES2015",              // Wide compatibility
    "module": "esnext",              // Modern modules
    "lib": ["ES2020"],
    "declaration": true,             // Generate type definitions
    "declarationMap": true,          // Debug type definitions
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "removeComments": false,         // Keep JSDoc comments
    "preserveConstEnums": true       // Don't inline enums
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**💡 When to use:** Creating npm packages for others to use

---

## Best Practices

### 1. Always Enable Strict Mode

```json
{
  "compilerOptions": {
    "strict": true  // ← Do this!
  }
}
```

**Why:**
- ✅ Catches more errors at compile time
- ✅ Better code quality
- ✅ Easier refactoring
- ✅ Improved IDE support
- ✅ Fewer runtime bugs

**💡 Real-world comparison:**

Without strict mode:
```typescript
function getUser(id) {  // any type, no safety
  return users[id];     // might be null
}
const user = getUser(1);
user.name;  // ❌ Runtime crash if null!
```

With strict mode:
```typescript
function getUser(id: number): User | null {
  return users[id] || null;
}
const user = getUser(1);
user.name;  // ❌ TypeScript error: check for null first!

// ✅ Must check first
if (user) {
  user.name;  // Safe!
}
```

### 2. Use Include and Exclude

```json
{
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

**Why:**
- ✅ Only compile what you need
- ✅ Faster compilation
- ✅ Don't compile test files to output

**💡 Common patterns:**

```json
{
  // Include only source files
  "include": ["src/**/*"],

  // Exclude generated files, tests, and dependencies
  "exclude": [
    "node_modules",      // Dependencies
    "dist",              // Compiled output
    "**/*.test.ts",      // Unit tests
    "**/*.spec.ts",      // Test specs
    "**/*.d.ts"          // Type definitions (if generated)
  ]
}
```

### 3. Enable skipLibCheck for Faster Compilation

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

**What it does:** Skips type checking of `.d.ts` files in `node_modules/`.

**When to use:**
- ✅ Large projects with many dependencies
- ✅ Compilation is slow
- ✅ Getting type errors in `node_modules/` (not your fault!)

**When to avoid:**
- ❌ You're publishing a library (need to verify types)
- ❌ Small projects (not much performance gain)

**💡 Performance comparison:**
- Without: Checks ~1000 files in `node_modules/` (slow!)
- With: Only checks your code (fast!)

### 4. Use forceConsistentCasingInFileNames

```json
{
  "compilerOptions": {
    "forceConsistentCasingInFileNames": true
  }
}
```

**Why:**
- ✅ Prevents cross-platform issues
- ✅ Catches typos in imports

**Problem without this:**

```typescript
// On macOS (case-insensitive filesystem)
import { User } from "./User";    // Works
import { User } from "./user";    // Also works!
import { User } from "./USER";    // Also works!

// On Linux (case-sensitive filesystem)
import { User } from "./User";    // ✅ Works
import { User } from "./user";    // ❌ File not found!
```

With `forceConsistentCasingInFileNames: true`, TypeScript enforces exact casing everywhere!

### 5. Generate Declaration Files for Libraries

If you're publishing a package to npm:

```json
{
  "compilerOptions": {
    "declaration": true,        // Generate .d.ts files
    "declarationMap": true      // Generate .d.ts.map files
  }
}
```

**What it does:**

```typescript
// Your TypeScript (src/index.ts)
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

Generates:

```
dist/
├── index.js           ← Compiled JavaScript
└── index.d.ts         ← Type definitions
```

```typescript
// dist/index.d.ts
export declare function greet(name: string): string;
```

**Why:** Users of your package get full TypeScript support!

### 6. Use Project References for Monorepos

For large projects with multiple packages:

```json
{
  "compilerOptions": {
    "composite": true,          // Enable project references
    "incremental": true         // Faster rebuilds
  },
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/utils" }
  ]
}
```

**💡 What this does:**
- Splits large projects into smaller pieces
- Only recompiles changed packages
- Much faster for monorepos!

**📝 Note:** This is advanced - only needed for large projects with multiple packages.

---

## Quick Reference

### Minimal Configuration

Start here for new projects:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

### Recommended Configuration

Best all-around config for most projects:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Troubleshooting

### Compilation is Slow

**Problem:** `npx tsc` takes forever.

**Solutions:**

1. **Enable skipLibCheck:**
   ```json
   { "compilerOptions": { "skipLibCheck": true } }
   ```

2. **Enable incremental compilation:**
   ```json
   { "compilerOptions": { "incremental": true } }
   ```

3. **Exclude unnecessary files:**
   ```json
   { "exclude": ["node_modules", "dist", "**/*.test.ts"] }
   ```

4. **Use project references for monorepos:**
   ```json
   { "compilerOptions": { "composite": true } }
   ```

**💡 Expected improvement:** 50-90% faster compilation!

### Module Not Found Errors

**Problem:** `Cannot find module 'X'`

**Solutions:**

1. **Check module resolution:**
   ```json
   { "compilerOptions": { "moduleResolution": "node" } }
   ```

2. **Enable esModuleInterop:**
   ```json
   { "compilerOptions": { "esModuleInterop": true } }
   ```

3. **Verify baseUrl and paths:**
   ```json
   {
     "compilerOptions": {
       "baseUrl": "./",
       "paths": { "@/*": ["src/*"] }
     }
   }
   ```

4. **Install type definitions:**
   ```bash
   npm install --save-dev @types/package-name
   ```

### Cannot Find Name (DOM APIs)

**Problem:** `Cannot find name 'document'`, `Cannot find name 'window'`

**Solution:**

```json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

**💡 Explanation:** TypeScript needs to know browser APIs are available!

### Types Don't Match After Changes

**Problem:** Made changes but still seeing old type errors.

**Solutions:**

1. **Restart TypeScript server in VS Code:**
   - `Cmd/Ctrl + Shift + P`
   - "TypeScript: Restart TS Server"

2. **Delete generated files:**
   ```bash
   rm -rf dist/
   rm tsconfig.tsbuildinfo
   ```

3. **Restart your editor**

---

## Next Steps

**🎉 Congratulations!** You've completed Module 1: Foundations!

You now understand:
- ✅ TypeScript setup and tooling
- ✅ Basic types and type annotations
- ✅ Functions and parameters
- ✅ Interfaces and type aliases
- ✅ TypeScript configuration

**Continue to [Module 2: Intermediate TypeScript](../../02-intermediate/README.md)** to learn about:
- Generics
- Advanced types
- Utility types
- Type manipulation

---

**Further Reading:**
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig)
- [Compiler Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
