# TypeScript Troubleshooting Guide

Common errors, their causes, and solutions.

## Table of Contents

- [Compilation Errors](#compilation-errors)
- [Type Errors](#type-errors)
- [Configuration Issues](#configuration-issues)
- [Module Resolution](#module-resolution)
- [IDE and Tooling](#ide-and-tooling)
- [Performance Issues](#performance-issues)

---

## Compilation Errors

### "Cannot find module" or "Cannot find name"

**Error:**
```
Cannot find module 'react' or its corresponding type declarations.
Cannot find name 'document'.
```

**Causes & Solutions:**

1. **Missing package:**
   ```bash
   npm install react
   # or
   npm install --save-dev @types/react
   ```

2. **Missing type definitions:**
   ```bash
   npm install --save-dev @types/node
   npm install --save-dev @types/react
   npm install --save-dev @types/jest
   ```

3. **Missing lib in tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "lib": ["ES2020", "DOM"]
     }
   }
   ```

4. **Incorrect module resolution:**
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true
     }
   }
   ```

---

### "File is not under 'rootDir'"

**Error:**
```
File '/project/utils/helper.ts' is not under 'rootDir' '/project/src'.
```

**Solution:**

1. **Move file to src directory**, or
2. **Adjust rootDir:**
   ```json
   {
     "compilerOptions": {
       "rootDir": "./"
     }
   }
   ```

---

### "Duplicate identifier"

**Error:**
```
Duplicate identifier 'User'.
```

**Causes & Solutions:**

1. **Same name used twice:**
   ```typescript
   // ❌ Error
   interface User { }
   type User = { };

   // ✅ Solution: Use different names
   interface User { }
   type UserType = { };
   ```

2. **Ambient declaration conflicts:**
   ```typescript
   // If you have global.d.ts and types.d.ts with same name
   // ✅ Solution: Rename or use namespace
   ```

---

## Type Errors

### "Type 'null' is not assignable to type"

**Error:**
```
Type 'null' is not assignable to type 'string'.
```

**Cause:** `strictNullChecks` is enabled (good!).

**Solutions:**

```typescript
// ❌ Error
let name: string = null;

// ✅ Solution 1: Union with null
let name: string | null = null;

// ✅ Solution 2: Use optional
interface User {
  name?: string;
}

// ✅ Solution 3: Non-null assertion (when certain)
const user = users.find(u => u.id === 1)!;

// ✅ Solution 4: Null coalescing
const name = user.name ?? "Unknown";

// ✅ Solution 5: Optional chaining
const email = user?.contact?.email;
```

---

### "Property 'X' does not exist on type 'Y'"

**Error:**
```
Property 'value' does not exist on type 'EventTarget'.
Property 'toUpperCase' does not exist on type 'number'.
```

**Causes & Solutions:**

1. **Wrong type:**
   ```typescript
   // ❌ Error
   function process(value: number) {
     return value.toUpperCase();
   }

   // ✅ Solution
   function process(value: string) {
     return value.toUpperCase();
   }
   ```

2. **Need type assertion:**
   ```typescript
   // ❌ Error
   const input = event.target.value;

   // ✅ Solution
   const input = (event.target as HTMLInputElement).value;
   ```

3. **Missing property:**
   ```typescript
   // ❌ Error
   interface User {
     name: string;
   }
   const user: User = { name: "Alice" };
   console.log(user.age);

   // ✅ Solution: Add property
   interface User {
     name: string;
     age?: number;
   }
   ```

4. **Index signature needed:**
   ```typescript
   // ❌ Error
   const obj = { name: "Alice" };
   const key = "name";
   console.log(obj[key]);

   // ✅ Solution 1: Index signature
   const obj: { [key: string]: string } = { name: "Alice" };

   // ✅ Solution 2: Type assertion
   console.log(obj[key as keyof typeof obj]);

   // ✅ Solution 3: Use const assertion
   const obj = { name: "Alice" } as const;
   console.log(obj.name);
   ```

---

### "Argument of type 'X' is not assignable to parameter of type 'Y'"

**Error:**
```
Argument of type 'string' is not assignable to parameter of type 'number'.
```

**Solutions:**

```typescript
// ❌ Error
function multiply(a: number, b: number): number {
  return a * b;
}
multiply("5", 3);

// ✅ Solution 1: Convert type
multiply(Number("5"), 3);
multiply(parseInt("5", 10), 3);

// ✅ Solution 2: Union type
function multiply(a: number | string, b: number): number {
  const numA = typeof a === "string" ? Number(a) : a;
  return numA * b;
}

// ✅ Solution 3: Overloads
function multiply(a: number, b: number): number;
function multiply(a: string, b: number): number;
function multiply(a: number | string, b: number): number {
  const numA = typeof a === "string" ? Number(a) : a;
  return numA * b;
}
```

---

### "Object is of type 'unknown'"

**Error:**
```
Object is of type 'unknown'.
```

**Cause:** Using `unknown` type without narrowing.

**Solutions:**

```typescript
function process(value: unknown) {
  // ❌ Error
  console.log(value.toUpperCase());

  // ✅ Solution 1: typeof guard
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  }

  // ✅ Solution 2: Custom type guard
  if (isString(value)) {
    console.log(value.toUpperCase());
  }

  // ✅ Solution 3: Type assertion (if certain)
  console.log((value as string).toUpperCase());
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
```

---

### "X implicitly has an 'any' type"

**Error:**
```
Parameter 'name' implicitly has an 'any' type.
Variable 'data' implicitly has an 'any' type.
```

**Cause:** `noImplicitAny` is enabled.

**Solutions:**

```typescript
// ❌ Error
function greet(name) {
  return `Hello, ${name}`;
}

// ✅ Solution: Add type annotation
function greet(name: string): string {
  return `Hello, ${name}`;
}

// ❌ Error
const data = await fetch("/api").then(r => r.json());

// ✅ Solution: Add type
interface ApiResponse {
  data: string;
}
const data: ApiResponse = await fetch("/api").then(r => r.json());

// ✅ Solution: Use unknown
const data: unknown = await fetch("/api").then(r => r.json());
```

---

## Configuration Issues

### "tsconfig.json" is not being used

**Symptoms:**
- Changes to tsconfig.json don't take effect
- TypeScript using wrong compiler options

**Solutions:**

1. **Reload IDE:**
   - VS Code: `Cmd/Ctrl + Shift + P` → "Reload Window"

2. **Check tsconfig location:**
   - Must be in project root
   - Or specify with `--project` flag

3. **Check include/exclude:**
   ```json
   {
     "include": ["src/**/*"],
     "exclude": ["node_modules"]
   }
   ```

4. **Clean and rebuild:**
   ```bash
   rm -rf dist node_modules
   npm install
   npx tsc --build --clean
   npx tsc
   ```

---

### "Cannot write file ... because it would overwrite input file"

**Error:**
```
Cannot write file 'src/index.js' because it would overwrite input file.
```

**Cause:** Output directory conflicts with source directory.

**Solution:**

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "exclude": ["dist", "node_modules"]
}
```

---

## Module Resolution

### "Cannot find module 'X' or its corresponding type declarations"

**Solutions:**

1. **Install types:**
   ```bash
   npm install --save-dev @types/node
   npm install --save-dev @types/react
   npm install --save-dev @types/express
   ```

2. **Enable esModuleInterop:**
   ```json
   {
     "compilerOptions": {
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true
     }
   }
   ```

3. **Configure paths:**
   ```json
   {
     "compilerOptions": {
       "baseUrl": "./",
       "paths": {
         "@/*": ["src/*"],
         "@components/*": ["src/components/*"]
       }
     }
   }
   ```

4. **Create declaration file:**
   ```typescript
   // src/types/custom.d.ts
   declare module "my-untyped-module" {
     export function doSomething(): void;
   }
   ```

---

### Path aliases not working

**Problem:**
```typescript
import { Button } from "@/components/Button"; // Not found
```

**Solutions:**

1. **Configure tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "baseUrl": "./",
       "paths": {
         "@/*": ["src/*"]
       }
     }
   }
   ```

2. **For runtime (Node.js), use tsconfig-paths:**
   ```bash
   npm install --save-dev tsconfig-paths
   ```

   ```javascript
   // In your entry file
   require("tsconfig-paths/register");
   ```

3. **For bundlers (Webpack/Vite), configure alias:**
   ```javascript
   // vite.config.ts
   import { defineConfig } from "vite";
   import path from "path";

   export default defineConfig({
     resolve: {
       alias: {
         "@": path.resolve(__dirname, "./src"),
       },
     },
   });
   ```

---

## IDE and Tooling

### VS Code not showing TypeScript errors

**Solutions:**

1. **Check TypeScript version:**
   - Click TypeScript version in status bar
   - Select "Use Workspace Version"

2. **Reload window:**
   - `Cmd/Ctrl + Shift + P` → "Reload Window"

3. **Check file is included:**
   - Ensure file matches `include` patterns in tsconfig.json

4. **Restart TS Server:**
   - `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"

5. **Clear cache:**
   ```bash
   rm -rf node_modules/.cache
   ```

---

### Autocomplete/IntelliSense not working

**Solutions:**

1. **Install @types packages:**
   ```bash
   npm install --save-dev @types/node
   ```

2. **Check tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "allowSyntheticDefaultImports": true
     }
   }
   ```

3. **Restart TS Server** (see above)

4. **Check file extension:**
   - Use `.ts` or `.tsx`, not `.js`

---

## Performance Issues

### Slow compilation

**Solutions:**

1. **Enable incremental compilation:**
   ```json
   {
     "compilerOptions": {
       "incremental": true
     }
   }
   ```

2. **Skip lib check:**
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
     "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
   }
   ```

4. **Use project references for monorepos:**
   ```json
   {
     "references": [
       { "path": "./packages/core" },
       { "path": "./packages/utils" }
     ]
   }
   ```

5. **Reduce strictness temporarily:**
   ```json
   {
     "compilerOptions": {
       "strict": false
     }
   }
   ```

---

### IDE performance issues

**Solutions:**

1. **Increase memory for TS Server:**
   ```json
   // .vscode/settings.json
   {
     "typescript.tsserver.maxTsServerMemory": 4096
   }
   ```

2. **Exclude large directories:**
   ```json
   {
     "exclude": ["node_modules", "dist", "coverage"]
   }
   ```

3. **Use skipLibCheck:**
   ```json
   {
     "compilerOptions": {
       "skipLibCheck": true
     }
   }
   ```

---

## Quick Debugging Tips

### Enable detailed errors

```bash
# More detailed error output
npx tsc --explainFiles
npx tsc --listFiles
npx tsc --listEmittedFiles

# Trace module resolution
npx tsc --traceResolution
```

### Check TypeScript version

```bash
npx tsc --version
npm list typescript
```

### Validate tsconfig.json

```bash
npx tsc --showConfig
```

### Type-check without emitting files

```bash
npx tsc --noEmit
```

---

## Getting Help

Still stuck? Try these resources:

1. **Official TypeScript Documentation:**
   - [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
   - [Error Messages](https://www.typescriptlang.org/docs/handbook/2/error-messages.html)

2. **Community:**
   - [Stack Overflow - TypeScript](https://stackoverflow.com/questions/tagged/typescript)
   - [TypeScript Discord](https://discord.com/invite/typescript)
   - [r/typescript](https://www.reddit.com/r/typescript/)

3. **GitHub Issues:**
   - [TypeScript GitHub Issues](https://github.com/microsoft/TypeScript/issues)

4. **Search for error message:**
   - Copy exact error message
   - Search on Google or Stack Overflow
   - Check TypeScript GitHub issues

---

**Back to:**
- [Comparisons](./comparisons.md)
- [Glossary](./glossary.md)
- [Main README](../README.md)
