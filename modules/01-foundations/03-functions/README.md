# Functions in TypeScript

Learn how to type functions effectively for maximum type safety and clarity.

## Table of Contents

- [What Are Function Types and Why Do They Matter?](#what-are-function-types-and-why-do-they-matter)
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

## What Are Function Types and Why Do They Matter?

Functions are the building blocks of any program. They take inputs (parameters), do something with them, and give you outputs (return values). In plain JavaScript, you never really know what a function expects or what it will give back:

```typescript
// JavaScript - unclear what this function needs or returns
function calculate(x, y, operation) {
  if (operation === "add") {
    return x + y;
  }
  return x * y;
}

calculate(5, 3, "add"); // Returns 8... or does it?
calculate("5", "3", "add"); // Returns "53" - oops! String concatenation
calculate(5, 3); // Returns 15 - operation is undefined, so it multiplies
```

**💡 The Problem:**
- You don't know what types `x`, `y`, and `operation` should be
- You don't know what type the function returns
- Mistakes only show up when you run the code

**With TypeScript:**

```typescript
// TypeScript - crystal clear!
function calculate(x: number, y: number, operation: "add" | "multiply"): number {
  if (operation === "add") {
    return x + y;
  }
  return x * y;
}

calculate(5, 3, "add"); // ✅ 8
calculate("5", "3", "add"); // ❌ Error: Argument of type 'string' is not assignable to parameter of type 'number'
calculate(5, 3); // ❌ Error: Expected 3 arguments, but got 2
calculate(5, 3, "subtract"); // ❌ Error: Argument of type '"subtract"' is not assignable to parameter of type '"add" | "multiply"'
```

**💡 Real-world analogy:** Think of a function like a vending machine:
- **Parameters** are what you put in (coins, button selection)
- **Return type** is what you get out (snack, drink)
- **Type annotations** are like the labels on the buttons that tell you exactly what coins to insert and what you'll get

A vending machine labeled "Insert $1.50, Get Soda" is much more useful than one with no labels at all!

**🎯 Why this matters:**
- **Catch errors immediately** - TypeScript stops you from passing wrong types
- **Autocomplete** - Your editor knows what parameters a function needs
- **Documentation** - Function signatures tell you exactly how to use them
- **Refactoring safety** - Change a function's parameters, and TypeScript shows you everywhere you need to update

---

## Function Type Annotations

### Basic Function Syntax

TypeScript gives you several ways to write functions. They all work the same way, just different styles:

```typescript
// Function declaration (traditional style)
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Function expression (assigned to a variable)
const greet = function(name: string): string {
  return `Hello, ${name}!`;
};

// Arrow function (modern style)
const greet = (name: string): string => {
  return `Hello, ${name}!`;
};

// Concise arrow function (one-liner, no curly braces)
const greet = (name: string): string => `Hello, ${name}!`;
```

**💡 Explanation:**
- `name: string` - The parameter `name` must be a string
- `: string` after the parentheses - The function returns a string
- All four styles do the exact same thing, just written differently

**🤔 Common Question: Which style should I use?**

```typescript
// Use function declarations for top-level functions
function calculateTax(price: number, rate: number): number {
  return price * rate;
}

// Use arrow functions for callbacks and short functions
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);

// Use arrow functions to preserve 'this' context (advanced topic)
class Counter {
  count = 0;

  // Arrow function preserves 'this'
  increment = (): void => {
    this.count++;
  };
}
```

**💡 Explanation:** For now, use whichever style feels comfortable. As you learn more about JavaScript's `this` keyword and callbacks, you'll naturally develop preferences.

---

## Parameter Types

### Required Parameters

Parameters are the inputs to your function. In TypeScript, you specify exactly what type each parameter should be:

```typescript
function add(a: number, b: number): number {
  return a + b;
}

add(5, 3); // ✅ 8
add(5); // ❌ Expected 2 arguments, but got 1
add(5, 3, 2); // ❌ Expected 2 arguments, but got 3
```

**💡 Explanation:** TypeScript is strict about parameters:
- You must provide exactly the right number of arguments
- Each argument must be the correct type
- This prevents bugs like forgetting to pass a value or passing too many

**⚠️ Common Mistake:**

```typescript
function greet(name: string): string {
  return `Hello, ${name}!`;
}

greet(); // ❌ Expected 1 argument, but got 0
// In JavaScript, this would work but give you "Hello, undefined!"
// In TypeScript, it's caught immediately
```

### Type Inference in Contextual Typing

Sometimes TypeScript is smart enough to figure out parameter types for you:

```typescript
const numbers = [1, 2, 3];

// TypeScript knows this is a number array, so 'n' must be a number!
numbers.map(n => n * 2);
//          ^
//          TypeScript infers n: number

// You can write it explicitly if you want, but it's not necessary
numbers.map((n: number) => n * 2);
```

**💡 Explanation:** This is called "contextual typing" - TypeScript uses context clues to infer types. Since `numbers` is a `number[]`, TypeScript knows the callback will receive numbers.

**🎯 Real-world example:**

```typescript
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 }
];

// TypeScript knows 'user' has properties 'name' and 'age'
const names = users.map(user => user.name);
//                      ^^^^
//                      Type: { name: string; age: number }

// You get autocomplete for free!
users.map(user => user.); // Your editor shows: name, age
```

### Object Parameters

When a function needs multiple related values, use an object parameter:

```typescript
// ❌ Inline type - hard to read with many properties
function createUser(config: { name: string; age: number; email: string }) {
  console.log(`Creating user: ${config.name}`);
}

// ✅ Better: use interface or type alias - reusable and cleaner
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

**💡 Explanation:**
- Inline types get messy with many properties
- Interfaces/types can be reused across multiple functions
- Gives the type a meaningful name (`UserConfig`)

**🤔 Common Question: Why use an object instead of multiple parameters?**

```typescript
// ❌ Too many parameters - hard to remember the order
function createUser(name: string, age: number, email: string, phone: string, address: string) {
  // ...
}

// Which order? Easy to mix up!
createUser("Alice", "123-456", 25, "alice@example.com", "123 Main St"); // ❌ Wrong order!

// ✅ Object parameter - order doesn't matter, names are clear
interface UserConfig {
  name: string;
  age: number;
  email: string;
  phone: string;
  address: string;
}

function createUser(config: UserConfig) {
  // ...
}

// Crystal clear what each value represents!
createUser({
  name: "Alice",
  email: "alice@example.com",
  age: 25,
  phone: "123-456",
  address: "123 Main St"
});
```

**📝 Note for beginners:** If a function needs more than 2-3 parameters, consider using an object parameter instead.

### Destructured Parameters

Destructuring lets you "unpack" object properties directly in the parameter list:

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

// Without destructuring
function greetUser(user: User): string {
  return `Hello, ${user.name}! You are ${user.age} years old.`;
}

// With destructuring - cleaner!
function greetUser({ name, age }: User): string {
  return `Hello, ${name}! You are ${age} years old.`;
  //              ^^^^         ^^^
  //              Can use directly without 'user.'
}
```

**💡 Explanation:** Destructuring extracts `name` and `age` from the user object. Inside the function, you can use `name` and `age` directly instead of `user.name` and `user.age`.

**With default values:**

```typescript
// Give age a default value if not provided
function greetUser({ name, age = 18 }: User): string {
  return `Hello, ${name}! You are ${age} years old.`;
}

greetUser({ name: "Alice", age: 25, email: "alice@example.com" }); // "Hello, Alice! You are 25 years old."
greetUser({ name: "Bob", email: "bob@example.com" }); // "Hello, Bob! You are 18 years old."
```

**⚠️ Warning:** Destructuring with TypeScript can be confusing at first because you see both the type annotation AND the default value:

```typescript
// The syntax: { property = defaultValue }: Type
function greetUser({ name, age = 18 }: User): string {
  //                      ^^^^^^ default value
  //                              ^^^^^ type annotation
  return `Hello, ${name}! You are ${age} years old.`;
}
```

---

## Return Types

### Explicit Return Types

Return types tell TypeScript (and other developers) what a function gives back:

```typescript
// Explicit return type
function multiply(a: number, b: number): number {
  return a * b;
}
//                              ^^^^^^ This function returns a number

// Inferred return type (TypeScript figures it out)
function divide(a: number, b: number) {
  return a / b; // TypeScript infers this returns a number
}

// void return type - function doesn't return anything
function logMessage(message: string): void {
  console.log(message);
  // No return statement (or just 'return;' with no value)
}
```

**💡 Explanation:**
- `: number` - Function returns a number
- `: void` - Function doesn't return anything (like console.log)
- No annotation - TypeScript infers the return type from the return statement

**🤔 Common Question: void vs undefined?**

```typescript
// void - function doesn't return anything useful
function logMessage(message: string): void {
  console.log(message);
}

const result = logMessage("Hello"); // result is undefined, but we don't care

// undefined - function explicitly returns undefined
function getNothing(): undefined {
  return undefined;
}

const value = getNothing(); // value is explicitly undefined

// 💡 Rule of thumb: Use void for functions that don't return anything
// Use undefined only if returning undefined is meaningful
```

### When to Specify Return Types

**💡 Beginner's guide to when you should write return types:**

```typescript
// ✅ ALWAYS specify return types for:

// 1. Public/exported functions (ones other files use)
export function calculateTax(price: number, rate: number): number {
  return price * rate;
}

// 2. Functions where the return type isn't obvious
function getUserStatus(user: User): string {
  // Without the ': string', someone might not realize this always returns a string
  if (user.age >= 18) {
    return "adult";
  }
  return "minor";
}

// 3. Functions where inference might surprise you
function processUser(user: User) {
  if (user.age >= 18) {
    return "adult"; // Inferred type: string | boolean (not what we want!)
  }
  return false; // Oops! Mixing types
}

// ✅ Better: Explicit return type prevents this mistake
function processUser(user: User): string {
  if (user.age >= 18) {
    return "adult";
  }
  return "minor"; // ✅ Must be a string now
  // return false; // ❌ TypeScript would catch this!
}
```

**⚠️ Common Mistake - Type Inference Gone Wrong:**

```typescript
// Without explicit return type
function getDiscount(isPremium: boolean) {
  if (isPremium) {
    return 0.2; // 20% discount
  }
  return false; // Inferred type: number | boolean
}

const discount = getDiscount(true);
const price = 100 - (100 * discount); // ❌ Might multiply by false!

// With explicit return type
function getDiscount(isPremium: boolean): number {
  if (isPremium) {
    return 0.2;
  }
  return 0; // ✅ Must return a number
  // return false; // ❌ TypeScript error!
}
```

**📝 Note for beginners:** It's OK to let TypeScript infer return types for small, simple functions. But when in doubt, write it explicitly - it's good documentation!

### Returning Promises

When a function is `async` or returns a Promise, the return type should be `Promise<T>`:

```typescript
// Explicit Promise return type
async function fetchData(): Promise<string> {
  const response = await fetch("/api/data");
  return response.text(); // Returns a string
}

// Inferred Promise<number>
async function getNumber() {
  return 42; // TypeScript knows async functions return Promises
}

// Promise with union types
async function fetchUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/user");
    return response.json();
  } catch {
    return null; // Return null if it fails
  }
}
```

**💡 Explanation:**
- `async` functions ALWAYS return Promises
- `Promise<string>` means "a Promise that resolves to a string"
- `Promise<User | null>` means "a Promise that resolves to either a User or null"

**🎯 Real-world example:**

```typescript
// Loading user data with error handling
async function loadUser(id: number): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`);

    if (!response.ok) {
      return null; // User not found
    }

    const user = await response.json();
    return user; // Return the user
  } catch (error) {
    console.error("Failed to load user:", error);
    return null; // Network error
  }
}

