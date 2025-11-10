# TypeScript Configuration (tsconfig.json)

Master the TypeScript compiler configuration for optimal development experience and type safety.

## Table of Contents

- [Creating tsconfig.json](#creating-tsconfigjson)
- [Essential Compiler Options](#essential-compiler-options)
- [Strict Mode](#strict-mode)
- [Module Options](#module-options)
- [Common Configurations](#common-configurations)
- [Best Practices](#best-practices)

---

## Creating tsconfig.json

### Initialize Configuration

```bash
# Create tsconfig.json with defaults
npx tsc --init

# This creates a tsconfig.json with many options commented out
```

### Basic Structure

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

---

## Essential Compiler Options

### target

Specifies ECMAScript target version:

```json
{
  "compilerOptions": {
    "target": "ES2020" // ES3, ES5, ES6/ES2015, ES2016, ..., ES2022, ESNext
  }
}
```

**Common values:**
- `"ES5"`: Maximum compatibility (IE11+)
- `"ES2015"` (ES6): Modern browsers
- `"ES2020"`: Recent features (optional chaining, nullish coalescing)
- `"ES2022"`: Latest stable features
- `"ESNext"`: Cutting edge (experimental)

### module

Specifies module system:

```json
{
  "compilerOptions": {
    "module": "commonjs" // commonjs, es2015, es6, esnext, none, umd, amd, system
  }
}
```

**Common values:**
- `"commonjs"`: Node.js (require/module.exports)
- `"es2015"` or `"esnext"`: Modern (import/export)
- `"node16"` or `"nodenext"`: Node.js with ESM support

### lib

Specify library files to include:

```json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM"]
  }
}
```

**Common libraries:**
- `"DOM"`: Browser APIs (document, window)
- `"DOM.Iterable"`: DOM iteration methods
- `"ES2020"`: ES2020 language features
- `"ESNext"`: Latest JavaScript features

### outDir and rootDir

Control output structure:

```json
{
  "compilerOptions": {
    "outDir": "./dist",      // Output directory
    "rootDir": "./src"       // Root of source files
  }
}
```

**Example:**
```
src/
  index.ts
  utils/
    helpers.ts
```

Compiles to:
```
dist/
  index.js
  utils/
    helpers.js
```

### sourceMap

Generate source maps for debugging:

```json
{
  "compilerOptions": {
    "sourceMap": true,           // Generate .js.map files
    "inlineSourceMap": false,    // Inline source maps in .js files
    "sourceRoot": "/",           // Source root in source maps
    "mapRoot": "./"              // Location of map files
  }
}
```

---

## Strict Mode

### strict

Enable all strict type-checking options:

```json
{
  "compilerOptions": {
    "strict": true  // Enables all strict options
  }
}
```

**Equivalent to enabling:**

### strictNullChecks

```json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

```typescript
// With strictNullChecks: false
let name: string = null; // ✅ Allowed

// With strictNullChecks: true
let name: string = null; // ❌ Type 'null' is not assignable to type 'string'
let name: string | null = null; // ✅ Explicit null
```

### noImplicitAny

```json
{
  "compilerOptions": {
    "noImplicitAny": true
  }
}
```

```typescript
// With noImplicitAny: false
function greet(name) { // ✅ Implicitly any
  return `Hello, ${name}`;
}

// With noImplicitAny: true
function greet(name) { // ❌ Parameter 'name' implicitly has an 'any' type
  return `Hello, ${name}`;
}

function greet(name: string) { // ✅ Explicit type
  return `Hello, ${name}`;
}
```

### strictFunctionTypes

```json
{
  "compilerOptions": {
    "strictFunctionTypes": true
  }
}
```

Ensures function parameter types are checked contravariantly.

### strictBindCallApply

```json
{
  "compilerOptions": {
    "strictBindCallApply": true
  }
}
```

```typescript
function greet(name: string, age: number) {
  console.log(`${name} is ${age} years old`);
}

// With strictBindCallApply: true
greet.call(undefined, "Alice", 25); // ✅
greet.call(undefined, "Alice", "25"); // ❌ Argument of type 'string' not assignable to 'number'
```

### strictPropertyInitialization

```json
{
  "compilerOptions": {
    "strictPropertyInitialization": true
  }
}
```

```typescript
class User {
  name: string; // ❌ Property 'name' has no initializer

  // ✅ Solutions:
  name: string = ""; // Initialize
  name!: string; // Definite assignment assertion
  name?: string; // Optional
}
```

### noImplicitThis

```json
{
  "compilerOptions": {
    "noImplicitThis": true
  }
}
```

```typescript
// With noImplicitThis: true
function double() {
  return this.value * 2; // ❌ 'this' implicitly has type 'any'
}

function double(this: { value: number }) { // ✅ Explicit this type
  return this.value * 2;
}
```

---

## Module Options

### Module Resolution

```json
{
  "compilerOptions": {
    "moduleResolution": "node" // node, classic, node16, nodenext
  }
}
```

**Values:**
- `"node"`: Node.js style resolution
- `"node16"` or `"nodenext"`: Node.js with package.json exports
- `"classic"`: Legacy (rarely used)

### baseUrl and paths

Configure module path mapping:

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

**Usage:**
```typescript
// Instead of:
import { Button } from "../../../components/Button";

// Use:
import { Button } from "@components/Button";
```

### esModuleInterop

Enable interoperability between CommonJS and ES Modules:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

```typescript
// Without esModuleInterop
import * as React from "react";

// With esModuleInterop
import React from "react"; // ✅ More natural
```

### resolveJsonModule

Allow importing .json files:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

```typescript
// package.json
import packageJson from "./package.json";
console.log(packageJson.version);
```

---

## Common Configurations

### Node.js Project

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
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### React Project

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

### Library Project

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "esnext",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "removeComments": false,
    "preserveConstEnums": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

---

## Best Practices

### 1. Always Enable Strict Mode

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

**Benefits:**
- Catch more errors at compile time
- Better code quality
- Easier refactoring
- Improved IDE support

### 2. Use Include and Exclude

```json
{
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
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

**When to use:**
- Large projects with many dependencies
- Compilation is slow
- Type errors in node_modules

**When to avoid:**
- Small projects
- Need to verify library types

### 4. Use forceConsistentCasingInFileNames

```json
{
  "compilerOptions": {
    "forceConsistentCasingInFileNames": true
  }
}
```

Prevents case-sensitivity issues across different operating systems.

### 5. Generate Declaration Files for Libraries

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true
  }
}
```

### 6. Use Project References for Monorepos

```json
{
  "compilerOptions": {
    "composite": true,
    "incremental": true
  },
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/utils" }
  ]
}
```

---

## Quick Reference

### Minimal Configuration

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

**Solutions:**
1. Enable `skipLibCheck: true`
2. Use `incremental: true`
3. Exclude unnecessary files
4. Use project references for monorepos

### Module Not Found

**Solutions:**
1. Check `baseUrl` and `paths` configuration
2. Verify `moduleResolution` is set to `"node"`
3. Ensure `esModuleInterop` is `true`
4. Install `@types/` packages for libraries

### Cannot Find Name (DOM APIs)

**Solution:**
```json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM"]
  }
}
```

---

## Next Steps

You've completed Module 1! Continue to [Module 2: Intermediate TypeScript](../../02-intermediate/README.md) to learn about generics, advanced types, and utility types.

---

**Further Reading:**
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig)
- [Compiler Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
