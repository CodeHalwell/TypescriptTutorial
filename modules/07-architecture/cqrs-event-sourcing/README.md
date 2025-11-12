# CQRS and Event Sourcing in TypeScript

Separate read and write operations for scalability and use events as the source of truth.

## Table of Contents

- [CQRS Overview](#cqrs-overview)
- [Event Sourcing](#event-sourcing)
- [Complete CQRS + Event Sourcing Example](#complete-cqrs--event-sourcing-example)
- [Projections and Read Models](#projections-and-read-models)
- [Snapshots](#snapshots)
- [Best Practices](#best-practices)

---

## CQRS Overview

**Command Query Responsibility Segregation (CQRS)** separates read and write operations into different models.

### Traditional vs CQRS

```
Traditional:
┌──────────┐         ┌─────────┐         ┌──────────┐
│  Client  │────────>│  Model  │────────>│ Database │
└──────────┘  R/W    └─────────┘         └──────────┘

CQRS:
┌──────────┐         ┌──────────────┐    ┌────────────┐
│          │─Command→│ Write Model  │───>│ Event Store│
│  Client  │         └──────────────┘    └──────┬─────┘
│          │                                     │
│          │         ┌──────────────┐    ┌──────▼─────┐
│          │─Query──>│  Read Model  │<───│  Read DB   │
└──────────┘         └──────────────┘    └────────────┘
```

### Key Concepts

1. **Commands**: Intent to change state (imperative)
2. **Queries**: Request for data (no side effects)
3. **Events**: Facts about what happened (past tense)
4. **Write Model**: Handles commands, enforces business rules
5. **Read Model**: Optimized for queries

---

## CQRS Implementation

### Commands

```typescript
// commands/base/Command.ts
export interface Command {
  readonly commandId: string;
  readonly commandType: string;
  readonly timestamp: Date;
}

export abstract class BaseCommand implements Command {
  public readonly commandId: string;
  public readonly timestamp: Date;

  constructor(public readonly commandType: string) {
    this.commandId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}

// commands/OrderCommands.ts
export class CreateOrderCommand extends BaseCommand {
  constructor(
    public readonly customerId: string,
    public readonly items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>,
    public readonly shippingAddress: {
      street: string;
      city: string;
      zipCode: string;
    }
  ) {
    super('CreateOrder');
  }
}

export class AddOrderItemCommand extends BaseCommand {
  constructor(
    public readonly orderId: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly price: number
  ) {
    super('AddOrderItem');
  }
}

export class ConfirmOrderCommand extends BaseCommand {
  constructor(public readonly orderId: string) {
    super('ConfirmOrder');
  }
}

export class CancelOrderCommand extends BaseCommand {
  constructor(
    public readonly orderId: string,
    public readonly reason: string
  ) {
    super('CancelOrder');
  }
}
```

### Command Handlers

```typescript
// commands/handlers/CommandHandler.ts
export interface CommandHandler<T extends Command> {
  handle(command: T): Promise<void>;
}

// commands/handlers/OrderCommandHandlers.ts
export class CreateOrderCommandHandler
  implements CommandHandler<CreateOrderCommand>
{
  constructor(
    private orderRepository: EventSourcedOrderRepository,
    private eventBus: EventBus
  ) {}

  async handle(command: CreateOrderCommand): Promise<void> {
    // Create aggregate
    const order = Order.create(
      command.customerId,
      command.items,
      command.shippingAddress
    );

    // Save aggregate (stores events)
    await this.orderRepository.save(order);

    // Publish events
    await this.eventBus.publishAll(order.uncommittedEvents);

    // Clear uncommitted events
    order.clearUncommittedEvents();
  }
}

export class AddOrderItemCommandHandler
  implements CommandHandler<AddOrderItemCommand>
{
  constructor(
    private orderRepository: EventSourcedOrderRepository,
    private eventBus: EventBus
  ) {}

  async handle(command: AddOrderItemCommand): Promise<void> {
    // Load aggregate
    const order = await this.orderRepository.getById(command.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Execute command
    order.addItem(command.productId, command.quantity, command.price);

    // Save aggregate
    await this.orderRepository.save(order);

    // Publish events
    await this.eventBus.publishAll(order.uncommittedEvents);

    order.clearUncommittedEvents();
  }
}

export class ConfirmOrderCommandHandler
  implements CommandHandler<ConfirmOrderCommand>
{
  constructor(
    private orderRepository: EventSourcedOrderRepository,
    private eventBus: EventBus
  ) {}

  async handle(command: ConfirmOrderCommand): Promise<void> {
    const order = await this.orderRepository.getById(command.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.confirm();

    await this.orderRepository.save(order);
    await this.eventBus.publishAll(order.uncommittedEvents);
    order.clearUncommittedEvents();
  }
}
```

### Queries

```typescript
// queries/OrderQueries.ts
export interface OrderQuery {
  readonly queryId: string;
  readonly queryType: string;
}

export class GetOrderByIdQuery implements OrderQuery {
  public readonly queryId: string;
  public readonly queryType = 'GetOrderById';

  constructor(public readonly orderId: string) {
    this.queryId = crypto.randomUUID();
  }
}

export class GetOrdersByCustomerQuery implements OrderQuery {
  public readonly queryId: string;
  public readonly queryType = 'GetOrdersByCustomer';

  constructor(
    public readonly customerId: string,
    public readonly page: number = 1,
    public readonly pageSize: number = 10
  ) {
    this.queryId = crypto.randomUUID();
  }
}

export class GetOrderSummaryQuery implements OrderQuery {
  public readonly queryId: string;
  public readonly queryType = 'GetOrderSummary';

  constructor(public readonly orderId: string) {
    this.queryId = crypto.randomUUID();
  }
}
```

### Query Handlers

```typescript
// queries/handlers/OrderQueryHandlers.ts
export interface QueryHandler<TQuery, TResult> {
  handle(query: TQuery): Promise<TResult>;
}

// Read models (DTOs)
export interface OrderDTO {
  id: string;
  customerId: string;
  customerName: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: Date;
}

export interface OrderDetailDTO extends OrderDTO {
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
  };
}

export interface OrderSummaryDTO {
  orderId: string;
  customerName: string;
  total: number;
  status: string;
  itemCount: number;
}

export class GetOrderByIdQueryHandler
  implements QueryHandler<GetOrderByIdQuery, OrderDetailDTO | null>
{
  constructor(private readDb: PrismaClient) {}

  async handle(query: GetOrderByIdQuery): Promise<OrderDetailDTO | null> {
    const order = await this.readDb.orderReadModel.findUnique({
      where: { id: query.orderId },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!order) return null;

    return {
      id: order.id,
      customerId: order.customerId,
      customerName: order.customer.name,
      status: order.status,
      total: order.total.toNumber(),
      itemCount: order.itemCount,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price.toNumber(),
        subtotal: item.price.toNumber() * item.quantity,
      })),
      shippingAddress: {
        street: order.shippingStreet,
        city: order.shippingCity,
        zipCode: order.shippingZipCode,
      },
    };
  }
}

export class GetOrdersByCustomerQueryHandler
  implements QueryHandler<GetOrdersByCustomerQuery, OrderDTO[]>
{
  constructor(private readDb: PrismaClient) {}

  async handle(query: GetOrdersByCustomerQuery): Promise<OrderDTO[]> {
    const skip = (query.page - 1) * query.pageSize;

    const orders = await this.readDb.orderReadModel.findMany({
      where: { customerId: query.customerId },
      include: { customer: true },
      skip,
      take: query.pageSize,
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => ({
      id: order.id,
      customerId: order.customerId,
      customerName: order.customer.name,
      status: order.status,
      total: order.total.toNumber(),
      itemCount: order.itemCount,
      createdAt: order.createdAt,
    }));
  }
}

export class GetOrderSummaryQueryHandler
  implements QueryHandler<GetOrderSummaryQuery, OrderSummaryDTO | null>
{
  constructor(private readDb: PrismaClient) {}

  async handle(query: GetOrderSummaryQuery): Promise<OrderSummaryDTO | null> {
    // Optimized query for summary view
    const order = await this.readDb.orderReadModel.findUnique({
      where: { id: query.orderId },
      select: {
        id: true,
        total: true,
        status: true,
        itemCount: true,
        customer: {
          select: { name: true },
        },
      },
    });

    if (!order) return null;

    return {
      orderId: order.id,
      customerName: order.customer.name,
      total: order.total.toNumber(),
      status: order.status,
      itemCount: order.itemCount,
    };
  }
}
```

### Command/Query Bus

```typescript
// infrastructure/cqrs/CommandBus.ts
export class CommandBus {
  private handlers: Map<string, CommandHandler<any>> = new Map();

  register<T extends Command>(
    commandType: string,
    handler: CommandHandler<T>
  ): void {
    this.handlers.set(commandType, handler);
  }

  async execute<T extends Command>(command: T): Promise<void> {
    const handler = this.handlers.get(command.commandType);

    if (!handler) {
      throw new Error(`No handler registered for ${command.commandType}`);
    }

    console.log(`Executing command: ${command.commandType}`);
    await handler.handle(command);
  }
}

// infrastructure/cqrs/QueryBus.ts
export class QueryBus {
  private handlers: Map<string, QueryHandler<any, any>> = new Map();

  register<TQuery extends OrderQuery, TResult>(
    queryType: string,
    handler: QueryHandler<TQuery, TResult>
  ): void {
    this.handlers.set(queryType, handler);
  }

  async execute<TQuery extends OrderQuery, TResult>(
    query: TQuery
  ): Promise<TResult> {
    const handler = this.handlers.get(query.queryType);

    if (!handler) {
      throw new Error(`No handler registered for ${query.queryType}`);
    }

    console.log(`Executing query: ${query.queryType}`);
    return await handler.handle(query);
  }
}

// Usage
const commandBus = new CommandBus();
const queryBus = new QueryBus();

// Register handlers
commandBus.register('CreateOrder', new CreateOrderCommandHandler(repo, eventBus));
commandBus.register('AddOrderItem', new AddOrderItemCommandHandler(repo, eventBus));

queryBus.register('GetOrderById', new GetOrderByIdQueryHandler(prisma));
queryBus.register('GetOrdersByCustomer', new GetOrdersByCustomerQueryHandler(prisma));

// Execute commands
await commandBus.execute(
  new CreateOrderCommand('customer-1', items, address)
);

// Execute queries
const order = await queryBus.execute(
  new GetOrderByIdQuery('order-123')
);
```

---

## Event Sourcing

Store all changes as a sequence of events instead of current state.

### Event-Sourced Aggregate

```typescript
// domain/EventSourcedAggregate.ts
export abstract class EventSourcedAggregate {
  private _version: number = 0;
  private _uncommittedEvents: DomainEvent[] = [];

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

// domain/aggregates/Order.ts
export class Order extends EventSourcedAggregate {
  private _id: string = '';
  private _customerId: string = '';
  private _items: Map<string, OrderItem> = new Map();
  private _status: OrderStatus = 'pending';
  private _total: number = 0;
  private _shippingAddress: any = null;

  get id(): string {
    return this._id;
  }

  get customerId(): string {
    return this._customerId;
  }

  get items(): OrderItem[] {
    return Array.from(this._items.values());
  }

  get status(): OrderStatus {
    return this._status;
  }

  get total(): number {
    return this._total;
  }

  static create(
    customerId: string,
    items: Array<{ productId: string; quantity: number; price: number }>,
    shippingAddress: any
  ): Order {
    const order = new Order();
    const orderId = crypto.randomUUID();

    const event = new OrderCreatedEvent(
      orderId,
      1,
      customerId,
      items,
      shippingAddress,
      new Date()
    );

    order.addEvent(event);
    return order;
  }

  addItem(productId: string, quantity: number, price: number): void {
    if (this._status !== 'pending') {
      throw new Error('Cannot add items to non-pending order');
    }

    const event = new OrderItemAddedEvent(
      this._id,
      this.version + 1,
      productId,
      quantity,
      price,
      new Date()
    );

    this.addEvent(event);
  }

  removeItem(productId: string): void {
    if (this._status !== 'pending') {
      throw new Error('Cannot remove items from non-pending order');
    }

    if (!this._items.has(productId)) {
      throw new Error('Item not found');
    }

    const event = new OrderItemRemovedEvent(
      this._id,
      this.version + 1,
      productId,
      new Date()
    );

    this.addEvent(event);
  }

  confirm(): void {
    if (this._status !== 'pending') {
      throw new Error('Only pending orders can be confirmed');
    }

    if (this._items.size === 0) {
      throw new Error('Cannot confirm empty order');
    }

    const event = new OrderConfirmedEvent(
      this._id,
      this.version + 1,
      new Date()
    );

    this.addEvent(event);
  }

  cancel(reason: string): void {
    if (this._status === 'shipped' || this._status === 'delivered') {
      throw new Error('Cannot cancel shipped or delivered orders');
    }

    const event = new OrderCancelledEvent(
      this._id,
      this.version + 1,
      reason,
      new Date()
    );

    this.addEvent(event);
  }

  protected apply(event: DomainEvent): void {
    if (event instanceof OrderCreatedEvent) {
      this._id = event.aggregateId;
      this._customerId = event.customerId;
      this._shippingAddress = event.shippingAddress;
      this._status = 'pending';

      event.items.forEach(item => {
        this._items.set(item.productId, item);
      });

      this.recalculateTotal();
    } else if (event instanceof OrderItemAddedEvent) {
      const existing = this._items.get(event.productId);

      if (existing) {
        this._items.set(event.productId, {
          productId: event.productId,
          quantity: existing.quantity + event.quantity,
          price: event.price,
        });
      } else {
        this._items.set(event.productId, {
          productId: event.productId,
          quantity: event.quantity,
          price: event.price,
        });
      }

      this.recalculateTotal();
    } else if (event instanceof OrderItemRemovedEvent) {
      this._items.delete(event.productId);
      this.recalculateTotal();
    } else if (event instanceof OrderConfirmedEvent) {
      this._status = 'confirmed';
    } else if (event instanceof OrderCancelledEvent) {
      this._status = 'cancelled';
    }
  }

  private recalculateTotal(): void {
    this._total = Array.from(this._items.values()).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }
}
```

### Event Store

```typescript
// infrastructure/eventstore/EventStore.ts
export interface EventStore {
  saveEvents(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
  getAllEvents(fromVersion?: number): Promise<DomainEvent[]>;
}

// infrastructure/eventstore/PrismaEventStore.ts
export class PrismaEventStore implements EventStore {
  constructor(private prisma: PrismaClient) {}

  async saveEvents(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void> {
    // Optimistic concurrency check
    const currentVersion = await this.getCurrentVersion(aggregateId);

    if (currentVersion !== expectedVersion) {
      throw new Error(
        `Concurrency conflict: expected version ${expectedVersion}, got ${currentVersion}`
      );
    }

    // Save events
    await this.prisma.event.createMany({
      data: events.map(event => ({
        eventId: event.eventId,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        version: event.version,
        data: JSON.stringify(event),
        occurredAt: event.occurredAt,
      })),
    });
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    const events = await this.prisma.event.findMany({
      where: { aggregateId },
      orderBy: { version: 'asc' },
    });

    return events.map(e => JSON.parse(e.data));
  }

  async getAllEvents(fromVersion: number = 0): Promise<DomainEvent[]> {
    const events = await this.prisma.event.findMany({
      where: {
        version: { gte: fromVersion },
      },
      orderBy: [{ aggregateId: 'asc' }, { version: 'asc' }],
    });

    return events.map(e => JSON.parse(e.data));
  }

  private async getCurrentVersion(aggregateId: string): Promise<number> {
    const lastEvent = await this.prisma.event.findFirst({
      where: { aggregateId },
      orderBy: { version: 'desc' },
    });

    return lastEvent?.version ?? 0;
  }
}

// infrastructure/repositories/EventSourcedOrderRepository.ts
export class EventSourcedOrderRepository {
  constructor(
    private eventStore: EventStore,
    private snapshotStore?: SnapshotStore
  ) {}

  async getById(id: string): Promise<Order | null> {
    // Try to load from snapshot first
    let order: Order | null = null;
    let fromVersion = 0;

    if (this.snapshotStore) {
      const snapshot = await this.snapshotStore.getSnapshot(id);
      if (snapshot) {
        order = this.deserializeSnapshot(snapshot);
        fromVersion = snapshot.version;
      }
    }

    // Load events since snapshot
    const events = await this.eventStore.getEvents(id);
    const eventsToApply = events.filter(e => e.version > fromVersion);

    if (eventsToApply.length === 0 && !order) {
      return null;
    }

    if (!order) {
      order = new Order();
    }

    order.loadFromHistory(eventsToApply);

    return order;
  }

  async save(order: Order): Promise<void> {
    const events = order.uncommittedEvents;

    if (events.length === 0) {
      return;
    }

    await this.eventStore.saveEvents(
      order.id,
      events as DomainEvent[],
      order.version - events.length
    );

    // Create snapshot every 10 events
    if (this.snapshotStore && order.version % 10 === 0) {
      await this.snapshotStore.saveSnapshot(order.id, order.version, order);
    }
  }

  private deserializeSnapshot(snapshot: any): Order {
    // Deserialize order from snapshot
    const order = new Order();
    // ... restore state from snapshot
    return order;
  }
}
```

---

## Projections and Read Models

Transform events into queryable read models.

```typescript
// projections/OrderProjection.ts
export class OrderProjection {
  constructor(private prisma: PrismaClient) {}

  async project(event: DomainEvent): Promise<void> {
    if (event instanceof OrderCreatedEvent) {
      await this.handleOrderCreated(event);
    } else if (event instanceof OrderItemAddedEvent) {
      await this.handleOrderItemAdded(event);
    } else if (event instanceof OrderItemRemovedEvent) {
      await this.handleOrderItemRemoved(event);
    } else if (event instanceof OrderConfirmedEvent) {
      await this.handleOrderConfirmed(event);
    } else if (event instanceof OrderCancelledEvent) {
      await this.handleOrderCancelled(event);
    }
  }

  private async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.prisma.orderReadModel.create({
      data: {
        id: event.aggregateId,
        customerId: event.customerId,
        status: 'pending',
        total: event.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
        itemCount: event.items.reduce((sum, item) => sum + item.quantity, 0),
        shippingStreet: event.shippingAddress.street,
        shippingCity: event.shippingAddress.city,
        shippingZipCode: event.shippingAddress.zipCode,
        createdAt: event.occurredAt,
        items: {
          create: event.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });
  }

  private async handleOrderItemAdded(event: OrderItemAddedEvent): Promise<void> {
    // Update read model
    const order = await this.prisma.orderReadModel.findUnique({
      where: { id: event.aggregateId },
      include: { items: true },
    });

    if (!order) return;

    const existingItem = order.items.find(i => i.productId === event.productId);

    if (existingItem) {
      // Update existing item
      await this.prisma.orderItemReadModel.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + event.quantity,
        },
      });
    } else {
      // Add new item
      await this.prisma.orderItemReadModel.create({
        data: {
          orderId: event.aggregateId,
          productId: event.productId,
          quantity: event.quantity,
          price: event.price,
        },
      });
    }

    // Recalculate totals
    await this.recalculateTotals(event.aggregateId);
  }

  private async handleOrderItemRemoved(event: OrderItemRemovedEvent): Promise<void> {
    await this.prisma.orderItemReadModel.deleteMany({
      where: {
        orderId: event.aggregateId,
        productId: event.productId,
      },
    });

    await this.recalculateTotals(event.aggregateId);
  }

  private async handleOrderConfirmed(event: OrderConfirmedEvent): Promise<void> {
    await this.prisma.orderReadModel.update({
      where: { id: event.aggregateId },
      data: { status: 'confirmed' },
    });
  }

  private async handleOrderCancelled(event: OrderCancelledEvent): Promise<void> {
    await this.prisma.orderReadModel.update({
      where: { id: event.aggregateId },
      data: { status: 'cancelled' },
    });
  }

  private async recalculateTotals(orderId: string): Promise<void> {
    const items = await this.prisma.orderItemReadModel.findMany({
      where: { orderId },
    });

    const total = items.reduce(
      (sum, item) => sum + item.price.toNumber() * item.quantity,
      0
    );

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    await this.prisma.orderReadModel.update({
      where: { id: orderId },
      data: { total, itemCount },
    });
  }
}

// Event handler that updates projections
export class ProjectionEventHandler implements EventHandler<DomainEvent> {
  constructor(private projection: OrderProjection) {}

  async handle(event: DomainEvent): Promise<void> {
    await this.projection.project(event);
  }
}
```

---

## Snapshots

Optimize aggregate loading by storing periodic snapshots.

```typescript
// infrastructure/snapshots/SnapshotStore.ts
export interface Snapshot {
  aggregateId: string;
  version: number;
  data: any;
  createdAt: Date;
}

export interface SnapshotStore {
  saveSnapshot(aggregateId: string, version: number, aggregate: any): Promise<void>;
  getSnapshot(aggregateId: string): Promise<Snapshot | null>;
}

export class PrismaSnapshotStore implements SnapshotStore {
  constructor(private prisma: PrismaClient) {}

  async saveSnapshot(
    aggregateId: string,
    version: number,
    aggregate: any
  ): Promise<void> {
    await this.prisma.snapshot.upsert({
      where: { aggregateId },
      create: {
        aggregateId,
        version,
        data: JSON.stringify(aggregate),
        createdAt: new Date(),
      },
      update: {
        version,
        data: JSON.stringify(aggregate),
        createdAt: new Date(),
      },
    });
  }

  async getSnapshot(aggregateId: string): Promise<Snapshot | null> {
    const snapshot = await this.prisma.snapshot.findUnique({
      where: { aggregateId },
    });

    if (!snapshot) return null;

    return {
      aggregateId: snapshot.aggregateId,
      version: snapshot.version,
      data: JSON.parse(snapshot.data),
      createdAt: snapshot.createdAt,
    };
  }
}
```

---

## Complete CQRS + Event Sourcing Example

```typescript
// main.ts - Wire everything together
async function main() {
  const prisma = new PrismaClient();

  // Event infrastructure
  const eventStore = new PrismaEventStore(prisma);
  const snapshotStore = new PrismaSnapshotStore(prisma);
  const eventBus = new InMemoryEventBus();

  // Repository
  const orderRepository = new EventSourcedOrderRepository(
    eventStore,
    snapshotStore
  );

  // Command handlers
  const createOrderHandler = new CreateOrderCommandHandler(
    orderRepository,
    eventBus
  );
  const addItemHandler = new AddOrderItemCommandHandler(
    orderRepository,
    eventBus
  );
  const confirmOrderHandler = new ConfirmOrderCommandHandler(
    orderRepository,
    eventBus
  );

  // Command bus
  const commandBus = new CommandBus();
  commandBus.register('CreateOrder', createOrderHandler);
  commandBus.register('AddOrderItem', addItemHandler);
  commandBus.register('ConfirmOrder', confirmOrderHandler);

  // Query handlers
  const getOrderByIdHandler = new GetOrderByIdQueryHandler(prisma);
  const getOrdersByCustomerHandler = new GetOrdersByCustomerQueryHandler(prisma);

  // Query bus
  const queryBus = new QueryBus();
  queryBus.register('GetOrderById', getOrderByIdHandler);
  queryBus.register('GetOrdersByCustomer', getOrdersByCustomerHandler);

  // Projection
  const projection = new OrderProjection(prisma);
  eventBus.subscribe('OrderCreated', new ProjectionEventHandler(projection));
  eventBus.subscribe('OrderItemAdded', new ProjectionEventHandler(projection));
  eventBus.subscribe('OrderItemRemoved', new ProjectionEventHandler(projection));
  eventBus.subscribe('OrderConfirmed', new ProjectionEventHandler(projection));

  // Execute commands
  await commandBus.execute(
    new CreateOrderCommand(
      'customer-1',
      [{ productId: 'p1', quantity: 2, price: 10 }],
      { street: '123 Main St', city: 'NYC', zipCode: '10001' }
    )
  );

  // Query data
  const orders = await queryBus.execute(
    new GetOrdersByCustomerQuery('customer-1')
  );

  console.log('Orders:', orders);
}

main();
```

---

## Best Practices

### 1. Separate Write and Read Models

```typescript
// ✅ Good: Separate models
// Write model (aggregate)
class Order extends EventSourcedAggregate {
  // Business logic
}

// Read model (DTO)
interface OrderDTO {
  id: string;
  customerName: string;
  total: number;
}

// ❌ Bad: Same model for everything
class Order {
  // Used for both writes and reads
}
```

### 2. Idempotent Projections

```typescript
// ✅ Good: Handle duplicate events
async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
  const existing = await this.prisma.orderReadModel.findUnique({
    where: { id: event.aggregateId },
  });

  if (existing) {
    console.log('Order already projected, skipping');
    return;
  }

  await this.prisma.orderReadModel.create({
    // ...
  });
}
```

### 3. Snapshot Strategy

```typescript
// ✅ Good: Snapshot every N events
if (order.version % 10 === 0) {
  await snapshotStore.saveSnapshot(order.id, order.version, order);
}

// Alternative: Snapshot on important events
if (event instanceof OrderCompletedEvent) {
  await snapshotStore.saveSnapshot(order.id, order.version, order);
}
```

---

## Benefits

1. **Scalability**: Read and write can scale independently
2. **Auditability**: Complete history of all changes
3. **Time Travel**: Reconstruct state at any point in time
4. **Event Replay**: Rebuild read models from events
5. **Optimized Queries**: Read models tailored for specific queries

---

## When to Use

**Use CQRS when:**
- Read and write patterns are very different
- Need different scaling strategies for reads vs writes
- Complex queries that don't fit write model
- Multiple read models for same data

**Use Event Sourcing when:**
- Need complete audit trail
- Business requires event history
- Temporal queries (state at point in time)
- Event replay for debugging/analytics

**Avoid when:**
- Simple CRUD applications
- Eventual consistency not acceptable
- Team lacks experience with these patterns

---

## Next Steps

- [Event-Driven Architecture](../event-driven/README.md) - Event patterns
- [Microservices](../microservices/README.md) - CQRS in distributed systems
- [API Design](../api-design/README.md) - Exposing CQRS systems

---

**Remember**: CQRS and Event Sourcing are powerful but complex. Use them only when the benefits outweigh the complexity!
