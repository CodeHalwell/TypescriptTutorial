# TypeScript Glossary

Comprehensive definitions of TypeScript terminology.

## A

**Abstract Class**
A class that cannot be instantiated directly and may contain abstract methods that must be implemented by derived classes.

```typescript
abstract class Animal {
  abstract makeSound(): void;
  move(): void {
    console.log("Moving...");
  }
}
```

**Ambient Declaration**
Type declarations that describe the shape of code that exists elsewhere, typically in `.d.ts` files.

```typescript
declare module "my-library" {
  export function doSomething(): void;
}
```

**any**
A type that disables type checking. Allows any value and operations.

```typescript
let value: any = "hello";
value = 42;
value.anything.works();
```

**Arrow Function**
Concise function syntax using `=>`.

```typescript
const add = (a: number, b: number): number => a + b;
```

**Assertion (Type Assertion)**
Telling TypeScript to treat a value as a specific type.

```typescript
const input = document.getElementById("input") as HTMLInputElement;
```

## B

**Brand Type**
A technique for creating nominal types in TypeScript's structural type system.

```typescript
type UserId = string & { readonly __brand: "UserId" };
```

## C

**Call Signature**
Describes how a function can be called, including parameter types and return type.

```typescript
type GreetFunction = {
  (name: string): string;
};
```

**Class**
A blueprint for creating objects with shared properties and methods.

```typescript
class User {
  constructor(public name: string) {}
  greet(): string {
    return `Hello, ${this.name}`;
  }
}
```

**Compilation**
The process of transforming TypeScript code into JavaScript.

**Compiler**
The TypeScript compiler (`tsc`) that transforms `.ts` files to `.js` files.

**Conditional Type**
A type that selects one of two types based on a condition.

```typescript
type IsString<T> = T extends string ? true : false;
```

**Const Assertion**
Tells TypeScript to infer the most literal type possible.

```typescript
const config = {
  apiUrl: "https://api.example.com"
} as const;
// Type: { readonly apiUrl: "https://api.example.com" }
```

**Constructor**
A special method for initializing class instances.

```typescript
class User {
  constructor(public name: string) {}
}
```

**Contravariance**
When a type parameter can be replaced with a less specific type.

## D

**Declaration File (.d.ts)**
Files containing type declarations without implementation.

```typescript
// types.d.ts
export interface User {
  id: number;
  name: string;
}
```

**Declaration Merging**
TypeScript's ability to merge multiple declarations with the same name.

```typescript
interface User {
  name: string;
}
interface User {
  age: number;
}
// Merged: { name: string; age: number }
```

**Decorator**
Special declarations for modifying classes, methods, properties, or parameters.

```typescript
@sealed
class User {}
```

**Discriminated Union**
Union type with a common discriminant property for type narrowing.

```typescript
type Result =
  | { status: "success"; data: string }
  | { status: "error"; error: string };
```

**Duck Typing**
"If it walks like a duck and quacks like a duck, it's a duck." TypeScript uses structural typing.

## E

**Enum**
A way to define named constants.

```typescript
enum Color {
  Red,
  Green,
  Blue
}
```

**Excess Property Check**
TypeScript's check for extra properties in object literals.

```typescript
interface User {
  name: string;
}
const user: User = {
  name: "Alice",
  age: 25 // Error: Excess property
};
```

**extends**
Keyword for class inheritance or generic constraints.

```typescript
class Admin extends User {}
function log<T extends { toString(): string }>(value: T) {}
```

## F

**Function Overload**
Multiple function signatures for the same function name.

```typescript
function makeDate(timestamp: number): Date;
function makeDate(y: number, m: number, d: number): Date;
function makeDate(yOrTs: number, m?: number, d?: number): Date {
  // Implementation
}
```

**Function Type Expression**
Syntax for describing function types.

```typescript
type GreetFunction = (name: string) => string;
```

## G

**Generic**
Type parameter that makes code reusable with different types.

```typescript
function identity<T>(value: T): T {
  return value;
}
```

**Generic Constraint**
Restricting what types a generic can accept.

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}
```

**Guard Clause**
Early return to handle edge cases.

```typescript
function process(value: string | null) {
  if (!value) return;
  // value is string here
}
```

## I

**implements**
Keyword for class implementing an interface.

```typescript
interface Greetable {
  greet(): string;
}
class User implements Greetable {
  greet() {
    return "Hello";
  }
}
```

**Index Signature**
Allows dynamic property names on objects.

```typescript
interface Dictionary {
  [key: string]: number;
}
```

**Indexed Access Type**
Access a type's property type.

```typescript
type Person = { name: string; age: number };
type Name = Person["name"]; // string
```

**infer**
Keyword for inferring types in conditional types.

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
```

**Interface**
Defines the structure of an object.

```typescript
interface User {
  id: number;
  name: string;
}
```

**Intersection Type**
Combines multiple types into one.

```typescript
type A = { a: number };
type B = { b: string };
type C = A & B; // { a: number; b: string }
```

## K

**keyof**
Operator that gets all keys of a type.

```typescript
type Person = { name: string; age: number };
type PersonKeys = keyof Person; // "name" | "age"
```

## L

**Literal Type**
A type that represents a specific value.

```typescript
let status: "active" | "inactive" = "active";
const pi: 3.14 = 3.14;
```

## M

**Mapped Type**
Transform properties of one type to create another.

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

