# Event-Driven Architecture in TypeScript

Build reactive, scalable systems using events as the primary means of communication between components.

## Table of Contents

- [Event-Driven Architecture Overview](#event-driven-architecture-overview)
- [Event Patterns](#event-patterns)
- [Event Bus Implementation](#event-bus-implementation)
- [Message Queue Integration](#message-queue-integration)
- [Event Sourcing Basics](#event-sourcing-basics)
- [Saga Pattern](#saga-pattern)
- [Best Practices](#best-practices)

---

## Event-Driven Architecture Overview

**Event-Driven Architecture (EDA)** is a software architecture pattern where:
- **Events** represent state changes or significant occurrences
- **Producers** emit events when something happens
- **Consumers** react to events asynchronously
- **Loose coupling** between components

### Benefits

- **Scalability**: Components can scale independently
- **Flexibility**: Easy to add new event consumers
- **Resilience**: Failures don't cascade
- **Auditability**: Complete history of what happened

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Producer  │─Event──>│  Event Bus   │─Event──>│  Consumer 1 │
│  (Service)  │         │ (Broker/Bus) │         │  (Service)  │
└─────────────┘         └──────┬───────┘         └─────────────┘
                              │
                              │ Event             ┌─────────────┐
                              └──────────────────>│  Consumer 2 │
                                                  │  (Service)  │
                                                  └─────────────┘
```

---

## Event Patterns

### 1. Domain Events

Events that represent business-significant occurrences.

```typescript
// events/base/DomainEvent.ts
export interface DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly version: number;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;

  constructor(
    public readonly eventType: string,
    public readonly aggregateId: string,
    public readonly version: number
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }
}

// events/OrderEvents.ts
export class OrderCreatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    public readonly customerId: string,
    public readonly items: OrderItem[],
    public readonly total: number
  ) {
    super('OrderCreated', aggregateId, version);
  }
}

export class OrderConfirmedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    public readonly confirmedAt: Date
  ) {
    super('OrderConfirmed', aggregateId, version);
  }
}

export class OrderPaidEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    public readonly transactionId: string,
    public readonly amount: number,
    public readonly paidAt: Date
  ) {
    super('OrderPaid', aggregateId, version);
  }
}

export class OrderShippedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    public readonly trackingNumber: string,
    public readonly shippedAt: Date
  ) {
    super('OrderShipped', aggregateId, version);
  }
}

export class OrderCancelledEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    public readonly reason: string,
    public readonly cancelledAt: Date
  ) {
    super('OrderCancelled', aggregateId, version);
  }
}
```

### 2. Integration Events

Events that cross bounded context boundaries.

```typescript
// events/integration/IntegrationEvent.ts
export interface IntegrationEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly occurredAt: Date;
  readonly source: string; // Which service produced this
}

// events/integration/CustomerEvents.ts
export class CustomerRegisteredIntegrationEvent implements IntegrationEvent {
  public readonly eventId: string;
  public readonly eventType = 'CustomerRegistered';
  public readonly occurredAt: Date;
  public readonly source = 'customer-service';

  constructor(
    public readonly customerId: string,
    public readonly email: string,
    public readonly name: string
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }
}

// events/integration/OrderEvents.ts
export class OrderPlacedIntegrationEvent implements IntegrationEvent {
  public readonly eventId: string;
  public readonly eventType = 'OrderPlaced';
  public readonly occurredAt: Date;
  public readonly source = 'order-service';

  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly total: number,
    public readonly items: Array<{
      productId: string;
      quantity: number;
    }>
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }
}

export class PaymentProcessedIntegrationEvent implements IntegrationEvent {
  public readonly eventId: string;
  public readonly eventType = 'PaymentProcessed';
  public readonly occurredAt: Date;
  public readonly source = 'payment-service';

  constructor(
    public readonly orderId: string,
    public readonly transactionId: string,
    public readonly amount: number,
    public readonly status: 'success' | 'failed'
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }
}
```

### 3. Event Handlers

Subscribe to and handle events.

```typescript
// events/handlers/EventHandler.ts
export interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

// events/handlers/OrderEventHandlers.ts
export class SendOrderConfirmationEmailHandler
  implements EventHandler<OrderConfirmedEvent>
{
  constructor(private emailService: EmailService) {}

  async handle(event: OrderConfirmedEvent): Promise<void> {
    console.log(`Sending confirmation email for order ${event.aggregateId}`);

    // In real app, fetch order details
    await this.emailService.send({
      to: 'customer@example.com',
      subject: 'Order Confirmed',
      body: `Your order ${event.aggregateId} has been confirmed!`,
    });
  }
}

