# Module 1 Exercises: TypeScript Foundations

Hands-on exercises to reinforce TypeScript fundamentals. Complete these exercises to solidify your understanding.

## How to Use These Exercises

1. **Try each exercise** without looking at the solution
2. **Run the TypeScript compiler** to check for errors
3. **Compare your solution** with the provided one
4. **Understand why** the solution works

## Table of Contents

- [Exercise 1: Basic Types](#exercise-1-basic-types)
- [Exercise 2: Functions](#exercise-2-functions)
- [Exercise 3: Interfaces](#exercise-3-interfaces)
- [Exercise 4: Type Guards](#exercise-4-type-guards)
- [Exercise 5: Generics Intro](#exercise-5-generics-intro)
- [Exercise 6: Real-World Application](#exercise-6-real-world-application)

---

## Exercise 1: Basic Types

**Difficulty**: ⭐ Beginner

### Task

Create a type-safe product inventory system with the following requirements:

1. Define a `Product` type with:
   - `id` (number)
   - `name` (string)
   - `price` (number)
   - `inStock` (boolean)
   - `category` (enum: Electronics, Clothing, Food, Books)
   - `tags` (array of strings, optional)

2. Create a function `calculateTotal` that takes an array of products and returns the total price of items in stock

3. Create a function `filterByCategory` that filters products by category

### Hints

<details>
<summary>Click for hint 1</summary>

Use an enum for categories:
```typescript
enum Category {
  Electronics,
  Clothing,
  Food,
  Books
}
```
</details>

<details>
<summary>Click for hint 2</summary>

Use the `filter` and `reduce` array methods
</details>

### Solution

See [solutions/01-basic-types-solution.ts](./solutions/01-basic-types-solution.ts)

---

## Exercise 2: Functions

**Difficulty**: ⭐⭐ Intermediate

### Task

Create a type-safe user validation system:

1. Create a `User` interface with:
   - `username` (string, 3-20 characters)
   - `email` (string, must contain @)
   - `age` (number, 13-120)
   - `password` (string, min 8 characters)

2. Create validation functions:
   - `validateUsername(username: string): boolean`
   - `validateEmail(email: string): boolean`
   - `validateAge(age: number): boolean`
   - `validatePassword(password: string): boolean`

3. Create a `createUser` function that:
   - Takes all user properties as parameters
   - Validates each property
   - Returns the user object or throws an error with specific validation message

4. Use function overloads to allow creating a user with or without age

### Hints

<details>
<summary>Click for hint 1</summary>

Use regular expressions for email validation:
```typescript
/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
```
</details>

<details>
<summary>Click for hint 2</summary>

Function overloads syntax:
```typescript
function createUser(username: string, email: string, password: string): User;
function createUser(username: string, email: string, password: string, age: number): User;
function createUser(/* implementation */): User {
  // ...
}
```
</details>

### Solution

See [solutions/02-functions-solution.ts](./solutions/02-functions-solution.ts)

---

## Exercise 3: Interfaces

**Difficulty**: ⭐⭐ Intermediate

### Task

Create a type-safe blog system with interfaces:

1. Create interfaces for:
   - `Author` (id, name, email, bio?)
   - `Comment` (id, authorId, content, timestamp)
   - `BlogPost` (id, title, content, authorId, tags, comments[], createdAt, updatedAt?)

2. Create utility functions:
   - `createBlogPost`: Create a new blog post
   - `addComment`: Add a comment to a post
   - `getPostsByAuthor`: Filter posts by author
   - `getPostsByTag`: Filter posts containing a specific tag

3. Extend the `BlogPost` interface to create a `PublishedPost` interface that adds:
   - `publishedAt` (Date)
   - `views` (number)
   - `likes` (number)

### Hints

<details>
<summary>Click for hint 1</summary>

Use the `extends` keyword:
```typescript
interface PublishedPost extends BlogPost {
  publishedAt: Date;
  views: number;
  likes: number;
}
```
</details>

### Solution

See [solutions/03-interfaces-solution.ts](./solutions/03-interfaces-solution.ts)

---

## Exercise 4: Type Guards

**Difficulty**: ⭐⭐ Intermediate

### Task

Create a type-safe payment processing system:

1. Define types for different payment methods:
   - `CreditCard` (type: "credit", cardNumber, cvv, expiry)
   - `PayPal` (type: "paypal", email)
   - `Bitcoin` (type: "bitcoin", walletAddress)

2. Create a union type `PaymentMethod`

3. Implement type guards:
   - `isCreditCard(payment: PaymentMethod): payment is CreditCard`
   - `isPayPal(payment: PaymentMethod): payment is PayPal`
   - `isBitcoin(payment: PaymentMethod): payment is Bitcoin`

4. Create a `processPayment` function that:
   - Takes a `PaymentMethod` and `amount`
   - Uses type guards to handle each payment type differently
   - Returns a success message specific to the payment type

### Hints

<details>
<summary>Click for hint 1</summary>

Use discriminated unions with a `type` property:
```typescript
interface CreditCard {
  type: "credit";
  // ...
}
```
</details>

<details>
<summary>Click for hint 2</summary>

Type guard syntax:
```typescript
function isCreditCard(payment: PaymentMethod): payment is CreditCard {
  return payment.type === "credit";
}
```
</details>

### Solution

See [solutions/04-type-guards-solution.ts](./solutions/04-type-guards-solution.ts)

---

## Exercise 5: Generics Intro

**Difficulty**: ⭐⭐⭐ Advanced

### Task

Create a generic data structure and utilities:

1. Create a generic `Box<T>` interface:
   - `value: T`
   - `map<U>(fn: (value: T) => U): Box<U>`
   - `flatMap<U>(fn: (value: T) => Box<U>): Box<U>`
   - `getOrElse(defaultValue: T): T`

2. Implement a `BoxImpl<T>` class that implements `Box<T>`

3. Create utility functions:
   - `box<T>(value: T): Box<T>` - Create a box
   - `liftBox<T, U>(fn: (value: T) => U): (box: Box<T>) => Box<U>` - Lift a function to work with boxes

4. Demonstrate usage with different types (number, string, object)

### Hints

<details>
<summary>Click for hint 1</summary>

The `map` method should create a new box with the transformed value:
```typescript
map<U>(fn: (value: T) => U): Box<U> {
  return new BoxImpl(fn(this.value));
}
```
</details>

### Solution

See [solutions/05-generics-solution.ts](./solutions/05-generics-solution.ts)

---

## Exercise 6: Real-World Application

**Difficulty**: ⭐⭐⭐ Advanced

### Task

Build a type-safe task management system combining all concepts:

1. Define types:
   - `Priority`: "low" | "medium" | "high"
   - `Status`: "todo" | "in_progress" | "done"
   - `Task` interface with id, title, description?, priority, status, dueDate?, tags[]

2. Create a `TaskManager` class with:
   - Private tasks array
   - `addTask(task: Omit<Task, "id">): Task` - Generate ID automatically
   - `updateTask(id: number, updates: Partial<Task>): Task | null`
   - `deleteTask(id: number): boolean`
   - `getTasks(filter?: { status?: Status; priority?: Priority }): Task[]`
   - `getTasksByTag(tag: string): Task[]`
   - `getOverdueTasks(): Task[]`

3. Add sorting capabilities:
   - `sortByPriority(tasks: Task[]): Task[]`
   - `sortByDueDate(tasks: Task[]): Task[]`

4. Implement persistence:
   - `saveToJSON(): string`
   - `loadFromJSON(json: string): void`

### Requirements

- Use interfaces for complex types
- Use enums or union types for Priority and Status
- Use optional parameters and properties appropriately
- Use Partial, Omit utility types
- Add proper error handling
- Include JSDoc comments

### Hints

<details>
<summary>Click for hint 1</summary>

Generate IDs with a counter:
```typescript
private nextId = 1;

addTask(task: Omit<Task, "id">): Task {
  const newTask = { ...task, id: this.nextId++ };
  this.tasks.push(newTask);
  return newTask;
}
```
</details>

<details>
<summary>Click for hint 2</summary>

For filtering, use object destructuring and optional chaining:
```typescript
getTasks(filter?: { status?: Status; priority?: Priority }): Task[] {
  return this.tasks.filter(task => {
    if (filter?.status && task.status !== filter.status) return false;
    if (filter?.priority && task.priority !== filter.priority) return false;
    return true;
  });
}
```
</details>

### Solution

See [solutions/06-task-manager-solution.ts](./solutions/06-task-manager-solution.ts)

---

## Additional Challenges

Once you've completed all exercises:

1. **Extend Exercise 6**: Add subtasks, task dependencies, recurring tasks
2. **Create a CLI**: Build a command-line interface for the task manager
3. **Add Tests**: Write unit tests using Jest or Vitest
4. **Add Persistence**: Implement file system storage

---

## Running the Exercises

```bash
# Compile and run
npx tsc solutions/01-basic-types-solution.ts
node solutions/01-basic-types-solution.js

# Or use ts-node
npx ts-node solutions/01-basic-types-solution.ts

# Type check without emitting
npx tsc --noEmit solutions/01-basic-types-solution.ts
```

---

## Learning Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Exercises](https://typescript-exercises.github.io/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)

---

**Remember**: The goal is to understand the concepts, not just complete the exercises. If you're stuck, review the module content and try again!