// Using the function
const user = await loadUser(123);
if (user) {
  console.log(`Hello, ${user.name}!`);
} else {
  console.log("User not found");
}
```

**🤔 Common Question: Do I need to write Promise<T> for async functions?**

```typescript
// TypeScript infers the Promise for you
async function getNumber() {
  return 42; // Type: Promise<number>
}

// But it's good practice to write it explicitly for public functions
export async function fetchUserData(id: number): Promise<UserData> {
  // Explicit return type makes it clear what this function returns
  // ...
}
```

### Never Return Type

The `never` type is for functions that literally never return:

```typescript
// Function that always throws an error
function throwError(message: string): never {
  throw new Error(message);
  // Code execution stops here - function never returns!
}

// Function with infinite loop
function infiniteLoop(): never {
  while (true) {
    console.log("Running forever...");
  }
  // This loop never ends, so the function never returns
}
```

**💡 Explanation:**
- `never` means the function NEVER completes normally
- Either throws an error, runs forever, or calls `process.exit()`
- Different from `void` which returns `undefined`

**🎯 Real-world example:**

```typescript
// Utility for impossible cases
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

type Shape = "circle" | "square" | "triangle";

function getArea(shape: Shape): number {
  switch (shape) {
    case "circle":
      return Math.PI * 10 * 10;
    case "square":
      return 10 * 10;
    case "triangle":
      return 0.5 * 10 * 10;
    default:
      // If we add a new shape and forget to handle it, TypeScript will error!
      return assertNever(shape);
  }
}
```

**📝 Note for beginners:** `never` is advanced. You probably won't use it much as a beginner, but it's good to know it exists!

---

## Optional and Default Parameters

### Optional Parameters

Optional parameters might be provided, or they might not. They're marked with `?`:

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
```

