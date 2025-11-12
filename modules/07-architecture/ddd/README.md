# Domain-Driven Design (DDD) in TypeScript

Build complex applications using strategic and tactical DDD patterns to model your domain effectively.

## Table of Contents

- [DDD Overview](#ddd-overview)
- [Strategic Design](#strategic-design)
- [Tactical Patterns](#tactical-patterns)
- [Building Blocks](#building-blocks)
- [Complete Example](#complete-example)
- [Event Storming](#event-storming)
- [Best Practices](#best-practices)

---

## DDD Overview

**Domain-Driven Design** is an approach to software development that focuses on:
- **Understanding the business domain**
- **Modeling complex business logic**
- **Using ubiquitous language** (shared terminology)
- **Separating core domain from supporting domains**

### Core Concepts

1. **Ubiquitous Language**: Shared vocabulary between developers and domain experts
2. **Bounded Contexts**: Clear boundaries around related models
3. **Entities**: Objects with identity that persists over time
4. **Value Objects**: Immutable objects defined by their attributes
5. **Aggregates**: Clusters of entities and value objects with consistency boundaries
6. **Domain Events**: Things that happened in the domain
7. **Repositories**: Abstractions for data access
8. **Services**: Operations that don't belong to entities

---

## Strategic Design

### Bounded Contexts

Divide your system into distinct contexts with clear boundaries.

```typescript
// ===== Sales Context =====
namespace Sales {
  export interface Customer {
    id: string;
    name: string;
    email: string;
    creditLimit: number; // Sales cares about credit
  }

  export interface Order {
    id: string;
    customerId: string;
    total: number;
    status: 'pending' | 'paid' | 'shipped';
  }
}

// ===== Support Context =====
namespace Support {
  export interface Customer {
    id: string;
    name: string;
    email: string;
    supportTier: 'basic' | 'premium'; // Support cares about tier
    ticketCount: number;
  }

  export interface Ticket {
    id: string;
    customerId: string;
    subject: string;
    status: 'open' | 'in-progress' | 'closed';
  }
}

// ===== Context Mapping =====
// Anti-Corruption Layer: Translate between contexts
export class CustomerTranslator {
  static toSalesCustomer(supportCustomer: Support.Customer): Sales.Customer {
    return {
      id: supportCustomer.id,
      name: supportCustomer.name,
      email: supportCustomer.email,
      creditLimit: supportCustomer.supportTier === 'premium' ? 10000 : 5000,
    };
  }

  static toSupportCustomer(salesCustomer: Sales.Customer): Support.Customer {
    return {
      id: salesCustomer.id,
      name: salesCustomer.name,
      email: salesCustomer.email,
      supportTier: salesCustomer.creditLimit >= 10000 ? 'premium' : 'basic',
      ticketCount: 0,
    };
  }
}
```

### Context Map Patterns

```typescript
// 1. Shared Kernel: Shared code between contexts
export namespace SharedKernel {
  export class Money {
    constructor(
      public readonly amount: number,
      public readonly currency: string
    ) {}

    add(other: Money): Money {
      if (this.currency !== other.currency) {
        throw new Error('Cannot add different currencies');
      }
      return new Money(this.amount + other.amount, this.currency);
    }

    equals(other: Money): boolean {
      return this.amount === other.amount && this.currency === other.currency;
    }
  }

  export class Email {
    private constructor(public readonly value: string) {}

    static create(email: string): Email {
      if (!email.includes('@')) {
        throw new Error('Invalid email format');
      }
      return new Email(email.toLowerCase());
    }
  }
}

// 2. Customer-Supplier: Upstream/downstream relationship
export interface OrderAPI {
  // Upstream context defines API
  getOrder(id: string): Promise<OrderDTO>;
  listOrders(customerId: string): Promise<OrderDTO[]>;
}

export class ShippingService {
  // Downstream context consumes API
  constructor(private orderAPI: OrderAPI) {}

  async processShipment(orderId: string): Promise<void> {
    const order = await this.orderAPI.getOrder(orderId);
    // Process shipment based on order data
  }
}

// 3. Conformist: Downstream conforms to upstream model
export class ReportingService {
  // Uses upstream model directly without translation
  constructor(private orderAPI: OrderAPI) {}

  async generateReport(customerId: string): Promise<Report> {
    const orders = await this.orderAPI.listOrders(customerId);
    // Generate report using upstream model
    return { orders };
  }
}
```

---

## Tactical Patterns

### 1. Entities

Objects with unique identity that persists over time.

```typescript
// domain/entities/User.ts
export class User {
  private constructor(
    private readonly _id: string,
    private _email: string,
    private _username: string,
    private _createdAt: Date
  ) {}

  // Factory method
  static create(email: string, username: string): User {
    return new User(crypto.randomUUID(), email, username, new Date());
  }

  // Reconstitute from persistence
  static fromPersistence(
    id: string,
    email: string,
    username: string,
    createdAt: Date
  ): User {
    return new User(id, email, username, createdAt);
  }

  // Identity
  get id(): string {
    return this._id;
  }

  // Getters
  get email(): string {
    return this._email;
  }

  get username(): string {
    return this._username;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // Business methods
  changeEmail(newEmail: string): void {
    if (!newEmail.includes('@')) {
      throw new Error('Invalid email format');
    }
    this._email = newEmail.toLowerCase();
  }

  changeUsername(newUsername: string): void {
    if (newUsername.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    this._username = newUsername;
  }

  // Equality based on identity
  equals(other: User): boolean {
    return this._id === other._id;
  }
}
```

### 2. Value Objects

Immutable objects defined by their attributes, not identity.

```typescript
// domain/value-objects/Money.ts
export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }

    if (!['USD', 'EUR', 'GBP'].includes(currency)) {
      throw new Error('Unsupported currency');
    }
  }

  static create(amount: number, currency: string): Money {
    return new Money(amount, currency);
  }

  static zero(currency: string): Money {
    return new Money(0, currency);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  greaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare different currencies');
    }
    return this.amount > other.amount;
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }
}

// domain/value-objects/Email.ts
export class Email {
  private constructor(public readonly value: string) {}

  static create(email: string): Email {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.includes('@')) {
      throw new Error('Invalid email format');
    }

    const [local, domain] = normalizedEmail.split('@');

    if (local.length === 0 || domain.length === 0) {
      throw new Error('Invalid email format');
    }

    if (!domain.includes('.')) {
      throw new Error('Invalid email domain');
    }

    return new Email(normalizedEmail);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// domain/value-objects/Address.ts
export class Address {
  private constructor(
    public readonly street: string,
    public readonly city: string,
    public readonly state: string,
    public readonly zipCode: string,
    public readonly country: string
  ) {}

  static create(
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  ): Address {
    if (!street || !city || !state || !zipCode || !country) {
      throw new Error('All address fields are required');
    }

    return new Address(
      street.trim(),
      city.trim(),
      state.trim(),
      zipCode.trim(),
      country.trim()
    );
  }

  equals(other: Address): boolean {
    return (
      this.street === other.street &&
      this.city === other.city &&
      this.state === other.state &&
      this.zipCode === other.zipCode &&
      this.country === other.country
    );
  }

  toString(): string {
    return `${this.street}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
  }
}
```

### 3. Aggregates

Cluster of entities and value objects with a consistency boundary.

```typescript
// domain/aggregates/Order.ts
import { Money } from '../value-objects/Money';
import { Address } from '../value-objects/Address';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: Money;
}

export class OrderLine {
  private constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly price: Money
  ) {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
  }

  static create(
    productId: string,
    productName: string,
    quantity: number,
    price: Money
  ): OrderLine {
    return new OrderLine(productId, productName, quantity, price);
  }

  get subtotal(): Money {
    return this.price.multiply(this.quantity);
  }

  changeQuantity(newQuantity: number): OrderLine {
    return new OrderLine(
      this.productId,
      this.productName,
      newQuantity,
      this.price
    );
  }
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

// Aggregate Root
export class Order {
  private _items: OrderLine[] = [];

  private constructor(
    private readonly _id: string,
    private readonly _customerId: string,
    private _status: OrderStatus,
    private _shippingAddress: Address,
    private readonly _createdAt: Date
  ) {}

  // Factory method
  static create(customerId: string, shippingAddress: Address): Order {
    return new Order(
      crypto.randomUUID(),
      customerId,
      'pending',
      shippingAddress,
      new Date()
    );
  }

  // Reconstitute from persistence
  static fromPersistence(
    id: string,
    customerId: string,
    status: OrderStatus,
    shippingAddress: Address,
    items: OrderLine[],
    createdAt: Date
  ): Order {
    const order = new Order(id, customerId, status, shippingAddress, createdAt);
    order._items = items;
    return order;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get customerId(): string {
    return this._customerId;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get shippingAddress(): Address {
    return this._shippingAddress;
  }

  get items(): ReadonlyArray<OrderLine> {
    return this._items;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // Calculated properties
  get total(): Money {
    if (this._items.length === 0) {
      return Money.zero('USD');
    }

    return this._items.reduce(
      (total, item) => total.add(item.subtotal),
      Money.zero(this._items[0].price.currency)
    );
  }

  get itemCount(): number {
    return this._items.reduce((count, item) => count + item.quantity, 0);
  }

  // Business methods (maintaining invariants)
  addItem(
    productId: string,
    productName: string,
    quantity: number,
    price: Money
  ): void {
    // Business rule: Cannot modify non-pending orders
    if (this._status !== 'pending') {
      throw new Error('Cannot add items to non-pending order');
    }

    // Business rule: Check if item already exists
    const existingItemIndex = this._items.findIndex(
      item => item.productId === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const existingItem = this._items[existingItemIndex];
      this._items[existingItemIndex] = existingItem.changeQuantity(
        existingItem.quantity + quantity
      );
    } else {
      // Add new item
      const orderLine = OrderLine.create(productId, productName, quantity, price);
      this._items.push(orderLine);
    }
  }

  removeItem(productId: string): void {
    if (this._status !== 'pending') {
      throw new Error('Cannot remove items from non-pending order');
    }

    const itemIndex = this._items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      throw new Error('Item not found in order');
    }

    this._items.splice(itemIndex, 1);
  }

  updateItemQuantity(productId: string, newQuantity: number): void {
    if (this._status !== 'pending') {
      throw new Error('Cannot update items in non-pending order');
    }

    const itemIndex = this._items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      throw new Error('Item not found in order');
    }

    if (newQuantity <= 0) {
      this._items.splice(itemIndex, 1);
    } else {
      this._items[itemIndex] = this._items[itemIndex].changeQuantity(newQuantity);
    }
  }

  changeShippingAddress(newAddress: Address): void {
    if (this._status === 'shipped' || this._status === 'delivered') {
      throw new Error('Cannot change address for shipped orders');
    }

    this._shippingAddress = newAddress;
  }

  confirm(): void {
    if (this._status !== 'pending') {
      throw new Error('Only pending orders can be confirmed');
    }

    if (this._items.length === 0) {
      throw new Error('Cannot confirm order with no items');
    }

    this._status = 'confirmed';
  }

  markAsPaid(): void {
    if (this._status !== 'confirmed') {
      throw new Error('Only confirmed orders can be marked as paid');
    }

    this._status = 'paid';
  }

  ship(): void {
    if (this._status !== 'paid') {
      throw new Error('Only paid orders can be shipped');
    }

    this._status = 'shipped';
  }

  deliver(): void {
    if (this._status !== 'shipped') {
      throw new Error('Only shipped orders can be delivered');
    }

    this._status = 'delivered';
  }

  cancel(): void {
    if (this._status === 'shipped' || this._status === 'delivered') {
      throw new Error('Cannot cancel shipped or delivered orders');
    }

    this._status = 'cancelled';
  }

  // Invariant check
  isValid(): boolean {
    return this._items.length > 0 || this._status === 'pending';
  }
}
```

### 4. Domain Events

Capture things that happened in the domain.

```typescript
// domain/events/DomainEvent.ts
export interface DomainEvent {
  occurredAt: Date;
  aggregateId: string;
  eventType: string;
}

// domain/events/OrderEvents.ts
export class OrderCreated implements DomainEvent {
  public readonly eventType = 'OrderCreated';
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly customerId: string,
    public readonly shippingAddress: Address
  ) {
    this.occurredAt = new Date();
  }
}

export class OrderItemAdded implements DomainEvent {
  public readonly eventType = 'OrderItemAdded';
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly price: Money
  ) {
    this.occurredAt = new Date();
  }
}

export class OrderConfirmed implements DomainEvent {
  public readonly eventType = 'OrderConfirmed';
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly total: Money
  ) {
    this.occurredAt = new Date();
  }
}

export class OrderPaid implements DomainEvent {
  public readonly eventType = 'OrderPaid';
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly transactionId: string,
    public readonly amount: Money
  ) {
    this.occurredAt = new Date();
  }
}

export class OrderShipped implements DomainEvent {
  public readonly eventType = 'OrderShipped';
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly trackingNumber: string
  ) {
    this.occurredAt = new Date();
  }
}

