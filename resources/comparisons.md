# TypeScript Comparisons

Comprehensive comparisons to help you make informed decisions in TypeScript development.

## Table of Contents

- [TypeScript vs JavaScript](#typescript-vs-javascript)
- [TypeScript vs Flow](#typescript-vs-flow)
- [Interface vs Type Alias](#interface-vs-type-alias)
- [any vs unknown](#any-vs-unknown)
- [Enum vs Union of Strings](#enum-vs-union-of-strings)
- [Type Assertion vs Type Guard](#type-assertion-vs-type-guard)
- [Class vs Function](#class-vs-function)
- [Namespace vs Module](#namespace-vs-module)

---

## TypeScript vs JavaScript

| Aspect | JavaScript | TypeScript |
|--------|-----------|------------|
| **Type System** | Dynamic (runtime) | Static (compile-time) |
| **Type Checking** | No | Yes |
| **Error Detection** | Runtime | Compile-time |
| **IDE Support** | Basic autocomplete | Advanced IntelliSense, refactoring |
| **Learning Curve** | Lower | Higher initially |
| **Build Step** | Not required | Required (compilation) |
| **File Extension** | `.js` | `.ts`, `.tsx` |
| **Runtime Performance** | Same | Same (compiles to JS) |
| **Ecosystem** | Vast | Vast (uses npm ecosystem) |
| **Adoption** | Universal | Growing rapidly |

### When to Use JavaScript

- Quick prototypes or scripts
- Very small projects
- Team unfamiliar with TypeScript
- Legacy codebases (migration not feasible)

### When to Use TypeScript

- ✅ **Large codebases**: Better maintainability
- ✅ **Team projects**: Clear contracts between code
- ✅ **Long-term projects**: Easier refactoring
- ✅ **Library development**: Better DX for consumers
- ✅ **Complex domains**: Type safety prevents bugs

### Migration Path

```typescript
// Step 1: Rename .js to .ts
// app.js → app.ts

// Step 2: Start with permissive config
{
  "compilerOptions": {
    "allowJs": true,
    "noImplicitAny": false
  }
}

// Step 3: Gradually add types
function greet(name) { ... }  // Before
function greet(name: string): string { ... }  // After

// Step 4: Enable strict mode incrementally
{
  "compilerOptions": {
    "strict": true
  }
}
```

---

## TypeScript vs Flow

| Feature | TypeScript | Flow |
|---------|-----------|------|
| **Developer** | Microsoft | Meta (Facebook) |
| **Adoption** | Very high | Declining |
| **IDE Support** | Excellent (VS Code) | Good but limited |
| **Tooling** | Mature ecosystem | Less tooling |
| **Type Inference** | Excellent | Excellent |
| **Performance** | Good | Fast |
| **Learning Resources** | Abundant | Limited |
| **Community** | Large and active | Smaller |
| **Breaking Changes** | Rare, well-documented | More frequent |
| **React Support** | Excellent | Native (created for React) |

### Syntax Differences

**TypeScript:**
```typescript
// Type annotation
function greet(name: string): string {
  return `Hello, ${name}`;
}

// Generic
function identity<T>(value: T): T {
  return value;
}

// Type alias
type User = {
  name: string;
  age: number;
};
```

**Flow:**
```javascript
// @flow

// Type annotation
function greet(name: string): string {
  return `Hello, ${name}`;
}

// Generic
function identity<T>(value: T): T {
  return value;
}

// Type alias
type User = {
  name: string,
  age: number,
};
```

### Recommendation

**Choose TypeScript if:**
- ✅ Starting a new project
- ✅ Need better tooling and IDE support
- ✅ Want abundant community resources
- ✅ Value ecosystem maturity

**Consider Flow if:**
- Existing Flow codebase
- Specific Flow features needed
- Team expertise in Flow

---

## Interface vs Type Alias

| Feature | Interface | Type Alias |
|---------|-----------|------------|
| **Object shapes** | ✅ Primary use case | ✅ Supported |
| **Extending** | `extends` keyword | `&` intersection |
| **Declaration merging** | ✅ Yes | ❌ No |
| **Union types** | ❌ No | ✅ Yes |
| **Primitives** | ❌ No | ✅ Yes |
| **Tuples** | ❌ Limited | ✅ Yes |
| **Mapped types** | ❌ No | ✅ Yes |
| **Conditional types** | ❌ No | ✅ Yes |
| **Performance** | Slightly faster | Slightly slower |
| **Error messages** | Often clearer | Can be verbose |

### Interface Examples

```typescript
// Basic interface
interface User {
  id: number;
  name: string;
}

// Extending
interface Admin extends User {
  role: "admin";
}

// Declaration merging
interface User {
  email: string;
}
// User now has: id, name, email

// Implementing in class
class UserClass implements User {
  id: number;
  name: string;
  email: string;
}
```

### Type Alias Examples

```typescript
// Basic type
type User = {
  id: number;
  name: string;
};

// Intersection
type Admin = User & {
  role: "admin";
};

// Union types
type ID = number | string;
type Status = "active" | "inactive" | "pending";

// Primitives
type Name = string;
type Count = number;

// Tuples
type Point = [number, number];

// Functions
type GreetFunction = (name: string) => string;

// Mapped types
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Conditional types
type IsString<T> = T extends string ? true : false;
```

### When to Use Each

**Use Interface:**
```typescript
// ✅ Defining object shapes
interface User {
  id: number;
  name: string;
}

// ✅ Class contracts
interface Greetable {
  greet(): string;
}

class User implements Greetable { ... }

// ✅ Extending object types
interface Admin extends User {
  role: string;
}

// ✅ Public API (better error messages)
export interface ApiResponse {
  data: any;
  status: number;
}
```

**Use Type Alias:**
```typescript
// ✅ Union types
type Status = "active" | "inactive" | "pending";
type ID = number | string;

// ✅ Intersection types
type Employee = Person & { employeeId: number };

// ✅ Primitives
type Name = string;

// ✅ Tuples
type Point = [number, number];

// ✅ Functions
type Handler = (event: Event) => void;

// ✅ Advanced types
type Nullable<T> = T | null;
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
```

### Best Practice

Choose one approach and be consistent within your project:

```typescript
// ✅ Consistent: All interfaces
interface User { ... }
interface Admin extends User { ... }

// ✅ Consistent: All types
type User = { ... };
type Admin = User & { ... };

// ⚠️ Mixed (acceptable for specific reasons)
interface User { ... }
type Status = "active" | "inactive"; // Type needed for union
```

---

## any vs unknown

| Feature | any | unknown |
|---------|-----|---------|
| **Type Safety** | ❌ None | ✅ Type-safe |
| **Assignments** | Can assign to anything | Must narrow first |
| **Operations** | All allowed | Must narrow first |
| **Use Case** | Migration, prototyping | Unknown data |
| **Recommended** | ⚠️ Avoid | ✅ Prefer |

### any - The Escape Hatch

```typescript
let value: any = "hello";
value = 42;
value = true;
value.foo.bar.baz; // No error, but crashes at runtime!

// Can assign to anything
let str: string = value; // No error
let num: number = value; // No error

// ❌ Problems with any
function process(data: any) {
  return data.value.toUpperCase(); // No type checking!
}

process({ value: 42 }); // Runtime error!
```

### unknown - Type-Safe Alternative

```typescript
let value: unknown = "hello";
value = 42;
value = true;

// ❌ Cannot use directly
value.toUpperCase(); // Error: Object is of type 'unknown'

// ✅ Must narrow type first
if (typeof value === "string") {
  console.log(value.toUpperCase()); // ✅ Safe
}

// ❌ Cannot assign to other types
let str: string = value; // Error

// ✅ Must narrow first
if (typeof value === "string") {
  let str: string = value; // ✅ Safe
}
```

### When to Use Each

**Use `any` (sparingly):**
- Migrating from JavaScript
- Interfacing with untyped libraries (temporarily)
- Truly dynamic data (use with caution)
- Prototyping (plan to add types later)

**Use `unknown` (preferred):**
```typescript
// ✅ API responses
async function fetchData(): Promise<unknown> {
  const response = await fetch("/api/data");
  return response.json();
}

// ✅ User input
function processInput(input: unknown) {
  if (typeof input === "string") {
    return input.toUpperCase();
  }
  if (typeof input === "number") {
    return input * 2;
  }
  throw new Error("Invalid input");
}

// ✅ Error handling
catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

### Migration: any → unknown

```typescript
// Before
function process(data: any) {
  return data.value;
}

// After
function process(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "value" in data
  ) {
    return (data as { value: unknown }).value;
  }
  throw new Error("Invalid data");
}

// Better: Define interface
interface Data {
  value: string;
}

function process(data: unknown): string {
  if (isData(data)) {
    return data.value;
  }
  throw new Error("Invalid data");
}

function isData(value: unknown): value is Data {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    typeof (value as Data).value === "string"
  );
}
```

---

## Enum vs Union of Strings

| Feature | Enum | Union of Strings |
|---------|------|------------------|
| **Runtime Code** | ✅ Yes (object) | ❌ No |
| **Autocomplete** | ✅ Yes | ✅ Yes |
| **Reverse Mapping** | ✅ Yes (numeric) | ❌ No |
| **Iteration** | ✅ Possible | ❌ No |
| **Bundle Size** | Larger | Smaller |
| **Type Safety** | ✅ Yes | ✅ Yes |

### Enum

```typescript
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING"
}

// Usage
let status: Status = Status.Active;
console.log(status); // "ACTIVE"

// Runtime code generated
var Status;
(function (Status) {
    Status["Active"] = "ACTIVE";
    Status["Inactive"] = "INACTIVE";
    Status["Pending"] = "PENDING";
})(Status || (Status = {}));

// Reverse mapping (numeric enums)
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right  // 3
}

console.log(Direction.Up); // 0
console.log(Direction[0]); // "Up"
```

### Union of Strings

```typescript
type Status = "ACTIVE" | "INACTIVE" | "PENDING";

// Usage
let status: Status = "ACTIVE";
console.log(status); // "ACTIVE"

// No runtime code generated
// Type is erased during compilation

// Helper for autocomplete
const Status = {
  Active: "ACTIVE",
  Inactive: "INACTIVE",
  Pending: "PENDING"
} as const;

type Status = typeof Status[keyof typeof Status];

let status: Status = Status.Active; // Autocomplete + type safety
```

### When to Use Each

**Use Enum:**
- Need reverse mapping
- Want to iterate over values
- Prefer namespaced values (`Status.Active`)
- Don't mind extra runtime code

```typescript
enum HttpStatus {
  OK = 200,
  NotFound = 404,
  ServerError = 500
}

// Iteration
Object.values(HttpStatus).forEach(status => {
  if (typeof status === "number") {
    console.log(status);
  }
});
```

**Use Union:**
- Want minimal runtime code
- Prefer literal values
- Working with external APIs
- Building libraries (smaller bundle)

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function request(method: HttpMethod, url: string) {
  // method is just a string, no runtime overhead
}

request("GET", "/api/users");
```

### Best Practice: const Object + Type

```typescript
const Status = {
  Active: "ACTIVE",
  Inactive: "INACTIVE",
  Pending: "PENDING"
} as const;

type Status = typeof Status[keyof typeof Status];

// Benefits:
// ✅ Autocomplete: Status.Active
// ✅ Type safety: Status type
// ✅ Minimal runtime: just an object
// ✅ Can iterate: Object.values(Status)

let status: Status = Status.Active;
```

---

## Type Assertion vs Type Guard

| Feature | Type Assertion | Type Guard |
|---------|---------------|------------|
| **Safety** | ⚠️ Bypass checking | ✅ Type-safe |
| **Runtime** | No validation | Validates at runtime |
| **Use Case** | "I know better" | "Let TypeScript know" |
| **Recommended** | Sparingly | Frequently |

### Type Assertion

```typescript
// Type assertion: "Trust me, I know what I'm doing"
const input = document.getElementById("input") as HTMLInputElement;

// Alternative syntax
const input = <HTMLInputElement>document.getElementById("input");

// ⚠️ Danger: No runtime check
const value: any = "hello";
const num = value as number; // Compiles, but wrong!
console.log(num * 2); // NaN at runtime

// ✅ Valid use: You know more than TypeScript
interface ApiResponse {
  data: unknown;
}

const response: ApiResponse = await fetch("/api").then(r => r.json());
const user = response.data as User; // You know it's a User
```

### Type Guard

```typescript
// Type guard: Prove type to TypeScript
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function process(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase()); // ✅ Safe
  }
}

// ✅ Runtime validation
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof (value as User).name === "string" &&
    "age" in value &&
    typeof (value as User).age === "number"
  );
}

const data: unknown = await fetch("/api/user").then(r => r.json());
if (isUser(data)) {
  console.log(data.name); // ✅ Type-safe and validated
} else {
  throw new Error("Invalid user data");
}
```

### When to Use Each

**Type Assertion:**
- DOM elements (you know the type)
- Third-party libraries with weak types
- After runtime validation
- Non-null assertion when certain value exists

```typescript
// ✅ DOM element
const button = document.querySelector("#btn") as HTMLButtonElement;

// ✅ After validation
if (typeof value === "string") {
  const str = value as string; // Redundant but harmless
}

// ✅ Non-null assertion
const user = users.find(u => u.id === 1)!; // Certain it exists
```

**Type Guard:**
- Validating unknown data
- API responses
- User input
- Discriminated unions

```typescript
// ✅ Unknown data
function processData(data: unknown) {
  if (isUser(data)) {
    // Type-safe usage
  }
}

// ✅ Union narrowing
type Shape = Circle | Square;

function isCircle(shape: Shape): shape is Circle {
  return shape.kind === "circle";
}
```

---

**Continue to:**
- [Troubleshooting Guide](./troubleshooting.md)
- [Glossary](./glossary.md)
- [Back to Main README](../README.md)