**💡 Explanation:**
- `greeting?` means greeting is optional
- Type of `greeting` is actually `string | undefined`
- Must check if it exists before using it

**⚠️ Common Mistake:**

```typescript
function greet(name: string, greeting?: string): string {
  return `${greeting}, ${name}!`; // ❌ greeting might be undefined!
  //       ^^^^^^^^^
  //       Could be "undefined, Alice!"
}

// ✅ Always check optional parameters
function greet(name: string, greeting?: string): string {
  const msg = greeting ?? "Hello"; // Use ?? to provide fallback
  return `${msg}, ${name}!`;
}
```

**Type of optional parameter is string | undefined:**

```typescript
function process(value?: string) {
  console.log(value.toUpperCase()); // ❌ value might be undefined
  console.log(value?.toUpperCase()); // ✅ Safe navigation with ?.

  // Or check explicitly
  if (value) {
    console.log(value.toUpperCase()); // ✅ Safe
  }
}
```

**💡 Explanation:** Optional parameters are really just shorthand for `parameter: type | undefined`.

### Default Parameters

Default parameters have a value that's used if nothing is provided:

```typescript
// Default parameter value
function greet(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}

greet("Alice"); // "Hello, Alice!" (uses default)
greet("Bob", "Hi"); // "Hi, Bob!" (uses provided value)
```

