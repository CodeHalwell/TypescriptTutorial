# Module 3: Advanced TypeScript & Design Patterns

Master advanced TypeScript features and architectural patterns for building robust, maintainable applications.

## 🎯 Learning Objectives

By the end of this module, you will be able to:

- Understand and apply variance in generic types
- Simulate higher-kinded types in TypeScript
- Use template literal types for advanced string manipulation
- Create recursive and conditional types
- Perform type-level programming
- Master the `infer` keyword for type extraction
- Implement brand types for nominal typing
- Apply classic design patterns in TypeScript
- Follow SOLID principles in your code
- Understand functional programming patterns (Maybe, Either, IO monads)

## ⏱️ Estimated Time

**3-4 weeks** (assuming 5-10 hours per week)

## 📚 Module Structure

### [01. Advanced Generics](./01-advanced-generics/README.md)
- Variance (covariance, contravariance, invariance)
- Higher-kinded types simulation
- Generic constraints with multiple bounds
- Conditional generic constraints
- Default type parameters
- Generic factories

### [02. Template Literal Types](./02-template-literals/README.md)
- Template literal type syntax
- String manipulation at type level
- Uppercase, Lowercase, Capitalize, Uncapitalize
- Pattern matching with template literals
- Building type-safe APIs with template literals
- Route type generation

### [03. Recursive Types](./03-recursive-types/README.md)
- Recursive type definitions
- Recursive data structures (trees, linked lists)
- Deep readonly and partial types
- Flattening nested types
- JSON type representation
- Tail recursion optimization

### [04. Type-Level Programming](./04-type-level-programming/README.md)
- Types as values
- Type-level functions
- Type-level conditionals
- Type-level loops
- Building complex types from primitives
- Type-level algorithms

### [05. The infer Keyword](./05-infer-keyword/README.md)
- Understanding `infer`
- Inferring function return types
- Inferring function parameters
- Inferring array element types
- Conditional type inference
- Advanced inference patterns

### [06. Brand Types](./06-brand-types/README.md)
- Nominal typing vs structural typing
- Creating branded types
- Type-safe IDs
- Validated types (email, URL, etc.)
- Opaque types
- Best practices

### [07. Design Patterns](./07-design-patterns/README.md)
- **Creational**: Factory, Abstract Factory, Singleton, Builder
- **Structural**: Adapter, Decorator, Facade, Proxy
- **Behavioral**: Observer, Strategy, Command, State
- TypeScript-specific patterns
- When to use each pattern

### [08. SOLID Principles](./08-solid-principles/README.md)
- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle
- Applying SOLID in TypeScript

### [09. Functional Patterns](./09-functional-patterns/README.md)
- Maybe/Option monad
- Either/Result monad
- IO monad
- Functors, Applicatives, Monads
- Function composition
- Immutability patterns
- Algebraic data types

## 🔑 Key Concepts Preview

### Variance

Understanding how type relationships change with generics:

```typescript
// Covariance: Array<T> is covariant in T
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

const dogs: Dog[] = [{ name: "Buddy", breed: "Golden" }];
const animals: Animal[] = dogs; // ✅ OK (covariant)

// Contravariance: Function parameters are contravariant
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

const handleAnimal: AnimalHandler = (animal) => console.log(animal.name);
const handleDog: DogHandler = handleAnimal; // ✅ OK (contravariant)
```

### Template Literal Types

Type-safe string manipulation:

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type Route = "/users" | "/posts" | "/comments";

// Combine types with template literals
type Endpoint = `${HttpMethod} ${Route}`;
// "GET /users" | "GET /posts" | ... | "DELETE /comments"

// Extract parts from strings
type ExtractRouteParams<T extends string> =
  T extends `${string}/:${infer Param}/${infer Rest}`
    ? Param | ExtractRouteParams<`/${Rest}`>
    : T extends `${string}/:${infer Param}`
    ? Param
    : never;