// Domain Event Publisher
export interface DomainEventPublisher {
  publish(event: DomainEvent): Promise<void>;
}

// Aggregate with event tracking
export class OrderWithEvents extends Order {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  clearEvents(): void {
    this._domainEvents = [];
  }

  private addEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  // Override methods to emit events
  static create(customerId: string, shippingAddress: Address): OrderWithEvents {
    const order = super.create(customerId, shippingAddress) as OrderWithEvents;
    order.addEvent(new OrderCreated(order.id, customerId, shippingAddress));
    return order;
  }

  addItem(
    productId: string,
    productName: string,
    quantity: number,
    price: Money
  ): void {
    super.addItem(productId, productName, quantity, price);
    this.addEvent(new OrderItemAdded(this.id, productId, quantity, price));
  }

  confirm(): void {
    super.confirm();
    this.addEvent(new OrderConfirmed(this.id, this.total));
  }

  markAsPaid(transactionId: string): void {
    super.markAsPaid();
    this.addEvent(new OrderPaid(this.id, transactionId, this.total));
  }

  ship(trackingNumber: string): void {
    super.ship();
    this.addEvent(new OrderShipped(this.id, trackingNumber));
  }
}
```

### 5. Repositories

Abstract data access for aggregates.

```typescript
// domain/repositories/OrderRepository.ts
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  delete(id: string): Promise<void>;

  // Aggregate-specific queries
  findPendingOrders(customerId: string): Promise<Order[]>;
  findOrdersByStatus(status: OrderStatus): Promise<Order[]>;
}