export class UpdateInventoryHandler implements EventHandler<OrderPaidEvent> {
  constructor(private inventoryService: InventoryService) {}

  async handle(event: OrderPaidEvent): Promise<void> {
    console.log(`Updating inventory for order ${event.aggregateId}`);

    // In real app, fetch order items and update inventory
    await this.inventoryService.reserveItems(event.aggregateId);
  }
}

export class CreateShipmentHandler implements EventHandler<OrderPaidEvent> {
  constructor(private shippingService: ShippingService) {}

  async handle(event: OrderPaidEvent): Promise<void> {
    console.log(`Creating shipment for order ${event.aggregateId}`);

    await this.shippingService.createShipment({
      orderId: event.aggregateId,
      transactionId: event.transactionId,
    });
  }
}

export class NotifyCustomerOrderShippedHandler
  implements EventHandler<OrderShippedEvent>
{
  constructor(
    private emailService: EmailService,
    private smsService: SMSService
  ) {}

  async handle(event: OrderShippedEvent): Promise<void> {
    console.log(`Notifying customer about shipment ${event.trackingNumber}`);

    // Send email and SMS
    await Promise.all([
      this.emailService.send({
        to: 'customer@example.com',
        subject: 'Order Shipped',
        body: `Your order has been shipped! Tracking: ${event.trackingNumber}`,
      }),
      this.smsService.send({
        to: '+1234567890',
        message: `Order shipped! Track: ${event.trackingNumber}`,
      }),
    ]);
  }
}
```

---

## Event Bus Implementation

### In-Memory Event Bus

```typescript
// infrastructure/events/InMemoryEventBus.ts
export class InMemoryEventBus {
  private handlers: Map<string, Array<EventHandler<any>>> = new Map();

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    this.handlers.get(eventType)!.push(handler);
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];

    console.log(
      `Publishing event ${event.eventType} to ${handlers.length} handler(s)`
    );

    // Execute handlers in parallel
    await Promise.all(handlers.map(handler => handler.handle(event)));
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

// Usage example
const eventBus = new InMemoryEventBus();

// Register handlers
eventBus.subscribe(
  'OrderConfirmed',
  new SendOrderConfirmationEmailHandler(emailService)
);
eventBus.subscribe('OrderPaid', new UpdateInventoryHandler(inventoryService));
eventBus.subscribe('OrderPaid', new CreateShipmentHandler(shippingService));
eventBus.subscribe(
  'OrderShipped',
  new NotifyCustomerOrderShippedHandler(emailService, smsService)
);

// Publish event
const event = new OrderConfirmedEvent('order-123', 1, new Date());
await eventBus.publish(event);
```

### Event Bus with Error Handling

```typescript
// infrastructure/events/ResilientEventBus.ts
export interface EventBusOptions {
  retries?: number;
  retryDelay?: number;
  onError?: (error: Error, event: DomainEvent, handler: EventHandler<any>) => void;
}

export class ResilientEventBus {
  private handlers: Map<string, Array<EventHandler<any>>> = new Map();
  private options: Required<EventBusOptions>;

  constructor(options: EventBusOptions = {}) {
    this.options = {
      retries: options.retries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      onError: options.onError ?? this.defaultErrorHandler,
    };
  }

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    this.handlers.get(eventType)!.push(handler);
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];

    console.log(
      `Publishing event ${event.eventType} to ${handlers.length} handler(s)`
    );

    // Execute handlers with error handling
    const results = await Promise.allSettled(
      handlers.map(handler => this.executeWithRetry(event, handler))
    );

    // Log failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `Handler ${index} for ${event.eventType} failed:`,
          result.reason
        );
      }
    });
  }

  private async executeWithRetry<T extends DomainEvent>(
    event: T,
    handler: EventHandler<T>
  ): Promise<void> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.options.retries; attempt++) {
      try {
        await handler.handle(event);
        return; // Success
      } catch (error) {
        lastError = error as Error;

        console.warn(
          `Handler failed (attempt ${attempt + 1}/${this.options.retries + 1}):`,
          error
        );

        if (attempt < this.options.retries) {
          // Wait before retry
          await new Promise(resolve =>
            setTimeout(resolve, this.options.retryDelay * (attempt + 1))
          );
        }
      }
    }

    // All retries exhausted
    this.options.onError(lastError!, event, handler);
    throw lastError;
  }

  private defaultErrorHandler(
    error: Error,
    event: DomainEvent,
    handler: EventHandler<any>
  ): void {
    console.error(
      `Event handler failed after all retries:`,
      {
        event: event.eventType,
        eventId: event.eventId,
        handler: handler.constructor.name,
        error: error.message,
      }
    );
  }
}
```

---

## Message Queue Integration

### RabbitMQ Event Publisher

```typescript
// infrastructure/events/RabbitMQEventBus.ts
import amqp, { Connection, Channel } from 'amqplib';

