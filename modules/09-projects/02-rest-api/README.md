# Project 2: REST API - Blog Platform

A production-ready RESTful API for a blog platform built with TypeScript, Express, Prisma, and JWT authentication.

## 📋 Project Overview

**Difficulty**: ⭐⭐⭐ Intermediate
**Estimated Time**: 15-20 hours
**Technologies**: Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, Zod

## 🎯 Learning Objectives

- Build a complete RESTful API from scratch
- Implement JWT authentication and authorization
- Use Prisma ORM for database operations
- Validate requests with Zod
- Handle errors gracefully
- Write API tests
- Document API endpoints
- Deploy to production

## ✨ Features

### Core Features
- ✅ User authentication (register, login, logout)
- ✅ User profiles with avatars
- ✅ Create, read, update, delete blog posts
- ✅ Comments on blog posts
- ✅ Like/unlike posts
- ✅ Pagination and filtering
- ✅ Search functionality
- ✅ Tag-based organization

### Advanced Features
- ✅ JWT token refresh mechanism
- ✅ Rate limiting
- ✅ Input validation with Zod
- ✅ Error handling middleware
- ✅ Logging with Winston
- ✅ API documentation with Swagger
- ✅ Database migrations
- ✅ Comprehensive testing

## 🏗️ Architecture

```
blog-api/
├── src/
│   ├── config/
│   │   ├── database.ts       # Prisma client
│   │   └── env.ts            # Environment config
│   ├── controllers/          # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── post.controller.ts
│   │   └── comment.controller.ts
│   ├── middleware/           # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── rateLimiter.middleware.ts
│   ├── routes/               # API routes
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── post.routes.ts
│   │   └── index.ts
│   ├── services/             # Business logic
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── post.service.ts
│   │   └── token.service.ts
│   ├── validators/           # Zod schemas
│   │   ├── auth.validator.ts
│   │   ├── user.validator.ts
│   │   └── post.validator.ts
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   ├── utils/                # Utilities
│   │   ├── logger.ts
│   │   └── errors.ts
│   └── index.ts              # Entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # DB migrations
├── tests/
│   ├── integration/
│   └── unit/
├── docs/
│   └── api.md
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 📦 Database Schema

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  name          String?
  bio           String?
  avatar        String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  posts         Post[]
  comments      Comment[]
  likes         Like[]
  refreshTokens RefreshToken[]
}

model Post {
  id          String    @id @default(uuid())
  title       String
  slug        String    @unique
  content     String
  excerpt     String?
  published   Boolean   @default(false)
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  authorId    String
  author      User      @relation(fields: [authorId], references: [id])

  tags        Tag[]
  comments    Comment[]
  likes       Like[]

  @@index([authorId])
  @@index([published])
  @@index([slug])
}

model Comment {
  id        String   @id @default(uuid())
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  authorId  String
  author    User     @relation(fields: [authorId], references: [id])

  @@index([postId])
  @@index([authorId])
}

model Like {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())

  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  userId    String
  user      User     @relation(fields: [userId], references: [id])

  @@unique([postId, userId])
  @@index([postId])
  @@index([userId])
}

model Tag {
  id    String @id @default(uuid())
  name  String @unique
  slug  String @unique

  posts Post[]

  @@index([slug])
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
}
```

## 💻 Implementation Guide

### Step 1: Project Setup

```bash
# Create project directory
mkdir blog-api
cd blog-api

# Initialize npm
npm init -y

# Install dependencies
npm install express prisma @prisma/client
npm install bcrypt jsonwebtoken zod winston
npm install express-rate-limit helmet cors

# Install dev dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/bcrypt @types/jsonwebtoken
npm install -D ts-node nodemon prisma
npm install -D vitest supertest @types/supertest

# Initialize TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init
```

### Step 2: Configure TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 3: Environment Configuration

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

export const env = loadEnv();
```

### Step 4: Authentication Service

```typescript
// src/services/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
import { UnauthorizedError, ValidationError } from '../utils/errors';

const prisma = new PrismaClient();

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    // Check if user exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { username: input.username }],
      },
    });

    if (existing) {
      if (existing.email === input.email) {
        throw new ValidationError('Email already in use');
      }
      throw new ValidationError('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash,
        name: input.name,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return { user, ...tokens };
  }

  async login(input: LoginInput): Promise<{ user: any; } & AuthTokens> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
      };

      // Check if token exists in database
      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!tokenRecord) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Check if token is expired
      if (tokenRecord.expiresAt < new Date()) {
        await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
        throw new UnauthorizedError('Refresh token expired');
      }

      // Generate new tokens
      return this.generateTokens(payload.userId);
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  private async generateTokens(userId: string): Promise<AuthTokens> {
    // Generate access token
    const accessToken = jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    // Generate refresh token
    const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<{ userId: string }> {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      return payload;
    } catch (error) {
      throw new UnauthorizedError('Invalid access token');
    }
  }
}

export const authService = new AuthService();
```

### Step 5: Authentication Middleware

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { UnauthorizedError } from '../utils/errors';

export interface AuthRequest extends Request {
  userId?: string;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);

    // Verify token
    const payload = await authService.verifyAccessToken(token);

    // Attach user ID to request
    req.userId = payload.userId;

    next();
  } catch (error) {
    next(error);
  }
}

export function optionalAuthenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  authenticate(req, res, next);
}
```

### Step 6: Request Validation

```typescript
// src/validators/post.validator.ts
import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    excerpt: z.string().max(500).optional(),
    published: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).optional(),
    excerpt: z.string().max(500).optional(),
    published: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const getPostsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('10'),
    published: z.string().transform((val) => val === 'true').optional(),
    tag: z.string().optional(),
    search: z.string().optional(),
  }),
});

// Middleware
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Validation failed', messages));
      } else {
        next(error);
      }
    }
  };
}
```

### Step 7: Error Handling

```typescript
// src/utils/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: any) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err instanceof ValidationError && { errors: err.fields }),
    });
  }

  // Log unexpected errors
  logger.error('Unexpected error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}
```

## 🧪 Testing

```typescript
// tests/integration/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index';
import { prisma } from '../../src/config/database';

describe('Authentication', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'another',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Email already in use');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });
});
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/posts` - Get user's posts

### Posts
- `GET /api/posts` - List posts (with pagination, filtering)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post (auth required)
- `PUT /api/posts/:id` - Update post (auth required, author only)
- `DELETE /api/posts/:id` - Delete post (auth required, author only)
- `POST /api/posts/:id/like` - Like post (auth required)
- `DELETE /api/posts/:id/like` - Unlike post (auth required)

### Comments
- `GET /api/posts/:id/comments` - Get post comments
- `POST /api/posts/:id/comments` - Create comment (auth required)
- `PUT /api/comments/:id` - Update comment (auth required)
- `DELETE /api/comments/:id` - Delete comment (auth required)

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

## ✅ Completion Checklist

- [ ] Database schema designed and migrated
- [ ] Authentication system implemented
- [ ] CRUD operations for posts
- [ ] Comments functionality
- [ ] Input validation with Zod
- [ ] Error handling middleware
- [ ] Rate limiting
- [ ] Tests written
- [ ] API documentation
- [ ] Docker configuration
- [ ] Environment variables configured
- [ ] Logging implemented

---

**Ready to build?** This project demonstrates production-ready API development with TypeScript!

**Complete code**: See the `/src` directory for full implementation.