// infrastructure/persistence/PrismaOrderRepository.ts
import { PrismaClient } from '@prisma/client';
import { OrderRepository } from '../../domain/repositories/OrderRepository';
import { Order, OrderLine } from '../../domain/aggregates/Order';
import { Money } from '../../domain/value-objects/Money';
import { Address } from '../../domain/value-objects/Address';

export class PrismaOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaClient) {}

  async save(order: Order): Promise<void> {
    await this.prisma.order.upsert({
      where: { id: order.id },
      create: {
        id: order.id,
        customerId: order.customerId,
        status: order.status,
        shippingStreet: order.shippingAddress.street,
        shippingCity: order.shippingAddress.city,
        shippingState: order.shippingAddress.state,
        shippingZipCode: order.shippingAddress.zipCode,
        shippingCountry: order.shippingAddress.country,
        createdAt: order.createdAt,
        items: {
          create: order.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            priceAmount: item.price.amount,
            priceCurrency: item.price.currency,
          })),
        },
      },
      update: {
        status: order.status,
        shippingStreet: order.shippingAddress.street,
        shippingCity: order.shippingAddress.city,
        shippingState: order.shippingAddress.state,
        shippingZipCode: order.shippingAddress.zipCode,
        shippingCountry: order.shippingAddress.country,
        items: {
          deleteMany: {},
          create: order.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            priceAmount: item.price.amount,
            priceCurrency: item.price.currency,
          })),
        },
      },
    });
  }

  async findById(id: string): Promise<Order | null> {
    const orderData = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!orderData) return null;

    return this.toDomain(orderData);
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => this.toDomain(order));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({ where: { id } });
  }

  async findPendingOrders(customerId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        customerId,
        status: 'pending',
      },
      include: { items: true },
    });

    return orders.map(order => this.toDomain(order));
  }

  async findOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { status },
      include: { items: true },
    });

    return orders.map(order => this.toDomain(order));
  }

  private toDomain(orderData: any): Order {
    const address = Address.create(
      orderData.shippingStreet,
      orderData.shippingCity,
      orderData.shippingState,
      orderData.shippingZipCode,
      orderData.shippingCountry
    );

    const items = orderData.items.map((item: any) =>
      OrderLine.create(
        item.productId,
        item.productName,
        item.quantity,
        Money.create(item.priceAmount, item.priceCurrency)
      )
    );

    return Order.fromPersistence(
      orderData.id,
      orderData.customerId,
      orderData.status,
      address,
      items,
      orderData.createdAt
    );
  }
}
```

### 6. Domain Services

Operations that don't naturally belong to an entity or value object.

```typescript
// domain/services/PricingService.ts
export interface PricingRule {
  apply(order: Order): Money;
}

