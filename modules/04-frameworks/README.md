# Module 4: Framework Integrations

Learn framework-specific TypeScript patterns for React, Node.js, NestJS, Vue, Angular, Next.js, and more.

## 🎯 Learning Objectives

By the end of this module, you will be able to:

- Type React components, hooks, and context with TypeScript
- Build type-safe Express and Node.js applications
- Create NestJS applications with DTOs and decorators
- Type Vue 3 Composition API components
- Work with Angular's dependency injection and RxJS
- Use Next.js with TypeScript (App Router and Server Components)
- Build end-to-end type-safe applications with tRPC
- Integrate TypeScript with other popular frameworks

## ⏱️ Estimated Time

**Variable** - Choose the frameworks you use (1-2 weeks per framework)

## 📚 Module Structure

### React + TypeScript
- Component typing (FC, ReactNode, children)
- Hooks: useState, useEffect, useReducer, useContext, useRef
- Custom hooks
- Event handlers and synthetic events
- Props with generics
- forwardRef, memo, lazy
- Context API
- React Router
- State management: Redux Toolkit, Zustand, Jotai
- Form libraries: React Hook Form, Formik

### Node.js + Express
- Typing Express applications
- Request, Response, NextFunction
- Custom middleware typing
- Route handler types
- Request validation (Zod, Yup)
- Environment variables
- Error handling patterns

### NestJS
- Controllers, Providers, Modules
- Dependency injection
- DTOs and validation pipes
- Guards, Interceptors, Decorators
- TypeORM/Prisma integration
- GraphQL with TypeScript

### Vue 3 + TypeScript
- Composition API typing
- defineComponent and setup()
- Props typing with PropType
- Emits typing
- Computed and watchers
- Pinia state management

### Angular
- Components and Services
- RxJS Observables and operators
- Dependency injection
- Forms and validation
- HttpClient

### Next.js
- App Router with TypeScript
- Server Components
- Server Actions
- Route handlers
- Metadata API
- Data fetching patterns

### Additional Frameworks
- **Remix**: Loaders, actions, and type inference
- **tRPC**: End-to-end type safety
- **Fastify**: Typed routes and plugins
- **Hono**: Edge-first web framework

## 🔑 Framework Quick Starts

### React + TypeScript

```typescript
import React, { useState } from "react";

interface User {
  id: number;
  name: string;
}

interface UserListProps {
  initialUsers: User[];
}

const UserList: React.FC<UserListProps> = ({ initialUsers }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const addUser = (name: string) => {
    const newUser: User = {
      id: Date.now(),
      name,
    };
    setUsers([...users, newUser]);
  };

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
};
```

### Express + TypeScript

```typescript
import express, { Request, Response, NextFunction } from "express";

interface User {
  id: number;
  name: string;
  email: string;
}

const app = express();

app.get("/users/:id", async (req: Request<{ id: string }>, res: Response) => {
  const userId = parseInt(req.params.id);
  const user = await getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

app.post("/users", async (req: Request<{}, {}, User>, res: Response) => {
  const user = req.body;
  const created = await createUser(user);
  res.status(201).json(created);
});
```

### NestJS

```typescript
// user.controller.ts
import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}

// dto/create-user.dto.ts
import { IsString, IsEmail, MinLength } from "class-validator";

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;
}
```

### tRPC

```typescript
// server
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const appRouter = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      return { id: input.id, name: "Alice" };
    }),

  createUser: t.procedure
    .input(z.object({ name: z.string(), email: z.string().email() }))
    .mutation(({ input }) => {
      return { id: 1, ...input };
    }),
});

export type AppRouter = typeof appRouter;

// client
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./server";

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});

// Fully type-safe!
const user = await client.getUser.query({ id: 1 });
const newUser = await client.createUser.mutate({
  name: "Bob",
  email: "bob@example.com",
});
```

## 🛠️ Prerequisites

Before starting this module:
- Complete [Module 1: TypeScript Foundations](../01-foundations/README.md)
- Complete [Module 2: Intermediate TypeScript](../02-intermediate/README.md)
- Have experience with at least one of the frameworks

## 📖 Framework-Specific Resources

### React
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React Documentation](https://react.dev/)

### Node.js
- [Node.js TypeScript Docs](https://nodejs.org/docs/latest/api/)
- [Express TypeScript](https://expressjs.com/)

### NestJS
- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS TypeScript](https://docs.nestjs.com/first-steps)

### Vue
- [Vue TypeScript Guide](https://vuejs.org/guide/typescript/overview.html)
- [Vue Documentation](https://vuejs.org/)

### Angular
- [Angular TypeScript](https://angular.io/guide/typescript-configuration)
- [Angular Documentation](https://angular.io/)

## ✅ Module Completion

Choose the frameworks relevant to your work. For each framework:

- [ ] Understand framework-specific type patterns
- [ ] Type components/controllers appropriately
- [ ] Implement type-safe state management
- [ ] Handle API requests with proper typing
- [ ] Complete framework-specific exercises

## 🚀 Next Steps

After mastering your chosen frameworks:
- [Module 5: Build Tools & Ecosystem](../05-build-tools/README.md)
- [Module 6: Testing Strategies](../06-testing/README.md)
- [Module 9: Real-World Projects](../09-projects/README.md)

---

**Coming Soon**: Detailed guides for each framework are being added!

**Questions?** Check the [Troubleshooting Guide](../../resources/troubleshooting.md) or open an issue.