**💡 Explanation:**
- `= "Hello"` provides a default value
- If caller doesn't provide `greeting`, it defaults to `"Hello"`
- `greeting` is NEVER undefined - it always has a value

**Default parameter infers type:**

```typescript
function multiply(a: number, b = 1) {
  //                           ^^^^^ TypeScript infers b: number
  return a * b;
}

multiply(5); // 5 * 1 = 5
multiply(5, 3); // 5 * 3 = 15
```

**Complex default values:**

```typescript
function createUser(
  name: string,
  options = { admin: false, active: true }
) {
  return { name, ...options };
}

createUser("Alice"); // { name: "Alice", admin: false, active: true }
createUser("Bob", { admin: true, active: false }); // { name: "Bob", admin: true, active: false }
```

### Optional vs Default Parameters

**💡 Understanding the difference:**

```typescript
// Optional: might be undefined - you need to handle that
function greetOptional(name?: string): void {
  console.log(name?.toUpperCase());
  //          ^^^^^ Need ?. because name might be undefined
  // Output: might be undefined
}

// Default: never undefined - always has a value
function greetDefault(name: string = "Guest"): void {
  console.log(name.toUpperCase());
  //          ^^^^ No ?. needed - name is always a string
  // Output: always a string
}

greetOptional(); // undefined
greetDefault(); // "GUEST"
```