export class RabbitMQEventBus {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly exchange = 'domain_events';

  async connect(url: string): Promise<void> {
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();

    // Declare exchange
    await this.channel.assertExchange(this.exchange, 'topic', {
      durable: true,
    });

    console.log('Connected to RabbitMQ');
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }

    const routingKey = event.eventType;
    const message = JSON.stringify(event);

    this.channel.publish(this.exchange, routingKey, Buffer.from(message), {
      persistent: true,
      contentType: 'application/json',
      messageId: event.eventId,
      timestamp: event.occurredAt.getTime(),
    });

    console.log(`Published event ${event.eventType} to RabbitMQ`);
  }

  async subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
    queueName: string = `${eventType}_queue`
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }

    // Declare queue
    await this.channel.assertQueue(queueName, {
      durable: true,
    });

    // Bind queue to exchange
    await this.channel.bindQueue(queueName, this.exchange, eventType);

    console.log(`Subscribed to ${eventType} on queue ${queueName}`);

    // Consume messages
    this.channel.consume(
      queueName,
      async msg => {
        if (!msg) return;

        try {
          const event = JSON.parse(msg.content.toString()) as T;
          await handler.handle(event);

          // Acknowledge message
          this.channel!.ack(msg);
        } catch (error) {
          console.error('Error handling message:', error);

          // Reject and requeue
          this.channel!.nack(msg, false, true);
        }
      },
      { noAck: false }
    );
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
    console.log('Disconnected from RabbitMQ');
  }
}

// Usage
const eventBus = new RabbitMQEventBus();
await eventBus.connect('amqp://localhost');

// Publish
const event = new OrderCreatedEvent('order-123', 1, 'customer-1', [], 100);
await eventBus.publish(event);

// Subscribe
await eventBus.subscribe(
  'OrderCreated',
  new SendOrderConfirmationEmailHandler(emailService),
  'email_service_queue'
);
```

### Redis Pub/Sub Event Bus

```typescript
// infrastructure/events/RedisEventBus.ts
import { createClient, RedisClientType } from 'redis';

export class RedisEventBus {
  private publisher: RedisClientType | null = null;
  private subscriber: RedisClientType | null = null;
  private handlers: Map<string, Array<EventHandler<any>>> = new Map();

  async connect(url: string): Promise<void> {
    this.publisher = createClient({ url });
    this.subscriber = createClient({ url });

    await this.publisher.connect();
    await this.subscriber.connect();

    console.log('Connected to Redis');
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    if (!this.publisher) {
      throw new Error('Not connected to Redis');
    }

    const channel = `events:${event.eventType}`;
    const message = JSON.stringify(event);

    await this.publisher.publish(channel, message);

    console.log(`Published event ${event.eventType} to Redis`);
  }

  async subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): Promise<void> {
    if (!this.subscriber) {
      throw new Error('Not connected to Redis');
    }

    // Register handler
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);

      // Subscribe to channel
      const channel = `events:${eventType}`;
      await this.subscriber.subscribe(channel, async message => {
        const event = JSON.parse(message) as T;
        const handlers = this.handlers.get(eventType) || [];

        // Execute all handlers
        await Promise.allSettled(
          handlers.map(h => h.handle(event))
        );
      });

      console.log(`Subscribed to ${eventType} on Redis`);
    }

    this.handlers.get(eventType)!.push(handler);
  }

  async close(): Promise<void> {
    await this.publisher?.quit();
    await this.subscriber?.quit();
    console.log('Disconnected from Redis');
  }
}
```

---

## Event Sourcing Basics

Store all changes as a sequence of events.

```typescript
// domain/EventSourcedAggregate.ts
export abstract class EventSourcedAggregate {
  private _uncommittedEvents: DomainEvent[] = [];
  private _version: number = 0;

