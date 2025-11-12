# Design Patterns in TypeScript

Learn how to implement classic design patterns with TypeScript's type system for robust, maintainable code.

## Table of Contents

- [Creational Patterns](#creational-patterns)
- [Structural Patterns](#structural-patterns)
- [Behavioral Patterns](#behavioral-patterns)
- [TypeScript-Specific Patterns](#typescript-specific-patterns)
- [When to Use Each Pattern](#when-to-use-each-pattern)

---

## Creational Patterns

### Factory Pattern

**Intent**: Define an interface for creating objects, but let subclasses decide which class to instantiate.

```typescript
// Product interface
interface Product {
  operation(): string;
}

// Concrete products
class ConcreteProductA implements Product {
  operation(): string {
    return "Result of Product A";
  }
}

class ConcreteProductB implements Product {
  operation(): string {
    return "Result of Product B";
  }
}

// Creator
abstract class Creator {
  abstract factoryMethod(): Product;

  someOperation(): string {
    const product = this.factoryMethod();
    return `Creator: Working with ${product.operation()}`;
  }
}

// Concrete creators
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

// Usage
const creatorA = new CreatorA();
console.log(creatorA.someOperation());
// "Creator: Working with Result of Product A"

const creatorB = new CreatorB();
console.log(creatorB.someOperation());
// "Creator: Working with Result of Product B"
```

**Real-World Example: UI Component Factory**

```typescript
interface Button {
  render(): void;
  onClick(handler: () => void): void;
}

class WindowsButton implements Button {
  render(): void {
    console.log("Rendering Windows button");
  }

  onClick(handler: () => void): void {
    console.log("Windows button clicked");
    handler();
  }
}

class MacButton implements Button {
  render(): void {
    console.log("Rendering Mac button");
  }

  onClick(handler: () => void): void {
    console.log("Mac button clicked");
    handler();
  }
}

abstract class Dialog {
  abstract createButton(): Button;

  render(): void {
    const button = this.createButton();
    button.render();
    button.onClick(() => console.log("Button action executed"));
  }
}

class WindowsDialog extends Dialog {
  createButton(): Button {
    return new WindowsButton();
  }
}

class MacDialog extends Dialog {
  createButton(): Button {
    return new MacButton();
  }
}

// Usage
const os = "Windows"; // or "Mac"
let dialog: Dialog;

if (os === "Windows") {
  dialog = new WindowsDialog();
} else {
  dialog = new MacDialog();
}

dialog.render();
```

---

### Singleton Pattern

**Intent**: Ensure a class has only one instance and provide a global access point.

```typescript
class Singleton {
  private static instance: Singleton;
  private constructor() {
    // Private constructor prevents instantiation
  }

  static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }

  someBusinessLogic(): void {
    console.log("Business logic executed");
  }
}

// Usage
const s1 = Singleton.getInstance();
const s2 = Singleton.getInstance();

console.log(s1 === s2); // true - same instance

// ❌ Error: Constructor is private
// const s3 = new Singleton();
```

**Type-Safe Singleton with Generics**

```typescript
abstract class GenericSingleton<T> {
  private static instances: Map<any, any> = new Map();

  static getInstance<T>(this: new () => T): T {
    if (!GenericSingleton.instances.has(this)) {
      GenericSingleton.instances.set(this, new this());
    }
    return GenericSingleton.instances.get(this);
  }
}

class DatabaseConnection extends GenericSingleton<DatabaseConnection> {
  private constructor() {
    super();
  }

  query(sql: string): void {
    console.log(`Executing: ${sql}`);
  }
}

class ConfigManager extends GenericSingleton<ConfigManager> {
  private constructor() {
    super();
  }

  get(key: string): string {
    return `Value for ${key}`;
  }
}

// Usage
const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();
console.log(db1 === db2); // true

const config1 = ConfigManager.getInstance();
const config2 = ConfigManager.getInstance();
console.log(config1 === config2); // true
```

---

### Builder Pattern

**Intent**: Separate the construction of a complex object from its representation.

```typescript
interface User {
  name: string;
  age?: number;
  email?: string;
  address?: string;
  phone?: string;
}

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

  setEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  setAddress(address: string): this {
    this.user.address = address;
    return this;
  }

  setPhone(phone: string): this {
    this.user.phone = phone;
    return this;
  }

  build(): User {
    if (!this.user.name) {
      throw new Error("Name is required");
    }
    return this.user as User;
  }
}

// Usage
const user = new UserBuilder()
  .setName("Alice")
  .setAge(30)
  .setEmail("alice@example.com")
  .build();
```

**Type-Safe Builder with Required Fields**

```typescript
// Use the type system to enforce required fields
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

class TypeSafeBuilder<T, Built = {}> {
  private props: Partial<T> = {};

  set<K extends keyof T>(
    key: K,
    value: T[K]
  ): TypeSafeBuilder<T, Built & Pick<T, K>> {
    this.props[key] = value;
    return this as any;
  }

  build(this: TypeSafeBuilder<T, T>): T {
    return this.props as T;
  }
}

interface Product {
  name: string;
  price: number;
  description?: string;
}

const builder = new TypeSafeBuilder<Product>();

// ❌ Error: can't build without required fields
// builder.build();

const product = builder
  .set("name", "Widget")
  .set("price", 9.99)
  .build(); // ✅ OK - all required fields set
```

---

## Structural Patterns

### Decorator Pattern

**Intent**: Attach additional responsibilities to an object dynamically.

```typescript
interface Coffee {
  cost(): number;
  description(): string;
}

class SimpleCoffee implements Coffee {
  cost(): number {
    return 5;
  }

  description(): string {
    return "Simple coffee";
  }
}

// Decorator base class
abstract class CoffeeDecorator implements Coffee {
  constructor(protected coffee: Coffee) {}

  abstract cost(): number;
  abstract description(): string;
}

class MilkDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 1;
  }

  description(): string {
    return `${this.coffee.description()}, milk`;
  }
}

class SugarDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 0.5;
  }

  description(): string {
    return `${this.coffee.description()}, sugar`;
  }
}

class WhippedCreamDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 2;
  }

  description(): string {
    return `${this.coffee.description()}, whipped cream`;
  }
}

// Usage
let coffee: Coffee = new SimpleCoffee();
console.log(`${coffee.description()}: $${coffee.cost()}`);
// "Simple coffee: $5"

coffee = new MilkDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost()}`);
// "Simple coffee, milk: $6"

coffee = new SugarDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost()}`);
// "Simple coffee, milk, sugar: $6.5"

coffee = new WhippedCreamDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost()}`);
// "Simple coffee, milk, sugar, whipped cream: $8.5"
```

---

### Adapter Pattern

**Intent**: Convert the interface of a class into another interface clients expect.

```typescript
// Target interface
interface MediaPlayer {
  play(fileName: string): void;
}

// Adaptee (incompatible interface)
class AdvancedMediaPlayer {
  playMp4(fileName: string): void {
    console.log(`Playing MP4 file: ${fileName}`);
  }

  playVlc(fileName: string): void {
    console.log(`Playing VLC file: ${fileName}`);
  }
}

// Adapter
class MediaAdapter implements MediaPlayer {
  private advancedPlayer: AdvancedMediaPlayer;

  constructor(private fileType: string) {
    this.advancedPlayer = new AdvancedMediaPlayer();
  }

  play(fileName: string): void {
    if (this.fileType === "mp4") {
      this.advancedPlayer.playMp4(fileName);
    } else if (this.fileType === "vlc") {
      this.advancedPlayer.playVlc(fileName);
    }
  }
}

// Client
class AudioPlayer implements MediaPlayer {
  play(fileName: string): void {
    const fileType = fileName.split(".").pop()?.toLowerCase();

    if (fileType === "mp3") {
      console.log(`Playing MP3 file: ${fileName}`);
    } else if (fileType === "mp4" || fileType === "vlc") {
      const adapter = new MediaAdapter(fileType);
      adapter.play(fileName);
    } else {
      console.log(`Invalid media format: ${fileType}`);
    }
  }
}

// Usage
const player = new AudioPlayer();
player.play("song.mp3"); // "Playing MP3 file: song.mp3"
player.play("video.mp4"); // "Playing MP4 file: video.mp4"
player.play("movie.vlc"); // "Playing VLC file: movie.vlc"
```

---

## Behavioral Patterns

### Observer Pattern

**Intent**: Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified.

```typescript
interface Observer<T> {
  update(data: T): void;
}

interface Subject<T> {
  attach(observer: Observer<T>): void;
  detach(observer: Observer<T>): void;
  notify(data: T): void;
}

class ConcreteSubject<T> implements Subject<T> {
  private observers: Observer<T>[] = [];

  attach(observer: Observer<T>): void {
    const isExist = this.observers.includes(observer);
    if (!isExist) {
      this.observers.push(observer);
    }
  }

  detach(observer: Observer<T>): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex !== -1) {
      this.observers.splice(observerIndex, 1);
    }
  }

  notify(data: T): void {
    for (const observer of this.observers) {
      observer.update(data);
    }
  }
}

