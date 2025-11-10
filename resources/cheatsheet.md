# TypeScript Cheat Sheet

A comprehensive quick reference for TypeScript syntax, types, and patterns.

## Table of Contents

- [Basic Types](#basic-types)
- [Functions](#functions)
- [Interfaces and Types](#interfaces-and-types)
- [Classes](#classes)
- [Generics](#generics)
- [Utility Types](#utility-types)
- [Type Guards](#type-guards)
- [Advanced Types](#advanced-types)
- [Decorators](#decorators)
- [Compiler Options](#compiler-options)

---

## Basic Types

```typescript
// Primitives
let str: string = "hello";
let num: number = 42;
let bool: boolean = true;
let sym: symbol = Symbol("key");
let big: bigint = 100n;

// Arrays
let nums: number[] = [1, 2, 3];
let strs: Array<string> = ["a", "b", "c"];

// Tuples
let tuple: [string, number] = ["hello", 42];
let namedTuple: [name: string, age: number] = ["Alice", 25];

// Enums
enum Color { Red, Green, Blue }
enum Status { Active = "ACTIVE", Inactive = "INACTIVE" }

// Special types
let anything: any = "can be anything";
let unknown: unknown = "type-safe any";
let nothing: void = undefined;
let never: never = (() => { throw new Error(); })();
let nul: null = null;
let undef: undefined = undefined;

// Object types
let obj: object = {};
let user: { name: string; age: number } = { name: "Alice", age: 25 };

// Union types
let id: string | number = "123";
type Status = "active" | "inactive" | "pending";

// Intersection types
type A = { a: number };
type B = { b: string };
type C = A & B; // { a: number; b: string }

// Literal types
let direction: "up" | "down" | "left" | "right" = "up";
let yes: true = true;
const pi: 3.14 = 3.14;
```

---

## Functions

```typescript
// Function declaration
function greet(name: string): string {
  return `Hello, ${name}`;
}

// Function expression
const greet = function(name: string): string {
  return `Hello, ${name}`;
};

// Arrow function
const greet = (name: string): string => `Hello, ${name}`;

// Optional parameters
function greet(name: string, greeting?: string): string {
  return `${greeting || "Hello"}, ${name}`;
}

// Default parameters
function greet(name: string, greeting = "Hello"): string {
  return `${greeting}, ${name}`;
}

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

// Function type
type GreetFunction = (name: string) => string;
const greet: GreetFunction = (name) => `Hello, ${name}`;

// Void return
function log(message: string): void {
  console.log(message);
}

// Never return
function throwError(message: string): never {
  throw new Error(message);
}

// Function overloads
function makeDate(timestamp: number): Date;
function makeDate(year: number, month: number, day: number): Date;
function makeDate(yearOrTimestamp: number, month?: number, day?: number): Date {
  if (month !== undefined && day !== undefined) {
    return new Date(yearOrTimestamp, month, day);
  }
  return new Date(yearOrTimestamp);
}

// this parameter
function double(this: { value: number }): number {
  return this.value * 2;
}
```

---

## Interfaces and Types

```typescript
// Interface
interface User {
  id: number;
  name: string;
  email?: string;              // Optional
  readonly createdAt: Date;    // Readonly
  greet(): string;             // Method
}

// Type alias
type User = {
  id: number;
  name: string;
};

// Extending interface
interface Admin extends User {
  role: "admin";
  permissions: string[];
}

// Extending multiple interfaces
interface Employee extends Person, Timestamped {
  employeeId: number;
}

// Type intersection
type Admin = User & {
  role: "admin";
  permissions: string[];
};

// Index signature
interface Dictionary {
  [key: string]: number;
}

// Readonly index signature
interface ReadonlyDict {
  readonly [key: string]: string;
}

// Call signature
type DescribableFunction = {
  description: string;
  (value: number): string;
};

// Construct signature
type Constructor = {
  new (name: string): { name: string };
};
```

---

## Classes

```typescript
// Basic class
class User {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  greet(): string {
    return `Hello, I'm ${this.name}`;
  }
}

// Access modifiers
class User {
  public name: string;          // Public (default)
  private password: string;     // Private
  protected email: string;      // Protected
  readonly id: number;          // Readonly

  constructor(name: string, password: string, email: string, id: number) {
    this.name = name;
    this.password = password;
    this.email = email;
    this.id = id;
  }
}

// Parameter properties
class User {
  constructor(
    public name: string,
    private password: string,
    readonly id: number
  ) {}
}

// Getters and setters
class User {
  private _age: number = 0;

  get age(): number {
    return this._age;
  }

  set age(value: number) {
    if (value < 0) throw new Error("Age cannot be negative");
    this._age = value;
  }
}

// Static members
class User {
  static count: number = 0;

  static incrementCount(): void {
    User.count++;
  }
}

// Abstract class
abstract class Animal {
  abstract makeSound(): void;

  move(): void {
    console.log("Moving...");
  }
}

class Dog extends Animal {
  makeSound(): void {
    console.log("Woof!");
  }
}

// Implementing interface
interface Greetable {
  greet(): string;
}

class User implements Greetable {
  constructor(public name: string) {}

  greet(): string {
    return `Hello, I'm ${this.name}`;
  }
}
```

---

## Generics

```typescript
// Generic function
function identity<T>(value: T): T {
  return value;
}

const result = identity<number>(42);
const result = identity("hello"); // Type inferred

// Generic interface
interface Box<T> {
  value: T;
}

const numberBox: Box<number> = { value: 42 };
const stringBox: Box<string> = { value: "hello" };

// Generic class
class Box<T> {
  constructor(public value: T) {}

  getValue(): T {
    return this.value;
  }
}

// Generic constraints
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Multiple type parameters
function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

// Default type parameters
interface Box<T = string> {
  value: T;
}

// Generic type aliases
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type ReadonlyArray<T> = readonly T[];
```

---

## Utility Types

```typescript
// Partial<T> - Make all properties optional
interface User {
  name: string;
  age: number;
  email: string;
}
type PartialUser = Partial<User>;
// { name?: string; age?: number; email?: string }

// Required<T> - Make all properties required
type RequiredUser = Required<PartialUser>;

// Readonly<T> - Make all properties readonly
type ReadonlyUser = Readonly<User>;
// { readonly name: string; readonly age: number; readonly email: string }

// Record<K, T> - Object type with keys K and values T
type UserRoles = Record<string, string>;
type StatusMessages = Record<"active" | "inactive", string>;

// Pick<T, K> - Pick specific properties
type UserPreview = Pick<User, "name" | "email">;
// { name: string; email: string }

// Omit<T, K> - Omit specific properties
type UserWithoutEmail = Omit<User, "email">;
// { name: string; age: number }

// Exclude<T, U> - Exclude types from union
type T = Exclude<"a" | "b" | "c", "a">;
// "b" | "c"

// Extract<T, U> - Extract types from union
type T = Extract<"a" | "b" | "c", "a" | "f">;
// "a"

// NonNullable<T> - Exclude null and undefined
type T = NonNullable<string | null | undefined>;
// string

// ReturnType<T> - Extract function return type
function getUser() {
  return { name: "Alice", age: 25 };
}
type User = ReturnType<typeof getUser>;
// { name: string; age: number }

// Parameters<T> - Extract function parameter types
function greet(name: string, age: number) {}
type Params = Parameters<typeof greet>;
// [name: string, age: number]

// InstanceType<T> - Extract instance type of constructor
class User {}
type UserInstance = InstanceType<typeof User>;

// Awaited<T> - Extract Promise resolved type
type Result = Awaited<Promise<string>>;
// string
```

---

## Type Guards

```typescript
// typeof guard
function process(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase(); // string
  }
  return value * 2; // number
}

// instanceof guard
class Dog {
  bark() {}
}
class Cat {
  meow() {}
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark(); // Dog
  } else {
    animal.meow(); // Cat
  }
}

// in operator
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim(); // Fish
  } else {
    animal.fly(); // Bird
  }
}

// Custom type guard (type predicate)
function isString(value: unknown): value is string {
  return typeof value === "string";
}

if (isString(value)) {
  console.log(value.toUpperCase()); // string
}

// Truthiness narrowing
function printLength(str: string | null) {
  if (str) {
    console.log(str.length); // string
  } else {
    console.log("null");
  }
}

// Equality narrowing
function process(x: string | number, y: string | boolean) {
  if (x === y) {
    // x and y are both string
    console.log(x.toUpperCase());
    console.log(y.toUpperCase());
  }
}

// Discriminated unions
type Success = { status: "success"; data: string };
type Error = { status: "error"; error: string };
type Result = Success | Error;

function handle(result: Result) {
  if (result.status === "success") {
    console.log(result.data); // Success
  } else {
    console.log(result.error); // Error
  }
}
```

---

## Advanced Types

```typescript
// Mapped types
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

type ReadonlyPartial<T> = {
  readonly [P in keyof T]?: T[P];
};

// Conditional types
type IsString<T> = T extends string ? true : false;

type Result1 = IsString<string>; // true
type Result2 = IsString<number>; // false

// Template literal types
type EventName<T extends string> = `${T}Changed`;
type UserEvent = EventName<"user">; // "userChanged"

type Getter<T extends string> = `get${Capitalize<T>}`;
type UserGetter = Getter<"user">; // "getUser"

// Indexed access types
interface User {
  name: string;
  age: number;
}

type Name = User["name"]; // string
type NameOrAge = User["name" | "age"]; // string | number

// keyof operator
type UserKeys = keyof User; // "name" | "age"

// typeof operator
const user = { name: "Alice", age: 25 };
type User = typeof user; // { name: string; age: number }

// infer keyword
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Recursive types
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

// Brand types (nominal typing)
type UserId = string & { readonly __brand: "UserId" };
type ProductId = string & { readonly __brand: "ProductId" };

function createUserId(id: string): UserId {
  return id as UserId;
}
```

---

## Decorators

```typescript
// Enable in tsconfig.json: "experimentalDecorators": true

// Class decorator
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class User {
  name: string;
}

// Method decorator
function log(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${key} with`, args);
    return original.apply(this, args);
  };
}

class User {
  @log
  greet(name: string) {
    return `Hello, ${name}`;
  }
}

// Property decorator
function readonly(target: any, key: string) {
  Object.defineProperty(target, key, {
    writable: false
  });
}

class User {
  @readonly
  id: number = 1;
}

// Parameter decorator
function required(target: any, key: string, index: number) {
  // Mark parameter as required
}

class User {
  greet(@required name: string) {
    return `Hello, ${name}`;
  }
}
```

---

## Compiler Options

```json
{
  "compilerOptions": {
    // Language and Environment
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,

    // Modules
    "module": "commonjs",
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    },
    "resolveJsonModule": true,

    // Emit
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,

    // Type Checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    // Interop Constraints
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,

    // Performance
    "skipLibCheck": true,
    "incremental": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Common Patterns

### Result Type

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return { success: false, error: new Error("Division by zero") };
  }
  return { success: true, data: a / b };
}
```

### Builder Pattern

```typescript
class UserBuilder {
  private user: Partial<User> = {};

  setName(name: string): this {
    this.user.name = name;
    return this;
  }

  setAge(age: number): this {
    this.user.age = age;
    return this;
  }

  build(): User {
    return this.user as User;
  }
}

const user = new UserBuilder()
  .setName("Alice")
  .setAge(25)
  .build();
```

### Type-Safe Event Emitter

```typescript
type EventMap = {
  userCreated: { id: number; name: string };
  userDeleted: { id: number };
};

class EventEmitter<T extends Record<string, any>> {
  private listeners: { [K in keyof T]?: Array<(data: T[K]) => void> } = {};

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.listeners[event]?.forEach(listener => listener(data));
  }
}

const emitter = new EventEmitter<EventMap>();
emitter.on("userCreated", (data) => {
  console.log(data.name); // Type-safe!
});
```

---

## Quick Tips

1. **Enable strict mode**: `"strict": true`
2. **Prefer `unknown` over `any`** for type-safe dynamic values
3. **Use `const` assertions** for literal types: `as const`
4. **Leverage type inference** - don't over-annotate
5. **Use union types** instead of enums when possible
6. **Prefer interfaces for objects**, types for everything else
7. **Use utility types** to transform existing types
8. **Write type guards** for better type narrowing
9. **Use generics** for reusable, flexible code
10. **Document complex types** with JSDoc comments

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)
- [Type Challenges](https://github.com/type-challenges/type-challenges)

---

**Last Updated**: 2025
