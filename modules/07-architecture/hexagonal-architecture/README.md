# Hexagonal Architecture in TypeScript

Build maintainable, testable applications using the Ports and Adapters pattern.

## Table of Contents

- [Hexagonal Architecture Overview](#hexagonal-architecture-overview)
- [Ports and Adapters](#ports-and-adapters)
- [Core Concepts](#core-concepts)
- [Implementation in TypeScript](#implementation-in-typescript)
- [Complete Example](#complete-example)
- [Testing Strategy](#testing-strategy)
- [Comparison with Clean Architecture](#comparison-with-clean-architecture)
- [Best Practices](#best-practices)

---

## Hexagonal Architecture Overview

**Hexagonal Architecture** (also known as **Ports and Adapters**) was created by Alistair Cockburn to solve the problem of business logic being tightly coupled to external concerns.

### Key Principles

1. **Application Core** contains business logic
2. **Ports** define interfaces for communication
3. **Adapters** implement the interfaces for specific technologies
4. **Dependencies point inward** toward the core

```
         ┌─────────────────────────────────┐
         │                                 │
    ┌────┤         Adapters (Out)          ├────┐
    │    │   (Database, Email, APIs)       │    │
    │    └─────────────────────────────────┘    │
    │                                            │
┌───▼────────────────────────────────────────┬──▼───┐
│  Ports (Interfaces)                        │Ports │
│  ┌──────────────────────────────────────┐  │(In)  │
│  │                                      │  │      │
│  │       Application Core               │  │REST  │
│  │     (Business Logic)                 │  │      │
│  │                                      │  │CLI   │
│  └──────────────────────────────────────┘  │      │
└───▲────────────────────────────────────────┴──▲───┘
    │                                            │
    │    ┌─────────────────────────────────┐    │
    └────┤        Adapters (In)            ├────┘
         │    (HTTP, gRPC, CLI, Queue)     │
         └─────────────────────────────────┘
```

---

## Ports and Adapters

### Primary Ports (Driving Ports)

**Purpose**: Define how external actors interact with the application

```typescript
// application/ports/in/CreateUserPort.ts
export interface CreateUserCommand {
  email: string;
  username: string;
  password: string;
}

export interface CreateUserUseCase {
  execute(command: CreateUserCommand): Promise<User>;
}
```

### Primary Adapters (Driving Adapters)

**Purpose**: Implement interfaces that call the application (UI, API, CLI)

```typescript
// adapters/in/http/UserController.ts
import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../../application/ports/in/CreateUserPort';

export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.createUserUseCase.execute({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
      });

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
}
```

### Secondary Ports (Driven Ports)

**Purpose**: Define interfaces for external services the application needs

```typescript
// application/ports/out/UserRepository.ts
export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
}

export interface UserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  delete(id: string): Promise<void>;
}

// application/ports/out/EmailService.ts
export interface EmailService {
  sendWelcomeEmail(email: string, username: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
}
```

### Secondary Adapters (Driven Adapters)

**Purpose**: Implement external services (databases, APIs, email)

```typescript
// adapters/out/persistence/PrismaUserRepository.ts
import { PrismaClient } from '@prisma/client';
import { UserRepository, User } from '../../../application/ports/out/UserRepository';

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.create({
      data: user,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}

// adapters/out/email/SendGridEmailService.ts
import sgMail from '@sendgrid/mail';
import { EmailService } from '../../../application/ports/out/EmailService';

export class SendGridEmailService implements EmailService {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    await sgMail.send({
      to: email,
      from: 'noreply@example.com',
      subject: 'Welcome!',
      text: `Welcome ${username}!`,
      html: `<strong>Welcome ${username}!</strong>`,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    await sgMail.send({
      to: email,
      from: 'noreply@example.com',
      subject: 'Password Reset',
      text: `Your reset token: ${token}`,
      html: `<p>Your reset token: <strong>${token}</strong></p>`,
    });
  }
}
```

---

## Core Concepts

### 1. Application Core

The business logic that's independent of frameworks and infrastructure.

```typescript
// application/domain/User.ts
export class UserDomain {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly username: string,
    public readonly passwordHash: string,
    public readonly createdAt: Date
  ) {}

  static create(email: string, username: string, passwordHash: string): UserDomain {
    // Business rules
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }

    if (username.length < 3 || username.length > 20) {
      throw new Error('Username must be 3-20 characters');
    }

    if (passwordHash.length < 60) {
      throw new Error('Password must be hashed');
    }

    return new UserDomain(
      crypto.randomUUID(),
      email.toLowerCase(),
      username,
      passwordHash,
      new Date()
    );
  }

  canBeDeleted(): boolean {
    // Business rule: users can only be deleted if account is older than 24 hours
    const hoursSinceCreation =
      (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation >= 24;
  }
}
```

### 2. Application Services (Use Cases)

Orchestrate business logic and external dependencies.

```typescript
// application/services/CreateUserService.ts
import { CreateUserUseCase, CreateUserCommand } from '../ports/in/CreateUserPort';
import { UserRepository, User } from '../ports/out/UserRepository';
import { EmailService } from '../ports/out/EmailService';
import { PasswordHasher } from '../ports/out/PasswordHasher';
import { UserDomain } from '../domain/User';

export class CreateUserService implements CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private passwordHasher: PasswordHasher
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(command.password);

    // Create domain entity
    const userDomain = UserDomain.create(
      command.email,
      command.username,
      passwordHash
    );

    // Convert to persistence model
    const user: User = {
      id: userDomain.id,
      email: userDomain.email,
      username: userDomain.username,
      passwordHash: userDomain.passwordHash,
      createdAt: userDomain.createdAt,
    };

    // Save user
    await this.userRepository.save(user);

    // Send welcome email (fire and forget)
    this.emailService
      .sendWelcomeEmail(user.email, user.username)
      .catch(err => console.error('Failed to send welcome email:', err));

    return user;
  }
}
```

---

## Complete Example

### E-commerce Order System

```typescript
// ===== Domain Models =====
// application/domain/Order.ts
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export class OrderDomain {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly items: ReadonlyArray<OrderItem>,
    public readonly status: OrderStatus,
    public readonly total: number,
    public readonly createdAt: Date
  ) {}

  static create(userId: string, items: OrderItem[]): OrderDomain {
    if (items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    if (items.some(item => item.quantity <= 0)) {
      throw new Error('Item quantity must be positive');
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (total <= 0) {
      throw new Error('Order total must be positive');
    }

    return new OrderDomain(
      crypto.randomUUID(),
      userId,
      items,
      'pending',
      total,
      new Date()
    );
  }

  markAsPaid(): OrderDomain {
    if (this.status !== 'pending') {
      throw new Error('Only pending orders can be marked as paid');
    }

    return new OrderDomain(
      this.id,
      this.userId,
      this.items,
      'paid',
      this.total,
      this.createdAt
    );
  }

  ship(): OrderDomain {
    if (this.status !== 'paid') {
      throw new Error('Only paid orders can be shipped');
    }

    return new OrderDomain(
      this.id,
      this.userId,
      this.items,
      'shipped',
      this.total,
      this.createdAt
    );
  }

  cancel(): OrderDomain {
    if (this.status === 'shipped' || this.status === 'delivered') {
      throw new Error('Cannot cancel shipped or delivered orders');
    }

    return new OrderDomain(
      this.id,
      this.userId,
      this.items,
      'cancelled',
      this.total,
      this.createdAt
    );
  }
}

// ===== Primary Ports (In) =====
// application/ports/in/PlaceOrderPort.ts
export interface PlaceOrderCommand {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface PlaceOrderResult {
  orderId: string;
  total: number;
  paymentUrl: string;
}

export interface PlaceOrderUseCase {
  execute(command: PlaceOrderCommand): Promise<PlaceOrderResult>;
}

// ===== Secondary Ports (Out) =====
// application/ports/out/OrderRepository.ts
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: Date;
}

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  update(order: Order): Promise<void>;
}

// application/ports/out/ProductRepository.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findByIds(ids: string[]): Promise<Product[]>;
  decreaseStock(productId: string, quantity: number): Promise<void>;
}

// application/ports/out/PaymentService.ts
export interface PaymentResult {
  transactionId: string;
  paymentUrl: string;
  expiresAt: Date;
}

export interface PaymentService {
  createPaymentSession(
    orderId: string,
    amount: number,
    currency: string
  ): Promise<PaymentResult>;
  verifyPayment(transactionId: string): Promise<boolean>;
}

// application/ports/out/NotificationService.ts
export interface NotificationService {
  notifyOrderCreated(userId: string, orderId: string): Promise<void>;
  notifyPaymentReceived(userId: string, orderId: string): Promise<void>;
  notifyOrderShipped(userId: string, orderId: string, trackingNumber: string): Promise<void>;
}

// ===== Application Service =====
// application/services/PlaceOrderService.ts
import { PlaceOrderUseCase, PlaceOrderCommand, PlaceOrderResult } from '../ports/in/PlaceOrderPort';
import { OrderRepository } from '../ports/out/OrderRepository';
import { ProductRepository } from '../ports/out/ProductRepository';
import { PaymentService } from '../ports/out/PaymentService';
import { NotificationService } from '../ports/out/NotificationService';
import { OrderDomain, OrderItem } from '../domain/Order';

export class PlaceOrderService implements PlaceOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository,
    private paymentService: PaymentService,
    private notificationService: NotificationService
  ) {}

  async execute(command: PlaceOrderCommand): Promise<PlaceOrderResult> {
    // Validate and fetch products
    const productIds = command.items.map(item => item.productId);
    const products = await this.productRepository.findByIds(productIds);

    if (products.length !== productIds.length) {
      throw new Error('Some products not found');
    }

    // Build order items with current prices
    const orderItems: OrderItem[] = command.items.map(item => {
      const product = products.find(p => p.id === item.productId)!;

      // Check stock
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      };
    });

    // Create order domain entity
    const orderDomain = OrderDomain.create(command.userId, orderItems);

    // Convert to persistence model
    const order = {
      id: orderDomain.id,
      userId: orderDomain.userId,
      items: orderDomain.items as OrderItem[],
      status: orderDomain.status,
      total: orderDomain.total,
      createdAt: orderDomain.createdAt,
    };

    // Save order
    await this.orderRepository.save(order);

    // Decrease product stock
    for (const item of orderItems) {
      await this.productRepository.decreaseStock(item.productId, item.quantity);
    }

    // Create payment session
    const payment = await this.paymentService.createPaymentSession(
      order.id,
      order.total,
      'USD'
    );

    // Send notification (fire and forget)
    this.notificationService
      .notifyOrderCreated(command.userId, order.id)
      .catch(err => console.error('Failed to send notification:', err));

    return {
      orderId: order.id,
      total: order.total,
      paymentUrl: payment.paymentUrl,
    };
  }
}

// ===== Primary Adapter (HTTP) =====
// adapters/in/http/OrderController.ts
import { Request, Response } from 'express';
import { PlaceOrderUseCase } from '../../../application/ports/in/PlaceOrderPort';

export class OrderController {
  constructor(private placeOrderUseCase: PlaceOrderUseCase) {}

  async placeOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id; // From authentication middleware

      const result = await this.placeOrderUseCase.execute({
        userId,
        items: req.body.items,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
}

// ===== Secondary Adapters =====
// adapters/out/persistence/PrismaOrderRepository.ts
import { PrismaClient } from '@prisma/client';
import { OrderRepository, Order } from '../../../application/ports/out/OrderRepository';

export class PrismaOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaClient) {}

  async save(order: Order): Promise<void> {
    await this.prisma.order.create({
      data: {
        id: order.id,
        userId: order.userId,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        items: {
          create: order.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });
  }

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return null;

    return {
      id: order.id,
      userId: order.userId,
      items: order.items,
      status: order.status as any,
      total: order.total.toNumber(),
      createdAt: order.createdAt,
    };
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => ({
      id: order.id,
      userId: order.userId,
      items: order.items,
      status: order.status as any,
      total: order.total.toNumber(),
      createdAt: order.createdAt,
    }));
  }

  async update(order: Order): Promise<void> {
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: order.status,
        total: order.total,
      },
    });
  }
}

// adapters/out/payment/StripePaymentService.ts
import Stripe from 'stripe';
import { PaymentService, PaymentResult } from '../../../application/ports/out/PaymentService';

export class StripePaymentService implements PaymentService {
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, { apiVersion: '2023-10-16' });
  }

  async createPaymentSession(
    orderId: string,
    amount: number,
    currency: string
  ): Promise<PaymentResult> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Order ${orderId}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.APP_URL}/orders/${orderId}/success`,
      cancel_url: `${process.env.APP_URL}/orders/${orderId}/cancel`,
      metadata: {
        orderId,
      },
    });

    return {
      transactionId: session.id,
      paymentUrl: session.url!,
      expiresAt: new Date(session.expires_at * 1000),
    };
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    const session = await this.stripe.checkout.sessions.retrieve(transactionId);
    return session.payment_status === 'paid';
  }
}

// adapters/out/notification/EmailNotificationService.ts
import { NotificationService } from '../../../application/ports/out/NotificationService';
import { EmailService } from '../../../application/ports/out/EmailService';

export class EmailNotificationService implements NotificationService {
  constructor(private emailService: EmailService) {}

  async notifyOrderCreated(userId: string, orderId: string): Promise<void> {
    // In real app, fetch user email from UserRepository
    await this.emailService.sendWelcomeEmail(
      'user@example.com',
      `Your order ${orderId} has been created`
    );
  }

  async notifyPaymentReceived(userId: string, orderId: string): Promise<void> {
    await this.emailService.sendWelcomeEmail(
      'user@example.com',
      `Payment received for order ${orderId}`
    );
  }

  async notifyOrderShipped(
    userId: string,
    orderId: string,
    trackingNumber: string
  ): Promise<void> {
    await this.emailService.sendWelcomeEmail(
      'user@example.com',
      `Order ${orderId} shipped. Tracking: ${trackingNumber}`
    );
  }
}

// ===== Dependency Injection Container =====
// infrastructure/di/Container.ts
import { PrismaClient } from '@prisma/client';
import { PlaceOrderService } from '../../application/services/PlaceOrderService';
import { PrismaOrderRepository } from '../../adapters/out/persistence/PrismaOrderRepository';
import { PrismaProductRepository } from '../../adapters/out/persistence/PrismaProductRepository';
import { StripePaymentService } from '../../adapters/out/payment/StripePaymentService';
import { EmailNotificationService } from '../../adapters/out/notification/EmailNotificationService';
import { SendGridEmailService } from '../../adapters/out/email/SendGridEmailService';

export class Container {
  private static prisma = new PrismaClient();

  static createPlaceOrderService(): PlaceOrderService {
    const orderRepository = new PrismaOrderRepository(this.prisma);
    const productRepository = new PrismaProductRepository(this.prisma);
    const paymentService = new StripePaymentService(process.env.STRIPE_API_KEY!);
    const emailService = new SendGridEmailService(process.env.SENDGRID_API_KEY!);
    const notificationService = new EmailNotificationService(emailService);

    return new PlaceOrderService(
      orderRepository,
      productRepository,
      paymentService,
      notificationService
    );
  }
}
```

---

## Testing Strategy

### Unit Testing Application Services

```typescript
// __tests__/PlaceOrderService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaceOrderService } from '../application/services/PlaceOrderService';

describe('PlaceOrderService', () => {
  // Create mocks
  const mockOrderRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    update: vi.fn(),
  };

  const mockProductRepository = {
    findById: vi.fn(),
    findByIds: vi.fn(),
    decreaseStock: vi.fn(),
  };

  const mockPaymentService = {
    createPaymentSession: vi.fn(),
    verifyPayment: vi.fn(),
  };

  const mockNotificationService = {
    notifyOrderCreated: vi.fn(),
    notifyPaymentReceived: vi.fn(),
    notifyOrderShipped: vi.fn(),
  };

  let service: PlaceOrderService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new PlaceOrderService(
      mockOrderRepository,
      mockProductRepository,
      mockPaymentService,
      mockNotificationService
    );
  });

  it('should place order successfully', async () => {
    // Arrange
    const command = {
      userId: 'user-1',
      items: [{ productId: 'product-1', quantity: 2 }],
    };

    const product = {
      id: 'product-1',
      name: 'Test Product',
      price: 10.0,
      stock: 5,
    };

    mockProductRepository.findByIds.mockResolvedValue([product]);
    mockPaymentService.createPaymentSession.mockResolvedValue({
      transactionId: 'txn-1',
      paymentUrl: 'https://payment.com',
      expiresAt: new Date(),
    });

    // Act
    const result = await service.execute(command);

    // Assert
    expect(result.orderId).toBeDefined();
    expect(result.total).toBe(20.0);
    expect(result.paymentUrl).toBe('https://payment.com');
    expect(mockOrderRepository.save).toHaveBeenCalledOnce();
    expect(mockProductRepository.decreaseStock).toHaveBeenCalledWith('product-1', 2);
  });

  it('should throw error if product not found', async () => {
    // Arrange
    const command = {
      userId: 'user-1',
      items: [{ productId: 'invalid', quantity: 1 }],
    };

    mockProductRepository.findByIds.mockResolvedValue([]);

    // Act & Assert
    await expect(service.execute(command)).rejects.toThrow('Some products not found');
  });

  it('should throw error if insufficient stock', async () => {
    // Arrange
    const command = {
      userId: 'user-1',
      items: [{ productId: 'product-1', quantity: 10 }],
    };

    const product = {
      id: 'product-1',
      name: 'Test Product',
      price: 10.0,
      stock: 5,
    };

    mockProductRepository.findByIds.mockResolvedValue([product]);

    // Act & Assert
    await expect(service.execute(command)).rejects.toThrow('Insufficient stock');
  });
});
```

### Integration Testing with Test Adapters

```typescript
// __tests__/integration/PlaceOrder.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { PlaceOrderService } from '../../application/services/PlaceOrderService';
import { InMemoryOrderRepository } from '../../adapters/out/persistence/InMemoryOrderRepository';
import { InMemoryProductRepository } from '../../adapters/out/persistence/InMemoryProductRepository';
import { FakePaymentService } from '../../adapters/out/payment/FakePaymentService';
import { FakeNotificationService } from '../../adapters/out/notification/FakeNotificationService';

describe('PlaceOrder Integration', () => {
  let service: PlaceOrderService;
  let productRepository: InMemoryProductRepository;

  beforeEach(() => {
    const orderRepository = new InMemoryOrderRepository();
    productRepository = new InMemoryProductRepository();
    const paymentService = new FakePaymentService();
    const notificationService = new FakeNotificationService();

    service = new PlaceOrderService(
      orderRepository,
      productRepository,
      paymentService,
      notificationService
    );

    // Seed test data
    productRepository.seed([
      { id: 'p1', name: 'Product 1', price: 10.0, stock: 10 },
      { id: 'p2', name: 'Product 2', price: 20.0, stock: 5 },
    ]);
  });

  it('should place order and decrease stock', async () => {
    // Act
    const result = await service.execute({
      userId: 'user-1',
      items: [
        { productId: 'p1', quantity: 2 },
        { productId: 'p2', quantity: 1 },
      ],
    });

    // Assert
    expect(result.total).toBe(40.0); // (10 * 2) + (20 * 1)

    const p1 = await productRepository.findById('p1');
    const p2 = await productRepository.findById('p2');

    expect(p1?.stock).toBe(8); // 10 - 2
    expect(p2?.stock).toBe(4); // 5 - 1
  });
});
```

---

## Comparison with Clean Architecture

| Aspect | Hexagonal Architecture | Clean Architecture |
|--------|------------------------|-------------------|
| **Focus** | Ports and Adapters separation | Layer separation with Dependency Rule |
| **Structure** | Core + Ports + Adapters | Entities → Use Cases → Controllers → Infrastructure |
| **Terminology** | Ports (interfaces), Adapters (implementations) | Layers (Domain, Application, Infrastructure) |
| **Primary Goal** | Isolate core from external concerns | Separate concerns by abstraction level |
| **Best For** | Applications with multiple interfaces (REST, CLI, gRPC) | Complex domains with clear business rules |
| **Complexity** | Simpler, fewer layers | More structured, more layers |

### When to Use Hexagonal Architecture

✅ **Use when:**
- Application has multiple interfaces (HTTP, CLI, message queue)
- Need to swap implementations frequently (different databases, APIs)
- Domain logic is relatively simple
- Team prefers explicit port definitions

### When to Use Clean Architecture

✅ **Use when:**
- Complex business logic with multiple use cases
- Clear separation between domain and application logic needed
- Large teams working on different layers
- Long-term maintainability is critical

---

## Best Practices

### 1. Define Clear Port Interfaces

```typescript
// ✅ Good: Clear, focused interface
export interface UserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

// ❌ Bad: Too many responsibilities
export interface UserService {
  createUser(data: any): Promise<any>;
  sendEmail(to: string): Promise<void>;
  logActivity(action: string): void;
  processPayment(amount: number): Promise<void>;
}
```

### 2. Keep Domain Logic Pure

```typescript
// ✅ Good: Pure domain logic
export class OrderDomain {
  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  canBeCancelled(): boolean {
    return this.status !== 'shipped' && this.status !== 'delivered';
  }
}

// ❌ Bad: Infrastructure concerns in domain
export class OrderDomain {
  async save() {
    await database.save(this); // Don't do this!
  }

  async sendConfirmationEmail() {
    await emailService.send(...); // Don't do this!
  }
}
```

### 3. Use Dependency Injection

```typescript
// ✅ Good: Dependencies injected
export class PlaceOrderService {
  constructor(
    private orderRepository: OrderRepository,
    private paymentService: PaymentService
  ) {}
}

// ❌ Bad: Direct instantiation
export class PlaceOrderService {
  private orderRepository = new PrismaOrderRepository();
  private paymentService = new StripePaymentService();
}
```

### 4. Create Test Adapters

```typescript
// Test implementations for easy testing
export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return Array.from(this.users.values()).find(u => u.email === email) || null;
  }

  // Test helper methods
  clear(): void {
    this.users.clear();
  }

  seed(users: User[]): void {
    users.forEach(u => this.users.set(u.id, u));
  }
}
```

---

## Directory Structure

```
src/
├── application/                 # Application core
│   ├── domain/                  # Domain models
│   │   ├── Order.ts
│   │   └── User.ts
│   ├── ports/
│   │   ├── in/                  # Primary ports (driving)
│   │   │   ├── PlaceOrderPort.ts
│   │   │   └── CreateUserPort.ts
│   │   └── out/                 # Secondary ports (driven)
│   │       ├── OrderRepository.ts
│   │       ├── PaymentService.ts
│   │       └── NotificationService.ts
│   └── services/                # Application services (use cases)
│       ├── PlaceOrderService.ts
│       └── CreateUserService.ts
├── adapters/
│   ├── in/                      # Primary adapters
│   │   ├── http/
│   │   │   ├── OrderController.ts
│   │   │   └── UserController.ts
│   │   ├── cli/
│   │   │   └── OrderCLI.ts
│   │   └── grpc/
│   │       └── OrderGrpcService.ts
│   └── out/                     # Secondary adapters
│       ├── persistence/
│       │   ├── PrismaOrderRepository.ts
│       │   └── InMemoryOrderRepository.ts
│       ├── payment/
│       │   ├── StripePaymentService.ts
│       │   └── FakePaymentService.ts
│       └── notification/
│           └── EmailNotificationService.ts
└── infrastructure/              # Framework and configuration
    ├── di/
    │   └── Container.ts
    ├── config/
    │   └── database.ts
    └── server.ts
```

---

## Benefits

1. **Testability**: Easy to test core logic with mock adapters
2. **Flexibility**: Swap implementations without touching core
3. **Independence**: Core doesn't depend on frameworks
4. **Clarity**: Clear separation between business logic and infrastructure
5. **Maintainability**: Changes to external services don't affect core

---

## Next Steps

- [Domain-Driven Design](../ddd/README.md) - Tactical patterns for complex domains
- [Event-Driven Architecture](../event-driven/README.md) - Building reactive systems
- [Clean Architecture](../clean-architecture/README.md) - Alternative architectural approach

---

**Remember**: Hexagonal Architecture is about isolating your business logic from external concerns through well-defined ports and adapters!