**🤔 Common Question: When should I use optional vs default?**

```typescript
// Use OPTIONAL when:
// - Value being absent is meaningful
// - You want different behavior when value isn't provided

function sendEmail(to: string, cc?: string) {
  if (cc) {
    // Send with CC
  } else {
    // Send without CC - this is different behavior
  }
}

// Use DEFAULT when:
// - There's a sensible default value
// - You always need a value, just want to make it convenient

function createPost(title: string, published: boolean = false) {
  // Posts are draft by default - makes sense!
  return { title, published };
}
```

**📝 Note for beginners:** If you always need a value and there's a good default, use default parameters. If the absence of a value has special meaning, use optional parameters.

---

## Rest Parameters

### Basic Rest Parameters

Rest parameters let you accept any number of arguments:

```typescript
// Rest parameter (must be last, type is array)
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3); // 6
sum(1, 2, 3, 4, 5); // 15
sum(); // 0 (empty array)
```

**💡 Explanation:**
- `...numbers` is the "rest" operator
- Collects all arguments into an array
- `numbers` is a `number[]` inside the function
- You can pass as many (or as few) arguments as you want

**🎯 Real-world example:**

```typescript
// Logging function that accepts any number of messages
function logMessages(...messages: string[]): void {
  const timestamp = new Date().toISOString();
  messages.forEach(msg => {
    console.log(`[${timestamp}] ${msg}`);
  });
}

logMessages("App started");
// [2024-01-01T12:00:00.000Z] App started

logMessages("User logged in", "Session created", "Redirecting to dashboard");
// [2024-01-01T12:00:00.000Z] User logged in
// [2024-01-01T12:00:00.000Z] Session created
// [2024-01-01T12:00:00.000Z] Redirecting to dashboard
```

### Combining Parameters

You can mix regular parameters with rest parameters:

```typescript
// Regular + rest parameters
function greetAll(greeting: string, ...names: string[]): string {
  return names.map(name => `${greeting}, ${name}!`).join(" ");
}

greetAll("Hello", "Alice", "Bob", "Charlie");
// "Hello, Alice! Hello, Bob! Hello, Charlie!"
```

**💡 Explanation:**
- `greeting` is a normal parameter (required, comes first)
- `...names` collects all remaining arguments
- Rest parameter MUST be the last parameter

**⚠️ Common Mistake:**

```typescript
// ❌ Rest parameter must be last
function process(...items: string[], category: string) { // ❌ Error!
  // Can't put parameters after rest parameter
}

// ✅ Correct order
function process(category: string, ...items: string[]) {
  console.log(`Processing ${category}:`, items);
}
```

### Typed Rest Parameters

Rest parameters can have union types or even tuple types:

```typescript
// Rest with union types
function combine(...items: (string | number)[]): string {
  return items.join(", ");
}

combine(1, "two", 3, "four"); // "1, two, 3, four"

// Rest with tuples (advanced - specific number and types)
function process(...args: [string, number, boolean]): void {
  const [str, num, bool] = args;
  console.log(str, num, bool);
}

process("test", 42, true); // ✅
process("test", 42); // ❌ Expected 3 arguments
```

**💡 Explanation:**
- `(string | number)[]` - Array can contain strings OR numbers
- `[string, number, boolean]` - Tuple: exactly 3 items in that order

**📝 Note for beginners:** Tuple rest parameters are advanced. Stick with simple array rest parameters for now!

---

## Function Type Expressions

### Defining Function Types

Function types let you describe the "shape" of a function without implementing it:

```typescript
// Function type expression
type GreetFunction = (name: string) => string;
//   ^^^^^^^^^^^^^^   ^^^^^^^^^^^^^^^^^^^^^^^^
//   Type name        Function signature

const greet: GreetFunction = (name) => {
  return `Hello, ${name}!`;
  //     ^^^^^^^^^^^^^^^^ Must return a string
};
```

