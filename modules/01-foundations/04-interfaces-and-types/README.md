# Interfaces and Type Aliases

Learn how to define complex object shapes and when to use interfaces vs type aliases.

## Table of Contents

- [Interfaces](#interfaces)
- [Type Aliases](#type-aliases)
- [Interfaces vs Type Aliases](#interfaces-vs-type-aliases)
- [Extending and Composing](#extending-and-composing)
- [Index Signatures](#index-signatures)
- [Best Practices](#best-practices)

---

## Interfaces

### Basic Interface

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

// ❌ Missing properties
// ❌ Missing properties
const invalidUser1: User = {
  id: 1,
  name: "Bob"
  // Error: Property 'email' is missing
};

// ❌ Extra properties
const invalidUser2: User = {
  id: 1,
  name: "Charlie",
  email: "charlie@example.com",
  age: 25 // Error: Object literal may only specify known properties
};
```

### Optional Properties

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // Optional
  phone?: string; // Optional
}

const user1: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
  // age and phone are optional
};

const user2: User = {
  id: 2,
  name: "Bob",
  email: "bob@example.com",
  age: 25,
  phone: "123-456-7890"
};
```

### Readonly Properties

```typescript
interface User {
  readonly id: number; // Cannot be changed after creation
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

user.name = "Alicia"; // ✅
user.id = 2; // ❌ Cannot assign to 'id' because it is a read-only property
```

### Method Signatures

```typescript
interface User {
  id: number;
  name: string;

  // Method signature (two syntaxes)
  greet(): string;
  sendEmail(subject: string, body: string): void;
}

const user: User = {
  id: 1,
  name: "Alice",

  greet() {
    return `Hello, I'm ${this.name}`;
  },

  sendEmail(subject, body) {
    console.log(`Sending email: ${subject}`);
  }
};

// Alternative: arrow function property
interface Calculator {
  add: (a: number, b: number) => number;
}

const calc: Calculator = {
  add: (a, b) => a + b
};
```

---

## Type Aliases

### Basic Type Alias

```typescript
type User = {
  id: number;
  name: string;
  email: string;
};

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};
```

### Primitive Type Aliases

```typescript
type ID = number;
type Email = string;
type Active = boolean;

type User = {
  id: ID;
  email: Email;
  active: Active;
};
```

### Union Types

```typescript
// Union of primitive types
type Status = "active" | "inactive" | "pending";

type ID = number | string;

// Union of object types
type Response = SuccessResponse | ErrorResponse;

type SuccessResponse = {
  status: "success";
  data: any;
};

type ErrorResponse = {
  status: "error";
  error: string;
};
```

### Intersection Types

```typescript
type User = {
  id: number;
  name: string;
};

type Admin = {
  role: "admin";
  permissions: string[];
};

// Intersection: has all properties from both
type AdminUser = User & Admin;

const admin: AdminUser = {
  id: 1,
  name: "Alice",
  role: "admin",
  permissions: ["read", "write", "delete"]
};
```

### Function Types

```typescript
// Function type alias
type GreetFunction = (name: string) => string;

const greet: GreetFunction = (name) => `Hello, ${name}!`;

// Complex function types
type AsyncOperation<T> = (input: T) => Promise<T>;
type EventHandler = (event: Event) => void;
type Comparator<T> = (a: T, b: T) => number;
```

### Tuple Types

```typescript
// Tuple type alias
type Point = [number, number];
type RGB = [number, number, number];
type NamedPoint = [x: number, y: number];

const point: Point = [10, 20];
const color: RGB = [255, 128, 0];
```

---

## Interfaces vs Type Aliases

### Key Differences

| Feature | Interface | Type Alias |
|---------|-----------|------------|
| **Extend** | ✅ `extends` keyword | ✅ `&` intersection |
| **Implement** | ✅ Classes can implement | ✅ Classes can implement object types |
| **Declaration Merging** | ✅ Yes | ❌ No |
| **Union Types** | ❌ No | ✅ Yes |
| **Primitive Aliases** | ❌ No | ✅ Yes |
| **Tuple Types** | ❌ Limited | ✅ Yes |
| **Computed Properties** | ❌ No | ✅ Yes |

### Declaration Merging (Interface)

```typescript
// Interfaces with same name merge
interface User {
  id: number;
  name: string;
}

interface User {
  email: string;
}

// Merged: { id: number; name: string; email: string; }
const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

// ❌ Type aliases cannot merge
type User = {
  id: number;
  name: string;
};

type User = {
  email: string;
}; // Error: Duplicate identifier 'User'
```

### Union Types (Type Alias Only)

```typescript
// ✅ Type aliases can be unions
type Status = "active" | "inactive" | "pending";
type ID = number | string;
type Result = Success | Error;

// ❌ Interfaces cannot be unions
interface Status = "active" | "inactive"; // Syntax error
```

### When to Use Each

**Use Interface When:**
- Defining object shapes
- Working with OOP (classes, inheritance)
- Need declaration merging (e.g., augmenting libraries)
- Want clearer error messages

**Use Type Alias When:**
- Creating union or intersection types
- Aliasing primitives, tuples, or functions
- Using advanced type features (mapped types, conditional types)
- Need computed properties

### Best Practice: Be Consistent

```typescript
// ✅ Consistent approach within project
// Option 1: Prefer interfaces
interface User {
  id: number;
  name: string;
}

interface Admin extends User {
  role: "admin";
}

// Option 2: Prefer types
type User = {
  id: number;
  name: string;
};

type Admin = User & {
  role: "admin";
};

// ❌ Avoid mixing unnecessarily
interface User {
  id: number;
}

type Admin = User & {
  role: "admin";
}; // Inconsistent
```

---

## Extending and Composing

### Extending Interfaces

```typescript
interface Person {
  name: string;
  age: number;
}

interface Employee extends Person {
  employeeId: number;
  department: string;
}

const employee: Employee = {
  name: "Alice",
  age: 25,
  employeeId: 1001,
  department: "Engineering"
};

// Extending multiple interfaces
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface User extends Person, Timestamped {
  email: string;
}
```

### Intersection Types (Type Aliases)

```typescript
type Person = {
  name: string;
  age: number;
};

type Employee = Person & {
  employeeId: number;
  department: string;
};

// Multiple intersections
type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type User = Person & Timestamped & {
  email: string;
};
```

### Implementing Interfaces in Classes

```typescript
interface Animal {
  name: string;
  makeSound(): void;
}

class Dog implements Animal {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  makeSound() {
    console.log("Woof!");
  }
}

const dog = new Dog("Buddy");
dog.makeSound(); // "Woof!"
```

---

## Index Signatures

### Basic Index Signature

```typescript
// String index signature
interface StringMap {
  [key: string]: string;
}

const colors: StringMap = {
  red: "#FF0000",
  green: "#00FF00",
  blue: "#0000FF"
};

colors.yellow = "#FFFF00"; // ✅
console.log(colors.red); // "#FF0000"
```

### Number Index Signature

```typescript
interface NumberArray {
  [index: number]: string;
}

const fruits: NumberArray = ["apple", "banana", "orange"];
console.log(fruits[0]); // "apple"
```

### Combined with Named Properties

```typescript
interface Dictionary {
  count: number; // Named property
  [key: string]: number; // Index signature
}

const scores: Dictionary = {
  count: 3,
  math: 95,
  english: 87,
  science: 92
};

// Note: Named properties must match index signature type
interface Invalid {
  count: string; // ❌ Error
  [key: string]: number;
}
```

### Readonly Index Signature

```typescript
interface ReadonlyStringMap {
  readonly [key: string]: string;
}

const config: ReadonlyStringMap = {
  apiUrl: "https://api.example.com",
  apiKey: "secret"
};

config.apiUrl = "https://new-url.com"; // ❌ Index signature is readonly
```

### Record Utility Type (Alternative)

```typescript
// Built-in Record type
type StringMap = Record<string, string>;
type NumberMap = Record<string, number>;

const colors: Record<string, string> = {
  red: "#FF0000",
  green: "#00FF00"
};

// With specific keys
type Status = "active" | "inactive" | "pending";
type StatusConfig = Record<Status, string>;

const statusMessages: StatusConfig = {
  active: "User is active",
  inactive: "User is inactive",
  pending: "User is pending"
};
```

---

## Best Practices

### 1. Prefer Interfaces for Object Shapes

```typescript
// ✅ Interface for object shapes
interface User {
  id: number;
  name: string;
  email: string;
}

// ⚠️ Type alias works but interface is more idiomatic
type User = {
  id: number;
  name: string;
  email: string;
};
```

### 2. Use Type Aliases for Unions and Intersections

```typescript
// ✅ Type alias for unions
type Status = "active" | "inactive" | "pending";
type ID = number | string;

// ✅ Type alias for intersections
type Employee = Person & {
  employeeId: number;
};
```

### 3. Use Readonly for Immutable Data

```typescript
interface User {
  readonly id: number;
  name: string;
  readonly createdAt: Date;
}

// Or use Readonly utility type
type ReadonlyUser = Readonly<User>;
```

### 4. Avoid Empty Interfaces

```typescript
// ❌ Empty interface has no purpose
interface EmptyInterface {}

// ✅ Use object type or unknown
type EmptyObject = Record<string, never>;
```

### 5. Use Optional Properties Appropriately

```typescript
// ✅ Good: Property is truly optional
interface User {
  id: number;
  name: string;
  nickname?: string; // May or may not have a nickname
}

// ❌ Avoid: Should use default value instead
interface Config {
  timeout?: number; // Better to have a default
}

// ✅ Better: Use default in implementation
interface Config {
  timeout: number;
}
const defaultConfig: Config = { timeout: 5000 };
```

---

## Quick Reference

```typescript
// Interface
interface User {
  id: number;
  name: string;
  email?: string; // Optional
  readonly createdAt: Date; // Readonly
  greet(): void; // Method
}

// Type alias
type User = {
  id: number;
  name: string;
};

// Union type
type Status = "active" | "inactive" | "pending";

// Intersection type
type Employee = Person & { employeeId: number };

// Extending interface
interface Admin extends User {
  role: "admin";
}

// Index signature
interface Dictionary {
  [key: string]: number;
}

// Function type
type Handler = (event: Event) => void;
```

---

## Next Steps

Continue to [05. Unions and Intersections](../05-unions-and-intersections/README.md) to learn about combining types effectively.

---

**Practice**: Try the [Interfaces Exercises](../exercises/03-interfaces-exercises.md) to master object type definitions!