// Concrete observers
class EmailObserver implements Observer<string> {
  update(message: string): void {
    console.log(`Email notification: ${message}`);
  }
}

class SMSObserver implements Observer<string> {
  update(message: string): void {
    console.log(`SMS notification: ${message}`);
  }
}

class PushObserver implements Observer<string> {
  update(message: string): void {
    console.log(`Push notification: ${message}`);
  }
}

// Usage
const subject = new ConcreteSubject<string>();

const emailObserver = new EmailObserver();
const smsObserver = new SMSObserver();
const pushObserver = new PushObserver();

subject.attach(emailObserver);
subject.attach(smsObserver);
subject.attach(pushObserver);

subject.notify("New message received!");
// Email notification: New message received!
// SMS notification: New message received!
// Push notification: New message received!

subject.detach(smsObserver);
subject.notify("Another message!");
// Email notification: Another message!
// Push notification: Another message!
```

---

### Strategy Pattern

**Intent**: Define a family of algorithms, encapsulate each one, and make them interchangeable.

```typescript
interface PaymentStrategy {
  pay(amount: number): void;
}

class CreditCardStrategy implements PaymentStrategy {
  constructor(
    private cardNumber: string,
    private cvv: string,
    private expiry: string
  ) {}

  pay(amount: number): void {
    console.log(`Paid $${amount} using Credit Card ${this.cardNumber}`);
  }
}