  get version(): number {
    return this._version;
  }

  get uncommittedEvents(): ReadonlyArray<DomainEvent> {
    return this._uncommittedEvents;
  }

  protected addEvent(event: DomainEvent): void {
    this._uncommittedEvents.push(event);
    this.apply(event);
    this._version++;
  }

  clearUncommittedEvents(): void {
    this._uncommittedEvents = [];
  }

  loadFromHistory(events: DomainEvent[]): void {
    events.forEach(event => {
      this.apply(event);
      this._version++;
    });
  }

  protected abstract apply(event: DomainEvent): void;
}

// domain/aggregates/BankAccount.ts
export class BankAccount extends EventSourcedAggregate {
  private _id: string = '';
  private _accountNumber: string = '';
  private _balance: number = 0;
  private _isActive: boolean = true;

  get id(): string {
    return this._id;
  }

  get accountNumber(): string {
    return this._accountNumber;
  }

  get balance(): number {
    return this._balance;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  static create(accountNumber: string, initialDeposit: number): BankAccount {
    const account = new BankAccount();
    const event = new AccountOpenedEvent(
      crypto.randomUUID(),
      1,
      accountNumber,
      initialDeposit,
      new Date()
    );
    account.addEvent(event);
    return account;
  }

  deposit(amount: number, description: string): void {
    if (!this._isActive) {
      throw new Error('Account is closed');
    }

    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    const event = new MoneyDepositedEvent(
      this._id,
      this.version + 1,
      amount,
      description,
      new Date()
    );

    this.addEvent(event);
  }

  withdraw(amount: number, description: string): void {
    if (!this._isActive) {
      throw new Error('Account is closed');
    }

    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    if (this._balance < amount) {
      throw new Error('Insufficient funds');
    }

    const event = new MoneyWithdrawnEvent(
      this._id,
      this.version + 1,
      amount,
      description,
      new Date()
    );

    this.addEvent(event);
  }

  close(): void {
    if (!this._isActive) {
      throw new Error('Account already closed');
    }

    if (this._balance > 0) {
      throw new Error('Cannot close account with positive balance');
    }

    const event = new AccountClosedEvent(
      this._id,
      this.version + 1,
      new Date()
    );

    this.addEvent(event);
  }

  protected apply(event: DomainEvent): void {
    if (event instanceof AccountOpenedEvent) {
      this._id = event.aggregateId;
      this._accountNumber = event.accountNumber;
      this._balance = event.initialDeposit;
      this._isActive = true;
    } else if (event instanceof MoneyDepositedEvent) {
      this._balance += event.amount;
    } else if (event instanceof MoneyWithdrawnEvent) {
      this._balance -= event.amount;
    } else if (event instanceof AccountClosedEvent) {
      this._isActive = false;
    }
  }
}

// Events
export class AccountOpenedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    public readonly accountNumber: string,
    public readonly initialDeposit: number,
    public readonly openedAt: Date
  ) {
    super('AccountOpened', aggregateId, version);
  }
}

export class MoneyDepositedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    public readonly amount: number,
    public readonly description: string,
    public readonly depositedAt: Date
  ) {
    super('MoneyDeposited', aggregateId, version);
  }
}

export class MoneyWithdrawnEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    public readonly amount: number,
    public readonly description: string,
    public readonly withdrawnAt: Date
  ) {
    super('MoneyWithdrawn', aggregateId, version);
  }
}

export class AccountClosedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    public readonly closedAt: Date
  ) {
    super('AccountClosed', aggregateId, version);
  }
}

// Event Store
export interface EventStore {
  saveEvents(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
}

export class InMemoryEventStore implements EventStore {
  private events: Map<string, DomainEvent[]> = new Map();

  async saveEvents(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void> {
    const existingEvents = this.events.get(aggregateId) || [];

    // Optimistic concurrency check
    if (existingEvents.length !== expectedVersion) {
      throw new Error('Concurrency conflict');
    }

    this.events.set(aggregateId, [...existingEvents, ...events]);
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    return this.events.get(aggregateId) || [];
  }
}
```

---

## Saga Pattern

Coordinate long-running transactions across multiple services.

```typescript
// sagas/OrderSaga.ts
export class OrderSaga {
  private state: 'initial' | 'order_created' | 'payment_processed' | 'inventory_reserved' | 'completed' | 'compensating' = 'initial';

  constructor(
    private orderService: OrderService,
    private paymentService: PaymentService,
    private inventoryService: InventoryService,
    private eventBus: EventBus
  ) {}