**💡 Explanation:**
- `type GreetFunction = (name: string) => string` defines what a greeting function looks like
- Any function matching that signature can be assigned to `GreetFunction` type
- The parameter `name` is automatically typed as `string` - you don't need to repeat it!

**🎯 Real-world example:**

```typescript
// Define operation type
type MathOperation = (a: number, b: number) => number;

// All these functions match the MathOperation type
const add: MathOperation = (a, b) => a + b;
const subtract: MathOperation = (a, b) => a - b;
const multiply: MathOperation = (a, b) => a * b;
const divide: MathOperation = (a, b) => a / b;

// Use them interchangeably
function calculate(x: number, y: number, operation: MathOperation): number {
  return operation(x, y);
}

console.log(calculate(10, 5, add)); // 15
console.log(calculate(10, 5, multiply)); // 50
```

**💡 Explanation:** This is powerful! You can pass different functions to `calculate` as long as they match the `MathOperation` signature.

### Function Types as Parameters

Functions that accept other functions as parameters are called "higher-order functions":

```typescript
// Higher-order function
function applyOperation(
  a: number,
  b: number,
  operation: (x: number, y: number) => number
  //         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //         This parameter is a FUNCTION
): number {
  return operation(a, b);
}

applyOperation(5, 3, (x, y) => x + y); // 8
applyOperation(5, 3, (x, y) => x * y); // 15
```

**💡 Real-world analogy:** Think of it like a food processor:
- The food processor is `applyOperation`
- The ingredients are `a` and `b`
- The blade attachment is `operation`
- You can swap different blades (functions) to do different things!

**Array methods with function types:**

```typescript
const numbers = [1, 2, 3, 4, 5];

// map takes a function: (value: number, index: number) => number
const doubled = numbers.map((n: number): number => n * 2);
// [2, 4, 6, 8, 10]

// filter takes a function: (value: number) => boolean
const evens = numbers.filter((n: number): boolean => n % 2 === 0);
// [2, 4]
```

**💡 Explanation:**
- `map` expects a function that transforms each element
- `filter` expects a function that returns true/false for each element
- These are built-in higher-order functions you'll use ALL the time!

### Returning Functions

Functions can also return other functions:

```typescript
// Function that returns a function
function createMultiplier(factor: number): (value: number) => number {
  //                                        ^^^^^^^^^^^^^^^^^^^^^^^
  //                                        Returns a function
  return (value) => value * factor;
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10 (5 * 2)
console.log(triple(5)); // 15 (5 * 3)
```

**💡 Explanation:**
- `createMultiplier` returns a new function
- The returned function "remembers" the `factor` (this is called a "closure")
- Each returned function has its own `factor` value

**🎯 Real-world example:**

```typescript
// Create custom validators
function createMinValidator(min: number): (value: number) => boolean {
  return (value) => value >= min;
}

const isAdult = createMinValidator(18);
const canDrink = createMinValidator(21);

console.log(isAdult(20)); // true
console.log(canDrink(20)); // false
```

**With explicit types:**

```typescript
// Define the return type separately for clarity
type Multiplier = (value: number) => number;

function createMultiplier(factor: number): Multiplier {
  return (value) => value * factor;
}
```

**📝 Note for beginners:** Functions returning functions might seem strange at first, but they're incredibly useful for creating customized behaviors!

---

## Call Signatures

### Object Types with Call Signatures

Functions can have properties! Call signatures let you type these "function objects":

```typescript
// Call signature in object type
type DescribableFunction = {
  description: string; // A property
  (value: number): string; // The function signature
};

function createFormatter(description: string): DescribableFunction {
  const formatter = (value: number) => `${description}: ${value}`;
  formatter.description = description;
  return formatter as DescribableFunction;
}

const currencyFormatter = createFormatter("USD");
console.log(currencyFormatter(100)); // "USD: 100" (calling it as a function)
console.log(currencyFormatter.description); // "USD" (accessing its property)
```

**💡 Explanation:**
- `DescribableFunction` is both a function AND an object with properties
- You can call it like a function: `currencyFormatter(100)`
- You can access its properties: `currencyFormatter.description`

**🎯 Real-world example:**