type Params = ExtractRouteParams<"/users/:id/posts/:postId">;
// "id" | "postId"
```

### Recursive Types

Build complex nested structures:

```typescript
// Deep readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

interface User {
  name: string;
  address: {
    street: string;
    city: string;
  };
}

type ReadonlyUser = DeepReadonly<User>;
// All properties and nested properties are readonly
```

### Design Patterns: Factory

```typescript
interface Product {
  operation(): string;
}

class ConcreteProductA implements Product {
  operation(): string {
    return "Product A";
  }
}

class ConcreteProductB implements Product {
  operation(): string {
    return "Product B";
  }
}

abstract class Creator {
  abstract factoryMethod(): Product;

  someOperation(): string {
    const product = this.factoryMethod();
    return `Creator: ${product.operation()}`;
  }
}

class CreatorA extends Creator {
  factoryMethod(): Product {
    return new ConcreteProductA();
  }
}

class CreatorB extends Creator {
  factoryMethod(): Product {
    return new ConcreteProductB();
  }
}
```

### SOLID: Single Responsibility

```typescript
// ❌ Bad: Multiple responsibilities
class User {
  name: string;
  email: string;

  saveToDatabase() {
    // Database logic
  }

  sendEmail() {
    // Email logic
  }

  generateReport() {
    // Reporting logic
  }
}

// ✅ Good: Single responsibility
class User {
  constructor(public name: string, public email: string) {}
}

class UserRepository {
  save(user: User) {
    // Database logic
  }
}

class EmailService {
  send(to: string, subject: string, body: string) {
    // Email logic
  }
}

class ReportGenerator {
  generate(user: User) {
    // Reporting logic
  }
}
```

### Functional Pattern: Maybe

```typescript
class Maybe<T> {
  private constructor(private value: T | null) {}

  static some<T>(value: T): Maybe<T> {
    return new Maybe(value);
  }

  static none<T>(): Maybe<T> {
    return new Maybe<T>(null);
  }

  map<U>(fn: (value: T) => U): Maybe<U> {
    if (this.value === null) {
      return Maybe.none<U>();
    }
    return Maybe.some(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
    if (this.value === null) {
      return Maybe.none<U>();
    }
    return fn(this.value);
  }

  getOrElse(defaultValue: T): T {
    return this.value === null ? defaultValue : this.value;
  }
}

// Usage
const user = Maybe.some({ name: "Alice", age: 25 });
const userName = user.map(u => u.name).getOrElse("Unknown");
```

## 🛠️ Prerequisites

Before starting this module:
- Complete [Module 1: TypeScript Foundations](../01-foundations/README.md)
- Complete [Module 2: Intermediate TypeScript](../02-intermediate/README.md)
- Be comfortable with generics and utility types

## 📖 Additional Resources

- [TypeScript Handbook - Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Type Challenges](https://github.com/type-challenges/type-challenges) - Practice advanced types
- [Design Patterns in TypeScript](https://refactoring.guru/design-patterns/typescript)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Functional Programming in TypeScript](https://github.com/gcanti/fp-ts)

## ✅ Module Completion Checklist

Before moving to Module 4, ensure you can:

- [ ] Explain variance and its implications
- [ ] Create template literal types for complex scenarios
- [ ] Write recursive type definitions
- [ ] Use the `infer` keyword effectively
- [ ] Implement brand types for type safety
- [ ] Apply appropriate design patterns
- [ ] Follow SOLID principles in code
- [ ] Understand functional programming concepts
- [ ] Complete all exercises in this module

## 🚀 Next Steps

Once you complete this module:
- [Module 4: Framework Integrations](../04-frameworks/README.md) - Apply concepts in real frameworks
- [Module 7: Advanced Patterns & Architecture](../07-architecture/README.md) - Architectural patterns
- [Module 9: Real-World Projects](../09-projects/README.md) - Build production applications

---

**Ready to dive deep into TypeScript?** Let's master these advanced concepts!

**Questions or Issues?** Open an issue or check the [Troubleshooting Guide](../../resources/troubleshooting.md).