export class BulkDiscountRule implements PricingRule {
  constructor(
    private minItems: number,
    private discountPercentage: number
  ) {}

  apply(order: Order): Money {
    if (order.itemCount >= this.minItems) {
      const discount = order.total.multiply(this.discountPercentage / 100);
      return discount;
    }
    return Money.zero(order.total.currency);
  }
}

export class LoyaltyDiscountRule implements PricingRule {
  constructor(
    private customerRepository: CustomerRepository,
    private discountPercentage: number
  ) {}

  async apply(order: Order): Promise<Money> {
    const customer = await this.customerRepository.findById(order.customerId);

    if (customer && customer.isLoyal()) {
      const discount = order.total.multiply(this.discountPercentage / 100);
      return discount;
    }

    return Money.zero(order.total.currency);
  }
}

export class PricingService {
  constructor(private rules: PricingRule[]) {}

  async calculateFinalPrice(order: Order): Promise<Money> {
    let finalPrice = order.total;

    for (const rule of this.rules) {
      const discount = await rule.apply(order);
      finalPrice = finalPrice.subtract(discount);
    }

    return finalPrice;
  }
}

// domain/services/OrderValidationService.ts
export class OrderValidationService {
  constructor(
    private productRepository: ProductRepository,
    private customerRepository: CustomerRepository
  ) {}