**Module**
File that exports declarations for use in other files.

```typescript
// math.ts
export function add(a: number, b: number): number {
  return a + b;
}
```

**Module Resolution**
How TypeScript finds and loads modules.

## N

**Namespace**
Way to organize code (less common in modern TypeScript).

```typescript
namespace Utils {
  export function log(message: string) {
    console.log(message);
  }
}
```

**Narrowing**
TypeScript refining a type based on control flow analysis.

```typescript
function process(value: string | number) {
  if (typeof value === "string") {
    // value is string here
  }
}
```

**never**
Type representing values that never occur.

```typescript
function throwError(message: string): never {
  throw new Error(message);
}
```

**Nominal Typing**
Type system where types with the same structure are not compatible unless explicitly related. TypeScript uses structural typing, but nominal typing can be simulated.

**Non-null Assertion (!)**
Tells TypeScript a value is definitely not null/undefined.

```typescript
const value = maybeNull!; // Assert not null
```

## O

**Optional Chaining (?.)**
Safely access nested properties.

```typescript
const email = user?.contact?.email;
```

**Optional Property**
Property that may or may not exist.

```typescript
interface User {
  name: string;
  age?: number; // Optional
}
```

**Overload**
See Function Overload.

## P

**Parameter**
Input to a function.

```typescript
function greet(name: string) {
  // name is parameter
}
```

**Partial**
Utility type making all properties optional.

```typescript
type User = { name: string; age: number };
type PartialUser = Partial<User>;
// { name?: string; age?: number }
```

**Pick**
Utility type selecting specific properties.

```typescript
type User = { name: string; age: number; email: string };
type UserPreview = Pick<User, "name" | "email">;
// { name: string; email: string }
```

**Polymorphism**
Ability to work with multiple types.

**Primitive Type**
Basic types: string, number, boolean, symbol, bigint, null, undefined.

**Property**
Member of an object or class.

```typescript
interface User {
  name: string; // Property
}
```

## R

**readonly**
Modifier preventing property modification.

```typescript
interface User {
  readonly id: number;
}
```

**Record**
Utility type creating object type with specific keys and values.

```typescript
type UserRoles = Record<string, string>;
```

**Rest Parameters**
Function parameter accepting multiple arguments.

```typescript
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}
```

**Return Type**
Type that a function returns.

```typescript
function greet(name: string): string {
  // string is return type
  return `Hello, ${name}`;
}
```

## S

**Signature**
Description of function parameters and return type.

**Spread Operator (...)**
Expands elements.

```typescript
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];
```

**Strict Mode**
Compiler option enabling all strict type checks.

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

**Structural Typing**
Type compatibility based on structure, not names.

```typescript
interface Point {
  x: number;
  y: number;
}
const point = { x: 0, y: 0, z: 0 };
const p: Point = point; // OK, has x and y
```

## T

**Template Literal Type**
Type-level string manipulation.

```typescript
type Greeting = `Hello, ${string}!`;
```

**Transpilation**
Converting TypeScript to JavaScript.

**tsconfig.json**
TypeScript configuration file.

**Tuple**
Array with fixed length and known types at each position.

```typescript
type Point = [number, number];
const p: Point = [10, 20];
```

**Type Alias**
Create a name for a type.

```typescript
type Name = string;
type User = { name: string; age: number };
```

**Type Annotation**
Explicitly specifying a type.

```typescript
let name: string = "Alice";
```

**Type Assertion**
Telling TypeScript to treat a value as a specific type.

```typescript
const value = input as string;
```

**Type Guard**
Function or expression that narrows types.

```typescript
function isString(value: unknown): value is string {
  return typeof value === "string";
}
```

**Type Inference**
TypeScript automatically determining types.

```typescript
let num = 42; // Inferred as number
```

**Type Parameter**
Generic placeholder for a type.

```typescript
function identity<T>(value: T): T {
  return value;
}
```

**Type Predicate**
Return type for type guard functions.

```typescript
function isString(value: unknown): value is string {
  // "value is string" is type predicate
  return typeof value === "string";
}
```

**typeof**
Operator getting type of a value.

```typescript
const user = { name: "Alice", age: 25 };
type User = typeof user;
```

## U

**Union Type**
Type that can be one of several types.

```typescript
type ID = number | string;
function process(value: string | number) {}
```

**unknown**
Type-safe alternative to any.

```typescript
let value: unknown = "hello";
// Must narrow before use
if (typeof value === "string") {
  console.log(value.toUpperCase());
}
```

**Utility Type**
Built-in type transformations.

Examples: `Partial<T>`, `Required<T>`, `Readonly<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, T>`, `Exclude<T, U>`, `Extract<T, U>`, `NonNullable<T>`, `ReturnType<T>`, `Parameters<T>`, `InstanceType<T>`

## V

**Variance**
How type relationships change with type parameters.

**void**
Return type for functions that don't return a value.

```typescript
function log(message: string): void {
  console.log(message);
}
```

## W

**Widening**
TypeScript inferring a less specific type.

```typescript
let status = "active"; // Widened to string
const status = "active"; // Literal type "active"
```

---

## Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)

---

**Back to:**
- [Cheat Sheet](./cheatsheet.md)
- [Comparisons](./comparisons.md)
- [Troubleshooting](./troubleshooting.md)
- [Main README](../README.md)
