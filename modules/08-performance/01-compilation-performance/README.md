# Compilation Performance Optimization

Speed up TypeScript compilation and type-checking for faster development cycles.

## Table of Contents

- [Understanding Compilation](#understanding-compilation)
- [Compiler Options](#compiler-options)
- [Project References](#project-references)
- [Incremental Compilation](#incremental-compilation)
- [Skip Lib Check](#skip-lib-check)
- [Profiling Compilation](#profiling-compilation)
- [Best Practices](#best-practices)

---

## Understanding Compilation

TypeScript compilation consists of:

1. **Parsing**: Source code → AST (Abstract Syntax Tree)
2. **Binding**: Connect references to declarations
3. **Type-checking**: Verify types are correct
4. **Emit**: Generate JavaScript and .d.ts files

Type-checking is typically the slowest phase in large projects.

---

## Compiler Options

### Essential Performance Options

```json
// tsconfig.json
{
  "compilerOptions": {
    // Core performance options
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo",

    // Skip type checking for libraries
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,

    // Faster module resolution
    "moduleResolution": "bundler", // or "node16"

    // Disable emit for build tools
    "noEmit": true,

    // Strict checks (can be slow)
    "strict": true,

    // Disable unused checks if not needed
    "noUnusedLocals": false,
    "noUnusedParameters": false
  },

  // Exclude unnecessary files
  "exclude": [
    "node_modules",
    "dist",
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
}
```

### Impact Analysis

| Option | Impact | Trade-off |
|--------|--------|-----------|
| `incremental` | ⚡⚡⚡ Fast | Disk space for .tsbuildinfo |
| `skipLibCheck` | ⚡⚡⚡ Fast | May miss type errors in node_modules |
| `noEmit` | ⚡⚡ Moderate | No JS output (use bundler) |
| `strict` | 🐌 Slow | Better type safety |
| `paths` | 🐌 Can be slow | Better imports |

---

## Project References

Split large projects into smaller compilable units.

### Monorepo Structure

```
monorepo/
├── tsconfig.json (root)
├── packages/
│   ├── shared/
│   │   ├── tsconfig.json
│   │   └── src/
│   ├── api/
│   │   ├── tsconfig.json
│   │   └── src/
│   └── web/
│       ├── tsconfig.json
│       └── src/
```

### Root tsconfig.json

```json
{
  "files": [],
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/api" },
    { "path": "./packages/web" }
  ]
}
```

### Package tsconfig.json (shared)

```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### Package tsconfig.json (api - depends on shared)

```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [
    { "path": "../shared" }
  ],
  "include": ["src/**/*"]
}
```

### Building with Project References

```bash
# Build all projects
tsc --build

# Build specific project
tsc --build packages/api

# Clean build
tsc --build --clean

# Force rebuild
tsc --build --force

# Watch mode
tsc --build --watch
```

### Benefits

- ✅ **Faster incremental builds**: Only rebuild changed projects
- ✅ **Parallel compilation**: Build independent projects simultaneously
- ✅ **Better editor performance**: IDE only type-checks affected files
- ✅ **Clear dependencies**: Explicit project boundaries

---

## Incremental Compilation

### Enable Incremental Mode

```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo"
  }
}
```

### How It Works

1. First compilation creates `.tsbuildinfo` file
2. Subsequent compilations:
   - Read .tsbuildinfo
   - Compare file hashes
   - Only reprocess changed files
   - Update .tsbuildinfo

### Performance Gain

```bash
# First build
time tsc
# real    0m15.234s

# Incremental build (no changes)
time tsc
# real    0m2.145s

# Incremental build (1 file changed)
time tsc
# real    0m3.892s
```

### Best Practices

```json
{
  "compilerOptions": {
    "incremental": true,
    // Store .tsbuildinfo outside src
    "tsBuildInfoFile": "./node_modules/.cache/tsc/.tsbuildinfo"
  }
}
```

---

## Skip Lib Check

### What is skipLibCheck?

Skips type-checking of `.d.ts` files in `node_modules`.

### Before

```bash
# Type-checking node_modules
tsc
# 142 files type-checked
# Time: 18.5s
```

### After

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

```bash
# Skip node_modules type-checking
tsc
# 45 files type-checked
# Time: 6.2s
```

### Trade-offs

✅ **Pros:**
- Much faster compilation
- Avoids errors in third-party types
- Recommended for most projects

❌ **Cons:**
- May miss type errors in dependencies
- Could hide breaking changes in @types

### When to Use

```typescript
// ✅ Use skipLibCheck: true when:
// - You trust your dependencies
// - You have good test coverage
// - Fast iteration is important
// - Working on application code

// ❌ Don't skip when:
// - Building a library
// - Need to catch all type errors
// - First-time dependency updates
```

---

## Profiling Compilation

### Using --generateTrace

```bash
# Generate trace file
tsc --generateTrace trace

# Analyze with chrome://tracing
# Open Chrome -> chrome://tracing
# Load trace/trace.json
```

### Trace Output

```
trace/
├── trace.json       # Main trace file
├── types.json       # Type instantiation info
└── legend.json      # Legend for trace
```

### What to Look For

1. **Long-running files**: Files taking >1s to type-check
2. **Type instantiation depth**: Complex generic types
3. **Module resolution**: Slow import resolution
4. **Plugin overhead**: TS plugins slowing down

### Example Analysis

```bash
# Generate trace
tsc --generateTrace trace

# Use built-in analyzer
npx analyze-trace trace
```

Output:
```
Top 10 slowest files:
1. src/types/api.ts (3.2s)
2. src/utils/helpers.ts (2.1s)
3. src/components/Table.tsx (1.8s)

Recommendations:
- Split src/types/api.ts into smaller files
- Simplify generic types in helpers.ts
- Consider skipLibCheck for faster builds
```

---

## Type-Checking Performance

### Slow Type Patterns

```typescript
// ❌ Bad: Deep recursive type
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

// ✅ Good: Limit recursion depth
type DeepPartial<T, Depth extends number = 5> =
  Depth extends 0
    ? T
    : {
        [P in keyof T]?: T[P] extends object
          ? DeepPartial<T[P], Prev<Depth>>
          : T[P];
      };

// ❌ Bad: Excessive union types
type Status =
  | 'pending' | 'processing' | 'completed' | 'failed'
  | 'cancelled' | 'expired' | 'archived' | 'deleted'
  // ... 50 more statuses

// ✅ Good: Use enums or const objects
enum Status {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  // ...
}

// ❌ Bad: Complex conditional types
type ComplexMapping<T> =
  T extends string ? StringHandler<T> :
  T extends number ? NumberHandler<T> :
  T extends boolean ? BooleanHandler<T> :
  T extends Array<infer U> ? ArrayHandler<U> :
  T extends object ? ObjectHandler<T> :
  never;

// ✅ Good: Simplify or split
type StringMapping<T extends string> = StringHandler<T>;
type NumberMapping<T extends number> = NumberHandler<T>;
// Use specific types instead of one complex type
```

### Optimize Generic Constraints

```typescript
// ❌ Bad: Overly complex constraint
function process<T extends { id: string } & Record<string, unknown>>(item: T): T {
  return item;
}

// ✅ Good: Simpler constraint
function process<T extends { id: string }>(item: T): T {
  return item;
}

// ❌ Bad: Excessive type manipulation
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

// ✅ Good: Use built-in types when possible
type Config = Readonly<{
  api: Readonly<{
    url: string;
    timeout: number;
  }>;
}>;
```

---

## Build Tool Integration

### Vite (Recommended)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Don't use tsc for type-checking during build
  build: {
    // esbuild is much faster than tsc
    // Run tsc separately in CI
  },

  // Type-check in separate process
  esbuild: {
    // No type-checking, just transpilation
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});
```

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "type-check": "tsc --noEmit"
  }
}
```

### ts-node (Development)

```bash
# Slow: Full type-checking
ts-node src/index.ts

# Fast: Transpile only
ts-node --transpile-only src/index.ts

# Faster: Use swc
npm install -D @swc/core @swc/register
node --require @swc/register src/index.ts
```

### tsx (Alternative to ts-node)

```bash
npm install -D tsx

# Much faster than ts-node
tsx src/index.ts

# Watch mode
tsx watch src/index.ts
```

---

## CI/CD Optimization

### Parallel Type-Checking

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        project: [packages/shared, packages/api, packages/web]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: tsc --build ${{ matrix.project }} --noEmit
```

### Cache .tsbuildinfo

```yaml
- name: Cache TypeScript build info
  uses: actions/cache@v3
  with:
    path: |
      **/.tsbuildinfo
      **/node_modules/.cache
    key: ${{ runner.os }}-tsc-${{ hashFiles('**/tsconfig.json') }}
```

---

## Best Practices

### 1. Use Project References for Large Codebases

```typescript
// ✅ Good: Split into multiple projects
monorepo/
├── packages/core/
├── packages/utils/
└── packages/app/  // depends on core, utils
```

### 2. Optimize tsconfig.json

```json
{
  "compilerOptions": {
    "incremental": true,
    "skipLibCheck": true,
    "noEmit": true,

    // Remove if not needed
    "declaration": false,
    "declarationMap": false,
    "sourceMap": false
  },

  "exclude": [
    "node_modules",
    "**/*.spec.ts",
    "**/__tests__/**"
  ]
}
```

### 3. Separate Type-Checking from Build

```json
{
  "scripts": {
    "dev": "vite",  // No type-checking
    "build": "tsc --noEmit && vite build",
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch"
  }
}
```

### 4. Profile Regularly

```bash
# Before optimization
time tsc --noEmit
# 25.3s

# After optimization
time tsc --noEmit
# 8.1s
```

---

## Troubleshooting

### Problem: Slow Compilation

**Diagnosis:**
```bash
tsc --generateTrace trace
npx analyze-trace trace
```

**Solutions:**
1. Enable `skipLibCheck`
2. Use project references
3. Simplify complex types
4. Update TypeScript version

### Problem: Out of Memory

**Diagnosis:**
```bash
tsc --extendedDiagnostics
```

**Solutions:**
```bash
# Increase Node.js memory
NODE_OPTIONS=--max_old_space_size=8192 tsc

# Split into smaller projects
# Use project references
```

### Problem: Incremental Build Not Working

**Check:**
```bash
# Verify .tsbuildinfo is created
ls -la .tsbuildinfo

# Check tsconfig.json
grep -A 2 "incremental" tsconfig.json
```

**Fix:**
```json
{
  "compilerOptions": {
    "incremental": true,
    "composite": true  // Required for project references
  }
}
```

---

## Benchmarks

### Real-World Example

**Project:** Medium-sized app (500 files, 50k LOC)

| Configuration | First Build | Incremental | File Watch |
|---------------|-------------|-------------|------------|
| Default | 18.2s | 15.1s | 2.3s |
| + skipLibCheck | 12.5s | 9.8s | 1.9s |
| + incremental | 12.3s | 3.2s | 1.1s |
| + Project refs | 11.1s | 2.1s | 0.8s |
| **Optimized** | **11.1s** | **2.1s** | **0.8s** |

**Improvement:** 39% faster first build, 86% faster incremental

---

## Next Steps

- [Runtime Performance](../02-runtime-performance/README.md) - Optimize execution speed
- [Bundle Optimization](../03-bundle-optimization/README.md) - Reduce bundle size
- [Profiling](../04-profiling-benchmarking/README.md) - Measure performance

---

**Remember**: Measure first, optimize second. Use `--generateTrace` to find bottlenecks!
