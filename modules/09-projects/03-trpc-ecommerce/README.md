# Project 3: Full-Stack tRPC E-commerce

Build a type-safe, full-stack e-commerce platform using tRPC, React, Prisma, and TypeScript.

## Overview

Create a complete e-commerce application with:
- End-to-end type safety with tRPC
- React frontend with TanStack Query
- Prisma ORM with PostgreSQL
- Stripe payment integration
- JWT authentication
- Image upload with Cloudinary
- Shopping cart and checkout flow
- Admin dashboard

**Duration:** 4-5 weeks
**Difficulty:** ⭐⭐⭐⭐ (Advanced)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Setup](#project-setup)
4. [Database Schema](#database-schema)
5. [Backend Implementation](#backend-implementation)
6. [Frontend Implementation](#frontend-implementation)
7. [Authentication](#authentication)
8. [Payment Integration](#payment-integration)
9. [Deployment](#deployment)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                    │
│              (Next.js + TanStack Query)              │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ tRPC (Type-safe API)
                  │
┌─────────────────▼───────────────────────────────────┐
│                  Express Backend                     │
│            (tRPC Server + Business Logic)            │
└─────────────────┬───────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────┐
    │             │             │             │
┌───▼────┐  ┌────▼─────┐  ┌───▼──────┐  ┌──▼─────┐
│Prisma  │  │  Stripe  │  │Cloudinary│  │  Redis │
│   DB   │  │ Payment  │  │  Images  │  │ Cache  │
└────────┘  └──────────┘  └──────────┘  └────────┘
```

---

## Tech Stack

### Backend
- **tRPC** - Type-safe API layer
- **Express** - HTTP server
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Zod** - Runtime validation
- **JWT** - Authentication

### Frontend
- **Next.js 14** - React framework
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **React Hook Form** - Forms

### External Services
- **Stripe** - Payment processing
- **Cloudinary** - Image hosting
- **Resend** - Email service

---

## Project Setup

### Monorepo Structure

```
ecommerce/
├── package.json
├── turbo.json
├── apps/
│   ├── web/                # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── utils/
│   │   └── package.json
│   └── api/                # tRPC backend
│       ├── src/
│       │   ├── routers/
│       │   ├── services/
│       │   ├── middleware/
│       │   └── index.ts
│       └── package.json
└── packages/
    ├── db/                 # Prisma schema
    │   ├── prisma/
    │   └── package.json
    ├── types/              # Shared types
    └── config/             # Shared config
```

### Initialize Project

```bash
# Create monorepo
npx create-turbo@latest ecommerce
cd ecommerce

# Install dependencies
npm install

# Backend packages
npm install @trpc/server @trpc/client @tanstack/react-query zod
npm install express cors helmet compression
npm install prisma @prisma/client
npm install bcryptjs jsonwebtoken
npm install stripe cloudinary

# Frontend packages
npm install @trpc/react-query @trpc/next
npm install zustand react-hook-form @hookform/resolvers
npm install tailwindcss @shadcn/ui

# Dev dependencies
npm install -D tsx nodemon
npm install -D @types/express @types/node @types/bcryptjs @types/jsonwebtoken
```

---

## Database Schema

### Prisma Schema

```prisma
// packages/db/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  name          String
  role          Role      @default(CUSTOMER)
  cart          Cart?
  orders        Order[]
  addresses     Address[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  CUSTOMER
  ADMIN
}

model Product {
  id          String         @id @default(uuid())
  name        String
  slug        String         @unique
  description String
  price       Decimal        @db.Decimal(10, 2)
  comparePrice Decimal?      @db.Decimal(10, 2)
  stock       Int
  images      String[]
  categoryId  String
  category    Category       @relation(fields: [categoryId], references: [id])
  cartItems   CartItem[]
  orderItems  OrderItem[]
  published   Boolean        @default(false)
  featured    Boolean        @default(false)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([categoryId])
  @@index([slug])
  @@index([published])
}

model Category {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  description String?
  image       String?
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Cart {
  id        String     @id @default(uuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String   @id @default(uuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([cartId, productId])
  @@index([cartId])
  @@index([productId])
}

model Order {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  items           OrderItem[]
  total           Decimal     @db.Decimal(10, 2)
  status          OrderStatus @default(PENDING)
  paymentId       String?
  paymentStatus   PaymentStatus @default(PENDING)
  shippingAddress Address     @relation(fields: [addressId], references: [id])
  addressId       String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([userId])
  @@index([status])
}

model OrderItem {
  id        String   @id @default(uuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal  @db.Decimal(10, 2)
  createdAt DateTime @default(now())

  @@index([orderId])
  @@index([productId])
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

model Address {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName   String
  street     String
  city       String
  state      String
  zipCode    String
  country    String
  phone      String
  isDefault  Boolean  @default(false)
  orders     Order[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId])
}
```

### Run Migrations

```bash
cd packages/db
npx prisma migrate dev --name init
npx prisma generate
```

---

## Backend Implementation

### tRPC Server Setup

```typescript
// apps/api/src/index.ts
import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routers';
import { createContext } from './context';

const app = express();

app.use(cors());
app.use(express.json());

// tRPC endpoint
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### Context

```typescript
// apps/api/src/context.ts
import { inferAsyncReturnType } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function createContext({ req, res }: CreateExpressContextOptions) {
  // Get user from JWT token
  const token = req.headers.authorization?.replace('Bearer ', '');

  let user = null;
  if (token) {
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
        role: string;
      };
      user = decoded;
    } catch (error) {
      // Invalid token
    }
  }

  return {
    prisma,
    user,
    req,
    res,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
```

### tRPC Router

```typescript
// apps/api/src/routers/index.ts
import { router } from '../trpc';
import { authRouter } from './auth';
import { productRouter } from './product';
import { cartRouter } from './cart';
import { orderRouter } from './order';
import { categoryRouter } from './category';

export const appRouter = router({
  auth: authRouter,
  product: productRouter,
  cart: cartRouter,
  order: orderRouter,
  category: categoryRouter,
});

export type AppRouter = typeof appRouter;
```

### Product Router

```typescript
// apps/api/src/routers/product.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const productRouter = router({
  // List products with pagination
  list: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(20),
        categoryId: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, categoryId, search } = input;
      const skip = (page - 1) * pageSize;

      const where = {
        published: true,
        ...(categoryId && { categoryId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      };

      const [products, total] = await Promise.all([
        ctx.prisma.product.findMany({
          where,
          skip,
          take: pageSize,
          include: {
            category: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.product.count({ where }),
      ]);

      return {
        products,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  // Get single product
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { slug: input.slug },
        include: {
          category: true,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      return product;
    }),

  // Create product (admin only)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string(),
        price: z.number().positive(),
        comparePrice: z.number().positive().optional(),
        stock: z.number().int().nonnegative(),
        images: z.array(z.string().url()),
        categoryId: z.string().uuid(),
        published: z.boolean().default(false),
        featured: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin role
      if (ctx.user?.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      const product = await ctx.prisma.product.create({
        data: input,
      });

      return product;
    }),

  // Update product
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().positive().optional(),
        stock: z.number().int().nonnegative().optional(),
        images: z.array(z.string().url()).optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      const { id, ...data } = input;

      const product = await ctx.prisma.product.update({
        where: { id },
        data,
      });

      return product;
    }),

  // Delete product
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      await ctx.prisma.product.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get featured products
  featured: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.product.findMany({
      where: {
        published: true,
        featured: true,
      },
      take: 8,
      include: {
        category: true,
      },
    });
  }),
});
```

### Cart Router

```typescript
// apps/api/src/routers/cart.ts
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const cartRouter = router({
  // Get user's cart
  get: protectedProcedure.query(async ({ ctx }) => {
    let cart = await ctx.prisma.cart.findUnique({
      where: { userId: ctx.user!.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    // Create cart if doesn't exist
    if (!cart) {
      cart = await ctx.prisma.cart.create({
        data: {
          userId: ctx.user!.userId,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }),

  // Add item to cart
  addItem: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check product exists and has stock
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.productId },
      });

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      if (product.stock < input.quantity) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Insufficient stock',
        });
      }

      // Get or create cart
      let cart = await ctx.prisma.cart.findUnique({
        where: { userId: ctx.user!.userId },
      });

      if (!cart) {
        cart = await ctx.prisma.cart.create({
          data: { userId: ctx.user!.userId },
        });
      }

      // Check if item already in cart
      const existingItem = await ctx.prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: input.productId,
          },
        },
      });

      if (existingItem) {
        // Update quantity
        await ctx.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + input.quantity,
          },
        });
      } else {
        // Add new item
        await ctx.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: input.productId,
            quantity: input.quantity,
          },
        });
      }

      return { success: true };
    }),

  // Update item quantity
  updateQuantity: protectedProcedure
    .input(
      z.object({
        itemId: z.string().uuid(),
        quantity: z.number().int().nonnegative(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.quantity === 0) {
        // Remove item
        await ctx.prisma.cartItem.delete({
          where: { id: input.itemId },
        });
      } else {
        // Update quantity
        await ctx.prisma.cartItem.update({
          where: { id: input.itemId },
          data: { quantity: input.quantity },
        });
      }

      return { success: true };
    }),

  // Remove item
  removeItem: protectedProcedure
    .input(z.object({ itemId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.cartItem.delete({
        where: { id: input.itemId },
      });

      return { success: true };
    }),

  // Clear cart
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    const cart = await ctx.prisma.cart.findUnique({
      where: { userId: ctx.user!.userId },
    });

    if (cart) {
      await ctx.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return { success: true };
  }),
});
```

---

## Frontend Implementation

### tRPC Client Setup

```typescript
// apps/web/src/lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../api/src/routers';

export const trpc = createTRPCReact<AppRouter>();
```

### Provider Setup

```typescript
// apps/web/src/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3001/trpc',
          headers() {
            const token = localStorage.getItem('token');
            return token ? { authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### Product List Component

```typescript
// apps/web/src/components/ProductList.tsx
'use client';

import { trpc } from '@/lib/trpc';
import { ProductCard } from './ProductCard';

export function ProductList() {
  const { data, isLoading, error } = trpc.product.list.useQuery({
    page: 1,
    pageSize: 20,
  });

  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {data?.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Add to Cart

```typescript
// apps/web/src/components/AddToCartButton.tsx
'use client';

import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';

interface Props {
  productId: string;
}

export function AddToCartButton({ productId }: Props) {
  const utils = trpc.useUtils();
  const addItem = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      // Invalidate cart query
      utils.cart.get.invalidate();
    },
  });

  const handleAddToCart = () => {
    addItem.mutate({ productId, quantity: 1 });
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={addItem.isPending}
    >
      {addItem.isPending ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
}
```

---

## Authentication

See `backend/auth.ts` for JWT implementation with bcrypt password hashing.

---

## Payment Integration

See `backend/payment.ts` for Stripe integration with webhook handling.

---

## Deployment

### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  api:
    build: ./apps/api
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/ecommerce
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://api:3001
```

---

## Next Steps

1. Set up authentication flow
2. Implement Stripe payments
3. Add image upload with Cloudinary
4. Build admin dashboard
5. Deploy to production

**Estimated Time:** 4-5 weeks

---

## Resources

- [tRPC Documentation](https://trpc.io)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Stripe API](https://stripe.com/docs/api)
- [Next.js Documentation](https://nextjs.org/docs)