  async validateOrder(order: Order): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validate customer exists
    const customer = await this.customerRepository.findById(order.customerId);
    if (!customer) {
      errors.push('Customer not found');
    }

    // Validate products and stock
    for (const item of order.items) {
      const product = await this.productRepository.findById(item.productId);

      if (!product) {
        errors.push(`Product ${item.productId} not found`);
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push(
          `Insufficient stock for product ${item.productName}. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }
    }

    // Validate customer credit limit
    if (customer && order.total.greaterThan(customer.creditLimit)) {
      errors.push('Order total exceeds customer credit limit');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

---

## Complete Example

### Banking Domain with DDD

```typescript
// domain/value-objects/AccountNumber.ts
export class AccountNumber {
  private constructor(public readonly value: string) {}

  static create(value: string): AccountNumber {
    // Validate format: XXX-XXXXXX-XX
    if (!/^\d{3}-\d{6}-\d{2}$/.test(value)) {
      throw new Error('Invalid account number format');
    }
    return new AccountNumber(value);
  }

  equals(other: AccountNumber): boolean {
    return this.value === other.value;
  }
}

// domain/aggregates/Account.ts
export class Transaction {
  constructor(
    public readonly id: string,
    public readonly amount: Money,
    public readonly type: 'debit' | 'credit',
    public readonly description: string,
    public readonly timestamp: Date
  ) {}
}

export class Account {
  private _transactions: Transaction[] = [];

  private constructor(
    private readonly _id: string,
    private readonly _accountNumber: AccountNumber,
    private readonly _ownerId: string,
    private _balance: Money,
    private readonly _createdAt: Date
  ) {}

  static create(accountNumber: AccountNumber, ownerId: string): Account {
    return new Account(
      crypto.randomUUID(),
      accountNumber,
      ownerId,
      Money.zero('USD'),
      new Date()
    );
  }

  get id(): string {
    return this._id;
  }

  get accountNumber(): AccountNumber {
    return this._accountNumber;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  get balance(): Money {
    return this._balance;
  }

  get transactions(): ReadonlyArray<Transaction> {
    return this._transactions;
  }

  deposit(amount: Money, description: string): void {
    if (amount.amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    this._balance = this._balance.add(amount);

    const transaction = new Transaction(
      crypto.randomUUID(),
      amount,
      'credit',
      description,
      new Date()
    );

    this._transactions.push(transaction);
  }

  withdraw(amount: Money, description: string): void {
    if (amount.amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    if (this._balance.amount < amount.amount) {
      throw new Error('Insufficient funds');
    }

    this._balance = this._balance.subtract(amount);

    const transaction = new Transaction(
      crypto.randomUUID(),
      amount,
      'debit',
      description,
      new Date()
    );

    this._transactions.push(transaction);
  }

  canTransfer(amount: Money): boolean {
    return this._balance.amount >= amount.amount;
  }
}

// domain/services/TransferService.ts
export class TransferService {
  constructor(private accountRepository: AccountRepository) {}

  async transfer(
    fromAccountId: string,
    toAccountId: string,
    amount: Money,
    description: string
  ): Promise<void> {
    // Load accounts
    const fromAccount = await this.accountRepository.findById(fromAccountId);
    const toAccount = await this.accountRepository.findById(toAccountId);

    if (!fromAccount) {
      throw new Error('Source account not found');
    }

    if (!toAccount) {
      throw new Error('Destination account not found');
    }

    // Business rule: Cannot transfer to same account
    if (fromAccount.id === toAccount.id) {
      throw new Error('Cannot transfer to same account');
    }

    // Business rule: Check if transfer is possible
    if (!fromAccount.canTransfer(amount)) {
      throw new Error('Insufficient funds for transfer');
    }

    // Perform transfer
    fromAccount.withdraw(amount, `Transfer to ${toAccount.accountNumber.value}: ${description}`);
    toAccount.deposit(amount, `Transfer from ${fromAccount.accountNumber.value}: ${description}`);

    // Save both accounts
    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);
  }
}
```

---

## Event Storming

A collaborative workshop technique to explore complex domains.

### Steps

1. **Domain Events**: Start with events (orange sticky notes)
   - "Order Placed"
   - "Payment Received"
   - "Order Shipped"

2. **Commands**: What triggers events? (blue sticky notes)
   - "Place Order"
   - "Process Payment"
   - "Ship Order"

3. **Aggregates**: What handles commands? (yellow sticky notes)
   - Order
   - Payment
   - Shipment

4. **Policies**: Automated reactions (purple sticky notes)
   - "When Payment Received → Send Confirmation Email"
   - "When Order Shipped → Update Inventory"

5. **Read Models**: Information needed (green sticky notes)
   - Order Summary
   - Customer History

6. **External Systems**: Outside dependencies (pink sticky notes)
   - Payment Gateway
   - Shipping Provider

---

## Best Practices

### 1. Always Use Value Objects for Concepts

```typescript
// ✅ Good: Using value objects
class Order {
  constructor(
    private readonly price: Money,
    private readonly shippingAddress: Address
  ) {}
}

// ❌ Bad: Primitive obsession
class Order {
  constructor(
    private readonly priceAmount: number,
    private readonly priceCurrency: string,
    private readonly street: string,
    private readonly city: string
  ) {}
}
```

### 2. Maintain Aggregate Invariants

```typescript
// ✅ Good: Enforce rules within aggregate
class Order {
  confirm(): void {
    if (this.items.length === 0) {
      throw new Error('Cannot confirm empty order');
    }
    if (this.status !== 'pending') {
      throw new Error('Only pending orders can be confirmed');
    }
    this._status = 'confirmed';
  }
}

// ❌ Bad: Allow invalid state
class Order {
  setStatus(status: OrderStatus): void {
    this._status = status; // No validation!
  }
}
```

### 3. Keep Aggregates Small

```typescript
// ✅ Good: Focused aggregate
class Order {
  private _items: OrderLine[];
  // Order-specific logic only
}

class Customer {
  private _orders: string[]; // Just references
  // Customer-specific logic only
}

// ❌ Bad: God aggregate
class Customer {
  private _orders: Order[]; // Entire order objects!
  private _payments: Payment[];
  private _addresses: Address[];
  // Too much responsibility
}
```

---

## Directory Structure

```
src/
├── domain/                      # Domain layer
│   ├── aggregates/
│   │   ├── Order.ts
│   │   └── Customer.ts
│   ├── entities/
│   │   └── User.ts
│   ├── value-objects/
│   │   ├── Money.ts
│   │   ├── Email.ts
│   │   └── Address.ts
│   ├── events/
│   │   ├── DomainEvent.ts
│   │   └── OrderEvents.ts
│   ├── services/
│   │   ├── PricingService.ts
│   │   └── TransferService.ts
│   └── repositories/            # Interfaces only
│       └── OrderRepository.ts
├── application/                 # Application layer
│   ├── use-cases/
│   │   ├── PlaceOrderUseCase.ts
│   │   └── TransferMoneyUseCase.ts
│   └── services/
│       └── OrderApplicationService.ts
└── infrastructure/              # Infrastructure layer
    ├── persistence/
    │   └── PrismaOrderRepository.ts
    └── events/
        └── EventPublisher.ts
```

---

## Benefits of DDD

1. **Shared Understanding**: Ubiquitous language bridges developers and domain experts
2. **Focus on Core Domain**: Separate core business logic from supporting concerns
3. **Maintainability**: Clear boundaries and responsibilities
4. **Testability**: Domain logic independent of infrastructure
5. **Flexibility**: Easy to adapt to changing requirements

---

## When to Use DDD

**Use DDD when:**
- Complex business domain with many rules
- Long-lived project with evolving requirements
- Need close collaboration with domain experts
- Core domain provides competitive advantage

**Avoid DDD for:**
- Simple CRUD applications
- Technical problems without complex domain
- Small, short-lived projects
- Teams without domain expert access

---

## Next Steps

- [Event-Driven Architecture](../event-driven/README.md) - Building reactive systems
- [CQRS](../cqrs-event-sourcing/README.md) - Command Query Responsibility Segregation
- [Microservices](../microservices/README.md) - DDD in distributed systems

---

**Remember**: DDD is about understanding and modeling your business domain, not just applying technical patterns!
