# Profiling & Benchmarking

Measure performance accurately and identify bottlenecks in TypeScript applications.

## Chrome DevTools Profiling

### CPU Profile

```typescript
// Mark performance sections
performance.mark('start-heavy-operation');

// Heavy operation
for (let i = 0; i < 1000000; i++) {
  // work
}

performance.mark('end-heavy-operation');
performance.measure(
  'heavy-operation',
  'start-heavy-operation',
  'end-heavy-operation'
);

const measure = performance.getEntriesByName('heavy-operation')[0];
console.log(`Duration: ${measure.duration}ms`);
```

### Memory Profile

```typescript
// Check memory usage
if (performance.memory) {
  console.log({
    usedJSHeapSize: performance.memory.usedJSHeapSize / 1024 / 1024,
    totalJSHeapSize: performance.memory.totalJSHeapSize / 1024 / 1024,
    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit / 1024 / 1024
  });
}
```

---

## Node.js Profiling

### Using --inspect

```bash
# Start with inspector
node --inspect src/index.ts

# Or with inspect-brk (pause at start)
node --inspect-brk src/index.ts

# Open Chrome DevTools
# chrome://inspect
```

### CPU Profiling

```bash
# Using clinic.js
npm install -g clinic

# Generate flame graph
clinic flame -- node src/index.ts

# Generate profile
clinic doctor -- node src/index.ts
```

### Using 0x

```bash
npm install -g 0x

# Generate flame graph
0x src/index.ts

# With arguments
0x -- node src/index.ts arg1 arg2
```

---

## Benchmarking

### Benchmark.js

```typescript
import Benchmark from 'benchmark';

const suite = new Benchmark.Suite();

suite
  .add('JSON.stringify', () => {
    JSON.stringify({ name: 'John', age: 30 });
  })
  .add('Manual string building', () => {
    const obj = { name: 'John', age: 30 };
    `{"name":"${obj.name}","age":${obj.age}}`;
  })
  .on('cycle', (event: any) => {
    console.log(String(event.target));
  })
  .on('complete', function(this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
```

### Tinybench (Modern Alternative)

```typescript
import { Bench } from 'tinybench';

const bench = new Bench({ time: 1000 });

bench
  .add('Array.forEach', () => {
    const arr = [1, 2, 3, 4, 5];
    let sum = 0;
    arr.forEach(n => sum += n);
  })
  .add('for loop', () => {
    const arr = [1, 2, 3, 4, 5];
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
  });

await bench.run();

console.table(bench.table());
```

---

## Web Vitals

```typescript
import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

onCLS(console.log);  // Cumulative Layout Shift
onFCP(console.log);  // First Contentful Paint
onFID(console.log);  // First Input Delay
onLCP(console.log);  // Largest Contentful Paint
onTTFB(console.log); // Time to First Byte
```

---

## Performance Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('Performance', () => {
  it('should complete within time limit', async () => {
    const start = Date.now();

    await heavyOperation();

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000); // 1 second
  });

  it('should handle large datasets efficiently', () => {
    const data = Array.from({ length: 100000 }, (_, i) => i);

    const start = performance.now();
    processData(data);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100); // 100ms
  });
});
```

---

## Best Practices

1. **Profile in Production-like Environment**
   - Use production builds
   - Use production data volumes
   - Test on target devices

2. **Measure Multiple Times**
   - Run benchmarks multiple times
   - Calculate average and median
   - Account for JIT warm-up

3. **Focus on Bottlenecks**
   - Profile first, optimize second
   - Target 80/20 rule
   - Measure impact of changes

---

## Next Steps

- [Production Monitoring](../05-production-monitoring/README.md) - Monitor in production

**Remember**: Measure, don't guess. Profile before and after optimization!
