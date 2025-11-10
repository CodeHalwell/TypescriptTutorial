# Basic Types

TypeScript's type system starts with the types you know from JavaScript, then adds powerful new capabilities.

## Table of Contents

- [Primitive Types](#primitive-types)
- [Arrays](#arrays)
- [Tuples](#tuples)
- [Enums](#enums)
- [Special Types](#special-types)
- [Type Inference](#type-inference)
- [Best Practices](#best-practices)

---

## Primitive Types

### String

Represents text values:

```typescript
let firstName: string = "Alice";
let lastName: string = 'Bob';
let message: string = `Hello, ${firstName}!`; // Template literal

// Type error
firstName = 42; // ❌ Type 'number' is not assignable to type 'string'
```

### Number

All numbers in TypeScript/JavaScript are floating point:

```typescript
let decimal: number = 6;
let hex: number = 0xf00d;
let binary: number = 0b1010;
let octal: number = 0o744;
let big: number = 1_000_000; // Numeric separator (ES2021)

// Type error
decimal = "6"; // ❌ Type 'string' is not assignable to type 'number'
```

### Boolean

True or false values:

```typescript
let isDone: boolean = false;
let isActive: boolean = true;

// Common mistake
let isInvalidBoolean: boolean = 1; // ❌ Type 'number' is not assignable to type 'boolean'

// Correct: explicit boolean conversion
let isValid: boolean = Boolean(1); // ✅
```

### Symbol

Unique immutable primitive values:

```typescript
const sym1: symbol = Symbol("key");
const sym2: symbol = Symbol("key");

console.log(sym1 === sym2); // false - each symbol is unique

// Common use: object property keys
const SPECIAL_KEY = Symbol("special");
const obj = {
  [SPECIAL_KEY]: "value"
};
```

### BigInt

Arbitrary-precision integers (ES2020+):

```typescript
let big1: bigint = 100n;
let big2: bigint = BigInt(100);

// Cannot mix with regular numbers
let result = big1 + 100; // ❌ Cannot mix BigInt and number
let result = big1 + 100n; // ✅
```

---

## Arrays

TypeScript provides two ways to type arrays:

### Array Type Syntax

```typescript
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["Alice", "Bob", "Charlie"];
let flags: boolean[] = [true, false, true];

// Type errors
numbers.push("6"); // ❌ Argument of type 'string' is not assignable to parameter of type 'number'
names[0] = 42; // ❌ Type 'number' is not assignable to type 'string'
```

### Generic Array Syntax

```typescript
let numbers: Array<number> = [1, 2, 3, 4, 5];
let names: Array<string> = ["Alice", "Bob", "Charlie"];
let flags: Array<boolean> = [true, false, true];
```

**Which to use?**
- `number[]` is more concise and commonly used
- `Array<number>` is useful for complex generic scenarios

### Multi-dimensional Arrays

```typescript
// 2D array
let matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

// Array of string arrays
let groups: string[][] = [
  ["Alice", "Bob"],
  ["Charlie", "David"]
];

// 3D array
let cube: number[][][] = [
  [[1, 2], [3, 4]],
  [[5, 6], [7, 8]]
];
```

### Array Methods with Type Safety

```typescript
const numbers: number[] = [1, 2, 3, 4, 5];

// map - transforms each element
const doubled: number[] = numbers.map(n => n * 2);
// [2, 4, 6, 8, 10]

// filter - removes elements
const evens: number[] = numbers.filter(n => n % 2 === 0);
// [2, 4]

// reduce - aggregates values
const sum: number = numbers.reduce((acc, n) => acc + n, 0);
// 15

// Type error
const invalid = numbers.map(n => n.toUpperCase());
// ❌ Property 'toUpperCase' does not exist on type 'number'
```

---

## Tuples

**Tuples** are arrays with fixed length and known types at each position:

### Basic Tuples

```typescript
// Tuple: [string, number]
let user: [string, number];
user = ["Alice", 25]; // ✅
user = [25, "Alice"]; // ❌ Type 'number' is not assignable to type 'string'
user = ["Alice"]; // ❌ Source has 1 element(s) but target requires 2

// Accessing elements
let name: string = user[0]; // ✅
let age: number = user[1]; // ✅
let invalid = user[2]; // ⚠️ Tuple type '[string, number]' of length '2' has no element at index '2'
```

### Named Tuples

TypeScript 4.0+ supports labeled tuple elements:

```typescript
// More readable tuple definition
type User = [name: string, age: number];

let user: User = ["Alice", 25];

// Labels are for documentation only, not runtime
let userName = user[0]; // Still accessed by index
```

### Optional Tuple Elements

```typescript
// Optional element at the end
type Response = [success: boolean, data?: string];

let response1: Response = [true, "Success!"];
let response2: Response = [false]; // ✅ data is optional
```

### Rest Elements in Tuples

```typescript
// Fixed start, variable end
type StringNumberBooleans = [string, number, ...boolean[]];

let tuple1: StringNumberBooleans = ["hello", 1];
let tuple2: StringNumberBooleans = ["world", 2, true];
let tuple3: StringNumberBooleans = ["foo", 3, true, false, true];
```

### Practical Use Cases

```typescript
// Coordinates
type Point2D = [x: number, y: number];
type Point3D = [x: number, y: number, z: number];

const point: Point2D = [10, 20];

// RGB color
type RGB = [red: number, green: number, blue: number];
const color: RGB = [255, 128, 0];

// API response
type ApiResponse<T> = [data: T, error: null] | [data: null, error: Error];

function fetchData(): ApiResponse<string> {
  if (Math.random() > 0.5) {
    return ["Success data", null];
  } else {
    return [null, new Error("Failed")];
  }
}

const [data, error] = fetchData();
if (error) {
  console.error(error);
} else {
  console.log(data);
}
```

---

## Enums

Enums allow you to define a set of named constants:

### Numeric Enums

```typescript
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right  // 3
}

let move: Direction = Direction.Up;
console.log(move); // 0

// Custom starting value
enum Status {
  Pending = 1,
  Active,   // 2
  Inactive  // 3
}

// Custom values
enum HttpStatus {
  OK = 200,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  ServerError = 500
}

let status: HttpStatus = HttpStatus.OK;
console.log(status); // 200
```

### String Enums

More descriptive and debuggable:

```typescript
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT"
}

let move: Direction = Direction.Up;
console.log(move); // "UP"

// No automatic incrementing - each member must be initialized
enum LogLevel {
  Error = "ERROR",
  Warning = "WARNING",
  Info = "INFO",
  Debug = "DEBUG"
}
```

### Heterogeneous Enums

Mixed string and numeric values (not recommended):

```typescript
enum Mixed {
  No = 0,
  Yes = "YES"
}
```

### Const Enums

Optimized enums that are inlined at compile time:

```typescript
const enum Direction {
  Up,
  Down,
  Left,
  Right
}

let move = Direction.Up;

// Compiled JavaScript:
// let move = 0; (inlined, no enum object created)
```

**Use const enums when**:
- You don't need reverse mapping
- You want smaller bundle size
- Performance is critical

### Enum vs Union of Strings

```typescript
// Enum
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE"
}

// Union type (alternative)
type Color = "RED" | "GREEN" | "BLUE";

// Pros of enums:
// - Autocomplete in IDE
// - Namespace (Color.Red vs just "RED")
// - Can iterate values (with non-const enums)

// Pros of unions:
// - No runtime code
// - More flexible
// - Better with literal types
```

---

## Special Types

### any

Disables type checking (use sparingly!):

```typescript
let value: any = 42;
value = "hello";
value = true;
value.foo.bar.baz; // No error, but might crash at runtime!

// Valid use cases:
// 1. Migrating from JavaScript
// 2. Working with truly dynamic data
// 3. Interfacing with untyped libraries (temporarily)
```

### unknown

Type-safe alternative to `any`:

```typescript
let value: unknown = 42;
value = "hello";
value = true;

// Must narrow type before use
value.toUpperCase(); // ❌ Object is of type 'unknown'

// Type narrowing required
if (typeof value === "string") {
  console.log(value.toUpperCase()); // ✅
}
```

**Prefer `unknown` over `any`** for better type safety!

### void

Represents absence of a value (typically function returns):

```typescript
function logMessage(message: string): void {
  console.log(message);
  // No return statement
}

// void return type means "ignore the return value"
function doSomething(): void {
  return; // ✅
  return undefined; // ✅
  return null; // ❌ Type 'null' is not assignable to type 'void'
}
```

### never

Represents values that never occur:

```typescript
// Function that never returns
function throwError(message: string): never {
  throw new Error(message);
  // No return statement, execution never reaches end
}

// Infinite loop
function infiniteLoop(): never {
  while (true) {
    // Never exits
  }
}

// Exhaustiveness checking
type Shape = Circle | Square;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.size ** 2;
    default:
      // If all cases are handled, shape is type 'never' here
      const exhaustiveCheck: never = shape;
      return exhaustiveCheck;
  }
}
```

### null and undefined

```typescript
let u: undefined = undefined;
let n: null = null;

// By default, null and undefined are subtypes of all types
let num: number = null; // ✅ (without strictNullChecks)

// With strictNullChecks (recommended):
let num: number = null; // ❌ Type 'null' is not assignable to type 'number'
let num: number | null = null; // ✅
```

### object

Represents non-primitive types:

```typescript
let obj: object = { name: "Alice" };
obj = {}; // ✅
obj = []; // ✅ (arrays are objects)
obj = () => {}; // ✅ (functions are objects)

obj = 42; // ❌
obj = "hello"; // ❌
obj = true; // ❌

// Usually better to use specific object type
let user: { name: string; age: number } = { name: "Alice", age: 25 };
```

---

## Type Inference

TypeScript can infer types automatically:

### Variable Inference

```typescript
let message = "Hello"; // Inferred as string
let count = 42; // Inferred as number
let isActive = true; // Inferred as boolean

// Inference from complex expressions
let doubled = count * 2; // Inferred as number
let greeting = `${message}, world!`; // Inferred as string
```

### Best Type Inference

```typescript
// Inferred as (number | string)[]
let mixed = [1, "two", 3];

// Inferred as number[]
let numbers = [1, 2, 3];

// Inferred as string[]
let names = ["Alice", "Bob"];
```

### When to Annotate Types

```typescript
// ✅ Good: inference works well
let count = 42;
const names = ["Alice", "Bob"];

// ✅ Good: annotation for clarity
let userId: string; // Declaration without initialization
userId = "user-123";

// ✅ Good: annotation for specific type
let status: "active" | "inactive" = "active";

// ❌ Unnecessary: redundant annotation
let count: number = 42; // Type is obvious

// ✅ Good: function parameters always need types
function greet(name: string) {
  return `Hello, ${name}!`; // Return type inferred as string
}
```

---

## Best Practices

### 1. Enable Strict Mode

In `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

This enables:
- `strictNullChecks`: null/undefined must be explicitly handled
- `noImplicitAny`: Variables must have types (no implicit any)
- And more strict checks

### 2. Prefer Specific Types Over any

```typescript
// ❌ Avoid
function process(data: any) {
  return data.value;
}

// ✅ Better
function process(data: unknown) {
  if (typeof data === "object" && data !== null && "value" in data) {
    return (data as { value: unknown }).value;
  }
}

// ✅ Best
interface Data {
  value: string;
}
function process(data: Data) {
  return data.value;
}
```

### 3. Use const for Constants

```typescript
// ✅ Inferred as literal type "active"
const status = "active";

// ⚠️ Inferred as string (wider type)
let status = "active";
```

### 4. Leverage Type Inference

```typescript
// ❌ Redundant
const numbers: number[] = [1, 2, 3];

// ✅ Concise and clear
const numbers = [1, 2, 3];

// ✅ Annotate when inference is insufficient
const numbers: number[] = [];
```

### 5. Choose Arrays vs Tuples Appropriately

```typescript
// Array: homogeneous, variable length
const scores: number[] = [95, 87, 92, 88];

// Tuple: heterogeneous, fixed length
const user: [string, number] = ["Alice", 25];
```

---

## Quick Reference

```typescript
// Primitives
let str: string = "hello";
let num: number = 42;
let bool: boolean = true;
let sym: symbol = Symbol("key");
let big: bigint = 100n;

// Arrays
let nums: number[] = [1, 2, 3];
let strs: Array<string> = ["a", "b"];

// Tuples
let tuple: [string, number] = ["Alice", 25];

// Enums
enum Color { Red, Green, Blue }
let c: Color = Color.Red;

// Special
let any: any = "anything";
let unknown: unknown = "unknown";
let nothing: void = undefined;
let never: never = (() => { throw new Error(); })();
let nul: null = null;
let undef: undefined = undefined;
```

---

## Next Steps

Continue to [03. Functions](../03-functions/README.md) to learn how to type functions effectively.

---

**Practice**: Try the [Basic Types Exercises](../exercises/01-basic-types-exercises.md) to reinforce your understanding!
