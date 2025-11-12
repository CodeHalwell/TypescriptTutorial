# Interfaces and Type Aliases

Learn how to define complex object shapes and when to use interfaces vs type aliases.

## Table of Contents

- [What Are Interfaces and Types and Why Do They Matter?](#what-are-interfaces-and-types-and-why-do-they-matter)
- [Interfaces](#interfaces)
- [Type Aliases](#type-aliases)
- [Interfaces vs Type Aliases](#interfaces-vs-type-aliases)
- [Extending and Composing](#extending-and-composing)
- [Index Signatures](#index-signatures)
- [Best Practices](#best-practices)

---

## What Are Interfaces and Types and Why Do They Matter?

As your programs grow, you'll work with complex objects that have many properties. In JavaScript, objects can have any properties at any time - which sounds flexible but leads to chaos:

```typescript
// JavaScript - no structure
const user = {
  id: 1,
  name: "Alice"
};

// Later, someone adds properties
user.email = "alice@example.com";
user.age = 25;

// And uses wrong property names
console.log(user.emai); // undefined - typo!
console.log(user.naem); // undefined - typo!

// Or wrong types
user.id = "not-a-number"; // Oops!
```

**💡 The Problem:**
- No one knows what properties an object should have
- Typos in property names go unnoticed
- Properties can be any type
- Hard to understand what an object represents

**With TypeScript Interfaces:**

```typescript
// Define the structure of a User object
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  age: 25
};

console.log(user.emai); // ❌ Error: Property 'emai' does not exist. Did you mean 'email'?
console.log(user.naem); // ❌ Error: Property 'naem' does not exist. Did you mean 'name'?

user.id = "not-a-number"; // ❌ Error: Type 'string' is not assignable to type 'number'
```

**💡 Real-world analogy:** Think of interfaces and types like blueprints:
- A **blueprint for a house** defines what rooms must exist, what fixtures are required
- An **interface** defines what properties an object must have and their types
- Just like you can't build a house without a kitchen if the blueprint requires it, you can't create an object without required properties!

**🎯 Why this matters:**
- **Catch typos instantly** - TypeScript suggests the correct property name
- **Enforce structure** - Objects must have all required properties
- **Documentation** - Just by looking at an interface, you know exactly what an object should contain
- **Autocomplete** - Your editor shows all available properties
- **Refactoring safety** - Rename a property in the interface, and TypeScript shows everywhere to update

**🤔 Common Question: What's the difference between interface and type?**

Don't worry! We'll cover this in detail. For now, think of them as two ways to accomplish the same goal, with slightly different superpowers. Interfaces are like forms, types are like formulas - they both define structure, just with different flavors.

---

## Interfaces

### Basic Interface

An interface defines the "shape" of an object - what properties it must have and their types:

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
```

**💡 Explanation:**
- `interface User` creates a new type called `User`
- Inside the braces `{}` we list all required properties
- Each property has a name and a type
- Any object with type `User` MUST have all these properties

**⚠️ Common Mistakes:**

```typescript
// ❌ Missing properties
const invalidUser1: User = {
  id: 1,
  name: "Bob"
  // Error: Property 'email' is missing in type '{ id: number; name: string; }'
};

// ❌ Extra properties (in object literals)
const invalidUser2: User = {
  id: 1,
  name: "Charlie",
  email: "charlie@example.com",
  age: 25 // ❌ Error: Object literal may only specify known properties
};
```

**💡 Explanation:** TypeScript is strict about object shapes:
- **Missing properties** - Error! You must provide all required properties
- **Extra properties** - Error when creating the object directly! (This prevents typos)
- This strictness prevents bugs where you forget important data or mistype property names

**🤔 Common Question: Why does TypeScript complain about extra properties?**

```typescript
// This prevents typos!
const user: User = {
  id: 1,
  name: "Alice",
  eamil: "alice@example.com" // ❌ Error! Did you mean 'email'?
};

// If TypeScript didn't check this, your typo would go unnoticed!
```

### Optional Properties

Sometimes a property might exist, or it might not. Use `?` to make it optional:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // Optional - might not be provided
  phone?: string; // Optional - might not be provided
}

const user1: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
  // ✅ age and phone are optional - we don't need to provide them
};

const user2: User = {
  id: 2,
  name: "Bob",
  email: "bob@example.com",
  age: 25, // ✅ Can provide optional properties
  phone: "123-456-7890"
};
```

**💡 Explanation:**
- `age?` means age is optional (type is `number | undefined`)
- `phone?` means phone is optional (type is `string | undefined`)
- Optional properties can be omitted when creating objects
- If provided, they must still be the correct type

**🎯 Real-world example:**

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  description?: string; // Not all products have descriptions
  imageUrl?: string; // Not all products have images
  discount?: number; // Not all products are on sale
}

// Minimal product
const basicProduct: Product = {
  id: 1,
  name: "Widget",
  price: 9.99
};

// Full product
const premiumProduct: Product = {
  id: 2,
  name: "Premium Widget",
  price: 29.99,
  description: "The best widget you'll ever own!",
  imageUrl: "/images/premium-widget.jpg",
  discount: 0.15 // 15% off
};
```

**⚠️ Warning: Don't forget to check optional properties before using them!**

```typescript
interface User {
  name: string;
  age?: number;
}

function greet(user: User): string {
  return `${user.name} is ${user.age} years old`; // ⚠️ age might be undefined!
  // Output could be: "Alice is undefined years old"
}

// ✅ Better: Check if the property exists
function greetSafely(user: User): string {
  if (user.age !== undefined) {
    return `${user.name} is ${user.age} years old`;
  }
  return `Hello, ${user.name}!`;
}

// ✅ Or use optional chaining and default value
function greetWithDefault(user: User): string {
  return `${user.name} is ${user.age ?? "unknown"} years old`;
}
```

### Readonly Properties

Some properties should never change after an object is created. Use `readonly`:

```typescript
interface User {
  readonly id: number; // Can't be changed after creation
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

user.name = "Alicia"; // ✅ Can change name
user.email = "alicia@example.com"; // ✅ Can change email
user.id = 2; // ❌ Error: Cannot assign to 'id' because it is a read-only property
```

**💡 Explanation:**
- `readonly` prevents a property from being modified after the object is created
- It's like a one-way street - you can set it once, but not change it later
- Great for things that shouldn't change: IDs, creation timestamps, etc.

**🎯 Real-world example:**

```typescript
interface BankAccount {
  readonly accountNumber: string; // Never changes
  readonly createdAt: Date; // Never changes
  balance: number; // Can change
  lastTransaction?: Date; // Can change
}

const account: BankAccount = {
  accountNumber: "1234567890",
  createdAt: new Date(),
  balance: 1000
};

account.balance = 1500; // ✅ Update balance
account.lastTransaction = new Date(); // ✅ Update last transaction

account.accountNumber = "9999999999"; // ❌ Error! Can't change account number
account.createdAt = new Date(); // ❌ Error! Can't change creation date
```

**💡 Explanation:** This prevents bugs where someone accidentally changes data that should be permanent!

### Method Signatures

Interfaces can also define methods (functions that belong to an object):

```typescript
interface User {
  id: number;
  name: string;

  // Method signatures (two ways to write them)
  greet(): string; // Method that takes no params and returns string
  sendEmail(subject: string, body: string): void; // Method with params
}

const user: User = {
  id: 1,
  name: "Alice",

  greet() {
    return `Hello, I'm ${this.name}`;
  },

  sendEmail(subject, body) {
    console.log(`Sending email to ${this.name}: ${subject}`);
  }
};

console.log(user.greet()); // "Hello, I'm Alice"
user.sendEmail("Welcome", "Welcome to our platform!"); // Logs email
```

**💡 Explanation:**
- `greet(): string` - A method that returns a string
- `sendEmail(subject: string, body: string): void` - A method with parameters that doesn't return anything
- Inside the methods, `this` refers to the object itself

**Alternative: Arrow Function Property:**

```typescript
interface Calculator {
  add: (a: number, b: number) => number; // Property that is a function
}

const calc: Calculator = {
  add: (a, b) => a + b
};

console.log(calc.add(5, 3)); // 8
```

**💡 Explanation:**
- `add: (a: number, b: number) => number` means the `add` property is a function
- This is different from a method - arrow functions don't have their own `this`

**🤔 Common Question: Method syntax vs arrow function property?**

```typescript
interface Example {
  // Method syntax
  method1(): void;

  // Arrow function property
  method2: () => void;
}

// Both work, but there are subtle differences:

const obj: Example = {
  name: "Test",

  // Method - 'this' refers to the object
  method1() {
    console.log(this.name); // "Test"
  },

  // Arrow function - 'this' comes from surrounding scope
  method2: () => {
    // console.log(this.name); // Might not work as expected!
  }
};
```

**📝 Note for beginners:** For now, use the method syntax `method(): returnType` for object methods. It's simpler and works more intuitively!

---

## Type Aliases

### Basic Type Alias

Type aliases let you create custom names for types. They work very similarly to interfaces for objects:

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

**💡 Explanation:**
- `type User = { ... }` creates a type alias called `User`
- It looks almost identical to an interface!
- For simple object types, `interface` and `type` are interchangeable

**🤔 Common Question: What's the difference from interface?**

We'll cover this in detail later! For now, know that types can do everything interfaces can do for objects, PLUS they can do some things interfaces can't (like unions).

### Primitive Type Aliases

Type aliases can create custom names for primitive types too:

```typescript
type ID = number;
type Email = string;
type Active = boolean;

type User = {
  id: ID; // Using the ID alias
  email: Email; // Using the Email alias
  active: Active; // Using the Active alias
};

const user: User = {
  id: 123,
  email: "alice@example.com",
  active: true
};
```

**💡 Explanation:**
- `type ID = number` creates an alias for the number type
- This makes code more readable and semantic
- `id: ID` clearly shows it's an ID, not just any number

**🎯 Real-world example:**

```typescript
// Instead of using raw numbers and strings everywhere
type UserId = number;
type ProductId = number;
type Email = string;
type URL = string;

type User = {
  id: UserId; // Clearer than just 'number'
  email: Email; // Clearer than just 'string'
  avatarUrl: URL; // Clearer than just 'string'
};

type Product = {
  id: ProductId; // Different from UserId semantically
  name: string;
  imageUrl: URL;
};
```

**💡 Explanation:** These aliases make your code self-documenting. A `UserId` is semantically different from a `ProductId`, even though both are numbers!

### Union Types

**This is where type aliases really shine!** They can represent "this OR that":

```typescript
// Union of literal strings
type Status = "active" | "inactive" | "pending";
//            ^^^^^^^^   ^^^^^^^^^^   ^^^^^^^^^
//            Must be one of these exact strings

let userStatus: Status;
userStatus = "active"; // ✅
userStatus = "inactive"; // ✅
userStatus = "pending"; // ✅
userStatus = "deleted"; // ❌ Error! Not one of the allowed values

// Union of primitive types
type ID = number | string;
//        ^^^^^^   ^^^^^^
//        Can be a number OR a string

let userId: ID;
userId = 123; // ✅ number
userId = "abc-123"; // ✅ string
userId = true; // ❌ Error! Must be number or string
```

**💡 Real-world analogy:** Think of a union type like a multiple-choice question:
- "Status can be A, B, or C" (literal union)
- "ID can be a number OR a string" (type union)
- It must be ONE of the options, not all of them

**Union of object types:**

```typescript
type SuccessResponse = {
  status: "success";
  data: any;
};

type ErrorResponse = {
  status: "error";
  error: string;
};

// Response is either a success OR an error
type Response = SuccessResponse | ErrorResponse;

function handleResponse(response: Response) {
  if (response.status === "success") {
    console.log("Data:", response.data); // TypeScript knows it's SuccessResponse here!
  } else {
    console.log("Error:", response.error); // TypeScript knows it's ErrorResponse here!
  }
}
```

**💡 Explanation:**
- `Response` can be either `SuccessResponse` or `ErrorResponse`
- TypeScript uses the `status` property to figure out which one it is
- This is called "discriminated unions" (more on this later!)

**🎯 Real-world example:**

```typescript
type PaymentMethod =
  | { type: "credit-card"; cardNumber: string; cvv: string }
  | { type: "paypal"; email: string }
  | { type: "cash" };

function processPayment(method: PaymentMethod) {
  switch (method.type) {
    case "credit-card":
      console.log(`Processing card: ${method.cardNumber}`);
      break;
    case "paypal":
      console.log(`Processing PayPal: ${method.email}`);
      break;
    case "cash":
      console.log("Processing cash payment");
      break;
  }
}
```

### Intersection Types

**Intersection types combine multiple types into one!** An object must have ALL properties from ALL types:

```typescript
type User = {
  id: number;
  name: string;
};

type Admin = {
  role: "admin";
  permissions: string[];
};

// Intersection: has properties from BOTH User AND Admin
type AdminUser = User & Admin;

const admin: AdminUser = {
  // Must have all User properties
  id: 1,
  name: "Alice",

  // AND all Admin properties
  role: "admin",
  permissions: ["read", "write", "delete"]
};
```

**💡 Explanation:**
- `User & Admin` means "User AND Admin combined"
- The resulting type has ALL properties from both types
- You must provide all properties from both types

**💡 Real-world analogy:** Think of intersection like combining ingredients:
- User = {flour, water}
- Admin = {yeast, salt}
- User & Admin = {flour, water, yeast, salt} (all ingredients combined!)

**🎯 Real-world example:**

```typescript
type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type Identifiable = {
  id: number;
};

type BlogPost = Timestamped & Identifiable & {
  title: string;
  content: string;
  author: string;
};

const post: BlogPost = {
  // From Identifiable
  id: 1,

  // From Timestamped
  createdAt: new Date(),
  updatedAt: new Date(),

  // From BlogPost itself
  title: "My First Post",
  content: "Hello, world!",
  author: "Alice"
};
```

**💡 Explanation:** Intersection types are perfect for composing small, reusable pieces into larger types!

### Function Types

Type aliases are great for naming function types:

```typescript
// Simple function type
type GreetFunction = (name: string) => string;

const greet: GreetFunction = (name) => `Hello, ${name}!`;

console.log(greet("Alice")); // "Hello, Alice!"

// More complex function types
type AsyncOperation<T> = (input: T) => Promise<T>;
type EventHandler = (event: Event) => void;
type Comparator<T> = (a: T, b: T) => number;
```

**💡 Explanation:**
- `(name: string) => string` is a function that takes a string and returns a string
- By naming it `GreetFunction`, we can reuse it
- Generic function types like `AsyncOperation<T>` work with any type `T`

**🎯 Real-world example:**

```typescript
// Callback types for common operations
type SuccessCallback = (data: any) => void;
type ErrorCallback = (error: Error) => void;

function fetchData(
  url: string,
  onSuccess: SuccessCallback,
  onError: ErrorCallback
) {
  fetch(url)
    .then(response => response.json())
    .then(onSuccess)
    .catch(onError);
}

// Using the typed callbacks
fetchData(
  "/api/users",
  (data) => console.log("Success:", data),
  (error) => console.error("Error:", error)
);
```

### Tuple Types

Type aliases can also define tuple types (fixed-length arrays with specific types):

```typescript
// Tuple type aliases
type Point = [number, number]; // Exactly 2 numbers
type RGB = [number, number, number]; // Exactly 3 numbers
type NamedPoint = [x: number, y: number]; // Named for clarity

const point: Point = [10, 20]; // ✅
const color: RGB = [255, 128, 0]; // ✅

// ❌ Wrong number of elements
const invalid1: Point = [10]; // Error: Source has 1 elements but target requires 2
const invalid2: RGB = [255, 128, 0, 64]; // Error: Source has 4 elements but target requires 3

// ❌ Wrong types
const invalid3: Point = [10, "20"]; // Error: Type 'string' is not assignable to type 'number'
```

**💡 Explanation:**
- `[number, number]` means exactly 2 numbers in that order
- Tuples have a fixed length and fixed types at each position
- Great for representing coordinates, colors, etc.

**🎯 Real-world example:**

```typescript
// API response format
type ApiResponse = [status: number, data: any, error: string | null];

const successResponse: ApiResponse = [200, { name: "Alice" }, null];
const errorResponse: ApiResponse = [404, null, "Not found"];

function handleResponse([status, data, error]: ApiResponse) {
  if (status >= 200 && status < 300) {
    console.log("Success:", data);
  } else {
    console.error("Error:", error);
  }
}
```

**📝 Note for beginners:** Tuples are useful, but for complex data, objects with named properties are usually clearer!

---

## Interfaces vs Type Aliases

This is one of the most common questions in TypeScript! Let's break it down:

### Key Differences

| Feature | Interface | Type Alias |
|---------|-----------|------------|
| **Extend** | ✅ `extends` keyword | ✅ `&` intersection |
| **Implement (classes)** | ✅ Yes | ✅ Yes (for object types) |
| **Declaration Merging** | ✅ Yes | ❌ No |
| **Union Types** | ❌ No | ✅ Yes |
| **Primitive Aliases** | ❌ No | ✅ Yes |
| **Tuple Types** | ❌ Limited | ✅ Yes |
| **Computed Properties** | ❌ No | ✅ Yes |

**💡 Let's explain each difference:**

### Declaration Merging (Interface Only)

Interfaces with the same name automatically merge - types don't!

```typescript
// ✅ Interfaces with same name merge
interface User {
  id: number;
  name: string;
}

interface User {
  email: string;
}

// Both declarations merged into one!
// User = { id: number; name: string; email: string; }
const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com" // All three properties required!
};

// ❌ Type aliases cannot merge
type Admin = {
  id: number;
  name: string;
};

type Admin = {
  email: string;
}; // ❌ Error: Duplicate identifier 'Admin'
```

**💡 Explanation:**
- **Interface merging** is useful for extending library types
- TypeScript automatically combines all interface declarations
- Types give an error if you try to declare the same name twice

**🎯 Real-world example (extending library types):**

```typescript
// Augmenting a third-party library
// Library defines:
interface Window {
  title: string;
}

// You can add your own properties:
interface Window {
  myCustomProperty: string;
}

// Now Window has both properties!
window.myCustomProperty = "Hello!"; // ✅ Works!
```

### Union Types (Type Alias Only)

**This is a BIG difference!** Only type aliases can be union types:

```typescript
// ✅ Type aliases can be unions
type Status = "active" | "inactive" | "pending";
type ID = number | string;
type Result = Success | Error;

// ❌ Interfaces cannot be unions
interface Status = "active" | "inactive"; // ❌ Syntax error!
```

**💡 Explanation:** If you need a union type, you MUST use a type alias!

### When to Use Each

**💡 Decision Guide:**

**Use Interface When:**
- ✅ Defining object shapes for classes
- ✅ Working with OOP (classes, inheritance)
- ✅ Need declaration merging (augmenting libraries)
- ✅ Want slightly clearer error messages (subjective)
- ✅ Working with a team that prefers interfaces

**Use Type Alias When:**
- ✅ Creating union types (`"a" | "b" | "c"`)
- ✅ Creating intersection types (`A & B`)
- ✅ Aliasing primitives (`type ID = number`)
- ✅ Aliasing tuples (`type Point = [number, number]`)
- ✅ Using advanced type features (mapped types, conditional types)
- ✅ Need computed property names

### Best Practice: Be Consistent

**The most important thing is consistency within your project!**

```typescript
// ✅ Consistent approach 1: Prefer interfaces
interface User {
  id: number;
  name: string;
}

interface Admin extends User {
  role: "admin";
}

// ✅ Consistent approach 2: Prefer types
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
}; // Inconsistent - mixing for no good reason
```

**💡 Recommendation for beginners:**
- Use **interfaces** for objects and classes (more traditional, more common in tutorials)
- Use **types** for unions, primitives, and tuples (only types can do this)
- Be consistent in your choice for object shapes

**📝 Note:** Many codebases use interfaces by default and types only when necessary (unions, etc.). This is a safe default!

---

## Extending and Composing

### Extending Interfaces

Interfaces can extend other interfaces, inheriting all their properties:

```typescript
interface Person {
  name: string;
  age: number;
}

// Employee extends Person - gets all Person properties
interface Employee extends Person {
  employeeId: number;
  department: string;
}

const employee: Employee = {
  // From Person
  name: "Alice",
  age: 25,

  // From Employee
  employeeId: 1001,
  department: "Engineering"
};
```

**💡 Explanation:**
- `Employee extends Person` means Employee inherits all Person properties
- Employee objects must have ALL properties from both interfaces
- This is great for building type hierarchies

**💡 Real-world analogy:** Think of `extends` like a job application:
- Every employee is first a person (name, age)
- But employees have additional info (employee ID, department)
- You can't be an employee without being a person first!

**Extending multiple interfaces:**

```typescript
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface Identifiable {
  id: number;
}

// User extends multiple interfaces - gets properties from all of them
interface User extends Identifiable, Timestamped {
  name: string;
  email: string;
}

const user: User = {
  // From Identifiable
  id: 1,

  // From Timestamped
  createdAt: new Date(),
  updatedAt: new Date(),

  // From User itself
  name: "Alice",
  email: "alice@example.com"
};
```

**💡 Explanation:** You can extend multiple interfaces by separating them with commas. The new interface gets ALL properties from ALL parent interfaces!

### Intersection Types (Type Aliases)

Type aliases use `&` (intersection) instead of `extends`:

```typescript
type Person = {
  name: string;
  age: number;
};

// Employee is Person AND additional properties
type Employee = Person & {
  employeeId: number;
  department: string;
};

const employee: Employee = {
  name: "Alice",
  age: 25,
  employeeId: 1001,
  department: "Engineering"
};
```

**💡 Explanation:**
- `Person & { ... }` means "Person AND these additional properties"
- The result has ALL properties from both types
- Works exactly like `extends` for interfaces

**Multiple intersections:**

```typescript
type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type Identifiable = {
  id: number;
};

// Combine multiple types with &
type User = Identifiable & Timestamped & {
  name: string;
  email: string;
};
```

**🤔 Common Question: Interface extends vs Type intersection - which is better?**

They do the same thing for object types! Choose based on your preference:

```typescript
// Interface style
interface Employee extends Person {
  employeeId: number;
}

// Type style
type Employee = Person & {
  employeeId: number;
};

// Both create the exact same type!
```

**📝 Note for beginners:** If you're using interfaces, use `extends`. If you're using types, use `&`. Keep it consistent!

### Implementing Interfaces in Classes

Classes can implement interfaces - the class must have all properties from the interface:

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
console.log(dog.name); // "Buddy"
```

**💡 Explanation:**
- `implements Animal` means Dog must have all properties from Animal
- TypeScript checks that Dog has `name: string` and `makeSound(): void`
- This ensures the class matches the interface contract

**🎯 Real-world example:**

```typescript
interface Logger {
  log(message: string): void;
  error(message: string): void;
}

// Console logger implementation
class ConsoleLogger implements Logger {
  log(message: string) {
    console.log(message);
  }

  error(message: string) {
    console.error(message);
  }
}

// File logger implementation
class FileLogger implements Logger {
  log(message: string) {
    // Write to file
    this.writeToFile(`LOG: ${message}`);
  }

  error(message: string) {
    // Write to file
    this.writeToFile(`ERROR: ${message}`);
  }

  private writeToFile(content: string) {
    // Implementation...
  }
}

// Both classes implement the same interface!
function doSomething(logger: Logger) {
  logger.log("Doing something...");
  logger.error("Oh no!");
}

doSomething(new ConsoleLogger()); // Uses console
doSomething(new FileLogger()); // Uses file
```

**💡 Explanation:** Interfaces let you define a contract that multiple classes can implement differently!

---

## Index Signatures

### Basic Index Signature

Index signatures let you define objects with dynamic property names:

```typescript
// String index signature
interface StringMap {
  [key: string]: string;
  //^^^^^^^^^^^^  ^^^^^^
  //Property name  Property type
}

const colors: StringMap = {
  red: "#FF0000",
  green: "#00FF00",
  blue: "#0000FF",
  yellow: "#FFFF00" // Can add any string key!
};

console.log(colors.red); // "#FF0000"
console.log(colors["red"]); // "#FF0000"

// Can add new properties dynamically
colors.purple = "#800080"; // ✅
```

**💡 Explanation:**
- `[key: string]: string` means "any string property name returns a string value"
- You can add any property you want, as long as the value is a string
- Perfect for dictionary/map-like objects

**💡 Real-world analogy:** Think of it like a dictionary:
- The word (key) can be any word
- The definition (value) must be text
- You can add new words anytime!

### Number Index Signature

For array-like objects:

```typescript
interface NumberArray {
  [index: number]: string;
}

const fruits: NumberArray = ["apple", "banana", "orange"];

console.log(fruits[0]); // "apple"
console.log(fruits[1]); // "banana"
```

**💡 Explanation:**
- `[index: number]: string` means numeric indices return strings
- This is how arrays work in TypeScript!

### Combined with Named Properties

You can combine index signatures with specific named properties:

```typescript
interface Dictionary {
  count: number; // Specific named property
  [key: string]: number; // Any other property must be a number
}

const scores: Dictionary = {
  count: 3,
  math: 95,
  english: 87,
  science: 92
};

console.log(scores.count); // 3 (named property)
console.log(scores.math); // 95 (from index signature)
```

**⚠️ Important Restriction:**

```typescript
// ❌ Named properties must match index signature type
interface Invalid {
  count: string; // ❌ Error!
  [key: string]: number; // Index signature says all properties are numbers
}

// TypeScript error: Property 'count' of type 'string' is not assignable to
// string index type 'number'
```

**💡 Explanation:** If you have an index signature, ALL properties (named and dynamic) must match that signature's type!

### Readonly Index Signature

Prevent modification of properties:

```typescript
interface ReadonlyStringMap {
  readonly [key: string]: string;
}

const config: ReadonlyStringMap = {
  apiUrl: "https://api.example.com",
  apiKey: "secret"
};

console.log(config.apiUrl); // ✅ Can read
config.apiUrl = "https://new-url.com"; // ❌ Error: Index signature is readonly
config.newKey = "value"; // ❌ Error: Index signature is readonly
```

**💡 Explanation:** `readonly` prevents both modification and addition of properties!

### Record Utility Type (Alternative)

TypeScript provides a built-in `Record` type that's often cleaner:

```typescript
// Instead of this:
interface StringMap {
  [key: string]: string;
}

// Use this:
type StringMap = Record<string, string>;
//                      ^^^^^^  ^^^^^^
//                      Key type Value type

const colors: Record<string, string> = {
  red: "#FF0000",
  green: "#00FF00"
};
```

**💡 Explanation:**
- `Record<K, V>` is shorthand for `{ [key in K]: V }`
- It's more concise and readable
- Works the same as index signatures

**🎯 Real-world example with specific keys:**

```typescript
type Status = "active" | "inactive" | "pending";

// Record with specific keys
type StatusConfig = Record<Status, string>;

const statusMessages: StatusConfig = {
  active: "User is active",
  inactive: "User is inactive",
  pending: "User is pending"
  // ❌ Must have all three keys!
};

// TypeScript ensures all Status values are covered!
```

**💡 Explanation:** `Record<Status, string>` means "an object with keys from Status type, all with string values"!

**📝 Note for beginners:** Use `Record` instead of index signatures when possible - it's shorter and clearer!

---

## Best Practices

### 1. Prefer Interfaces for Object Shapes

For simple object types, interfaces are more idiomatic:

```typescript
// ✅ Interface for object shapes - more common
interface User {
  id: number;
  name: string;
  email: string;
}

// ⚠️ Type alias works but interface is more traditional
type User = {
  id: number;
  name: string;
  email: string;
};
```

**💡 Explanation:** The TypeScript community tends to prefer interfaces for object shapes. It's a convention, not a hard rule!

### 2. Use Type Aliases for Unions and Intersections

Only types can be unions, so use them when needed:

```typescript
// ✅ Type alias for unions
type Status = "active" | "inactive" | "pending";
type ID = number | string;

// ✅ Type alias for complex intersections
type Employee = Person & Timestamped & {
  employeeId: number;
};
```

### 3. Use Readonly for Immutable Data

Mark properties that shouldn't change as `readonly`:

```typescript
interface User {
  readonly id: number; // Never changes
  name: string; // Can change
  readonly createdAt: Date; // Never changes
  email: string; // Can change
}

// Or use Readonly utility type for entire interface
type ReadonlyUser = Readonly<User>;
// All properties are now readonly!
```

**💡 Explanation:** `readonly` prevents accidental modifications and makes your intent clear!

### 4. Avoid Empty Interfaces

Empty interfaces serve no purpose:

```typescript
// ❌ Empty interface - pointless
interface EmptyInterface {}

// ✅ Use object type or unknown
type EmptyObject = Record<string, never>; // Object with no properties
type AnyObject = Record<string, unknown>; // Object with any properties
```

### 5. Use Optional Properties Appropriately

Only make properties optional if they're truly optional:

```typescript
// ✅ Good: Property is truly optional
interface User {
  id: number;
  name: string;
  nickname?: string; // Some users don't have nicknames
}

// ❌ Avoid: Should use a default value instead
interface Config {
  timeout?: number; // Every config should have a timeout!
}

// ✅ Better: Provide a default value
interface Config {
  timeout: number;
}

const defaultConfig: Config = { timeout: 5000 };

function createConfig(partial: Partial<Config> = {}): Config {
  return { ...defaultConfig, ...partial };
}
```

**💡 Explanation:** If a property always needs a value, don't make it optional - use a default instead!

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

// Type alias (object)
type User = {
  id: number;
  name: string;
};

// Union type (type alias only)
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

// Record utility type (alternative to index signature)
type StringMap = Record<string, string>;

// Function type
type Handler = (event: Event) => void;

// Tuple type
type Point = [number, number];
```

---

## Next Steps

Continue to [05. Unions and Intersections](../05-unions-and-intersections/README.md) to learn about combining types effectively.

---

**Practice**: Try the [Interfaces Exercises](../exercises/03-interfaces-exercises.md) to master object type definitions!
