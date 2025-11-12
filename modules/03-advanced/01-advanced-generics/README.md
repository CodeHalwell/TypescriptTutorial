# Advanced Generics

Master advanced generic patterns including variance, higher-kinded types, and complex constraints.

## Table of Contents

- [Introduction](#introduction)
- [Variance](#variance)
- [Higher-Kinded Types Simulation](#higher-kinded-types-simulation)
- [Advanced Constraints](#advanced-constraints)
- [Conditional Generic Constraints](#conditional-generic-constraints)
- [Generic Factories](#generic-factories)
- [Best Practices](#best-practices)

---

## Introduction

By now you're familiar with basic generics from the foundations module. This module takes generics to the next level - understanding how type relationships work (variance), simulating advanced functional programming patterns, and building type-safe generic utilities.

**What you'll learn:**
- How subtype relationships affect generic types (variance)
- Simulating higher-kinded types for functional patterns
- Advanced constraint techniques
- Building type-safe generic factories and patterns

**Prerequisites:** Comfortable with basic generics, interfaces, and type manipulation.

---

## Variance

Variance describes how subtyping between complex types relates to subtyping between their components. Understanding variance is crucial for writing type-safe generic code.

**In simple terms:** If `Dog` is a subtype of `Animal`, when can you use `Container<Dog>` where `Container<Animal>` is expected? The answer depends on variance.

###covariance

**Definition:** A type constructor is **covariant** if the subtype relationship is preserved.

**Rule:** If `Dog <: Animal`, then `Container<Dog> <: Container<Animal>`

```typescript
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// Arrays are covariant in TypeScript
const dogs: Dog[] = [{ name: "Buddy", breed: "Golden Retriever" }];
const animals: Animal[] = dogs; // ✅ OK - covariant

// This works because:
// - Dog extends Animal (Dog is a subtype of Animal)
// - Array preserves this relationship
// - Dog[] can be assigned to Animal[]
```

**Why this is safe for read-only structures:**

```typescript
// ReadonlyArray is covariant
const readonlyDogs: readonly Dog[] = [{ name: "Buddy", breed: "Golden" }];
const readonlyAnimals: readonly Animal[] = readonlyDogs; // ✅ OK

// Safe because we can only READ from readonly arrays
readonlyAnimals.forEach(animal => console.log(animal.name)); // ✅ Works
// readonlyAnimals.push(...); // ❌ Can't modify
```

**⚠️ Covariance can be unsafe for mutable structures:**

```typescript
const dogs: Dog[] = [{ name: "Buddy", breed: "Golden" }];
const animals: Animal[] = dogs; // ✅ Allowed (covariant)

// Problem: Can now add a Cat!
interface Cat extends Animal {
  meow(): void;
}

animals.push({ name: "Whiskers", meow: () => {} } as Cat);
// Now dogs array contains a Cat! This will crash:
// dogs[1].breed // undefined!
```

**💡 Key insight:** Covariance is safe for outputs (producers) but potentially unsafe for inputs (consumers).

### Contravariance

**Definition:** Function parameters are **contravariant** - the subtype relationship is reversed.

**Rule:** If `Dog <: Animal`, then `Handler<Animal> <: Handler<Dog>`

```typescript
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

const handleAnimal: AnimalHandler = (animal) => {
  console.log(animal.name); // Only uses Animal properties
};

// ✅ OK: Can use AnimalHandler where DogHandler is expected
const handleDog: DogHandler = handleAnimal;

// Why is this safe?
// - DogHandler might be called with a Dog
// - handleAnimal only uses Animal properties
// - Every Dog has Animal properties
// - So handleAnimal can handle any Dog
```

**Why the reverse assignment fails:**

```typescript
const handleDog: DogHandler = (dog) => {
  console.log(dog.breed); // Uses Dog-specific property
};

// ❌ Not OK: Can't use DogHandler where AnimalHandler is expected
const handleAnimal: AnimalHandler = handleDog; // Type error!

// Why is this unsafe?
// - AnimalHandler might be called with a Cat
// - handleDog tries to access dog.breed
// - Cats don't have breed property
// - This would crash!
```

**💡 Key insight:** Contravariance means function parameters have reversed subtype relationships. This ensures functions can handle broader types than requested.

### Invariance

**Definition:** A type is **invariant** if it's neither covariant nor contravariant - it's both a producer AND consumer.

```typescript
interface Container<T> {
  get(): T;      // Producer (covariant position)
  set(value: T): void;  // Consumer (contravariant position)
}

const dogContainer: Container<Dog> = {
  get: () => ({ name: "Buddy", breed: "Golden" }),
  set: (dog) => console.log(dog.breed)
};

// ❌ Not OK: Container is invariant
// const animalContainer: Container<Animal> = dogContainer; // Error!
```

**Why invariance is necessary:**

```typescript
// If the above were allowed:
// const animalContainer: Container<Animal> = dogContainer;

// Problem 1: Setting (contravariant)
// animalContainer.set({ name: "Whiskers" }); // Cat, not Dog!
// But dogContainer.set expects Dog with breed property

// Problem 2: Getting (covariant)
// const animal: Animal = animalContainer.get(); // Would work
// But we lose type information
```

**💡 Key insight:** Types that both produce and consume values must be invariant - neither covariant nor contravariant.

### Variance in TypeScript

**Quick reference for variance:**

```typescript
// Covariant: Output positions (return types)
type Producer<T> = () => T;

const produceDog: Producer<Dog> = () => ({
  name: "Buddy",
  breed: "Golden"
});
const produceAnimal: Producer<Animal> = produceDog; // ✅ Covariant

// Contravariant: Input positions (parameters)
type Consumer<T> = (value: T) => void;

const consumeAnimal: Consumer<Animal> = (animal) => {
  console.log(animal.name);
};
const consumeDog: Consumer<Dog> = consumeAnimal; // ✅ Contravariant

// Invariant: Both input and output
type Storage<T> = {
  get(): T;           // Output (covariant)
  set(value: T): void; // Input (contravariant)
};
// Result: Invariant (can't substitute either direction)
```

**Practical implications:**

- **Arrays/Promises** (covariant): Can use subtypes for supertypes
- **Function parameters** (contravariant): Can use supertypes for subtypes
- **Classes with setters** (invariant): Must match exactly

---

## Higher-Kinded Types Simulation

TypeScript doesn't have true higher-kinded types (HKTs), but we can simulate them for functional programming patterns.

**What are HKTs?** Types that abstract over type constructors (like `Array`, `Promise`) rather than concrete types.

**Why simulate them?** To write generic code that works with any "container type" - arrays, promises, options, etc.

### Basic Simulation

```typescript
// Define a type-level interface for type constructors
interface HKT {
  readonly _A?: unknown; // Type parameter placeholder
  readonly _T?: unknown; // Result type placeholder
}

// Define type constructors
interface ArrayHKT extends HKT {
  readonly _T: Array<this["_A"]>;
}

interface PromiseHKT extends HKT {
  readonly _T: Promise<this["_A"]>;
}

// Apply type constructor
type Apply<F extends HKT, A> = (F & { readonly _A: A })["_T"];

// Usage
type NumberArray = Apply<ArrayHKT, number>; // number[]
type StringPromise = Apply<PromiseHKT, string>; // Promise<string>
```

**How this works:**
1. `HKT` is a base interface with type parameter placeholders
2. Specific constructors (`ArrayHKT`, `PromiseHKT`) define their shape
3. `Apply<F, A>` plugs type `A` into constructor `F`
4. Result: Type-level function application

### Functor Pattern with HKT

**Functor:** A container you can map over, transforming the contents while preserving structure.

```typescript
interface Functor<F extends HKT> {
  map<A, B>(fa: Apply<F, A>, f: (a: A) => B): Apply<F, B>;
}

// Array Functor
const ArrayFunctor: Functor<ArrayHKT> = {
  map: (arr, f) => arr.map(f)
};

// Promise Functor
const PromiseFunctor: Functor<PromiseHKT> = {
  map: (promise, f) => promise.then(f)
};

// Usage
const numbers = [1, 2, 3];
const doubled = ArrayFunctor.map(numbers, x => x * 2); // [2, 4, 6]

const promise = Promise.resolve(5);
const result = PromiseFunctor.map(promise, x => x * 2); // Promise<10>
```

**Why this is useful:** Same `map` interface works for arrays, promises, or any functor!

### Monad Pattern with HKT

**Monad:** A functor with additional operations: `of` (wrap) and `flatMap` (chain).

```typescript
interface Monad<F extends HKT> extends Functor<F> {
  of<A>(value: A): Apply<F, A>;
  flatMap<A, B>(fa: Apply<F, A>, f: (a: A) => Apply<F, B>): Apply<F, B>;
}

const ArrayMonad: Monad<ArrayHKT> = {
  of: <A>(value: A) => [value],
  map: ArrayFunctor.map,
  flatMap: <A, B>(arr: A[], f: (a: A) => B[]) => arr.flatMap(f)
};

const PromiseMonad: Monad<PromiseHKT> = {
  of: <A>(value: A) => Promise.resolve(value),
  map: PromiseFunctor.map,
  flatMap: <A, B>(promise: Promise<A>, f: (a: A) => Promise<B>) =>
    promise.then(f)
};

// Usage - duplicate and double
const result1 = ArrayMonad.flatMap([1, 2, 3], x => [x, x * 2]);
// [1, 2, 2, 4, 3, 6]

// Usage - async chaining
const result2 = PromiseMonad.flatMap(
  Promise.resolve(5),
  x => Promise.resolve(x * 2)
); // Promise<10>
```

**Real-world use case:** Building pipelines that work with arrays OR promises using the same interface.

**📝 Note:** This is advanced functional programming. If you're not doing functional TypeScript, you can skip HKTs for now.

---

## Advanced Constraints

### Multiple Type Constraints

Require types to satisfy multiple conditions:

```typescript
// Require both types to be objects
function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

const merged = merge({ a: 1 }, { b: 2 }); // { a: number, b: number }

// ❌ Error: number doesn't extend object
// merge(1, { b: 2 });
```

**Why this matters:** Prevents merging primitives, which would fail at runtime.

### Constrain with keyof

Ensure a key actually exists in the object:

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "Alice", age: 30 };
const name = getProperty(person, "name"); // string
const age = getProperty(person, "age"); // number

// ❌ Error: "invalid" is not a key of person
// getProperty(person, "invalid");
```

**Benefits:**
- Autocomplete for valid keys
- Prevents typos in property access
- Return type is automatically correct

### Constrain with Conditional Types

Limit to types that satisfy certain conditions:

```typescript
// Only allow types that can be compared
type Comparable = string | number | Date;

function max<T extends Comparable>(a: T, b: T): T {
  return a > b ? a : b;
}

max(5, 10); // ✅ 10
max("a", "b"); // ✅ "b"
max(new Date(2024, 0, 1), new Date(2024, 0, 2)); // ✅ newer date

// ❌ Error: objects aren't comparable
// max({ a: 1 }, { a: 2 });
```

### Constrain Constructor Types

Require constructor signatures:

```typescript
// Generic factory for any class
type Constructor<T = {}> = new (...args: any[]) => T;

function createInstance<T>(ctor: Constructor<T>, ...args: any[]): T {
  return new ctor(...args);
}

class Person {
  constructor(public name: string, public age: number) {}
}

const person = createInstance(Person, "Alice", 30);
// Person { name: "Alice", age: 30 }
```

**Use case:** Dependency injection, factory patterns, plugin systems.

---

## Conditional Generic Constraints

### Based on Type Properties

Only accept objects with specific required properties:

```typescript
// Require id property
function findById<T extends { id: number }>(
  items: T[],
  id: number
): T | undefined {
  return items.find(item => item.id === id);
}

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
];

findById(users, 1); // ✅ { id: 1, name: "Alice" }

// ❌ Error: objects must have id property
// findById([{ name: "Alice" }], 1);
```

### Conditional Return Types

Return type depends on input type:

```typescript
// Return string for string input, number for number input
type StringOrNumber<T> = T extends string ? string : number;

function double<T extends string | number>(value: T): StringOrNumber<T> {
  if (typeof value === "string") {
    return (value + value) as StringOrNumber<T>;
  }
  return (value * 2) as StringOrNumber<T>;
}

const str = double("hello"); // Type: string
const num = double(5); // Type: number
```

**⚠️ Limitation:** TypeScript can't always narrow conditional types correctly, hence the type assertions.

### Distributive Constraints

Conditional types distribute over unions:

```typescript
// Wraps each union member in an array
type ToArray<T> = T extends any ? T[] : never;

type Result = ToArray<string | number>;
// string[] | number[] (distributes over union)
// NOT (string | number)[]

// Remove null and undefined
type NonNullable<T> = T extends null | undefined ? never : T;

type Result1 = NonNullable<string | null>; // string
type Result2 = NonNullable<number | undefined>; // number
type Result3 = NonNullable<boolean | null | undefined>; // boolean
```

**How distribution works:** When `T` is a union, conditional types apply to each member separately, then union the results.

---

## Generic Factories

### Factory Functions

Create instances through a generic factory:

```typescript
interface Factory<T> {
  create(...args: any[]): T;
}

class UserFactory implements Factory<User> {
  create(name: string, email: string): User {
    return new User(name, email);
  }
}

class ProductFactory implements Factory<Product> {
  create(name: string, price: number): Product {
    return new Product(name, price);
  }
}

// Generic factory creator
function createFactory<T>(
  ctor: new (...args: any[]) => T
): Factory<T> {
  return {
    create(...args: any[]) {
      return new ctor(...args);
    }
  };
}

const userFactory = createFactory(User);
const user = userFactory.create("Alice", "alice@example.com");
```

**Use cases:** Testing (mock factories), dependency injection, plugin systems.

### Builder Pattern with Generics

Fluent API for object construction:

```typescript
class Builder<T> {
  private props: Partial<T> = {};

  set<K extends keyof T>(key: K, value: T[K]): this {
    this.props[key] = value;
    return this; // Return 'this' for chaining
  }

  build(): T {
    return this.props as T;
  }
}

interface User {
  name: string;
  age: number;
  email: string;
}

const user = new Builder<User>()
  .set("name", "Alice")     // Returns Builder<User>
  .set("age", 30)           // Returns Builder<User>
  .set("email", "alice@example.com")  // Returns Builder<User>
  .build();                 // Returns User
```

**Benefits:**
- Type-safe property setting
- Fluent, readable API
- Prevents invalid object construction

### Type-Safe Event Emitter

Build an event emitter with full type safety:

```typescript
type EventMap = Record<string, any>;

class TypedEventEmitter<Events extends EventMap> {
  private listeners: {
    [K in keyof Events]?: Array<(data: Events[K]) => void>;
  } = {};

  on<K extends keyof Events>(
    event: K,
    listener: (data: Events[K]) => void
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }
}

// Usage
interface AppEvents {
  userLoggedIn: { userId: number; timestamp: Date };
  userLoggedOut: { userId: number };
  dataUpdated: { resource: string; data: any };
}

const emitter = new TypedEventEmitter<AppEvents>();

emitter.on("userLoggedIn", ({ userId, timestamp }) => {
  console.log(`User ${userId} logged in at ${timestamp}`);
  // TypeScript knows the exact shape of the data!
});

emitter.emit("userLoggedIn", {
  userId: 123,
  timestamp: new Date()
}); // ✅ Type-safe!

// ❌ Error: wrong event data type
// emitter.emit("userLoggedIn", { userId: "123" }); // userId should be number
```

**Real-world use:** Event buses, pub/sub systems, state management.

---

## Best Practices

### 1. Prefer Specific Constraints

```typescript
// ❌ Too generic - doesn't provide much value
function process<T>(value: T): T {
  return value;
}

// ✅ Specific constraints - enables useful operations
function process<T extends { id: number }>(value: T): T {
  console.log(`Processing item ${value.id}`);
  return value;
}
```

**Why:** Specific constraints enable better type checking and allow safe operations on the values.

### 2. Use Descriptive Type Parameters

```typescript
// ❌ Non-descriptive single letters
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

// ✅ Descriptive names make code self-documenting
function map<TInput, TOutput>(
  arr: TInput[],
  fn: (item: TInput) => TOutput
): TOutput[] {
  return arr.map(fn);
}
```

**Exception:** Single-letter names (`T`, `K`, `V`) are fine for very short, obvious functions.

### 3. Avoid Excessive Generic Parameters

```typescript
// ❌ Too many generic parameters - hard to understand
function complex<T, U, V, W, X>(
  a: T,
  b: U,
  c: V,
  d: W,
  e: X
): [T, U, V, W, X] {
  return [a, b, c, d, e];
}

// ✅ Simplify with interfaces
interface ComplexInput<T, U, V> {
  a: T;
  b: U;
  c: V;
}

function complex<T, U, V>(input: ComplexInput<T, U, V>): ComplexInput<T, U, V> {
  return input;
}
```

**Rule of thumb:** More than 3-4 generic parameters? Consider refactoring.

### 4. Leverage Type Inference

```typescript
// ❌ Explicit types when inference works fine
const result = map<number, string>([1, 2, 3], n => n.toString());

// ✅ Let TypeScript infer - cleaner and just as safe
const result = map([1, 2, 3], n => n.toString());
```

**When to be explicit:** When inference produces unexpected types or for API documentation.

---

## Exercises

Test your understanding with these advanced generic challenges:

1. **Variance Exercise:** Why is `Array<Dog>` assignable to `ReadonlyArray<Animal>` but not vice versa?
2. **HKT Exercise:** Implement a `Tree` functor that works with `TreeHKT`
3. **Constraints Exercise:** Write a generic `sortBy` function that only accepts sortable properties
4. **Factory Exercise:** Create a type-safe factory for a dependency injection container

See [exercises/01-advanced-generics-exercises.md](../exercises/01-advanced-generics-exercises.md) for full details and solutions.

---

## Next Steps

Continue to [02. Template Literal Types](../02-template-literals/README.md) to learn type-level string manipulation.

---

**Key Takeaways:**

- **Variance** determines how subtype relationships carry through generic types
- **Covariant** (outputs): Dog[] → Animal[]
- **Contravariant** (inputs): Handler<Animal> → Handler<Dog>
- **Invariant** (both): Container<Dog> ≠ Container<Animal>
- **HKTs** enable writing code that works with any container type
- **Advanced constraints** make generics safer and more expressive
- **Generic factories** provide type-safe object creation patterns

**Practice:** Variance and HKTs are best learned through hands-on coding. Try the exercises!
