# API Design in TypeScript

Design robust REST, GraphQL, and gRPC APIs with TypeScript.

## Table of Contents

- [REST API Design](#rest-api-design)
- [GraphQL API](#graphql-api)
- [gRPC API](#grpc-api)
- [API Comparison](#api-comparison)
- [Best Practices](#best-practices)

---

## REST API Design

### RESTful Principles

1. **Resource-based**: URLs represent resources
2. **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
3. **Stateless**: Each request is independent
4. **Cacheable**: Support HTTP caching
5. **Layered**: Support intermediaries

### Express REST API Example

```typescript
// api/routes/productRoutes.ts
import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createProductSchema, updateProductSchema } from '../schemas/product';

export function createProductRoutes(controller: ProductController): Router {
  const router = Router();

  // GET /api/products - List products with pagination
  router.get('/', controller.list.bind(controller));

  // GET /api/products/:id - Get single product
  router.get('/:id', controller.getById.bind(controller));

  // POST /api/products - Create product (auth required)
  router.post(
    '/',
    authMiddleware,
    validateRequest(createProductSchema),
    controller.create.bind(controller)
  );

  // PUT /api/products/:id - Replace product
  router.put(
    '/:id',
    authMiddleware,
    validateRequest(updateProductSchema),
    controller.replace.bind(controller)
  );

  // PATCH /api/products/:id - Update product
  router.patch(
    '/:id',
    authMiddleware,
    validateRequest(updateProductSchema.partial()),
    controller.update.bind(controller)
  );

  // DELETE /api/products/:id - Delete product
  router.delete('/:id', authMiddleware, controller.delete.bind(controller));

  // GET /api/products/:id/reviews - Get product reviews
  router.get('/:id/reviews', controller.getReviews.bind(controller));

  return router;
}

// api/controllers/ProductController.ts
import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../../services/ProductService';

export class ProductController {
  constructor(private productService: ProductService) {}

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const sort = req.query.sort as string;
      const filter = req.query.filter as string;

      const result = await this.productService.list({
        page,
        pageSize,
        sort,
        filter,
      });

      res.json({
        data: result.items,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          totalItems: result.totalItems,
          totalPages: result.totalPages,
        },
        links: {
          self: `/api/products?page=${page}&pageSize=${pageSize}`,
          next:
            page < result.totalPages
              ? `/api/products?page=${page + 1}&pageSize=${pageSize}`
              : null,
          prev:
            page > 1 ? `/api/products?page=${page - 1}&pageSize=${pageSize}` : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productService.getById(id);

      if (!product) {
        res.status(404).json({
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
          },
        });
        return;
      }

      res.json({ data: product });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await this.productService.create(req.body);

      res.status(201)
        .location(`/api/products/${product.id}`)
        .json({ data: product });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productService.update(id, req.body);

      if (!product) {
        res.status(404).json({
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
          },
        });
        return;
      }

      res.json({ data: product });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.productService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const reviews = await this.productService.getReviews(id);
      res.json({ data: reviews });
    } catch (error) {
      next(error);
    }
  }
}

// api/schemas/product.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  categoryId: z.string().uuid(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
```

### REST API Best Practices

```typescript
// 1. Versioning
app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

// 2. Error Handling
export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}

// Error middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  } else {
    console.error('Unexpected error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
});

// 3. Rate Limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
});

app.use('/api/', limiter);

// 4. HATEOAS (Hypermedia)
interface ProductResource {
  id: string;
  name: string;
  price: number;
  _links: {
    self: { href: string };
    reviews: { href: string };
    category: { href: string };
  };
}

function toProductResource(product: Product): ProductResource {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    _links: {
      self: { href: `/api/products/${product.id}` },
      reviews: { href: `/api/products/${product.id}/reviews` },
      category: { href: `/api/categories/${product.categoryId}` },
    },
  };
}

// 5. Content Negotiation
app.use((req, res, next) => {
  const accepts = req.accepts(['json', 'xml']);

  if (!accepts) {
    res.status(406).json({
      error: {
        code: 'NOT_ACCEPTABLE',
        message: 'Supported content types: application/json, application/xml',
      },
    });
    return;
  }

  next();
});
```

---

## GraphQL API

### Apollo Server Setup

```typescript
// graphql/server.ts
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext } from './context';

export async function createGraphQLServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: createContext,
    })
  );

  return { app, httpServer, server };
}

// graphql/schema.ts
import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    stock: Int!
    category: Category!
    reviews: [Review!]!
    averageRating: Float
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Category {
    id: ID!
    name: String!
    products: [Product!]!
  }

  type Review {
    id: ID!
    product: Product!
    user: User!
    rating: Int!
    comment: String
    createdAt: DateTime!
  }

  type User {
    id: ID!
    email: String!
    name: String!
    reviews: [Review!]!
  }

  type Query {
    # Products
    products(
      page: Int = 1
      pageSize: Int = 20
      filter: ProductFilter
      sort: ProductSort
    ): ProductConnection!
    product(id: ID!): Product
    searchProducts(query: String!): [Product!]!

    # Categories
    categories: [Category!]!
    category(id: ID!): Category

    # Current user
    me: User
  }

  type Mutation {
    # Product mutations
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!

    # Review mutations
    createReview(input: CreateReviewInput!): Review!
    updateReview(id: ID!, input: UpdateReviewInput!): Review!
    deleteReview(id: ID!): Boolean!

    # Auth mutations
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
  }

  type Subscription {
    productCreated: Product!
    productUpdated(id: ID!): Product!
    productDeleted: ID!
  }

  # Input types
  input ProductFilter {
    categoryId: ID
    minPrice: Float
    maxPrice: Float
    inStock: Boolean
  }

  enum ProductSort {
    NAME_ASC
    NAME_DESC
    PRICE_ASC
    PRICE_DESC
    CREATED_AT_ASC
    CREATED_AT_DESC
  }

  input CreateProductInput {
    name: String!
    description: String
    price: Float!
    stock: Int!
    categoryId: ID!
    tags: [String!]
    images: [String!]
  }

  input UpdateProductInput {
    name: String
    description: String
    price: Float
    stock: Int
    categoryId: ID
    tags: [String!]
    images: [String!]
  }

  input CreateReviewInput {
    productId: ID!
    rating: Int!
    comment: String
  }

  input UpdateReviewInput {
    rating: Int
    comment: String
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  # Pagination
  type ProductConnection {
    edges: [ProductEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ProductEdge {
    node: Product!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  scalar DateTime
`;

// graphql/resolvers.ts
import { GraphQLError } from 'graphql';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    products: async (
      _parent: any,
      args: {
        page: number;
        pageSize: number;
        filter?: any;
        sort?: string;
      },
      context: any
    ) => {
      const { page, pageSize, filter, sort } = args;
      const result = await context.productService.list({
        page,
        pageSize,
        filter,
        sort,
      });

      return {
        edges: result.items.map((product: any, index: number) => ({
          node: product,
          cursor: Buffer.from(`${page}:${index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage: page < result.totalPages,
          hasPreviousPage: page > 1,
          startCursor:
            result.items.length > 0
              ? Buffer.from(`${page}:0`).toString('base64')
              : null,
          endCursor:
            result.items.length > 0
              ? Buffer.from(`${page}:${result.items.length - 1}`).toString('base64')
              : null,
        },
        totalCount: result.totalItems,
      };
    },

    product: async (_parent: any, args: { id: string }, context: any) => {
      const product = await context.productService.getById(args.id);

      if (!product) {
        throw new GraphQLError('Product not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return product;
    },

    searchProducts: async (_parent: any, args: { query: string }, context: any) => {
      return await context.productService.search(args.query);
    },

    me: async (_parent: any, _args: any, context: any) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return context.user;
    },
  },

  Mutation: {
    createProduct: async (_parent: any, args: { input: any }, context: any) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const product = await context.productService.create(args.input);

      // Publish subscription
      pubsub.publish('PRODUCT_CREATED', { productCreated: product });

      return product;
    },

    updateProduct: async (
      _parent: any,
      args: { id: string; input: any },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const product = await context.productService.update(args.id, args.input);

      if (!product) {
        throw new GraphQLError('Product not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Publish subscription
      pubsub.publish('PRODUCT_UPDATED', {
        productUpdated: product,
        id: args.id,
      });

      return product;
    },

    deleteProduct: async (_parent: any, args: { id: string }, context: any) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      await context.productService.delete(args.id);

      // Publish subscription
      pubsub.publish('PRODUCT_DELETED', { productDeleted: args.id });

      return true;
    },

    login: async (_parent: any, args: { input: any }, context: any) => {
      const result = await context.authService.login(
        args.input.email,
        args.input.password
      );

      return {
        token: result.token,
        user: result.user,
      };
    },
  },

  Subscription: {
    productCreated: {
      subscribe: () => pubsub.asyncIterator(['PRODUCT_CREATED']),
    },
    productUpdated: {
      subscribe: (_parent: any, args: { id: string }) => {
        return pubsub.asyncIterator([`PRODUCT_UPDATED`]);
      },
      resolve: (payload: any, args: { id: string }) => {
        // Filter by id if specified
        if (args.id && payload.id !== args.id) {
          return null;
        }
        return payload.productUpdated;
      },
    },
    productDeleted: {
      subscribe: () => pubsub.asyncIterator(['PRODUCT_DELETED']),
    },
  },

  // Field resolvers
  Product: {
    category: async (parent: any, _args: any, context: any) => {
      return await context.categoryService.getById(parent.categoryId);
    },

    reviews: async (parent: any, _args: any, context: any) => {
      return await context.reviewService.getByProductId(parent.id);
    },

    averageRating: async (parent: any, _args: any, context: any) => {
      return await context.reviewService.getAverageRating(parent.id);
    },
  },

  Review: {
    product: async (parent: any, _args: any, context: any) => {
      return await context.productService.getById(parent.productId);
    },

    user: async (parent: any, _args: any, context: any) => {
      return await context.userService.getById(parent.userId);
    },
  },
};

// graphql/context.ts
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { verify } from 'jsonwebtoken';

export interface Context {
  prisma: PrismaClient;
  user: { id: string; email: string } | null;
  productService: ProductService;
  categoryService: CategoryService;
  reviewService: ReviewService;
  userService: UserService;
  authService: AuthService;
}

const prisma = new PrismaClient();

export async function createContext({ req }: { req: Request }): Promise<Context> {
  const token = req.headers.authorization?.replace('Bearer ', '');

  let user = null;
  if (token) {
    try {
      user = verify(token, process.env.JWT_SECRET!) as any;
    } catch (error) {
      // Invalid token
    }
  }

  return {
    prisma,
    user,
    productService: new ProductService(prisma),
    categoryService: new CategoryService(prisma),
    reviewService: new ReviewService(prisma),
    userService: new UserService(prisma),
    authService: new AuthService(prisma),
  };
}
```

---

## gRPC API

### Protocol Buffers Definition

```protobuf
// proto/product.proto
syntax = "proto3";

package product;

service ProductService {
  rpc GetProduct(GetProductRequest) returns (Product);
  rpc ListProducts(ListProductsRequest) returns (ListProductsResponse);
  rpc CreateProduct(CreateProductRequest) returns (Product);
  rpc UpdateProduct(UpdateProductRequest) returns (Product);
  rpc DeleteProduct(DeleteProductRequest) returns (DeleteProductResponse);
  rpc StreamProducts(StreamProductsRequest) returns (stream Product);
}

message Product {
  string id = 1;
  string name = 2;
  string description = 3;
  double price = 4;
  int32 stock = 5;
  string category_id = 6;
  repeated string tags = 7;
  int64 created_at = 8;
  int64 updated_at = 9;
}

message GetProductRequest {
  string id = 1;
}

message ListProductsRequest {
  int32 page = 1;
  int32 page_size = 2;
  ProductFilter filter = 3;
  ProductSort sort = 4;
}

message ProductFilter {
  optional string category_id = 1;
  optional double min_price = 2;
  optional double max_price = 3;
  optional bool in_stock = 4;
}

enum ProductSort {
  NAME_ASC = 0;
  NAME_DESC = 1;
  PRICE_ASC = 2;
  PRICE_DESC = 3;
}

message ListProductsResponse {
  repeated Product products = 1;
  int32 total_count = 2;
  int32 page = 3;
  int32 page_size = 4;
}

message CreateProductRequest {
  string name = 1;
  string description = 2;
  double price = 3;
  int32 stock = 4;
  string category_id = 5;
  repeated string tags = 6;
}

message UpdateProductRequest {
  string id = 1;
  optional string name = 2;
  optional string description = 3;
  optional double price = 4;
  optional int32 stock = 5;
  optional string category_id = 6;
  repeated string tags = 7;
}

message DeleteProductRequest {
  string id = 1;
}

message DeleteProductResponse {
  bool success = 1;
}

message StreamProductsRequest {
  ProductFilter filter = 1;
}
```

### gRPC Server Implementation

```typescript
// grpc/ProductServiceServer.ts
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
      listProducts: this.listProducts.bind(this),
      createProduct: this.createProduct.bind(this),
      updateProduct: this.updateProduct.bind(this),
      deleteProduct: this.deleteProduct.bind(this),
      streamProducts: this.streamProducts.bind(this),
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

      callback(null, this.toProto(product));
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  private async listProducts(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const result = await this.productService.list(call.request);

      callback(null, {
        products: result.items.map(p => this.toProto(p)),
        total_count: result.totalItems,
        page: result.page,
        page_size: result.pageSize,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  private async createProduct(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const product = await this.productService.create(call.request);
      callback(null, this.toProto(product));
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  private async streamProducts(
    call: grpc.ServerWritableStream<any, any>
  ): Promise<void> {
    try {
      const products = await this.productService.list({
        filter: call.request.filter,
      });

      for (const product of products.items) {
        call.write(this.toProto(product));
        // Simulate streaming delay
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      call.end();
    } catch (error) {
      call.destroy(error as Error);
    }
  }

  private toProto(product: any): any {
    return {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category_id: product.categoryId,
      tags: product.tags || [],
      created_at: product.createdAt.getTime(),
      updated_at: product.updatedAt.getTime(),
    };
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

  async shutdown(): Promise<void> {
    return new Promise((resolve) => {
      this.server.tryShutdown(() => {
        console.log('gRPC server shut down');
        resolve();
      });
    });
  }
}
```

---

## API Comparison

| Feature | REST | GraphQL | gRPC |
|---------|------|---------|------|
| **Protocol** | HTTP | HTTP | HTTP/2 |
| **Data Format** | JSON, XML | JSON | Protocol Buffers |
| **Schema** | OpenAPI (optional) | Required | Required (proto) |
| **Versioning** | URL/Header | Schema evolution | Proto versioning |
| **Caching** | HTTP caching | Complex | Custom |
| **Performance** | Good | Good | Excellent |
| **Browser Support** | Excellent | Excellent | Limited |
| **Learning Curve** | Easy | Medium | Medium-Hard |
| **Use Case** | Public APIs, CRUD | Complex queries, mobile | Microservices |

---

## Best Practices

### 1. API Documentation

```typescript
// Use Swagger/OpenAPI for REST
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Product API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.ts'],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

### 2. Authentication

```typescript
// JWT authentication for all API types
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 3. Validation

```typescript
// Use Zod for runtime validation
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Validation failed', details: error });
    }
  };
};
```

---

## Next Steps

- [Database ORMs](../database-orms/README.md) - Data access layer
- [Microservices](../microservices/README.md) - Distributed APIs
- [Testing](../../06-testing/README.md) - API testing strategies

---

**Remember**: Choose the right API style for your use case. REST for simplicity, GraphQL for flexibility, gRPC for performance!
