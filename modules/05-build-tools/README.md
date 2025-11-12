# Module 5: Build Tools & Ecosystem

Master the TypeScript ecosystem including bundlers, linters, testing frameworks, and publishing workflows.

## 🎯 Learning Objectives

By the end of this module, you will be able to:

- Configure modern bundlers (Vite, Webpack, esbuild, Rollup) for TypeScript
- Set up ESLint and Prettier for code quality
- Configure testing frameworks (Jest, Vitest) with TypeScript
- Implement pre-commit hooks and code quality gates
- Manage monorepos with Turborepo or Nx
- Publish type-safe npm packages
- Optimize build performance and output size

## ⏱️ Estimated Time

**2 weeks** (assuming 5-10 hours per week)

## 📚 Module Structure

### [01. Bundlers](./bundlers/README.md)
- Vite configuration
- Webpack with TypeScript
- esbuild for fast builds
- Rollup for libraries
- Comparing bundlers
- Production optimization

### [02. Linting](./linting/README.md)
- ESLint setup for TypeScript
- TypeScript ESLint rules
- Prettier configuration
- Integrating ESLint and Prettier
- Custom rules
- IDE integration

### [03. Testing Setup](./testing-setup/README.md)
- Jest with TypeScript
- Vitest configuration
- ts-jest setup
- Coverage reporting
- Testing best practices
- Mocking with TypeScript

### [04. Code Quality](./code-quality/README.md)
- Husky for Git hooks
- lint-staged configuration
- commitlint for commit messages
- Pre-commit checks
- Pre-push validation
- CI/CD integration

### [05. Monorepos](./monorepos/README.md)
- Monorepo advantages
- Turborepo setup
- Nx configuration
- Workspace dependencies
- Shared configurations
- Build caching

### [06. Package Publishing](./package-publishing/README.md)
- Preparing packages for npm
- Declaration file generation
- Package.json configuration
- Versioning strategies
- Publishing workflow
- Scoped packages
- npm vs private registries

## 🔑 Key Configurations

### Vite with TypeScript

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2015',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

### ESLint + Prettier

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
```

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Husky + lint-staged

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npm run type-check
```

### Turborepo

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false
    }
  }
}
```

### Library Package.json

```json
{
  "name": "@myorg/my-library",
  "version": "1.0.0",
  "description": "My TypeScript library",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "test": "vitest",
    "lint": "eslint src --ext .ts",
    "prepublishOnly": "npm run build && npm test"
  },
  "keywords": ["typescript", "library"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  },
  "peerDependencies": {
    "typescript": ">=4.5.0"
  }
}
```

## 🛠️ Essential Tools

### Bundlers Comparison

| Tool | Best For | Speed | Config |
|------|----------|-------|--------|
| **Vite** | Apps, HMR | ⚡⚡⚡ | Simple |
| **Webpack** | Complex apps | ⚡ | Complex |
| **esbuild** | Fast builds | ⚡⚡⚡ | Minimal |
| **Rollup** | Libraries | ⚡⚡ | Moderate |
| **tsup** | Quick libs | ⚡⚡⚡ | Zero-config |

### Development Tools

```bash
# Essential packages
npm install -D typescript @types/node

# Bundler (choose one)
npm install -D vite
# or
npm install -D webpack webpack-cli ts-loader

# Linting
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier

# Testing
npm install -D vitest @vitest/ui
# or
npm install -D jest ts-jest @types/jest

# Code quality
npm install -D husky lint-staged
npm install -D @commitlint/cli @commitlint/config-conventional

# Building libraries
npm install -D tsup
```

## 📖 Quick Start Guides

### New Vite Project

```bash
# Create project
npm create vite@latest my-app -- --template react-ts

cd my-app
npm install

# Add linting
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier

# Add testing (Vitest comes with Vite)
npm install -D @testing-library/react @testing-library/jest-dom

# Setup git hooks
npm install -D husky lint-staged
npm run prepare
```

### New Library

```bash
# Create directory
mkdir my-library
cd my-library
npm init -y

# Install dependencies
npm install -D typescript tsup
npm install -D vitest @vitest/ui
npm install -D eslint prettier

# Initialize TypeScript
npx tsc --init

# Create source file
mkdir src
echo "export const hello = () => 'Hello, World!';" > src/index.ts

# Build
npx tsup src/index.ts --format cjs,esm --dts
```

## ✅ Best Practices

### 1. Use Strict TypeScript Settings

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 2. Automate Code Quality

- Run linting on pre-commit
- Run tests on pre-push
- Use CI/CD for comprehensive checks
- Enforce coverage thresholds

### 3. Optimize Build Performance

```typescript
// Use project references for large codebases
// tsconfig.json
{
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/utils" }
  ]
}
```

### 4. Version Control

```gitignore
# .gitignore
node_modules/
dist/
build/
*.log
.env
.DS_Store
coverage/
.turbo/
```

## 🚀 Project Setup Checklist

For every new TypeScript project:

- [ ] Initialize with `npm init` or `pnpm init`
- [ ] Install TypeScript: `npm install -D typescript`
- [ ] Configure `tsconfig.json` with strict settings
- [ ] Set up bundler (Vite, Webpack, etc.)
- [ ] Configure ESLint and Prettier
- [ ] Set up testing framework
- [ ] Add Git hooks (Husky, lint-staged)
- [ ] Configure CI/CD pipeline
- [ ] Add README and documentation
- [ ] Set up source maps for debugging

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Webpack TypeScript Guide](https://webpack.js.org/guides/typescript/)
- [ESLint TypeScript](https://typescript-eslint.io/)
- [Jest Documentation](https://jestjs.io/)
- [Turborepo Handbook](https://turbo.build/repo/docs)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

## ✅ Module Completion Checklist

Before moving forward, ensure you can:

- [ ] Set up a TypeScript project with a modern bundler
- [ ] Configure linting and formatting
- [ ] Write and run tests with type safety
- [ ] Set up pre-commit hooks
- [ ] Manage a monorepo (basics)
- [ ] Publish a package to npm
- [ ] Optimize build performance

## 🚀 Next Steps

Once you complete this module:
- [Module 6: Testing Strategies](../06-testing/README.md) - Deep dive into testing
- [Module 9: Real-World Projects](../09-projects/README.md) - Apply these tools
- [Module 10: Production Best Practices](../10-production/README.md) - Deploy with confidence

---

**Ready to master the TypeScript tooling ecosystem?** Let's build production-ready development workflows!

**Questions?** Check the [Troubleshooting Guide](../../resources/troubleshooting.md) or open an issue.