  async execute(command: CreateOrderCommand): Promise<void> {
    try {
      // Step 1: Create order
      const order = await this.orderService.createOrder(command);
      this.state = 'order_created';

      // Step 2: Process payment
      const payment = await this.paymentService.processPayment({
        orderId: order.id,
        amount: order.total,
      });
      this.state = 'payment_processed';

      // Step 3: Reserve inventory
      await this.inventoryService.reserveItems({
        orderId: order.id,
        items: order.items,
      });
      this.state = 'inventory_reserved';

      // Success: Publish completion event
      await this.eventBus.publish(
        new OrderCompletedEvent(order.id, payment.transactionId)
      );
      this.state = 'completed';
    } catch (error) {
      // Compensate based on current state
      await this.compensate(error);
      throw error;
    }
  }

  private async compensate(error: Error): Promise<void> {
    console.error('Saga failed, compensating:', error);
    this.state = 'compensating';

    try {
      if (this.state === 'inventory_reserved') {
        // Release inventory
        await this.inventoryService.releaseItems(orderId);
      }

      if (this.state === 'payment_processed') {
        // Refund payment
        await this.paymentService.refundPayment(paymentId);
      }

      if (this.state === 'order_created') {
        // Cancel order
        await this.orderService.cancelOrder(orderId);
      }
    } catch (compensationError) {
      console.error('Compensation failed:', compensationError);
      // In real app, send to dead letter queue or alert
    }
  }
}
```

---

## Best Practices

### 1. Event Naming

```typescript
// ✅ Good: Past tense, describes what happened
class OrderCreatedEvent {}
class PaymentProcessedEvent {}
class CustomerRegisteredEvent {}

// ❌ Bad: Present tense or imperative
class CreateOrderEvent {}
class ProcessPaymentEvent {}
class RegisterCustomerEvent {}
```

### 2. Event Versioning

```typescript
// v1
export class OrderCreatedEventV1 extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    public readonly customerId: string,
    public readonly total: number
  ) {
    super('OrderCreated', aggregateId, version);
  }
}

// v2 - Added items field
export class OrderCreatedEventV2 extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    public readonly customerId: string,
    public readonly total: number,
    public readonly items: OrderItem[]
  ) {
    super('OrderCreated', aggregateId, version);
  }
}

// Event Upcaster
export class OrderCreatedEventUpcaster {
  upcast(event: any): OrderCreatedEventV2 {
    if (event.version === 1) {
      return new OrderCreatedEventV2(
        event.aggregateId,
        2,
        event.customerId,
        event.total,
        [] // Default empty items
      );
    }
    return event;
  }
}
```

### 3. Idempotent Event Handlers

```typescript
// ✅ Good: Check if already processed
export class SendEmailHandler implements EventHandler<OrderCreatedEvent> {
  constructor(
    private emailService: EmailService,
    private processedEvents: Set<string> = new Set()
  ) {}

  async handle(event: OrderCreatedEvent): Promise<void> {
    // Idempotency check
    if (this.processedEvents.has(event.eventId)) {
      console.log(`Event ${event.eventId} already processed, skipping`);
      return;
    }

    await this.emailService.send({
      to: 'customer@example.com',
      subject: 'Order Created',
      body: `Order ${event.aggregateId} created`,
    });

    // Mark as processed
    this.processedEvents.add(event.eventId);
  }
}
```

### 4. Event Enrichment

```typescript
// Add context to events
export class EnrichedOrderCreatedEvent extends OrderCreatedEvent {
  constructor(
    aggregateId: string,
    version: number,
    customerId: string,
    items: OrderItem[],
    total: number,
    public readonly customerName: string,
    public readonly customerEmail: string
  ) {
    super(aggregateId, version, customerId, items, total);
  }
}
```

---

## Benefits

1. **Loose Coupling**: Services don't need to know about each other
2. **Scalability**: Easy to add new event consumers
3. **Auditability**: Complete event history
4. **Flexibility**: Easy to change behavior without modifying producers
5. **Resilience**: Failures are isolated

---

## Next Steps

- [CQRS and Event Sourcing](../cqrs-event-sourcing/README.md) - Advanced event patterns
- [Microservices](../microservices/README.md) - Event-driven microservices
- [API Design](../api-design/README.md) - Exposing event-driven systems

---

**Remember**: Events represent facts that happened in the past. They are immutable and can be replayed!
