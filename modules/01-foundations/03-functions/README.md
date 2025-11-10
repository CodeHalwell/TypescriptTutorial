# Functions in TypeScript

Learn how to type functions effectively for maximum type safety and clarity.

## Table of Contents

- [Function Type Annotations](#function-type-annotations)
- [Parameter Types](#parameter-types)
- [Return Types](#return-types)
- [Optional and Default Parameters](#optional-and-default-parameters)
- [Rest Parameters](#rest-parameters)
- [Function Type Expressions](#function-type-expressions)
- [Call Signatures](#call-signatures)
- [Function Overloads](#function-overloads)
- [Best Practices](#best-practices)

---

## Function Type Annotations

### Basic Function Syntax

```typescript
// Function declaration
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Function expression
const greet = function(name: string): string {
  return `Hello, ${name}!`;
};

// Arrow function
const greet = (name: string): string => {
  return `Hello, ${name}!`;
};

// Concise arrow function
const greet = (name: string): string => `Hello, ${name}!`;
```

---

## Parameter Types

### Required Parameters

```typescript
function add(a: number, b: number): number {
  return a + b;
}

add(5, 3); // ✅ 8
add(5); // ❌ Expected 2 arguments, but got 1
add(5, 3, 2); // ❌ Expected 2 arguments, but got 3
```

### Type Inference in Contextual Typing

```typescript
// When function is assigned to typed variable, parameters are inferred
const numbers = [1, 2, 3];

// 'n' is inferred as number
numbers.map(n => n * 2);

// Explicit typing (unnecessary but allowed)
numbers.map((n: number) => n * 2);
```

### Object Parameters

```typescript
// Object parameter with inline type
function createUser(config: { name: string; age: number; email: string }) {
  console.log(`Creating user: ${config.name}`);
}

// Better: use interface or type alias
interface UserConfig {
  name: string;
  age: number;
  email: string;
}

function createUser(config: UserConfig) {
  console.log(`Creating user: ${config.name}`);
}

createUser({ name: "Alice", age: 25, email: "alice@example.com" });
```

### Destructured Parameters

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

// Destructuring with types
function greetUser({ name, age }: User): string {
  return `Hello, ${name}! You are ${age} years old.`;
}

// With default values
function greetUser({ name, age = 18 }: User): string {
  return `Hello, ${name}! You are ${age} years old.`;
}
```

---

## Return Types

### Explicit Return Types

```typescript
// Explicit return type
function multiply(a: number, b: number): number {
  return a * b;
}

// Inferred return type (number)
function divide(a: number, b: number) {
  return a / b;
}

// void return type
function logMessage(message: string): void {
  console.log(message);
  // No return statement
}
```

### When to Specify Return Types

```typescript
// ✅ Good: Explicit return type for clarity and safety
function calculateTax(price: number, rate: number): number {
  return price * rate;
}

// ❌ Potential issue: Inference might surprise you
function getUserStatus(user: User) {
  if (user.age >= 18) {
    return "adult"; // Inferred: string | boolean
  }
  return false;
}

// ✅ Better: Explicit return type prevents mistakes
function getUserStatus(user: User): string {
  if (user.age >= 18) {
    return "adult";
  }
  return "minor"; // Must return string
}
```

### Returning Promises

```typescript
// Explicit Promise return type
async function fetchData(): Promise<string> {
  const response = await fetch("/api/data");
  return response.text();
}

// Inferred Promise<number>
async function getNumber() {
  return 42;
}

// Promise with union types
async function fetchUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/user");
    return response.json();
  } catch {
    return null;
  }
}
```

### Never Return Type

```typescript
// Function that never returns
function throwError(message: string): never {
  throw new Error(message);
}

// Function with infinite loop
function infiniteLoop(): never {
  while (true) {
    console.log("Running forever...");
  }
}
```

---

## Optional and Default Parameters

### Optional Parameters

```typescript
// Optional parameter (must come after required parameters)
function greet(name: string, greeting?: string): string {
  if (greeting) {
    return `${greeting}, ${name}!`;
  }
  return `Hello, ${name}!`;
}

greet("Alice"); // "Hello, Alice!"
greet("Bob", "Hi"); // "Hi, Bob!"

// Type of optional parameter is string | undefined
function process(value?: string) {
  console.log(value?.toUpperCase()); // Safe navigation
}
```

### Default Parameters

```typescript
// Default parameter value
function greet(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}

greet("Alice"); // "Hello, Alice!"
greet("Bob", "Hi"); // "Hi, Bob!"

// Default parameter infers type
function multiply(a: number, b = 1) { // b is inferred as number
  return a * b;
}

// Complex default values
function createUser(
  name: string,
  options = { admin: false, active: true }
) {
  return { name, ...options };
}
```

### Optional vs Default Parameters

```typescript
// Optional: might be undefined
function greet(name?: string): void {
  console.log(name?.toUpperCase()); // Needs safe navigation
}

// Default: never undefined
function greet(name: string = "Guest"): void {
  console.log(name.toUpperCase()); // Safe without ?
}
```

---

## Rest Parameters

### Basic Rest Parameters

```typescript
// Rest parameter (must be last, type is array)
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3); // 6
sum(1, 2, 3, 4, 5); // 15
sum(); // 0
```

### Combining Parameters

```typescript
// Regular + rest parameters
function greetAll(greeting: string, ...names: string[]): string {
  return names.map(name => `${greeting}, ${name}!`).join(" ");
}

greetAll("Hello", "Alice", "Bob", "Charlie");
// "Hello, Alice! Hello, Bob! Hello, Charlie!"
```

### Typed Rest Parameters

```typescript
// Rest with union types
function combine(...items: (string | number)[]): string {
  return items.join(", ");
}

combine(1, "two", 3, "four"); // "1, two, 3, four"

// Rest with tuples
function process(...args: [string, number, boolean]): void {
  const [str, num, bool] = args;
  console.log(str, num, bool);
}

process("test", 42, true);
```

---

## Function Type Expressions

### Defining Function Types

```typescript
// Function type expression
type GreetFunction = (name: string) => string;

const greet: GreetFunction = (name) => {
  return `Hello, ${name}!`;
};

// Alternative syntax with arrow
type MathOperation = (a: number, b: number) => number;

const add: MathOperation = (a, b) => a + b;
const subtract: MathOperation = (a, b) => a - b;
const multiply: MathOperation = (a, b) => a * b;
```

### Function Types as Parameters

```typescript
// Higher-order function
function applyOperation(
  a: number,
  b: number,
  operation: (x: number, y: number) => number
): number {
  return operation(a, b);
}

applyOperation(5, 3, (x, y) => x + y); // 8
applyOperation(5, 3, (x, y) => x * y); // 15

// Array methods with function types
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map((n: number): number => n * 2);
const evens = numbers.filter((n: number): boolean => n % 2 === 0);
```

### Returning Functions

```typescript
// Function that returns a function
function createMultiplier(factor: number): (value: number) => number {
  return (value) => value * factor;
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15

// With explicit types
type Multiplier = (value: number) => number;

function createMultiplier(factor: number): Multiplier {
  return (value) => value * factor;
}
```

---

## Call Signatures

### Object Types with Call Signatures

```typescript
// Call signature in object type
type DescribableFunction = {
  description: string;
  (value: number): string;
};

function createFormatter(description: string): DescribableFunction {
  const formatter = (value: number) => `${description}: ${value}`;
  formatter.description = description;
  return formatter as DescribableFunction;
}

const currencyFormatter = createFormatter("USD");
console.log(currencyFormatter(100)); // "USD: 100"
console.log(currencyFormatter.description); // "USD"
```

### Construct Signatures

```typescript
// Construct signature
type PointConstructor = {
  new (x: number, y: number): { x: number; y: number };
};

class Point {
  constructor(public x: number, public y: number) {}
}

const createPoint: PointConstructor = Point;
const point = new createPoint(10, 20);
```

---

## Function Overloads

### Basic Overloads

```typescript
// Overload signatures
function makeDate(timestamp: number): Date;
function makeDate(year: number, month: number, day: number): Date;

// Implementation signature (not callable directly)
function makeDate(yearOrTimestamp: number, month?: number, day?: number): Date {
  if (month !== undefined && day !== undefined) {
    return new Date(yearOrTimestamp, month, day);
  } else {
    return new Date(yearOrTimestamp);
  }
}

makeDate(1234567890); // ✅
makeDate(2024, 0, 1); // ✅
makeDate(2024, 0); // ❌ No overload matches this call
```

### Complex Overloads

```typescript
// Different return types based on input
function getValue(key: "name"): string;
function getValue(key: "age"): number;
function getValue(key: "active"): boolean;

function getValue(key: string): string | number | boolean {
  const data = { name: "Alice", age: 25, active: true };
  return data[key as keyof typeof data];
}

const name = getValue("name"); // Type: string
const age = getValue("age"); // Type: number
const active = getValue("active"); // Type: boolean
```

### When to Use Overloads

```typescript
// ❌ Overload not needed - use union types
function process(value: string | number): void {
  // ...
}

// ✅ Good use of overloads - different return types
function get(id: number): User;
function get(email: string): User;
function get(idOrEmail: number | string): User {
  // Implementation
}

// ✅ Alternative: union types with type guards
function get(idOrEmail: number | string): User {
  if (typeof idOrEmail === "number") {
    // Find by ID
  } else {
    // Find by email
  }
}
```

---

## Best Practices

### 1. Prefer Specific Types Over General

```typescript
// ❌ Too general
function process(data: any): any {
  return data.value;
}

// ✅ Specific types
function process(data: { value: string }): string {
  return data.value;
}
```

### 2. Use Return Type Annotations for Public APIs

```typescript
// ✅ Explicit for library functions
export function calculateTax(price: number, rate: number): number {
  return price * rate;
}

// ⚠️ Inference OK for internal functions
function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}
```

### 3. Avoid Overloads When Union Types Suffice

```typescript
// ❌ Unnecessary overload
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
  return String(value);
}

// ✅ Union type is simpler
function format(value: string | number): string {
  return String(value);
}
```

### 4. Use Optional Parameters Wisely

```typescript
// ✅ Good: optional makes sense
function createUser(name: string, email?: string) {
  // Email is truly optional
}

// ❌ Avoid: should use default instead
function greet(name: string, greeting?: string) {
  const msg = greeting || "Hello"; // Better to use default
}

// ✅ Better: use default parameter
function greet(name: string, greeting = "Hello") {
  return `${greeting}, ${name}!`;
}
```

### 5. Type Callback Parameters

```typescript
// ❌ Untyped callback
function process(callback: Function) {
  callback();
}

// ✅ Typed callback
function process(callback: () => void) {
  callback();
}

// ✅ Callback with parameters
function processArray(
  items: number[],
  callback: (item: number, index: number) => void
) {
  items.forEach(callback);
}
```

---

## Quick Reference

```typescript
// Basic function
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Arrow function
const add = (a: number, b: number): number => a + b;

// Optional parameter
function greet(name: string, greeting?: string): string {
  return `${greeting || "Hello"}, ${name}!`;
}

// Default parameter
function greet(name: string, greeting = "Hello"): string {
  return `${greeting}, ${name}!`;
}

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

// Function type
type Operation = (a: number, b: number) => number;

// Overloads
function makeDate(timestamp: number): Date;
function makeDate(y: number, m: number, d: number): Date;
function makeDate(yOrTs: number, m?: number, d?: number): Date {
  // Implementation
}
```

---

## Next Steps

Continue to [04. Interfaces and Type Aliases](../04-interfaces-and-types/README.md) to learn how to define complex object shapes.

---

**Practice**: Try the [Functions Exercises](../exercises/02-functions-exercises.md) to master function typing!
