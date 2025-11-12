# Basic Types

Welcome to TypeScript's type system! If you're coming from JavaScript, you already know how to use all these types - TypeScript just helps you catch mistakes before your code runs.

## 📚 Table of Contents

- [What Are Types and Why Do We Need Them?](#what-are-types-and-why-do-we-need-them)
- [Primitive Types](#primitive-types)
- [Arrays](#arrays)
- [Tuples](#tuples)
- [Enums](#enums)
- [Special Types](#special-types)
- [Type Inference](#type-inference)
- [Best Practices](#best-practices)

---

## What Are Types and Why Do We Need Them?

Before we dive in, let's understand **why** TypeScript adds types to JavaScript.

**💡 Think of types as labels on boxes**

Imagine you're organizing a storage room:
- You have boxes labeled "Books" that should only contain books
- Boxes labeled "Tools" that should only contain tools
- Boxes labeled "Toys" that should only contain toys

If someone tries to put a hammer in the "Books" box, you'd catch that mistake immediately. That's exactly what TypeScript does for your code!

```typescript
// Without types (JavaScript)
let age = 25;
age = "twenty-five"; // Oops! This could break things later

// With types (TypeScript)
let age: number = 25;
age = "twenty-five"; // ❌ TypeScript catches this immediately!
```

**Why this matters:**
- **Catch bugs early**: Before your code runs, not after your users find them
- **Better autocomplete**: Your editor knows exactly what you can do with each variable
- **Self-documenting code**: Types make your intentions clear to other developers (including future you!)
- **Safer refactoring**: Change code confidently, knowing TypeScript will catch breaking changes

---

## Primitive Types

Primitive types are the basic building blocks - like the atoms of your code. JavaScript has 7 primitive types, and TypeScript adds types for all of them.

### String

**What it is:** Text data - anything in quotes.

**When to use it:** Names, messages, URLs, any text you need to display or process.

```typescript
let firstName: string = "Alice";
let lastName: string = 'Bob';  // Single or double quotes work!
let message: string = `Hello, ${firstName}!`; // Template literals for dynamic strings

// 💡 Explanation: TypeScript now knows these variables hold text.
// If you try to use them like numbers, you'll get an error:

firstName = 42; // ❌ Type 'number' is not assignable to type 'string'
// TypeScript is saying: "Hey! firstName is supposed to hold text, not a number!"
```

**🤔 Common Questions:**

*Q: Do I need to write `: string` every time?*
A: Not usually! TypeScript can often figure it out (see Type Inference below). But it's good practice when you're learning.

*Q: What's the difference between `"` and `'`?*
A: No difference! Use whichever you prefer. Many teams use double quotes for consistency.

*Q: What are template literals (backticks)?*
A: They let you embed variables directly in strings using `${variable}`. Super useful!

```typescript
let name = "Alice";
let age = 25;

// Old way (string concatenation)
let message1 = "Hello, my name is " + name + " and I'm " + age + " years old.";

// New way (template literal)
let message2 = `Hello, my name is ${name} and I'm ${age} years old.`;
// Much cleaner! Plus, no forgetting those spaces.
```

---

### Number

**What it is:** Any numeric value - whole numbers, decimals, even special notations.

**Important to know:** Unlike many languages, JavaScript (and TypeScript) has only ONE number type. There's no separate "integer" or "float" - they're all just `number`.

```typescript
let decimal: number = 6;
let hex: number = 0xf00d;       // Hexadecimal (base 16)
let binary: number = 0b1010;    // Binary (base 2)
let octal: number = 0o744;      // Octal (base 8)
let big: number = 1_000_000;    // You can use underscores for readability!

// 💡 Explanation: All of these are type 'number', even though they're written differently.
// The underscores in 1_000_000 don't affect the value - they just make it easier to read.
// It's still one million!

console.log(big); // Outputs: 1000000

// Type safety in action:
decimal = "6"; // ❌ Type 'string' is not assignable to type 'number'
// Even though "6" looks like a number, it's actually text!
```

**🤔 Common Questions:**

*Q: Can I mix numbers and strings?*
A: Not directly! You need to convert them first:

```typescript
let age: number = 25;
let message: string = "I am " + age + " years old"; // ✅ This works!
// JavaScript automatically converts the number to a string here.

// But be careful with math:
let result = age + "5"; // "255" (string concatenation, not addition!)
let result = age + 5;   // 30 (actual addition)
```

*Q: What about really big numbers?*
A: For numbers bigger than `Number.MAX_SAFE_INTEGER` (9,007,199,254,740,991), use `bigint` (covered below).

---

### Boolean

**What it is:** True or false. That's it! Just two possible values.

**When to use it:** Conditions, flags, switches - anything that can be answered with yes/no or on/off.

```typescript
let isDone: boolean = false;
let isActive: boolean = true;
let hasPermission: boolean = false;

// 💡 Explanation: Booleans are perfect for representing state or conditions.
// They make your code readable:

if (isActive) {
  console.log("User is active");
}
// Much clearer than: if (status === 1)

// ⚠️ Common Mistake: Confusing truthy/falsy values with actual booleans
let isValid: boolean = 1; // ❌ Type 'number' is not assignable to type 'boolean'

// In JavaScript, 1 is "truthy" (acts like true in conditions)
// But TypeScript requires an actual boolean!

// ✅ Correct ways to convert:
let isValid: boolean = Boolean(1);  // true
let isValid: boolean = !!1;         // true (double negation)
let isValid: boolean = 1 === 1;     // true (comparison returns boolean)
```

**🤔 Common Questions:**

*Q: What's the difference between `true` and `"true"`?*
A: HUGE difference! `true` is a boolean (true/false value). `"true"` is a string (text) that happens to say "true".

```typescript
let bool: boolean = true;
let str: string = "true";

if (bool) {
  console.log("This runs");  // ✅ Executes
}

if (str) {
  console.log("This also runs!");  // ✅ Also executes (non-empty strings are truthy)
}

if (bool === str) {  // ❌ This comparison fails at compile time!
  // TypeScript won't let you compare different types directly
}
```

---

### Symbol

**What it is:** A unique identifier that's guaranteed to be different from every other symbol.

**When to use it:** When you need absolutely unique keys, especially for object properties that shouldn't conflict with other properties.

```typescript
const sym1: symbol = Symbol("key");
const sym2: symbol = Symbol("key");

console.log(sym1 === sym2); // false - Each Symbol is completely unique!

// 💡 Explanation: Even though both symbols have the same description ("key"),
// they're like two different people with the same name - still distinct individuals.

// Real-world use case: Unique object property keys
const SPECIAL_KEY = Symbol("special");
const ANOTHER_KEY = Symbol("special");  // Different symbol, same description

const obj = {
  [SPECIAL_KEY]: "value1",
  [ANOTHER_KEY]: "value2",
  normal: "value3"
};

console.log(obj[SPECIAL_KEY]); // "value1"
console.log(obj[ANOTHER_KEY]); // "value2"
// Even though the descriptions are the same, these are different properties!
```

**🎯 Real-World Example:**

Imagine you're building a plugin system where different plugins might add properties to objects. You don't want Plugin A's properties to accidentally overwrite Plugin B's properties:

```typescript
// Plugin A
const PLUGIN_A_DATA = Symbol("pluginData");
object[PLUGIN_A_DATA] = { foo: "bar" };

// Plugin B
const PLUGIN_B_DATA = Symbol("pluginData");  // Same description, but unique!
object[PLUGIN_B_DATA] = { baz: "qux" };

// No conflicts! Each plugin has its own unique property.
```

**📝 Note for beginners:** Symbols are advanced. If you're just starting, you won't use them often. Focus on strings, numbers, and booleans first!

---

### BigInt

**What it is:** Numbers that are too big for regular `number` type.

**When to use it:** Working with very large integers (like cryptography, timestamps in microseconds, or financial calculations requiring precision beyond 53 bits).

```typescript
let big1: bigint = 100n;  // The 'n' at the end makes it a BigInt
let big2: bigint = BigInt(100);  // Alternative way

// 💡 Explanation: Regular numbers in JavaScript can safely represent integers
// up to 9,007,199,254,740,991 (2^53 - 1). Beyond that, you lose precision.

let unsafe = 9007199254740991 + 2; // 9007199254740992 (lost precision!)
let safe = 9007199254740991n + 2n; // 9007199254740993n (exact!)

// ⚠️ Important: You can't mix BigInt and regular numbers!
let result = big1 + 100;  // ❌ Cannot mix BigInt and number
let result = big1 + 100n; // ✅ Both are BigInt now
```

**🤔 When do I actually need this?**

Most applications don't need BigInt! Regular numbers work fine for:
- User ages, quantities, prices
- Coordinates, measurements
- Most counting and math

You need BigInt when:
- Working with cryptocurrency (numbers can be HUGE)
- Processing very large IDs from databases
- Doing precise math with very large numbers
- Working with timestamps at microsecond precision

**📝 Note for beginners:** You can safely skip BigInt for now and come back when you actually need it!

---

## Arrays

Arrays hold multiple values of the same type. Think of them as a numbered list.

### Understanding Arrays

**💡 Real-world analogy:** An array is like a shelf with numbered slots. If it's a `number[]` array, every slot must contain a number. You can't sneak a book onto a shelf meant for DVDs!

```typescript
// Creating arrays - TypeScript checks what you put in them:
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["Alice", "Bob", "Charlie"];
let flags: boolean[] = [true, false, true];

// 💡 Explanation: The : number[] part means "this is an array of numbers"
// TypeScript will now make sure ONLY numbers go in this array

// This is great because:
numbers.push(6);      // ✅ Adding a number works
numbers.push("7");    // ❌ Adding a string fails!
// Error: Argument of type 'string' is not assignable to parameter of type 'number'

// TypeScript is protecting you from a bug that could crash your app later!
```

### Two Ways to Write Array Types

There are two ways to write the same thing:

```typescript
// Method 1: Simple array syntax (more common)
let numbers: number[] = [1, 2, 3];

// Method 2: Generic array syntax
let numbers: Array<number> = [1, 2, 3];

// They mean exactly the same thing! Use whichever reads better to you.
// Most developers prefer number[] because it's shorter.
```

**🤔 When to use which?**
- Use `number[]` for simple cases (which is most of the time)
- Use `Array<number>` when working with complex generics (you'll learn about these later)

### Working with Arrays

TypeScript makes array methods safer:

```typescript
const numbers: number[] = [1, 2, 3, 4, 5];

// map - transforms each element
const doubled: number[] = numbers.map(n => n * 2);
// [2, 4, 6, 8, 10]

// 💡 Explanation: map goes through each number and doubles it
// TypeScript knows 'n' is a number, so you get autocomplete for number methods!

// filter - keeps only elements that match a condition
const evens: number[] = numbers.filter(n => n % 2 === 0);
// [2, 4]

// 💡 Explanation: n % 2 === 0 checks if a number is even
// (% gives you the remainder of division - even numbers have no remainder when divided by 2)

// reduce - combines all elements into a single value
const sum: number = numbers.reduce((acc, n) => acc + n, 0);
// 15

// 💡 Explanation: reduce keeps a running total (acc = accumulator)
// It starts at 0, then adds each number: 0+1=1, 1+2=3, 3+3=6, 6+4=10, 10+5=15

// TypeScript catches mistakes:
const invalid = numbers.map(n => n.toUpperCase());
// ❌ Property 'toUpperCase' does not exist on type 'number'
// TypeScript is saying: "Numbers don't have a toUpperCase method - only strings do!"
```

### Multi-dimensional Arrays

Arrays can contain other arrays!

```typescript
// 2D array (like a spreadsheet or grid)
let matrix: number[][] = [
  [1, 2, 3],    // Row 0
  [4, 5, 6],    // Row 1
  [7, 8, 9]     // Row 2
];

// 💡 Explanation: number[][] means "array of arrays of numbers"
// Think of it like a table with rows and columns

// Accessing elements:
console.log(matrix[0][0]); // 1 (first row, first column)
console.log(matrix[1][2]); // 6 (second row, third column)
console.log(matrix[2][1]); // 8 (third row, second column)

// Real-world example: A tic-tac-toe board
let board: string[][] = [
  ['X', 'O', 'X'],
  ['O', 'X', 'O'],
  ['X', 'O', 'X']
];
```

**📝 Note:** Multi-dimensional arrays are less common in everyday coding. Focus on regular arrays first!

---

## Tuples

**What they are:** Arrays with a fixed number of elements, where each position has a specific type.

**💡 Real-world analogy:** A tuple is like a form with specific fields:
- Field 1: Name (must be text)
- Field 2: Age (must be a number)
- Field 3: Active (must be yes/no)

You can't skip fields or put them in the wrong order!

### Basic Tuples

```typescript
// Regular array: all elements are the same type, any length
let list: number[] = [1, 2, 3, 4, 5, 6, 7]; // Can add more numbers

// Tuple: fixed length, each position has its own type
let user: [string, number];
user = ["Alice", 25];  // ✅ Correct order and types

user = [25, "Alice"];  // ❌ Wrong order!
// Type 'number' is not assignable to type 'string'

user = ["Alice"];      // ❌ Missing the age!
// Source has 1 element(s) but target requires 2

user = ["Alice", 25, "extra"];  // ⚠️ TypeScript allows this, but be careful!

// 💡 Explanation: Tuples are perfect when you have a small, fixed set of related values
// that need to stay in a specific order.

// Accessing elements (just like arrays):
let name: string = user[0];  // "Alice"
let age: number = user[1];   // 25
let invalid = user[2];       // ⚠️ Tuple type of length '2' has no element at index '2'
```

### When to Use Tuples

**✅ Good use cases:**

```typescript
// 1. Coordinates
type Point2D = [x: number, y: number];
const position: Point2D = [10, 20];

// 2. RGB colors
type RGB = [red: number, green: number, blue: number];
const color: RGB = [255, 128, 0];  // Orange

// 3. Database query results
type UserRecord = [id: number, name: string, email: string];
const user: UserRecord = [1, "Alice", "alice@example.com"];

// 4. Function that returns multiple values
function getNameAndAge(): [string, number] {
  return ["Alice", 25];
}

const [name, age] = getNameAndAge();  // Destructuring!
console.log(name); // "Alice"
console.log(age);  // 25
```

**❌ Bad use cases:**

```typescript
// Don't use tuples for many items or complex data
type Person = [string, number, string, string, boolean, string, number];
// This is confusing! Which position is which?

// Instead, use an object or interface:
interface Person {
  name: string;
  age: number;
  email: string;
  address: string;
  active: boolean;
  phone: string;
  userId: number;
}
// Much clearer!
```

### Named Tuples (TypeScript 4.0+)

Make your tuples more readable:

```typescript
// Old way: positions aren't labeled
type User = [string, number];
let user: User = ["Alice", 25];
// Which is the name and which is the age? Not clear from the type!

// New way: positions are labeled
type User = [name: string, age: number];
let user: User = ["Alice", 25];
// Now it's clear! (Note: labels are just for documentation, you still access by index)

let userName = user[0];  // Still accessed by position, not by name
```

---

## Enums

**What they are:** A way to give friendly names to sets of numeric or string values.

**💡 Real-world analogy:** Think of enums like predefined options on a form. Instead of typing text (which could have typos), you select from a dropdown. Enums work the same way!

### Numeric Enums

```typescript
enum Direction {
  Up,     // 0
  Down,   // 1
  Left,   // 2
  Right   // 3
}

// 💡 Explanation: TypeScript automatically assigns numbers starting from 0
// (just like array indices!)

let playerDirection: Direction = Direction.Up;
console.log(playerDirection); // 0

// This is better than using magic numbers:
let playerDirection = 0; // What does 0 mean? Up? Down? Who knows!
let playerDirection = Direction.Up; // Crystal clear!

// You can customize the numbers:
enum Status {
  Pending = 1,
  Active,    // 2 (auto-incremented)
  Inactive   // 3 (auto-incremented)
}

enum HttpStatus {
  OK = 200,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  ServerError = 500
}

// Now your code is self-documenting:
if (response.status === HttpStatus.NotFound) {
  console.log("Page not found!");
}
// Much clearer than: if (response.status === 404)
```

### String Enums

More descriptive and easier to debug:

```typescript
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT"
}

let move: Direction = Direction.Up;
console.log(move); // "UP" (you can see the actual value when debugging!)

// 💡 Explanation: String enums are great because:
// 1. The value is meaningful (not just a number)
// 2. Easier to debug (you see "UP" in logs, not 0)
// 3. More stable (adding new values won't change existing numbers)

enum LogLevel {
  Error = "ERROR",
  Warning = "WARNING",
  Info = "INFO",
  Debug = "DEBUG"
}

// Using it:
function log(level: LogLevel, message: string) {
  console.log(`[${level}] ${message}`);
}

log(LogLevel.Error, "Something went wrong!");
// Output: [ERROR] Something went wrong!
```

### Enum vs Union Types

You might see code that uses union types instead of enums. Here's when to use each:

```typescript
// Enum approach:
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE"
}

let myColor: Color = Color.Red;

// Union type approach:
type Color = "RED" | "GREEN" | "BLUE";

let myColor: Color = "RED";

// 💡 When to use enums:
// ✅ Want autocomplete in your IDE (type Color. and see all options)
// ✅ Want a namespace (Color.Red is more organized than just "RED")
// ✅ Need to iterate over all values

// 💡 When to use unions:
// ✅ Want slightly smaller bundle size (no runtime code)
// ✅ Working with external APIs that return literal strings
// ✅ Want more flexibility with TypeScript features
```

**📝 For beginners:** Start with enums - they're more explicit and easier to understand. You can learn about union types later!

---

## Special Types

These types handle edge cases and special situations.

### any

**What it is:** The "turn off type checking" type.

**⚠️ Warning:** Using `any` is like disabling your seatbelt. Sometimes necessary, but usually not a good idea!

```typescript
let value: any = 42;
value = "hello";  // ✅ Allowed
value = true;     // ✅ Allowed
value = { foo: "bar" }; // ✅ Allowed
value.foo.bar.baz.qux(); // ✅ TypeScript won't stop you (but this will crash!)

// 💡 Explanation: 'any' tells TypeScript "I don't care about types here"
// TypeScript will let you do ANYTHING with this variable, even dangerous things!

// Why it exists:
// 1. Migrating from JavaScript (gradually add types)
// 2. Working with truly unpredictable data
// 3. Prototyping (but remove it later!)

// ⚠️ The problem:
let user: any = { name: "Alice" };
console.log(user.name.toUpperCase()); // Works
console.log(user.age.toUpperCase());   // Crashes at runtime! (age doesn't exist)
// TypeScript didn't catch this bug because you used 'any'
```

**📝 Rule of thumb:** If you're about to use `any`, stop and think if there's a better way!

### unknown

**What it is:** The type-safe version of `any`.

**💡 Think of it this way:**
- `any` says: "This could be anything, and I don't care"
- `unknown` says: "This could be anything, so let's be careful"

```typescript
let value: unknown = 42;
value = "hello";  // ✅ Can assign anything (like any)
value = true;     // ✅ Can assign anything

// But you can't just use it:
value.toUpperCase(); // ❌ Object is of type 'unknown'
// TypeScript is saying: "I don't know what this is, so I can't let you call methods on it!"

// You must check the type first (type narrowing):
if (typeof value === "string") {
  // Now TypeScript knows it's a string!
  console.log(value.toUpperCase()); // ✅ Safe!
}

// 💡 Explanation: 'unknown' forces you to verify what you have before using it.
// This prevents crashes!

// Real-world example: Parsing JSON from an API
function parseUserData(jsonString: string): unknown {
  return JSON.parse(jsonString);  // Could be anything!
}

const userData = parseUserData('{"name": "Alice", "age": 25}');

// Must verify the structure:
if (
  typeof userData === "object" &&
  userData !== null &&
  "name" in userData &&
  "age" in userData
) {
  // Now it's safe to use
  console.log(userData.name);
}
```

**📝 Rule:** Always prefer `unknown` over `any`! It's only slightly more work and much safer.

### void

**What it is:** Represents "no value" - used for functions that don't return anything.

```typescript
function logMessage(message: string): void {
  console.log(message);
  // No return statement
}

// 💡 Explanation: void means "this function does something, but doesn't give you back a value"

// You can return undefined or nothing:
function doSomething(): void {
  return;           // ✅ OK
  return undefined; // ✅ OK
  return null;      // ❌ Type 'null' is not assignable to type 'void'
  return 42;        // ❌ Type 'number' is not assignable to type 'void'
}

// When do you use it?
// Usually TypeScript infers this, so you don't need to write it:
function greet() {  // TypeScript knows this returns void
  console.log("Hello!");
}

// But it's good to be explicit in function signatures:
type LogFunction = (message: string) => void;
```

### never

**What it is:** Represents values that never occur.

**💡 Think of it this way:** `void` means "no return value", but `never` means "this function never returns at all"!

```typescript
// Function that throws an error (never returns normally)
function throwError(message: string): never {
  throw new Error(message);
  // Execution stops here - function never returns!
}

// Infinite loop (never returns)
function infiniteLoop(): never {
  while (true) {
    // Never exits
  }
}

// 💡 Explanation: These functions never reach their end.
// throwError stops execution by throwing.
// infiniteLoop runs forever.

// Real-world use: Exhaustive checking
type Shape = { kind: "circle"; radius: number } | { kind: "square"; size: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.size ** 2;
    default:
      // If we handled all cases, shape is type 'never' here
      const exhaustiveCheck: never = shape;
      throw new Error(`Unhandled shape: ${exhaustiveCheck}`);
  }
}

// 💡 Explanation: If you add a new shape type but forget to handle it,
// TypeScript will error at the 'never' assignment, reminding you to handle it!
```

**📝 For beginners:** `never` is advanced. You won't use it often. Just know it exists!

### null and undefined

**What they are:** Represent absence of a value.

```typescript
let u: undefined = undefined; // "This variable hasn't been set yet"
let n: null = null;           // "This variable intentionally has no value"

// 💡 The difference:
// - undefined: the default when something doesn't exist
// - null: explicitly set to "no value"

let name: string;
console.log(name); // undefined (never assigned)

let age: number | null = null; // Explicitly saying "no age yet"

// With strictNullChecks (you should enable this!):
let num: number = null;        // ❌ Type 'null' is not assignable to type 'number'
let num: number | null = null; // ✅ Explicitly allowing null

// 💡 Explanation: TypeScript forces you to be explicit about when values can be null/undefined.
// This prevents the famous "Cannot read property 'x' of null" error!

// Handling null/undefined safely:
function printLength(text: string | null) {
  if (text === null) {
    console.log("Text is null");
    return;
  }

  // TypeScript now knows text is definitely a string here!
  console.log(text.length);
}
```

---

## Type Inference

**What it is:** TypeScript's ability to figure out types automatically.

**💡 Think of it like this:** You don't need to tell a smart person everything explicitly. TypeScript is smart enough to figure out obvious things!

```typescript
// You write:
let message = "Hello";

// TypeScript understands:
let message: string = "Hello";

// 💡 Explanation: TypeScript sees you assigned a string,
// so it knows 'message' is type string. You don't need to tell it!

// More examples:
let count = 42;              // TypeScript infers: number
let isActive = true;         // TypeScript infers: boolean
let numbers = [1, 2, 3];     // TypeScript infers: number[]
let mixed = [1, "two", 3];   // TypeScript infers: (number | string)[]

// Even complex expressions:
let doubled = count * 2;     // TypeScript infers: number
let greeting = `Hello, ${message}!`; // TypeScript infers: string
```

### When to Add Type Annotations

```typescript
// ❌ Unnecessary (TypeScript can figure this out):
let count: number = 42;
let message: string = "Hello";

// ✅ Necessary (TypeScript can't figure this out):
let userId: string;  // Declaration without initial value
userId = "user-123"; // Assigned later

// ✅ Good for clarity (even if not strictly necessary):
let status: "active" | "inactive" = "active";
// Makes it clear status can only be these two values

// ✅ Always necessary for function parameters:
function greet(name: string) {  // TypeScript can't infer parameter types!
  return `Hello, ${name}!`;     // But it CAN infer return type (string)
}

// 💡 Rule of thumb:
// - Let TypeScript infer when it's obvious
// - Add annotations when it helps readability or TypeScript can't figure it out
```

---

## Best Practices

### 1. Enable Strict Mode

In your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

**💡 Why?** Strict mode turns on all the safety features:
- Catches more bugs
- Forces you to handle null/undefined
- Prevents implicit 'any' types

Think of it like putting on safety gear before a bike ride!

### 2. Avoid `any` When Possible

```typescript
// ❌ Bad:
function process(data: any) {
  return data.value;  // Could crash if data doesn't have 'value'!
}

// ✅ Better - use unknown:
function process(data: unknown) {
  if (typeof data === "object" && data !== null && "value" in data) {
    return (data as { value: unknown }).value;
  }
  throw new Error("Invalid data");
}

// ✅ Best - use a proper interface:
interface Data {
  value: string;
}

function process(data: Data) {
  return data.value;  // TypeScript guarantees this exists!
}
```

### 3. Use `const` for Constants

```typescript
// ✅ Better:
const PI = 3.14159;
// TypeScript infers the literal type 3.14159, not just 'number'

// ⚠️ Less specific:
let PI = 3.14159;
// TypeScript infers type 'number', allowing any number to be assigned later

// 💡 Explanation: const tells TypeScript and other developers
// that this value never changes. Plus, you get more specific types!
```

### 4. Choose the Right Type for the Job

```typescript
// Array: When you have a list of items (same type, variable length)
const scores: number[] = [95, 87, 92, 88, 91];

// Tuple: When you have a fixed number of related values (specific types)
const user: [string, number] = ["Alice", 25];

// Object: When you have multiple related properties with names
const user: { name: string; age: number } = { name: "Alice", age: 25 };

// 💡 Explanation: Pick the structure that best represents your data!
```

---

## 🎯 Quick Reference Card

```typescript
// PRIMITIVES
let str: string = "hello";
let num: number = 42;
let bool: boolean = true;
let sym: symbol = Symbol("key");
let big: bigint = 100n;

// ARRAYS
let nums: number[] = [1, 2, 3];
let strs: Array<string> = ["a", "b"];

// TUPLES
let tuple: [string, number] = ["Alice", 25];

// ENUMS
enum Color { Red, Green, Blue }
let c: Color = Color.Red;

// SPECIAL TYPES
let anything: any = "anything";
let unknown: unknown = "unknown";
let nothing: void = undefined;
let never: never = (() => { throw new Error(); })();
let nul: null = null;
let undef: undefined = undefined;
```

---

## 🚀 Ready to Move On?

You now understand TypeScript's basic types! These are the foundation of everything else in TypeScript.

**Next Steps:**
1. Try the [Basic Types Exercises](../exercises/01-basic-types-exercises.md) to practice
2. Continue to [03. Functions](../03-functions/README.md) to learn how to type functions

**💡 Remember:**
- Start simple - focus on string, number, boolean, and arrays
- Let TypeScript infer types when it's obvious
- Add types when it helps prevent bugs or makes code clearer
- Don't worry about mastering everything at once!

---

**Need Help?** If something isn't clear, go back and re-read that section. Understanding these basics will make everything else much easier!
