# Microservices Architecture in TypeScript

Build distributed systems using microservices patterns with TypeScript.

## Table of Contents

- [Microservices Overview](#microservices-overview)
- [Service Communication](#service-communication)
- [Service Discovery](#service-discovery)
- [API Gateway Pattern](#api-gateway-pattern)
- [Circuit Breaker Pattern](#circuit-breaker-pattern)
- [Distributed Tracing](#distributed-tracing)
- [Best Practices](#best-practices)

---

## Microservices Overview

**Microservices** is an architectural style that structures an application as a collection of loosely coupled services.

### Characteristics

- **Small and focused**: Each service does one thing well
- **Independently deployable**: Can deploy without affecting others
- **Decentralized**: Each service owns its data
- **Technology agnostic**: Can use different tech stacks
- **Fault tolerant**: Failures are isolated

```
┌─────────────────────────────────────────────────────────┐
│                      API Gateway                        │
└────┬──────────────┬──────────────┬──────────────┬───────┘
     │              │              │              │
┌────▼──────┐  ┌───▼──────┐  ┌───▼──────┐  ┌───▼──────┐
│  User     │  │ Order    │  │ Product  │  │ Payment  │
│  Service  │  │ Service  │  │ Service  │  │ Service  │
└────┬──────┘  └───┬──────┘  └───┬──────┘  └───┬──────┘
     │             │              │              │
┌────▼──────┐  ┌───▼──────┐  ┌───▼──────┐  ┌───▼──────┐
│  User DB  │  │ Order DB │  │Product DB│  │Payment DB│
└───────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## Service Communication

### 1. Synchronous Communication (HTTP/REST)

```typescript
// services/order-service/src/clients/ProductServiceClient.ts
import axios, { AxiosInstance } from 'axios';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export class ProductServiceClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const response = await this.client.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getProducts(ids: string[]): Promise<Product[]> {
    const response = await this.client.post<Product[]>('/products/batch', {
      ids,
    });
    return response.data;
  }

  async checkStock(productId: string, quantity: number): Promise<boolean> {
    const response = await this.client.post<{ available: boolean }>(
      `/products/${productId}/check-stock`,
      { quantity }
    );
    return response.data.available;
  }

  async reserveStock(
    productId: string,
    quantity: number,
    orderId: string
  ): Promise<void> {
    await this.client.post(`/products/${productId}/reserve`, {
      quantity,
      orderId,
    });
  }
}

// Usage in order service
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private productClient: ProductServiceClient,
    private paymentClient: PaymentServiceClient
  ) {}

  async createOrder(input: CreateOrderInput): Promise<Order> {
    // Validate products exist
    const products = await this.productClient.getProducts(
      input.items.map(i => i.productId)
    );

    if (products.length !== input.items.length) {
      throw new Error('Some products not found');
    }

    // Check stock availability
    for (const item of input.items) {
      const available = await this.productClient.checkStock(
        item.productId,
        item.quantity
      );

      if (!available) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
    }

    // Create order
    const order = await this.orderRepository.create(input);

    // Reserve stock
    for (const item of input.items) {
      await this.productClient.reserveStock(
        item.productId,
        item.quantity,
        order.id
      );
    }

    return order;
  }
}
```

### 2. Asynchronous Communication (Message Queue)

```typescript
// services/order-service/src/events/OrderEventPublisher.ts
import { Channel, Connection } from 'amqplib';

export interface OrderCreatedMessage {
  orderId: string;
  customerId: string;
  items: Array<{ productId: string; quantity: number }>;
  total: number;
  createdAt: Date;
}

export class OrderEventPublisher {
  private channel: Channel | null = null;
  private readonly exchange = 'order-events';

  async connect(connection: Connection): Promise<void> {
    this.channel = await connection.createChannel();
    await this.channel.assertExchange(this.exchange, 'topic', {
      durable: true,
    });
  }

  async publishOrderCreated(message: OrderCreatedMessage): Promise<void> {
    if (!this.channel) {
      throw new Error('Not connected');
    }

    this.channel.publish(
      this.exchange,
      'order.created',
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    console.log('Published order.created event:', message.orderId);
  }

  async publishOrderPaid(orderId: string, transactionId: string): Promise<void> {
    if (!this.channel) {
      throw new Error('Not connected');
    }

    this.channel.publish(
      this.exchange,
      'order.paid',
      Buffer.from(JSON.stringify({ orderId, transactionId })),
      { persistent: true }
    );

    console.log('Published order.paid event:', orderId);
  }
}

// services/inventory-service/src/consumers/OrderEventConsumer.ts
export class OrderEventConsumer {
  constructor(
    private inventoryService: InventoryService,
    private channel: Channel
  ) {}

  async start(): Promise<void> {
    const queue = 'inventory-service.order-events';

    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, 'order-events', 'order.created');
    await this.channel.bindQueue(queue, 'order-events', 'order.paid');

    this.channel.consume(queue, async msg => {
      if (!msg) return;

      try {
        const routingKey = msg.fields.routingKey;
        const content = JSON.parse(msg.content.toString());

        if (routingKey === 'order.created') {
          await this.handleOrderCreated(content);
        } else if (routingKey === 'order.paid') {
          await this.handleOrderPaid(content);
        }

        this.channel.ack(msg);
      } catch (error) {
        console.error('Error processing message:', error);
        this.channel.nack(msg, false, true);
      }
    });

    console.log('Order event consumer started');
  }

  private async handleOrderCreated(message: OrderCreatedMessage): Promise<void> {
    console.log('Handling order.created:', message.orderId);

    // Reserve inventory
    for (const item of message.items) {
      await this.inventoryService.reserve({
        productId: item.productId,
        quantity: item.quantity,
        orderId: message.orderId,
      });
    }
  }

  private async handleOrderPaid(message: {
    orderId: string;
    transactionId: string;
  }): Promise<void> {
    console.log('Handling order.paid:', message.orderId);

    // Commit reservation
    await this.inventoryService.commitReservation(message.orderId);
  }
}
```

### 3. gRPC Communication

```protobuf
// services/product-service/proto/product.proto
syntax = "proto3";

package product;

service ProductService {
  rpc GetProduct(GetProductRequest) returns (Product);
  rpc GetProducts(GetProductsRequest) returns (GetProductsResponse);
  rpc CheckStock(CheckStockRequest) returns (CheckStockResponse);
  rpc ReserveStock(ReserveStockRequest) returns (ReserveStockResponse);
}

message Product {
  string id = 1;
  string name = 2;
  double price = 3;
  int32 stock = 4;
}

message GetProductRequest {
  string id = 1;
}

message GetProductsRequest {
  repeated string ids = 1;
}

message GetProductsResponse {
  repeated Product products = 1;
}

message CheckStockRequest {
  string product_id = 1;
  int32 quantity = 2;
}

message CheckStockResponse {
  bool available = 1;
}

message ReserveStockRequest {
  string product_id = 1;
  int32 quantity = 2;
  string order_id = 3;
}

message ReserveStockResponse {
  bool success = 1;
  string message = 2;
}
```

```typescript
// services/product-service/src/grpc/ProductServiceServer.ts
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProductService } from '../services/ProductService';

const PROTO_PATH = __dirname + '/../../proto/product.proto';

export class ProductServiceServer {
  private server: grpc.Server;

  constructor(private productService: ProductService) {
    this.server = new grpc.Server();
    this.loadProto();
  }

  private loadProto(): void {
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const proto: any = grpc.loadPackageDefinition(packageDefinition);

    this.server.addService(proto.product.ProductService.service, {
      getProduct: this.getProduct.bind(this),
      getProducts: this.getProducts.bind(this),
      checkStock: this.checkStock.bind(this),
      reserveStock: this.reserveStock.bind(this),
    });
  }

  private async getProduct(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const product = await this.productService.getById(call.request.id);

      if (!product) {
        callback({
          code: grpc.status.NOT_FOUND,
          message: 'Product not found',
        });
        return;
      }

      callback(null, product);
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  private async getProducts(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const products = await this.productService.getByIds(call.request.ids);
      callback(null, { products });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  private async checkStock(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const available = await this.productService.checkStock(
        call.request.product_id,
        call.request.quantity
      );
      callback(null, { available });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  private async reserveStock(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      await this.productService.reserveStock(
        call.request.product_id,
        call.request.quantity,
        call.request.order_id
      );
      callback(null, { success: true, message: 'Stock reserved' });
    } catch (error) {
      callback(null, { success: false, message: (error as Error).message });
    }
  }

  start(port: number): void {
    this.server.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          console.error('Failed to start gRPC server:', error);
          return;
        }
        console.log(`gRPC server started on port ${port}`);
        this.server.start();
      }
    );
  }
}
```

---

## Service Discovery

### Consul Integration

```typescript
// infrastructure/discovery/ConsulServiceRegistry.ts
import Consul from 'consul';

export interface ServiceConfig {
  id: string;
  name: string;
  address: string;
  port: number;
  tags?: string[];
  check?: {
    http: string;
    interval: string;
  };
}

export class ConsulServiceRegistry {
  private consul: Consul.Consul;

  constructor(consulHost: string = 'localhost', consulPort: number = 8500) {
    this.consul = new Consul({
      host: consulHost,
      port: consulPort.toString(),
      promisify: true,
    });
  }

  async register(config: ServiceConfig): Promise<void> {
    await this.consul.agent.service.register({
      id: config.id,
      name: config.name,
      address: config.address,
      port: config.port,
      tags: config.tags,
      check: config.check,
    });

    console.log(`Service ${config.name} registered with Consul`);
  }

  async deregister(serviceId: string): Promise<void> {
    await this.consul.agent.service.deregister(serviceId);
    console.log(`Service ${serviceId} deregistered from Consul`);
  }

  async discover(serviceName: string): Promise<Array<{ address: string; port: number }>> {
    const result: any = await this.consul.health.service({
      service: serviceName,
      passing: true,
    });

    return result.map((entry: any) => ({
      address: entry.Service.Address,
      port: entry.Service.Port,
    }));
  }

  async watch(
    serviceName: string,
    callback: (services: Array<{ address: string; port: number }>) => void
  ): Promise<void> {
    const watcher = this.consul.watch({
      method: this.consul.health.service,
      options: {
        service: serviceName,
        passing: true,
      },
    });

    watcher.on('change', (data: any) => {
      const services = data.map((entry: any) => ({
        address: entry.Service.Address,
        port: entry.Service.Port,
      }));
      callback(services);
    });

    watcher.on('error', (error: Error) => {
      console.error('Consul watch error:', error);
    });
  }
}

// Usage
const registry = new ConsulServiceRegistry();

// Register service on startup
await registry.register({
  id: 'order-service-1',
  name: 'order-service',
  address: 'localhost',
  port: 3001,
  tags: ['v1', 'production'],
  check: {
    http: 'http://localhost:3001/health',
    interval: '10s',
  },
});

// Discover service instances
const productServices = await registry.discover('product-service');
console.log('Product service instances:', productServices);

// Deregister on shutdown
process.on('SIGTERM', async () => {
  await registry.deregister('order-service-1');
  process.exit(0);
});
```

---

## API Gateway Pattern

```typescript
// gateway/src/GatewayServer.ts
import express, { Request, Response } from 'express';
import httpProxy from 'http-proxy';
import { ConsulServiceRegistry } from './ConsulServiceRegistry';

export class APIGateway {
  private app = express();
  private proxy = httpProxy.createProxyServer();
  private serviceRegistry: ConsulServiceRegistry;
  private serviceCache: Map<string, Array<{ address: string; port: number }>> =
    new Map();

  constructor(consulHost: string, consulPort: number) {
    this.serviceRegistry = new ConsulServiceRegistry(consulHost, consulPort);
    this.setupRoutes();
    this.setupServiceWatch();
  }

  private setupRoutes(): void {
    this.app.use(express.json());

    // Route: /api/orders/* -> order-service
    this.app.all('/api/orders/*', (req, res) => {
      this.proxyRequest('order-service', req, res);
    });

    // Route: /api/products/* -> product-service
    this.app.all('/api/products/*', (req, res) => {
      this.proxyRequest('product-service', req, res);
    });

    // Route: /api/users/* -> user-service
    this.app.all('/api/users/*', (req, res) => {
      this.proxyRequest('user-service', req, res);
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });
  }

  private setupServiceWatch(): void {
    // Watch for service changes
    ['order-service', 'product-service', 'user-service'].forEach(serviceName => {
      this.serviceRegistry.watch(serviceName, services => {
        this.serviceCache.set(serviceName, services);
        console.log(`Updated ${serviceName} instances:`, services.length);
      });
    });
  }

  private async proxyRequest(
    serviceName: string,
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      // Get service instances
      let instances = this.serviceCache.get(serviceName);

      if (!instances || instances.length === 0) {
        instances = await this.serviceRegistry.discover(serviceName);
        this.serviceCache.set(serviceName, instances);
      }

      if (instances.length === 0) {
        res.status(503).json({ error: 'Service unavailable' });
        return;
      }

      // Load balancing: round-robin
      const instance = instances[Math.floor(Math.random() * instances.length)];
      const target = `http://${instance.address}:${instance.port}`;

      // Modify path (remove /api prefix)
      req.url = req.url.replace(/^\/api/, '');

      // Proxy request
      this.proxy.web(req, res, { target });
    } catch (error) {
      console.error(`Error proxying to ${serviceName}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  start(port: number): void {
    this.app.listen(port, () => {
      console.log(`API Gateway started on port ${port}`);
    });
  }
}

// Start gateway
const gateway = new APIGateway('localhost', 8500);
gateway.start(8080);
```

---

## Circuit Breaker Pattern

```typescript
// infrastructure/resilience/CircuitBreaker.ts
export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes before closing
  timeout: number; // Time to wait before half-open (ms)
}

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = Date.now();

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is open');
      }
      // Try half-open
      this.state = 'half-open';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === 'half-open') {
      this.successCount++;

      if (this.successCount >= this.options.successThreshold) {
        this.state = 'closed';
        this.successCount = 0;
        console.log('Circuit breaker closed');
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'open';
      this.nextAttempt = Date.now() + this.options.timeout;
      console.log(`Circuit breaker opened. Next attempt in ${this.options.timeout}ms`);
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// Usage with service client
export class ResilientProductServiceClient {
  private circuitBreaker: CircuitBreaker;

  constructor(
    private baseURL: string,
    circuitBreakerOptions: CircuitBreakerOptions = {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
    }
  ) {
    this.circuitBreaker = new CircuitBreaker(circuitBreakerOptions);
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      return await this.circuitBreaker.execute(async () => {
        const response = await axios.get<Product>(`${this.baseURL}/products/${id}`);
        return response.data;
      });
    } catch (error: any) {
      if (error.message === 'Circuit breaker is open') {
        // Return cached data or default
        console.log('Circuit breaker open, returning fallback');
        return null;
      }
      throw error;
    }
  }
}
```

---

## Distributed Tracing

```typescript
// infrastructure/tracing/TracingMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
}

export class TracingMiddleware {
  static create() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Extract or create trace context
      const traceId = req.headers['x-trace-id'] as string || uuidv4();
      const parentSpanId = req.headers['x-span-id'] as string;
      const spanId = uuidv4();

      // Attach to request
      (req as any).traceContext = {
        traceId,
        spanId,
        parentSpanId,
      };

      // Add to response headers
      res.setHeader('X-Trace-Id', traceId);
      res.setHeader('X-Span-Id', spanId);

      console.log(`[${traceId}:${spanId}] ${req.method} ${req.path}`);

      next();
    };
  }
}

// Usage in service
import axios from 'axios';

export class TracedProductServiceClient {
  constructor(private baseURL: string) {}

  async getProduct(id: string, traceContext: TraceContext): Promise<Product> {
    const startTime = Date.now();

    try {
      const response = await axios.get<Product>(`${this.baseURL}/products/${id}`, {
        headers: {
          'X-Trace-Id': traceContext.traceId,
          'X-Span-Id': uuidv4(),
          'X-Parent-Span-Id': traceContext.spanId,
        },
      });

      const duration = Date.now() - startTime;
      console.log(
        `[${traceContext.traceId}] getProduct(${id}) completed in ${duration}ms`
      );

      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[${traceContext.traceId}] getProduct(${id}) failed after ${duration}ms`,
        error
      );
      throw error;
    }
  }
}
```

---

## Best Practices

### 1. Database per Service

```typescript
// ✅ Good: Each service has its own database
// order-service uses orders_db
// product-service uses products_db
// user-service uses users_db

// ❌ Bad: Shared database
// All services use shared_db
```

### 2. API Versioning

```typescript
// ✅ Good: Version your APIs
app.get('/api/v1/products/:id', getProductV1);
app.get('/api/v2/products/:id', getProductV2);

// ❌ Bad: No versioning
app.get('/api/products/:id', getProduct);
```

### 3. Health Checks

```typescript
// ✅ Good: Implement health checks
app.get('/health', async (req, res) => {
  const dbHealthy = await checkDatabase();
  const queueHealthy = await checkMessageQueue();

  if (dbHealthy && queueHealthy) {
    res.json({ status: 'healthy' });
  } else {
    res.status(503).json({
      status: 'unhealthy',
      checks: { database: dbHealthy, queue: queueHealthy },
    });
  }
});
```

### 4. Graceful Shutdown

```typescript
// ✅ Good: Clean shutdown
const server = app.listen(3000);

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');

  // Stop accepting new connections
  server.close(() => {
    console.log('HTTP server closed');
  });

  // Deregister from service registry
  await serviceRegistry.deregister(serviceId);

  // Close database connections
  await prisma.$disconnect();

  // Close message queue connections
  await channel.close();
  await connection.close();

  process.exit(0);
});
```

---

## Benefits

1. **Scalability**: Scale services independently
2. **Technology Freedom**: Use best tool for each service
3. **Resilience**: Failures are isolated
4. **Team Autonomy**: Teams own services end-to-end
5. **Faster Deployment**: Deploy services independently

---

## Challenges

1. **Complexity**: Distributed systems are harder
2. **Data Consistency**: Eventual consistency required
3. **Testing**: Integration testing is complex
4. **Monitoring**: Need distributed tracing
5. **Network**: Latency and failures

---

## Next Steps

- [API Design](../api-design/README.md) - Design service APIs
- [Database ORMs](../database-orms/README.md) - Data access patterns
- [Event-Driven Architecture](../event-driven/README.md) - Async communication

---

**Remember**: Start with a monolith. Move to microservices when you have clear boundaries and team capacity!
