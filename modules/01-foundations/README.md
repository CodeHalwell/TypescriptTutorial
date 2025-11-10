# Module 1: TypeScript Foundations

Welcome to TypeScript! This module covers the fundamental concepts you need to start writing TypeScript code with confidence.

## 🎯 Learning Objectives

By the end of this module, you will be able to:

- Set up a TypeScript development environment
- Understand TypeScript's type system and philosophy
- Work confidently with basic types, arrays, tuples, and enums
- Write type-safe functions with proper parameter and return types
- Choose between interfaces and type aliases appropriately
- Use union and intersection types effectively
- Apply type narrowing and assertions correctly
- Configure the TypeScript compiler for your needs

## ⏱️ Estimated Time

**2-3 weeks** (assuming 5-10 hours per week)

## 📚 Module Structure

### [01. Installation and Setup](./01-setup/README.md)
- Installing Node.js and TypeScript
- Setting up your IDE (VS Code recommended)
- Creating your first TypeScript project
- Understanding compilation and transpilation

### [02. Basic Types](./02-basic-types/README.md)
- Primitives: `string`, `number`, `boolean`
- Arrays and their syntax variations
- Tuples for fixed-length arrays
- Enums for named constants
- Special types: `any`, `unknown`, `void`, `never`, `null`, `undefined`

### [03. Functions](./03-functions/README.md)
- Parameter type annotations
- Return type annotations
- Optional and default parameters
- Rest parameters
- Function type expressions
- Call signatures

### [04. Interfaces and Type Aliases](./04-interfaces-and-types/README.md)
- Defining object shapes with interfaces
- Type aliases for complex types
- When to use interfaces vs type aliases
- Extending and implementing interfaces
- Index signatures

### [05. Unions and Intersections](./05-unions-and-intersections/README.md)
- Union types for "OR" relationships
- Intersection types for "AND" relationships
- Literal types
- Type aliases with unions
- Practical use cases

### [06. Type Narrowing](./06-type-narrowing/README.md)
- Type guards with `typeof` and `instanceof`
- Truthiness narrowing
- Equality narrowing
- The `in` operator
- Type assertions and non-null assertion operator

### [07. TypeScript Configuration](./07-tsconfig/README.md)
- Deep dive into `tsconfig.json`
- Compiler options explained
- Strict mode and why it matters
- Module resolution
- Path mapping

## 🎯 Exercises

The [exercises](./exercises/) directory contains hands-on challenges to reinforce your learning. Each exercise includes:
- Clear objectives
- Requirements
- Hints (expandable)
- Complete solutions in the `solutions/` folder

**Recommended approach**: Try each exercise after completing its corresponding section. Attempt the exercise before looking at the solution!

## 🔑 Key Concepts

### Type Safety

TypeScript's primary goal is to catch errors at **compile time** rather than **runtime**:

```typescript
// JavaScript - error only discovered at runtime
function greet(name) {
  return "Hello, " + name.toUpperCase();
}
greet(42); // Runtime error: name.toUpperCase is not a function

// TypeScript - error caught immediately
function greet(name: string): string {
  return "Hello, " + name.toUpperCase();
}
greet(42); // Compile error: Argument of type 'number' is not assignable to parameter of type 'string'
```

### Type Inference

TypeScript can often infer types automatically:

```typescript
// Type is inferred as number
let count = 0;

// Type is inferred as (x: number, y: number) => number
const add = (x: number, y: number) => x + y;

// Type is inferred as string[]
const names = ["Alice", "Bob", "Charlie"];
```

### Progressive Adoption

TypeScript is designed for gradual adoption:
1. Rename `.js` files to `.ts`
2. Add types incrementally
3. Enable stricter checks as you progress

## 🛠️ Prerequisites

- Basic JavaScript knowledge (ES6+)
- Familiarity with:
  - Variables (`let`, `const`)
  - Functions and arrow functions
  - Objects and arrays
  - Classes (helpful but not required)

## 📖 Additional Resources

- [TypeScript Handbook - The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)
- [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [TypeScript Playground](https://www.typescriptlang.org/play) - Try examples interactively

## ✅ Module Completion Checklist

Before moving to Module 2, ensure you can:

- [ ] Set up a TypeScript project from scratch
- [ ] Compile TypeScript code to JavaScript
- [ ] Annotate function parameters and return types
- [ ] Define object shapes using interfaces
- [ ] Use union types effectively
- [ ] Apply type narrowing in conditional logic
- [ ] Configure `tsconfig.json` for your needs
- [ ] Complete all exercises in this module

## 🚀 Next Steps

Once you complete this module, proceed to [Module 2: Intermediate TypeScript](../02-intermediate/README.md) to learn about generics, advanced types, and utility types.

---

**Questions or Issues?** Open an issue in the repository or check the [Troubleshooting Guide](../../resources/troubleshooting.md).
