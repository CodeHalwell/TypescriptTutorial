# Runtime Performance Optimization

Optimize JavaScript execution speed and memory usage in TypeScript applications.

## Table of Contents

- [V8 Engine Optimization](#v8-engine-optimization)
- [Event Loop Performance](#event-loop-performance)
- [Memory Management](#memory-management)
- [Async Patterns](#async-patterns)
- [Best Practices](#best-practices)

---

## V8 Engine Optimization

### Hidden Classes

```typescript
// ✅ Good: Consistent object shape
class Point {
  constructor(
    public x: number,
    public y: number
  ) {}
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);
// Same hidden class = faster property access

// ❌ Bad: Dynamic property addition
const p3: any = {};
p3.x = 1; // Hidden class change
p3.y = 2; // Hidden class change again
```

### Inline Caching

```typescript
// ✅ Good: Monomorphic (same type)
function add(a: number, b: number): number {
  return a + b;
}

// V8 optimizes after seeing same types

// ❌ Bad: Polymorphic (different types)
function addAny(a: any, b: any): any {
  return a + b;
}

addAny(1, 2);       // number + number
addAny("a", "b");   // string + string
// V8 cannot optimize effectively
```

### Array Performance

```typescript
// ✅ Good: Packed arrays (no holes)
const arr = [1, 2, 3, 4, 5];

// ❌ Bad: Holey arrays
const holey = [];
holey[0] = 1;
holey[2] = 3; // Hole at index 1
// 30-50% slower access

// ✅ Good: Pre-allocate size
const preallocated = new Array(1000);
for (let i = 0; i < 1000; i++) {
  preallocated[i] = i;
}

// ❌ Bad: Growing array
const growing = [];
for (let i = 0; i < 1000; i++) {
  growing.push(i); // Multiple reallocations
}
```

---

## Event Loop Performance

### Blocking Operations

```typescript
// ❌ Bad: Blocks event loop
function processLargeData(data: number[]): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
  }
  return sum;
}

// ✅ Good: Chunk processing
async function processLargeDataAsync(
  data: number[],
  chunkSize: number = 10000
): Promise<number> {
  let sum = 0;

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);

    sum += chunk.reduce((acc, val) => acc + val, 0);

    // Yield to event loop
    await new Promise(resolve => setImmediate(resolve));
  }

  return sum;
}
```

### setImmediate vs setTimeout

```typescript
// ✅ Good: setImmediate for I/O callbacks
setImmediate(() => {
  console.log('After I/O');
});

// ❌ Bad: setTimeout(0) is slower
setTimeout(() => {
  console.log('After delay');
}, 0);

// ✅ Good: process.nextTick for immediate execution
process.nextTick(() => {
  console.log('Before I/O');
});
```

---

## Memory Management

### Memory Leaks Prevention

```typescript
// ❌ Bad: Memory leak with closure
class DataProcessor {
  private cache = new Map<string, any>();

  process(id: string, data: any) {
    this.cache.set(id, data); // Never cleared!
  }
}

// ✅ Good: LRU cache with size limit
import LRU from 'lru-cache';

class DataProcessor {
  private cache = new LRU({
    max: 500,
    maxAge: 1000 * 60 * 5 // 5 minutes
  });

  process(id: string, data: any) {
    this.cache.set(id, data);
  }
}

// ✅ Good: WeakMap for object references
class MetadataStore {
  private metadata = new WeakMap<object, any>();

  setMetadata(obj: object, meta: any) {
    this.metadata.set(obj, meta);
    // Garbage collected when obj is no longer referenced
  }
}
```

### Object Pooling

```typescript
// ✅ Good: Reuse objects
class ObjectPool<T> {
  private available: T[] = [];

  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    size: number
  ) {
    for (let i = 0; i < size; i++) {
      this.available.push(this.factory());
    }
  }

  acquire(): T {
    return this.available.pop() ?? this.factory();
  }

  release(obj: T): void {
    this.reset(obj);
    this.available.push(obj);
  }
}

// Usage
const bufferPool = new ObjectPool(
  () => Buffer.alloc(1024),
  (buf) => buf.fill(0),
  10
);

const buffer = bufferPool.acquire();
// Use buffer
bufferPool.release(buffer);
```

---

## Async Patterns

### Promise.all vs Sequential

```typescript
// ✅ Good: Parallel execution
async function fetchAllUsers(ids: string[]): Promise<User[]> {
  const promises = ids.map(id => fetchUser(id));
  return await Promise.all(promises);
}

// ❌ Bad: Sequential execution
async function fetchAllUsersSequential(ids: string[]): Promise<User[]> {
  const users = [];
  for (const id of ids) {
    users.push(await fetchUser(id)); // Waits for each
  }
  return users;
}

// ✅ Good: Batch with concurrency limit
async function fetchWithLimit(
  ids: string[],
  limit: number = 5
): Promise<User[]> {
  const results: User[] = [];

  for (let i = 0; i < ids.length; i += limit) {
    const batch = ids.slice(i, i + limit);
    const batchResults = await Promise.all(batch.map(fetchUser));
    results.push(...batchResults);
  }

  return results;
}
```

### Avoid Async/Await Overhead

```typescript
// ✅ Good: Return promise directly
function getData(id: string): Promise<Data> {
  return database.get(id);
}

// ❌ Bad: Unnecessary async/await
async function getData(id: string): Promise<Data> {
  return await database.get(id);
}

// ✅ Good: Use async/await when needed
async function processData(id: string): Promise<Result> {
  const data = await database.get(id);
  const processed = transform(data);
  return processed;
}
```

---

## Best Practices

### 1. Optimize Loops

```typescript
// ✅ Good: Cache length
for (let i = 0, len = arr.length; i < len; i++) {
  process(arr[i]);
}

// ❌ Bad: Access length each iteration
for (let i = 0; i < arr.length; i++) {
  process(arr[i]);
}

// ✅ Good: for...of for arrays
for (const item of arr) {
  process(item);
}
```

### 2. String Concatenation

```typescript
// ✅ Good: Template literals or array join
const str = items.map(item => item.name).join(', ');

// ❌ Bad: String concatenation in loop
let str = '';
for (const item of items) {
  str += item.name + ', ';
}
```

### 3. Avoid `try/catch` in Hot Paths

```typescript
// ✅ Good: Check before operation
function parseJSON(str: string): object | null {
  if (!str || typeof str !== 'string') {
    return null;
  }

  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// ❌ Bad: try/catch for control flow
function parseJSON(str: string): object | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
```

---

## Benchmarking

### Using Benchmark.js

```typescript
import Benchmark from 'benchmark';

const suite = new Benchmark.Suite();

suite
  .add('Array#forEach', () => {
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
  })
  .add('for...of', () => {
    const arr = [1, 2, 3, 4, 5];
    let sum = 0;
    for (const n of arr) {
      sum += n;
    }
  })
  .on('cycle', (event: any) => {
    console.log(String(event.target));
  })
  .on('complete', function(this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
```

---

## Next Steps

- [Bundle Optimization](../03-bundle-optimization/README.md) - Reduce bundle size
- [Profiling](../04-profiling-benchmarking/README.md) - Measure performance

**Remember**: Optimize only after profiling. Premature optimization wastes time!
