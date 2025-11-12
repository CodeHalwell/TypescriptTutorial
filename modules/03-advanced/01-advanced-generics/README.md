# Advanced Generics

Master advanced generic patterns including variance, higher-kinded types, and complex constraints.

## Table of Contents

- [Variance](#variance)
- [Higher-Kinded Types Simulation](#higher-kinded-types-simulation)
- [Advanced Constraints](#advanced-constraints)
- [Conditional Generic Constraints](#conditional-generic-constraints)
- [Generic Factories](#generic-factories)
- [Best Practices](#best-practices)

---

## Variance

Variance describes how subtyping between complex types relates to subtyping between their components.

### Covariance

A type constructor is **covariant** if the subtype relationship is preserved:

```typescript
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// Arrays are covariant in TypeScript
const dogs: Dog[] = [{ name: "Buddy", breed: "Golden Retriever" }];
const animals: Animal[] = dogs; // ✅ OK

// This is why we can assign Dog[] to Animal[]
// If Dog <: Animal, then Array<Dog> <: Array<Animal>
```

**Read-only structures are safely covariant:**

```typescript
// ReadonlyArray is covariant
const readonlyDogs: readonly Dog[] = [{ name: "Buddy", breed: "Golden" }];
const readonlyAnimals: readonly Animal[] = readonlyDogs; // ✅ OK
```

### Contravariance

Function parameters are **contravariant** - the subtype relationship is reversed:

```typescript
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

const handleAnimal: AnimalHandler = (animal) => {
  console.log(animal.name);
};

// ✅ OK: Can use AnimalHandler where DogHandler is expected
const handleDog: DogHandler = handleAnimal;

// ❌ Not OK: Can't use DogHandler where AnimalHandler is expected
const handleAnimal2: AnimalHandler = ((dog: Dog) => {
  console.log(dog.breed);
}) as AnimalHandler; // Type assertion needed (unsafe!)

// Why? AnimalHandler might receive a Cat, not just Dogs!
```

### Invariance

A type is **invariant** if it's neither covariant nor contravariant:

```typescript
interface Container<T> {
  get(): T;
  set(value: T): void;
}

// Invariant: Can't assign Container<Dog> to Container<Animal>
const dogContainer: Container<Dog> = {
  get: () => ({ name: "Buddy", breed: "Golden" }),
  set: (dog) => console.log(dog.breed)
};

// ❌ Not OK: Container is invariant
// const animalContainer: Container<Animal> = dogContainer;

// Why? If allowed, we could do:
// animalContainer.set({ name: "Whiskers" }); // Cat!
// But dogContainer.set expects a Dog with breed property
```

### Variance in TypeScript

```typescript
// Covariant: Output positions (return types)
type Producer<T> = () => T;

const produceDog: Producer<Dog> = () => ({
  name: "Buddy",
  breed: "Golden"
});
const produceAnimal: Producer<Animal> = produceDog; // ✅ OK

// Contravariant: Input positions (parameters)
type Consumer<T> = (value: T) => void;

const consumeAnimal: Consumer<Animal> = (animal) => {
  console.log(animal.name);
};
const consumeDog: Consumer<Dog> = consumeAnimal; // ✅ OK

// Invariant: Both input and output
type Storage<T> = {
  get(): T;
  set(value: T): void;
};
```

---

## Higher-Kinded Types Simulation

TypeScript doesn't have true higher-kinded types (HKTs), but we can simulate them:

### Basic Simulation

```typescript
// Define a type-level interface for type constructors
interface HKT {
  readonly _A?: unknown; // Type parameter placeholder
  readonly _T?: unknown; // Result type placeholder
}

// Define type constructor
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

### Functor Pattern with HKT

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

### Monad Pattern with HKT

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

// Usage
const result1 = ArrayMonad.flatMap([1, 2, 3], x => [x, x * 2]);
// [1, 2, 2, 4, 3, 6]

const result2 = PromiseMonad.flatMap(
  Promise.resolve(5),
  x => Promise.resolve(x * 2)
); // Promise<10>
```

---

## Advanced Constraints

### Multiple Type Constraints

```typescript
// Require multiple constraints
function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

const merged = merge({ a: 1 }, { b: 2 }); // { a: number, b: number }

// ❌ Error: number doesn't extend object
// merge(1, { b: 2 });
```

### Constrain with keyof

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

### Constrain with Conditional Types

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

```typescript
// Require constructor signature
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

---

## Conditional Generic Constraints

### Based on Type Properties

```typescript
// Only allow objects with specific properties
type HasId<T> = T extends { id: unknown } ? T : never;

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

```typescript
// Return type depends on input type
type StringOrNumber<T> = T extends string ? string : number;

function double<T extends string | number>(value: T): StringOrNumber<T> {
  if (typeof value === "string") {
    return (value + value) as StringOrNumber<T>;
  }
  return (value * 2) as StringOrNumber<T>;
}

const str = double("hello"); // string
const num = double(5); // number
```

### Distributive Constraints

```typescript
// Distribute over union types
type ToArray<T> = T extends any ? T[] : never;

type Result = ToArray<string | number>;
// string[] | number[] (not (string | number)[])

// Wrap nullable types
type NonNullable<T> = T extends null | undefined ? never : T;

type Result1 = NonNullable<string | null>; // string
type Result2 = NonNullable<number | undefined>; // number
type Result3 = NonNullable<boolean | null | undefined>; // boolean
```

---

## Generic Factories

### Factory Functions

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

// Generic factory function
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

### Builder Pattern with Generics

```typescript
class Builder<T> {
  private props: Partial<T> = {};

  set<K extends keyof T>(key: K, value: T[K]): this {
    this.props[key] = value;
    return this;
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
  .set("name", "Alice")
  .set("age", 30)
  .set("email", "alice@example.com")
  .build();
```

### Type-Safe Event Emitter

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
});

emitter.emit("userLoggedIn", {
  userId: 123,
  timestamp: new Date()
}); // ✅ Type-safe!

// ❌ Error: wrong event data type
// emitter.emit("userLoggedIn", { userId: "123" });
```

---

## Best Practices

### 1. Prefer Specific Constraints

```typescript
// ❌ Too generic
function process<T>(value: T): T {
  return value;
}

// ✅ Specific constraints
function process<T extends { id: number }>(value: T): T {
  console.log(`Processing item ${value.id}`);
  return value;
}
```

### 2. Use Descriptive Type Parameters

```typescript
// ❌ Non-descriptive
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

// ✅ Descriptive
function map<TInput, TOutput>(
  arr: TInput[],
  fn: (item: TInput) => TOutput
): TOutput[] {
  return arr.map(fn);
}
```

### 3. Avoid Excessive Generic Parameters

```typescript
// ❌ Too many generic parameters
function complex<T, U, V, W, X>(
  a: T,
  b: U,
  c: V,
  d: W,
  e: X
): [T, U, V, W, X] {
  return [a, b, c, d, e];
}

// ✅ Simplify or use interfaces
interface ComplexInput<T, U, V> {
  a: T;
  b: U;
  c: V;
}

function complex<T, U, V>(input: ComplexInput<T, U, V>): ComplexInput<T, U, V> {
  return input;
}
```

### 4. Leverage Type Inference

```typescript
// ❌ Explicit types when inference works
const result = map<number, string>([1, 2, 3], n => n.toString());

// ✅ Let TypeScript infer
const result = map([1, 2, 3], n => n.toString());
```

---

## Exercises

See [exercises/01-advanced-generics-exercises.md](../exercises/01-advanced-generics-exercises.md) for practice problems.

---

## Next Steps

Continue to [02. Template Literal Types](../02-template-literals/README.md) to learn type-level string manipulation.

---

**Practice**: The best way to master variance and advanced generics is through hands-on coding. Try the exercises!
