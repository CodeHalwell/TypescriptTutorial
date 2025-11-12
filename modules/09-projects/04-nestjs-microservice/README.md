# Project 4: NestJS Microservices Platform

Build a scalable microservices architecture using NestJS, RabbitMQ, and Docker.

## Overview

Create a distributed e-commerce backend with:
- Multiple microservices (User, Product, Order, Payment)
- Message-based communication with RabbitMQ
- API Gateway pattern
- Service discovery with Consul
- Distributed tracing
- Docker containerization

**Duration:** 3-4 weeks
**Difficulty:** ⭐⭐⭐⭐⭐ (Expert)

---

## Architecture

```
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (NestJS)      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
│  User Service │   │Product Service│   │ Order Service │
│   (NestJS)    │   │   (NestJS)    │   │   (NestJS)    │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                    │                    │
        │          ┌─────────▼────────┐          │
        └─────────►│    RabbitMQ      │◄─────────┘
                   │  Message Broker  │
                   └──────────────────┘
```

---

## Project Structure

```
nestjs-microservices/
├── docker-compose.yml
├── apps/
│   ├── api-gateway/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   └── modules/
│   │   └── package.json
│   ├── user-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── user.module.ts
│   │   │   ├── user.controller.ts
│   │   │   └── user.service.ts
│   │   └── package.json
│   ├── product-service/
│   ├── order-service/
│   └── payment-service/
└── libs/
    ├── common/
    │   ├── dto/
    │   ├── interfaces/
    │   └── decorators/
    └── database/
```

---

## Tech Stack

- **NestJS** - Framework for microservices
- **RabbitMQ** - Message broker
- **PostgreSQL** - Database per service
- **Redis** - Caching
- **Docker** - Containerization
- **Consul** - Service discovery
- **Prometheus** - Metrics
- **Grafana** - Monitoring

---

## Setup

### Initialize Monorepo

```bash
# Create NestJS monorepo
nest new nestjs-microservices
cd nestjs-microservices

# Generate microservices
nest generate app api-gateway
nest generate app user-service
nest generate app product-service
nest generate app order-service
nest generate app payment-service

# Install dependencies
npm install @nestjs/microservices amqplib amqp-connection-manager
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/config @nestjs/jwt
npm install class-validator class-transformer
```

---

## API Gateway

### Main Gateway

```typescript
// apps/api-gateway/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  app.enableCors();

  await app.listen(3000);
  console.log('🚀 API Gateway running on http://localhost:3000');
}
bootstrap();
```

### Gateway Module

```typescript
// apps/api-gateway/src/app.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'user_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'product_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'ORDER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'order_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    UserModule,
    ProductModule,
    OrderModule,
  ],
})
export class AppModule {}
```

### Gateway Controller

```typescript
// apps/api-gateway/src/modules/user/user.controller.ts
import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('users')
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private userClient: ClientProxy
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await firstValueFrom(
      this.userClient.send({ cmd: 'register' }, dto)
    );
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await firstValueFrom(
      this.userClient.send({ cmd: 'login' }, dto)
    );
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return await firstValueFrom(
      this.userClient.send({ cmd: 'get_user' }, { id })
    );
  }
}
```

---

## User Microservice

### User Service Main

```typescript
// apps/user-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { UserModule } from './user.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'user_queue',
        queueOptions: {
          durable: true,
        },
      },
    }
  );

  await app.listen();
  console.log('🚀 User Service is listening');
}
bootstrap();
```

### User Module

```typescript
// apps/user-service/src/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: 'user_db',
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
```

### User Controller

```typescript
// apps/user-service/src/user.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() data: RegisterDto) {
    return await this.userService.register(data);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() data: LoginDto) {
    return await this.userService.login(data);
  }

  @MessagePattern({ cmd: 'get_user' })
  async getUser(@Payload() data: { id: string }) {
    return await this.userService.findById(data.id);
  }
}
```

### User Service

```typescript
// apps/user-service/src/user.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = this.userRepository.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    await this.userRepository.save(user);

    // Generate JWT
    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
```