class PayPalStrategy implements PaymentStrategy {
  constructor(private email: string) {}

  pay(amount: number): void {
    console.log(`Paid $${amount} using PayPal account ${this.email}`);
  }
}

class BitcoinStrategy implements PaymentStrategy {
  constructor(private walletAddress: string) {}

  pay(amount: number): void {
    console.log(`Paid $${amount} using Bitcoin wallet ${this.walletAddress}`);
  }
}

class ShoppingCart {
  private items: { name: string; price: number }[] = [];

  addItem(name: string, price: number): void {
    this.items.push({ name, price });
  }

  calculateTotal(): number {
    return this.items.reduce((total, item) => total + item.price, 0);
  }

  pay(strategy: PaymentStrategy): void {
    const total = this.calculateTotal();
    strategy.pay(total);
  }
}

// Usage
const cart = new ShoppingCart();
cart.addItem("Book", 10);
cart.addItem("Pen", 2);
cart.addItem("Notebook", 5);

// Pay with credit card
cart.pay(new CreditCardStrategy("1234-5678-9012-3456", "123", "12/25"));
// "Paid $17 using Credit Card 1234-5678-9012-3456"

// Pay with PayPal
cart.pay(new PayPalStrategy("user@example.com"));
// "Paid $17 using PayPal account user@example.com"

// Pay with Bitcoin
cart.pay(new BitcoinStrategy("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"));
// "Paid $17 using Bitcoin wallet 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
```

---

### State Pattern

**Intent**: Allow an object to alter its behavior when its internal state changes.

```typescript
interface State {
  handleRequest(context: Context): void;
}

class Context {
  private state: State;

  constructor(state: State) {
    this.state = state;
    console.log(`Context: Initial state is ${state.constructor.name}`);
  }

  transition(state: State): void {
    console.log(`Context: Transition to ${state.constructor.name}`);
    this.state = state;
  }

  request(): void {
    this.state.handleRequest(this);
  }
}

class StartState implements State {
  handleRequest(context: Context): void {
    console.log("StartState: Processing request");
    context.transition(new ProcessingState());
  }
}

class ProcessingState implements State {
  handleRequest(context: Context): void {
    console.log("ProcessingState: Processing request");
    context.transition(new FinishedState());
  }
}

class FinishedState implements State {
  handleRequest(context: Context): void {
    console.log("FinishedState: Request finished");
  }
}

// Usage
const context = new Context(new StartState());
context.request(); // StartState -> ProcessingState
context.request(); // ProcessingState -> FinishedState
context.request(); // FinishedState (no transition)
```

---

## TypeScript-Specific Patterns

### Type-Safe Builder with Phantom Types

```typescript
// Phantom types to track builder state
type Built<T> = T & { __brand: "built" };
type Unbuilt = { __brand: "unbuilt" };

class FluentBuilder<T, State = Unbuilt> {
  private props: Partial<T> = {};

  set<K extends keyof T>(
    key: K,
    value: T[K]
  ): FluentBuilder<T, State & Pick<T, K>> {
    this.props[key] = value;
    return this as any;
  }

  build(this: FluentBuilder<T, T>): Built<T> {
    return this.props as Built<T>;
  }
}

interface Config {
  host: string;
  port: number;
  database: string;
}

const builder = new FluentBuilder<Config>();

// ❌ Error: not all required fields set
// builder.build();

const config = builder
  .set("host", "localhost")
  .set("port", 5432)
  .set("database", "mydb")
  .build(); // ✅ OK
```

---

## When to Use Each Pattern

| Pattern | Use When | Avoid When |
|---------|----------|------------|
| **Factory** | Creating objects without specifying exact class | Simple object creation |
| **Singleton** | Need exactly one instance | Testing (hard to mock) |
| **Builder** | Complex object with many optional parameters | Simple objects |
| **Decorator** | Adding responsibilities dynamically | Permanent changes needed |
| **Adapter** | Integrating incompatible interfaces | You control both interfaces |
| **Observer** | One-to-many dependencies | Simple callbacks suffice |
| **Strategy** | Multiple algorithms for same task | Only one algorithm |
| **State** | Behavior changes with state | Simple if/else suffices |

---

## Exercises

See [exercises/07-design-patterns-exercises.md](../exercises/07-design-patterns-exercises.md) for practice implementing patterns.

---

## Next Steps

Continue to [08. SOLID Principles](../08-solid-principles/README.md) to learn architectural principles.

---

**Practice**: Implement these patterns in real projects to truly understand when and how to use them!
