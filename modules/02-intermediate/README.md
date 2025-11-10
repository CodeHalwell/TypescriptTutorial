# Module 2: Intermediate TypeScript

Master advanced type patterns, generics, and utility types to write flexible, reusable TypeScript code.

## 🎯 Learning Objectives

By the end of this module, you will be able to:

- Write generic functions, interfaces, and classes with constraints
- Create and use mapped types, conditional types, and template literal types
- Leverage built-in utility types effectively
- Implement custom type guards for type narrowing
- Use discriminated unions for type-safe state management
- Work with modules, namespaces, and declaration files
- Integrate TypeScript with JavaScript libraries
- Apply experimental decorators

## ⏱️ Estimated Time

**2-3 weeks** (assuming 5-10 hours per week)

## 📚 Module Structure

### 01. Generics
- Generic functions
- Generic interfaces and classes
- Generic constraints
- Default type parameters
- Multiple type parameters

### 02. Advanced Types
- Mapped types
- Conditional types
- Template literal types
- Indexed access types
- Recursive types

### 03. Utility Types
- Partial, Required, Readonly
- Pick, Omit, Record
- Exclude, Extract, NonNullable
- ReturnType, Parameters, InstanceType
- Creating custom utility types

### 04. Type Guards
- typeof guards
- instanceof guards
- in operator
- Custom type predicates
- Assertion functions

### 05. Discriminated Unions
- Union types with discriminant properties
- Exhaustiveness checking
- State machines with unions
- Error handling patterns

### 06. Modules and Namespaces
- ES Modules vs CommonJS
- Import and export syntax
- Re-exporting
- Dynamic imports
- Namespaces (legacy)

### 07. Declaration Files
- .d.ts files
- DefinitelyTyped
- @types packages
- Writing declaration files
- Augmenting existing types

### 08. Decorators
- Class decorators
- Method decorators
- Property decorators
- Parameter decorators
- Decorator factories

## 🔑 Key Concepts

### Generics

Generics allow you to write reusable code that works with multiple types:

```typescript
// Without generics (limited)
function identity(value: number): number {
  return value;
}

// With generics (reusable)
function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42);
const str = identity<string>("hello");
const auto = identity(true); // Type inferred as boolean
```

### Utility Types

Built-in type transformations save time and improve code quality:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Make all properties optional
type PartialUser = Partial<User>;

// Pick specific properties
type UserPreview = Pick<User, "id" | "name">;

// Omit specific properties
type UserWithoutEmail = Omit<User, "email">;

// Make all properties readonly
type ReadonlyUser = Readonly<User>;
```

### Discriminated Unions

Type-safe state management with discriminant properties:

```typescript
type State =
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; error: Error };

function handle(state: State) {
  switch (state.status) {
    case "loading":
      console.log("Loading...");
      break;
    case "success":
      console.log(state.data); // Type-safe access
      break;
    case "error":
      console.log(state.error.message); // Type-safe access
      break;
  }
}
```

## 🛠️ Prerequisites

Before starting this module, ensure you have completed:
- [Module 1: TypeScript Foundations](../01-foundations/README.md)

You should be comfortable with:
- Basic types and type annotations
- Interfaces and type aliases
- Function typing
- Union and intersection types

## 📖 Additional Resources

- [TypeScript Handbook - Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript Handbook - Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [TypeScript Handbook - Type Manipulation](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)

## ✅ Module Completion Checklist

Before moving to Module 3, ensure you can:

- [ ] Write generic functions with constraints
- [ ] Create reusable components with generics
- [ ] Use utility types to transform existing types
- [ ] Implement custom type guards
- [ ] Design discriminated unions for complex state
- [ ] Work with declaration files
- [ ] Apply decorators appropriately
- [ ] Complete all exercises in this module

## 🚀 Next Steps

Once you complete this module, proceed to [Module 3: Advanced TypeScript & Design Patterns](../03-advanced/README.md) to learn type-level programming and architectural patterns.

---

**Coming Soon**: Detailed lessons for each section are being added. Check back soon!

**Questions or Issues?** Open an issue in the repository or check the [Troubleshooting Guide](../../resources/troubleshooting.md).