### User Entity

```typescript
// apps/user-service/src/entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## Order Microservice

### Order Service with Event Emitting

```typescript
// apps/order-service/src/order.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @Inject('PAYMENT_SERVICE') private paymentClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private productClient: ClientProxy
  ) {}

  async createOrder(dto: CreateOrderDto) {
    // Validate products
    const products = await firstValueFrom(
      this.productClient.send({ cmd: 'get_products' }, { ids: dto.items.map(i => i.productId) })
    );

    // Calculate total
    const total = dto.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product.price * item.quantity);
    }, 0);

    // Create order
    const order = this.orderRepository.create({
      userId: dto.userId,
      items: dto.items,
      total,
      status: 'PENDING',
    });

    await this.orderRepository.save(order);

    // Emit order created event
    this.paymentClient.emit('order_created', {
      orderId: order.id,
      userId: order.userId,
      total: order.total,
    });

    return order;
  }

  async processPayment(orderId: string, paymentId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    order.status = 'PAID';
    order.paymentId = paymentId;

    await this.orderRepository.save(order);

    // Emit order paid event
    this.productClient.emit('order_paid', {
      orderId: order.id,
      items: order.items,
    });

    return order;
  }
}
```

---

## Event-Driven Communication

### Payment Service Event Listener

```typescript
// apps/payment-service/src/payment.controller.ts
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: any) {
    console.log('Order created event received:', data);
    // Process payment
    await this.paymentService.processPayment(data);
  }
}
```

---

## Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest

  postgres-user:
    image: postgres:15
    environment:
      POSTGRES_DB: user_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5433:5432"

  postgres-product:
    image: postgres:15
    environment:
      POSTGRES_DB: product_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5434:5432"

  postgres-order:
    image: postgres:15
    environment:
      POSTGRES_DB: order_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5435:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  api-gateway:
    build:
      context: .
      dockerfile: apps/api-gateway/Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - rabbitmq
    environment:
      RABBITMQ_URL: amqp://rabbitmq:5672

  user-service:
    build:
      context: .
      dockerfile: apps/user-service/Dockerfile
    depends_on:
      - rabbitmq
      - postgres-user
    environment:
      RABBITMQ_URL: amqp://rabbitmq:5672
      DB_HOST: postgres-user
      DB_PORT: 5432

  product-service:
    build:
      context: .
      dockerfile: apps/product-service/Dockerfile
    depends_on:
      - rabbitmq
      - postgres-product
    environment:
      RABBITMQ_URL: amqp://rabbitmq:5672
      DB_HOST: postgres-product

  order-service:
    build:
      context: .
      dockerfile: apps/order-service/Dockerfile
    depends_on:
      - rabbitmq
      - postgres-order
    environment:
      RABBITMQ_URL: amqp://rabbitmq:5672
      DB_HOST: postgres-order

  payment-service:
    build:
      context: .
      dockerfile: apps/payment-service/Dockerfile
    depends_on:
      - rabbitmq
    environment:
      RABBITMQ_URL: amqp://rabbitmq:5672
```

---

## Running the Project

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## Testing

```bash
# Register user
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe","password":"password123"}'

# Create order
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"items":[{"productId":"123","quantity":2}]}'
```

---

## Best Practices

1. **Database per Service**: Each microservice has its own database
2. **Event Sourcing**: Use events for cross-service communication
3. **Circuit Breaker**: Handle service failures gracefully
4. **Health Checks**: Implement health endpoints
5. **Logging**: Centralized logging with correlation IDs
6. **Monitoring**: Use Prometheus + Grafana
7. **API Versioning**: Version your APIs from the start

---

## Next Steps

1. Add service discovery with Consul
2. Implement circuit breaker pattern
3. Add distributed tracing with Jaeger
4. Set up Prometheus metrics
5. Deploy to Kubernetes

**Estimated Time:** 3-4 weeks

---

## Resources

- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [Microservices Patterns](https://microservices.io/patterns/)
