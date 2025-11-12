# Clean Architecture in TypeScript

Implement Clean Architecture principles for maintainable, testable, and scalable applications.

## Table of Contents

- [Clean Architecture Overview](#clean-architecture-overview)
- [The Dependency Rule](#the-dependency-rule)
- [Layer Structure](#layer-structure)
- [Implementation in TypeScript](#implementation-in-typescript)
- [Practical Example](#practical-example)
- [Best Practices](#best-practices)

---

## Clean Architecture Overview

**Clean Architecture** (by Robert C. Martin) organizes code to separate concerns, making it:
- **Independent of frameworks**
- **Testable** without external dependencies
- **Independent of UI**
- **Independent of database**
- **Independent of external agencies**

### The Dependency Rule

**Dependencies point inward**. Outer layers can depend on inner layers, but never the reverse.

```
┌─────────────────────────────────────────┐
│  Infrastructure (Frameworks & Drivers)  │
│  ┌───────────────────────────────────┐  │
│  │   Interface Adapters (Controllers)│  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   Use Cases (Business Logic)│  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │   Entities (Domain)   │  │  │  │
│  │  │  │                       │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  │                              │  │  │
│  │  └──────────────────────────────┘  │  │
│  │                                     │  │
│  └─────────────────────────────────────┘  │
│                                            │
└────────────────────────────────────────────┘
```

---

## Layer Structure

### 1. Entities (Domain Layer)

**Purpose**: Core business objects and rules
**Dependencies**: None

```typescript
// domain/entities/User.ts
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export class UserEntity {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly createdAt: Date
  ) {}

  static create(props: Omit<User, 'id' | 'createdAt'>): UserEntity {
    return new UserEntity(
      crypto.randomUUID(),
      props.email,
      props.name,
      new Date()
    );
  }

  static fromPersistence(props: User): UserEntity {
    return new UserEntity(
      props.id,
      props.email,
      props.name,
      props.createdAt
    );
  }

  // Business rules
  canUpdateProfile(requesterId: string): boolean {
    return this.id === requesterId;
  }

  updateName(newName: string, requesterId: string): UserEntity {
    if (!this.canUpdateProfile(requesterId)) {
      throw new Error('Unauthorized to update profile');
    }

    return new UserEntity(
      this.id,
      this.email,
      newName,
      this.createdAt
    );
  }
}
```

### 2. Use Cases (Application Layer)

**Purpose**: Application-specific business rules
**Dependencies**: Entities only

```typescript
// application/use-cases/CreateUser.ts
import { UserEntity } from '../../domain/entities/User';

export interface UserRepository {
  save(user: UserEntity): Promise<void>;
  findByEmail(email: string): Promise<UserEntity | null>;
}

export interface CreateUserInput {
  email: string;
  name: string;
}

export interface CreateUserOutput {
  id: string;
  email: string;
  name: string;
}

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    // Business rule: email must be unique
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Create entity
    const user = UserEntity.create({
      email: input.email,
      name: input.name,
    });

    // Persist
    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
```

### 3. Interface Adapters

**Purpose**: Convert data between use cases and external world
**Dependencies**: Use Cases, Entities

```typescript
// infrastructure/controllers/UserController.ts
import { Request, Response, NextFunction } from 'express';
import { CreateUserUseCase } from '../../application/use-cases/CreateUser';

export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name } = req.body;

      const result = await this.createUserUseCase.execute({
        email,
        name,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

// infrastructure/presenters/UserPresenter.ts
export class UserPresenter {
  static toHttp(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    };
  }

  static toJson(user: UserEntity) {
    return JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  }
}
```

### 4. Infrastructure (Frameworks & Drivers)

**Purpose**: External tools and frameworks
**Dependencies**: Everything

```typescript
// infrastructure/repositories/PrismaUserRepository.ts
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../../application/use-cases/CreateUser';
import { UserEntity } from '../../domain/entities/User';

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async save(user: UserEntity): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return UserEntity.fromPersistence(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return UserEntity.fromPersistence(user);
  }
}
```

---

## Practical Example

### Complete E-commerce Order System

```typescript
// domain/entities/Order.ts
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export class OrderEntity {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly items: ReadonlyArray<OrderItem>,
    public readonly status: OrderStatus,
    public readonly total: number,
    public readonly createdAt: Date
  ) {}

  static create(userId: string, items: OrderItem[]): OrderEntity {
    if (items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return new OrderEntity(
      crypto.randomUUID(),
      userId,
      items,
      'pending',
      total,
      new Date()
    );
  }

  confirm(): OrderEntity {
    if (this.status !== 'pending') {
      throw new Error('Only pending orders can be confirmed');
    }

    return new OrderEntity(
      this.id,
      this.userId,
      this.items,
      'confirmed',
      this.total,
      this.createdAt
    );
  }

  cancel(): OrderEntity {
    if (this.status === 'delivered') {
      throw new Error('Cannot cancel delivered orders');
    }

    return new OrderEntity(
      this.id,
      this.userId,
      this.items,
      'cancelled',
      this.total,
      this.createdAt
    );
  }

  ship(): OrderEntity {
    if (this.status !== 'confirmed') {
      throw new Error('Only confirmed orders can be shipped');
    }

    return new OrderEntity(
      this.id,
      this.userId,
      this.items,
      'shipped',
      this.total,
      this.createdAt
    );
  }
}

// application/use-cases/PlaceOrder.ts
export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
}

export interface OrderRepository {
  save(order: OrderEntity): Promise<void>;
  findById(id: string): Promise<OrderEntity | null>;
}

export interface InventoryService {
  reserveItems(items: OrderItem[]): Promise<boolean>;
}

export interface PaymentService {
  processPayment(userId: string, amount: number): Promise<{ transactionId: string }>;
}

export class PlaceOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository,
    private inventoryService: InventoryService,
    private paymentService: PaymentService
  ) {}

  async execute(input: {
    userId: string;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<{ orderId: string; transactionId: string }> {
    // Validate products exist and get prices
    const orderItems: OrderItem[] = [];
    for (const item of input.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Create order entity
    const order = OrderEntity.create(input.userId, orderItems);

    // Reserve inventory
    const reserved = await this.inventoryService.reserveItems(orderItems);
    if (!reserved) {
      throw new Error('Insufficient inventory');
    }

    // Process payment
    const payment = await this.paymentService.processPayment(
      input.userId,
      order.total
    );

    // Confirm order
    const confirmedOrder = order.confirm();

    // Save order
    await this.orderRepository.save(confirmedOrder);

    return {
      orderId: confirmedOrder.id,
      transactionId: payment.transactionId,
    };
  }
}

// infrastructure/express/routes/orderRoutes.ts
import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { PlaceOrderUseCase } from '../../../application/use-cases/PlaceOrder';
import { PrismaOrderRepository } from '../../repositories/PrismaOrderRepository';
import { PrismaProductRepository } from '../../repositories/PrismaProductRepository';
import { InventoryServiceImpl } from '../../services/InventoryService';
import { StripePaymentService } from '../../services/StripePaymentService';

export function createOrderRoutes(prisma: PrismaClient): Router {
  const router = Router();

  // Dependency Injection
  const orderRepository = new PrismaOrderRepository(prisma);
  const productRepository = new PrismaProductRepository(prisma);
  const inventoryService = new InventoryServiceImpl();
  const paymentService = new StripePaymentService();

  const placeOrderUseCase = new PlaceOrderUseCase(
    orderRepository,
    productRepository,
    inventoryService,
    paymentService
  );

  const orderController = new OrderController(placeOrderUseCase);

  router.post('/orders', (req, res, next) =>
    orderController.placeOrder(req, res, next)
  );

  return router;
}
```

---

## Testing with Clean Architecture

### Unit Testing Use Cases

```typescript
// __tests__/CreateUser.test.ts
import { describe, it, expect, vi } from 'vitest';
import { CreateUserUseCase } from '../application/use-cases/CreateUser';
import { UserEntity } from '../domain/entities/User';

describe('CreateUserUseCase', () => {
  it('should create a new user', async () => {
    // Mock repository
    const mockRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findByEmail: vi.fn().mockResolvedValue(null),
    };

    const useCase = new CreateUserUseCase(mockRepository);

    const result = await useCase.execute({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('Test User');
    expect(mockRepository.save).toHaveBeenCalledOnce();
  });

  it('should throw error if email exists', async () => {
    const existingUser = UserEntity.create({
      email: 'test@example.com',
      name: 'Existing',
    });

    const mockRepository = {
      save: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(existingUser),
    };

    const useCase = new CreateUserUseCase(mockRepository);

    await expect(
      useCase.execute({
        email: 'test@example.com',
        name: 'Test User',
      })
    ).rejects.toThrow('Email already exists');
  });
});
```

---

## Best Practices

### 1. Keep Entities Pure

```typescript
// ✅ Good: Pure business logic
class OrderEntity {
  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  canBeCancelled(): boolean {
    return this.status !== 'delivered';
  }
}

// ❌ Bad: Infrastructure concerns in entity
class OrderEntity {
  async save() {
    await database.save(this); // Don't do this!
  }

  sendEmail() {
    emailService.send(...); // Don't do this!
  }
}
```

### 2. Use Dependency Injection

```typescript
// ✅ Good: Dependencies injected
class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}
}

// ❌ Bad: Direct instantiation
class CreateUserUseCase {
  private userRepository = new PrismaUserRepository();
  private emailService = new SendGridEmailService();
}
```

### 3. Define Clear Boundaries

```typescript
// Domain layer - no dependencies
export class UserEntity {
  // Pure business logic
}

// Application layer - depends on domain
export class CreateUserUseCase {
  constructor(private repository: UserRepository) {} // Interface from domain
}

// Infrastructure layer - depends on application
export class PrismaUserRepository implements UserRepository {
  // Prisma-specific implementation
}
```

### 4. Use Interfaces for Ports

```typescript
// application/ports/UserRepository.ts
export interface UserRepository {
  save(user: UserEntity): Promise<void>;
  findById(id: string): Promise<UserEntity | null>;
}

// Multiple implementations possible
export class PrismaUserRepository implements UserRepository { }
export class InMemoryUserRepository implements UserRepository { }
export class MongoUserRepository implements UserRepository { }
```

---

## Directory Structure

```
src/
├── domain/                    # Entities (no dependencies)
│   ├── entities/
│   │   ├── User.ts
│   │   └── Order.ts
│   └── value-objects/
│       └── Email.ts
├── application/               # Use cases
│   ├── use-cases/
│   │   ├── CreateUser.ts
│   │   └── PlaceOrder.ts
│   └── ports/                 # Interfaces
│       ├── UserRepository.ts
│       └── PaymentService.ts
└── infrastructure/            # External world
    ├── repositories/
    │   └── PrismaUserRepository.ts
    ├── controllers/
    │   └── UserController.ts
    ├── services/
    │   └── StripePaymentService.ts
    └── config/
        └── database.ts
```

---

## Benefits

1. **Testability**: Easy to test without external dependencies
2. **Flexibility**: Swap frameworks, databases, UI without changing business logic
3. **Maintainability**: Clear separation of concerns
4. **Independence**: Core business logic doesn't depend on external tools
5. **Team Collaboration**: Different teams can work on different layers

---

## When to Use

**Use Clean Architecture when:**
- Building complex applications
- Long-term maintainability is important
- Multiple teams working together
- Frequent requirement changes expected
- Need to support multiple platforms

**Consider simpler approaches for:**
- Small applications
- Prototypes
- Simple CRUD apps
- Tight deadlines with stable requirements

---

## Next Steps

- [Hexagonal Architecture](../hexagonal-architecture/README.md) - Alternative to Clean Architecture
- [Domain-Driven Design](../ddd/README.md) - Tactical patterns for complex domains

---

**Remember**: Clean Architecture is about separating concerns and managing dependencies. The goal is maintainable, testable code!