```typescript
// jQuery-style API where a function has methods
type Logger = {
  (message: string): void; // Main function
  error(message: string): void; // Method
  warn(message: string): void; // Method
  info(message: string): void; // Method
};

function createLogger(): Logger {
  const log = (message: string) => console.log(message);
  log.error = (message: string) => console.error(`ERROR: ${message}`);
  log.warn = (message: string) => console.warn(`WARN: ${message}`);
  log.info = (message: string) => console.info(`INFO: ${message}`);
  return log as Logger;
}

const logger = createLogger();
logger("Normal log"); // Normal function call
logger.error("Something went wrong!"); // Method call
logger.info("FYI"); // Method call
```

**📝 Note for beginners:** This is advanced! You won't need call signatures often, but they're common in library code.

### Construct Signatures

Construct signatures describe classes and constructors (very advanced):

```typescript
// Construct signature
type PointConstructor = {
  new (x: number, y: number): { x: number; y: number };
  //  ^^^ The 'new' keyword indicates this is a constructor
};

class Point {
  constructor(public x: number, public y: number) {}
}

const createPoint: PointConstructor = Point;
const point = new createPoint(10, 20);
```

**💡 Explanation:** The `new` keyword in a type signature means "this is a constructor that creates new objects".

**📝 Note for beginners:** This is very advanced. You rarely need to type constructors explicitly. Come back to this later!

---

## Function Overloads

### Basic Overloads

Function overloads let you define multiple ways to call the same function:

```typescript
// Overload signatures (what callers can use)
function makeDate(timestamp: number): Date;
function makeDate(year: number, month: number, day: number): Date;

// Implementation signature (how it actually works internally)
function makeDate(yearOrTimestamp: number, month?: number, day?: number): Date {
  if (month !== undefined && day !== undefined) {
    return new Date(yearOrTimestamp, month, day);
  } else {
    return new Date(yearOrTimestamp);
  }
}

makeDate(1234567890); // ✅ Using first overload
makeDate(2024, 0, 1); // ✅ Using second overload
makeDate(2024, 0); // ❌ No overload matches this call
```

**💡 Explanation:**
- The first two lines are "overload signatures" - they tell callers how to use the function
- The third function is the actual implementation
- TypeScript only lets you call the function using one of the overload signatures

**🎯 Real-world analogy:** Think of overloads like a menu at a restaurant:
- Overload 1: "Burger with fries" (timestamp)
- Overload 2: "Build your own meal" (year, month, day)
- Implementation: The kitchen that handles both orders

### Complex Overloads

Overloads can return different types based on input:

```typescript
// Different return types based on input
function getValue(key: "name"): string;
function getValue(key: "age"): number;
function getValue(key: "active"): boolean;

function getValue(key: string): string | number | boolean {
  const data = { name: "Alice", age: 25, active: true };
  return data[key as keyof typeof data];
}

const name = getValue("name"); // Type: string (not string | number | boolean!)
const age = getValue("age"); // Type: number
const active = getValue("active"); // Type: boolean
```

**💡 Explanation:**
- When you call `getValue("name")`, TypeScript knows it returns a string
- When you call `getValue("age")`, TypeScript knows it returns a number
- Without overloads, it would always return `string | number | boolean`

**🎯 Real-world example:**

```typescript
// API response type depends on endpoint
function apiGet(endpoint: "/user"): Promise<User>;
function apiGet(endpoint: "/posts"): Promise<Post[]>;
function apiGet(endpoint: "/settings"): Promise<Settings>;

function apiGet(endpoint: string): Promise<any> {
  return fetch(endpoint).then(r => r.json());
}

// TypeScript knows the exact return type!
const user = await apiGet("/user"); // Type: User
const posts = await apiGet("/posts"); // Type: Post[]
```

### When to Use Overloads

**🤔 Common Question: When should I use overloads?**

