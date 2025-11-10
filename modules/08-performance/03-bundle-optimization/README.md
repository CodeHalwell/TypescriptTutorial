# Bundle Optimization

Reduce bundle size and improve load times for web applications.

## Table of Contents

- [Bundle Analysis](#bundle-analysis)
- [Tree-Shaking](#tree-shaking)
- [Code Splitting](#code-splitting)
- [Dynamic Imports](#dynamic-imports)
- [Compression](#compression)
- [Best Practices](#best-practices)

---

## Bundle Analysis

### Webpack Bundle Analyzer

```bash
npm install --save-dev webpack-bundle-analyzer
```

```typescript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
};
```

### Vite Bundle Analyzer

```bash
npm install --save-dev rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
});
```

---

## Tree-Shaking

### Enable Tree-Shaking

```json
// package.json
{
  "sideEffects": false
}

// or specify files with side effects
{
  "sideEffects": ["*.css", "*.scss"]
}
```

### Write Tree-Shakeable Code

```typescript
// ✅ Good: Named exports
export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

// ❌ Bad: Default export with object
export default {
  add: (a: number, b: number) => a + b,
  multiply: (a: number, b: number) => a * b
};

// ✅ Good: Import only what you need
import { add } from './math';

// ❌ Bad: Import everything
import * as math from './math';
```

### Library Optimization

```typescript
// ❌ Bad: Import entire library
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ Good: Import specific function
import debounce from 'lodash/debounce';
debounce(fn, 300);

// ❌ Bad: Import all of date-fns
import { format, parseISO } from 'date-fns';

// ✅ Good: Use sub-imports
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
```

---

## Code Splitting

### Route-Based Splitting

```typescript
// React with React.lazy
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### Component-Based Splitting

```typescript
// ✅ Good: Lazy load heavy components
const HeavyChart = lazy(() => import('./components/HeavyChart'));

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading chart...</div>}>
        <HeavyChart data={data} />
      </Suspense>
    </div>
  );
}
```

### Vendor Chunking

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React vendors
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI libraries
          'ui-vendor': ['@mui/material', '@emotion/react'],

          // Utilities
          'utils-vendor': ['lodash', 'date-fns', 'zod']
        }
      }
    }
  }
});
```

---

## Dynamic Imports

### Conditional Loading

```typescript
// ✅ Good: Load only when needed
async function loadAnalytics() {
  if (process.env.NODE_ENV === 'production') {
    const analytics = await import('./analytics');
    analytics.init();
  }
}

// ✅ Good: Feature-based loading
async function handleExport(format: 'pdf' | 'excel') {
  if (format === 'pdf') {
    const { exportPDF } = await import('./exporters/pdf');
    return exportPDF(data);
  } else {
    const { exportExcel } = await import('./exporters/excel');
    return exportExcel(data);
  }
}
```

### Prefetching

```typescript
// Prefetch on hover
function ProductCard({ product }: Props) {
  const handleMouseEnter = () => {
    // Prefetch product details component
    import('./ProductDetails');
  };

  return (
    <Link
      to={`/product/${product.id}`}
      onMouseEnter={handleMouseEnter}
    >
      {product.name}
    </Link>
  );
}
```

---

## Compression

### Gzip & Brotli

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ]
});
```

### Server Configuration

```nginx
# nginx.conf
http {
  gzip on;
  gzip_types text/plain text/css application/json application/javascript;
  gzip_min_length 1000;

  brotli on;
  brotli_types text/plain text/css application/json application/javascript;
}
```

---

## Best Practices

### 1. Optimize Dependencies

```bash
# Analyze package size before installing
npx cost-of-modules
npx bundlephobia <package-name>

# Find lighter alternatives
# moment.js (71kb) → date-fns (13kb) → dayjs (2kb)
```

### 2. Remove Unused Code

```typescript
// ✅ Good: Remove console logs in production
if (process.env.NODE_ENV !== 'production') {
  console.log('Debug info');
}

// Use terser to remove dead code
// vite.config.ts
export default defineConfig({
  build: {
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

### 3. Externalize Dependencies

```typescript
// vite.config.ts - Don't bundle React in library
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'react-dom']
    }
  }
});
```

---

## Performance Budget

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 500, // 500kb

    rollupOptions: {
      output: {
        manualChunks(id) {
          // Warn if vendor chunk > 300kb
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
```

---

## Results

### Before Optimization
```
dist/
├── index.html (2kb)
├── index-abc123.js (850kb)
└── index-abc123.css (45kb)

Total: 897kb
Gzipped: 285kb
```

### After Optimization
```
dist/
├── index.html (2kb)
├── index-abc123.js (120kb)
├── vendor-react-def456.js (145kb)
├── vendor-ui-ghi789.js (95kb)
├── dashboard-jkl012.js (80kb - lazy)
└── index-abc123.css (12kb)

Initial Load: 277kb
Total: 454kb
Gzipped: 95kb

Improvement: 50% smaller initial load
```

---

## Next Steps

- [Profiling](../04-profiling-benchmarking/README.md) - Measure performance
- [Production Monitoring](../05-production-monitoring/README.md) - Track metrics

**Remember**: Analyze before optimizing. Use bundle analyzer to find wins!