```typescript
// ❌ Overload not needed - use union types instead
function process(value: string | number): void {
  // Simple case: just handle both types
}

// ✅ Good use of overloads - different return types
function get(id: number): User;
function get(email: string): User;
function get(idOrEmail: number | string): User {
  // Return type is the same, but behavior differs
  if (typeof idOrEmail === "number") {
    // Find by ID
  } else {
    // Find by email
  }
}

// ✅ Alternative: Type guards (sometimes simpler than overloads)
function get(idOrEmail: number | string): User {
  if (typeof idOrEmail === "number") {
    // TypeScript knows it's a number here
    return findById(idOrEmail);
  } else {
    // TypeScript knows it's a string here
    return findByEmail(idOrEmail);
  }
}
```

**💡 Rule of thumb:**
- Use overloads when the return type depends on the input type
- Use union types when the function just accepts multiple types
- Use type guards when you need to narrow types inside the function

**📝 Note for beginners:** Overloads are advanced. Don't worry about them when starting out - union types and type guards are usually simpler!

---

## Best Practices

### 1. Prefer Specific Types Over General

```typescript
// ❌ Too general - loses type safety
function process(data: any): any {
  return data.value;
}

const result = process({ value: "hello" });
result.toUpperCase(); // ❌ No error, but result could be anything!

// ✅ Specific types - safe and clear
function process(data: { value: string }): string {
  return data.value;
}

const result = process({ value: "hello" });
result.toUpperCase(); // ✅ TypeScript knows result is a string
```

**💡 Explanation:** `any` turns off TypeScript's checking. Avoid it unless you have a very good reason!

### 2. Use Return Type Annotations for Public APIs

```typescript
// ✅ Explicit for functions other files use
export function calculateTax(price: number, rate: number): number {
  return price * rate;
}

// ⚠️ Inference OK for internal/private functions
function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`; // Obviously returns a string
}
```

**💡 Explanation:**
- Exported functions should have explicit return types (acts as documentation)
- Private helper functions can rely on inference if it's obvious
- When in doubt, write it explicitly!

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

**💡 Explanation:** If all overloads return the same type and do similar things, just use a union type.

### 4. Use Optional Parameters Wisely

```typescript
// ✅ Good: optional makes sense
function createUser(name: string, email?: string) {
  // Email is truly optional - not all users need one
}

// ❌ Avoid: should use default instead
function greet(name: string, greeting?: string) {
  const msg = greeting || "Hello"; // If you're doing this, use a default!
}

// ✅ Better: use default parameter
function greet(name: string, greeting = "Hello") {
  return `${greeting}, ${name}!`;
}
```

**💡 Rule of thumb:**
- Optional: When the value being absent is meaningful
- Default: When you always want a value, just providing a convenient default

### 5. Type Callback Parameters

```typescript
// ❌ Untyped callback - very unsafe!
function process(callback: Function) {
  callback(); // Could be called wrong, no type checking
}

// ✅ Typed callback - safe and clear
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

processArray([1, 2, 3], (item, index) => {
  //                      ^^^^  ^^^^^
  //                      TypeScript knows the types!
  console.log(`Item ${index}: ${item}`);
});
```

**💡 Explanation:**
- Never use `Function` type - it's as bad as `any`
- Always specify the callback's parameters and return type
- Callers get autocomplete and type checking!

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
const multiply: Operation = (a, b) => a * b;

// Function accepting a function
function applyOperation(
  a: number,
  b: number,
  operation: (x: number, y: number) => number
): number {
  return operation(a, b);
}

// Function returning a function
function createMultiplier(factor: number): (value: number) => number {
  return (value) => value * factor;
}

// Async function
async function fetchData(): Promise<string> {
  const response = await fetch("/api/data");
  return response.text();
}

// Overloads
function makeDate(timestamp: number): Date;
function makeDate(y: number, m: number, d: number): Date;
function makeDate(yOrTs: number, m?: number, d?: number): Date {
  return m !== undefined && d !== undefined
    ? new Date(yOrTs, m, d)
    : new Date(yOrTs);
}
```

---

## Next Steps

Continue to [04. Interfaces and Type Aliases](../04-interfaces-and-types/README.md) to learn how to define complex object shapes.

---

**Practice**: Try the [Functions Exercises](../exercises/02-functions-exercises.md) to master function typing!
