# Database ORMs in TypeScript

Compare and use Prisma, TypeORM, Drizzle, and Kysely for type-safe database access.

## Table of Contents

- [ORM Comparison](#orm-comparison)
- [Prisma](#prisma)
- [TypeORM](#typeorm)
- [Drizzle ORM](#drizzle-orm)
- [Kysely](#kysely)
- [Which ORM to Choose](#which-orm-to-choose)

---

## ORM Comparison

| Feature | Prisma | TypeORM | Drizzle | Kysely |
|---------|--------|---------|---------|--------|
| **Type Safety** | Excellent | Good | Excellent | Excellent |
| **Query Builder** | Generated | Included | Included | SQL-like |
| **Migrations** | Built-in | Built-in | Built-in | External |
| **Performance** | Good | Good | Excellent | Excellent |
| **Learning Curve** | Easy | Medium | Easy | Easy |
| **Schema Definition** | Prisma schema | Decorators | TypeScript | TypeScript |
| **Database Support** | PostgreSQL, MySQL, SQLite, MongoDB, SQL Server | Many | PostgreSQL, MySQL, SQLite | Many |
| **Active Record** | No | Yes | No | No |
| **Data Mapper** | Yes | Yes | Yes | Yes |

---

## Prisma

### Setup

```bash
npm install @prisma/client
npm install -D prisma

npx prisma init
```

### Schema Definition

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Profile {
  id     String @id @default(uuid())
  bio    String?
  avatar String?
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Post {
  id        String    @id @default(uuid())
  title     String
  content   String?
  published Boolean   @default(false)
  authorId  String
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  tags      Tag[]
  comments  Comment[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([authorId])
  @@index([published])
}

model Comment {
  id        String   @id @default(uuid())
  content   String
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId  String
  createdAt DateTime @default(now())

  @@index([postId])
}

model Tag {
  id    String @id @default(uuid())
  name  String @unique
  posts Post[]
}
```

### Basic Operations

```typescript
// repositories/UserRepository.ts
import { PrismaClient, User, Prisma } from '@prisma/client';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({
      data,
      include: {
        profile: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        posts: {
          where: { published: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async list(options: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ users: User[]; total: number }> {
    const { page, pageSize, search } = options;
    const skip = (page - 1) * pageSize;

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { posts: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }
}

// repositories/PostRepository.ts
export class PostRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.PostCreateInput): Promise<Post> {
    return await this.prisma.post.create({
      data,
      include: {
        author: true,
        tags: true,
      },
    });
  }

  async findById(id: string): Promise<Post | null> {
    return await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tags: true,
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { comments: true },
        },
      },
    });
  }

  async findPublished(options: {
    page: number;
    pageSize: number;
    tagId?: string;
  }): Promise<{ posts: Post[]; total: number }> {
    const { page, pageSize, tagId } = options;
    const skip = (page - 1) * pageSize;

    const where: Prisma.PostWhereInput = {
      published: true,
      ...(tagId && {
        tags: {
          some: { id: tagId },
        },
      }),
    };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true },
          },
          tags: true,
          _count: {
            select: { comments: true },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return { posts, total };
  }

  async publish(id: string): Promise<Post> {
    return await this.prisma.post.update({
      where: { id },
      data: { published: true },
    });
  }

  async addTags(postId: string, tagIds: string[]): Promise<Post> {
    return await this.prisma.post.update({
      where: { id: postId },
      data: {
        tags: {
          connect: tagIds.map(id => ({ id })),
        },
      },
      include: { tags: true },
    });
  }
}

// Advanced queries
export class PostService {
  constructor(private prisma: PrismaClient) {}

  async getPostStatistics(): Promise<any> {
    return await this.prisma.post.groupBy({
      by: ['published'],
      _count: true,
      _avg: {
        title: false,
      },
    });
  }

  async searchPosts(query: string): Promise<Post[]> {
    return await this.prisma.$queryRaw`
      SELECT p.*, u.name as author_name
      FROM "Post" p
      JOIN "User" u ON p."authorId" = u.id
      WHERE p.title ILIKE ${`%${query}%`}
        OR p.content ILIKE ${`%${query}%`}
      ORDER BY p."createdAt" DESC
      LIMIT 20
    `;
  }

  async getPopularPosts(): Promise<any[]> {
    return await this.prisma.$queryRaw`
      SELECT p.*, COUNT(c.id) as comment_count
      FROM "Post" p
      LEFT JOIN "Comment" c ON p.id = c."postId"
      WHERE p.published = true
      GROUP BY p.id
      ORDER BY comment_count DESC
      LIMIT 10
    `;
  }
}
```

### Transactions

```typescript
// Prisma transactions
export class OrderService {
  constructor(private prisma: PrismaClient) {}

  async createOrder(userId: string, items: OrderItem[]): Promise<Order> {
    return await this.prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
          items: {
            create: items,
          },
        },
      });

      // Update product stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });
  }
}
```

---

## TypeORM

### Setup

```bash
npm install typeorm reflect-metadata pg
npm install -D @types/node
```

### Entity Definition

```typescript
// entities/User.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Profile } from './Profile.entity';
import { Post } from './Post.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @OneToOne(() => Profile, profile => profile.user, { cascade: true })
  profile: Profile;

  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// entities/Profile.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatar: string;

  @OneToOne(() => User, user => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;
}

// entities/Post.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { User } from './User.entity';
import { Tag } from './Tag.entity';
import { Comment } from './Comment.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ default: false })
  published: boolean;

  @ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
  author: User;

  @Column()
  authorId: string;

  @ManyToMany(() => Tag, tag => tag.posts)
  @JoinTable()
  tags: Tag[];

  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Repository Pattern

```typescript
// repositories/UserRepository.ts
import { Repository, Like } from 'typeorm';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User.entity';

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['profile', 'posts'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email },
    });
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.repository.update(id, userData);
    return (await this.findById(id))!;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async list(options: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ users: User[]; total: number }> {
    const { page, pageSize, search } = options;
    const skip = (page - 1) * pageSize;

    const where = search
      ? [{ name: Like(`%${search}%`) }, { email: Like(`%${search}%`) }]
      : {};

    const [users, total] = await this.repository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: { createdAt: 'DESC' },
      relations: ['posts'],
    });

    return { users, total };
  }
}

// Using Query Builder
export class PostRepository {
  private repository: Repository<Post>;

  constructor() {
    this.repository = AppDataSource.getRepository(Post);
  }

  async findPublishedWithComments(limit: number = 10): Promise<Post[]> {
    return await this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.comments', 'comments')
      .where('post.published = :published', { published: true })
      .orderBy('post.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  async getPostStatistics(): Promise<any> {
    return await this.repository
      .createQueryBuilder('post')
      .select('post.published', 'published')
      .addSelect('COUNT(*)', 'count')
      .groupBy('post.published')
      .getRawMany();
  }

  async searchPosts(query: string): Promise<Post[]> {
    return await this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.title ILIKE :query', { query: `%${query}%` })
      .orWhere('post.content ILIKE :query', { query: `%${query}%` })
      .orderBy('post.createdAt', 'DESC')
      .take(20)
      .getMany();
  }
}
```

### Transactions

```typescript
// TypeORM transactions
export class OrderService {
  async createOrder(userId: string, items: OrderItem[]): Promise<Order> {
    return await AppDataSource.transaction(async (manager) => {
      // Create order
      const order = manager.create(Order, {
        userId,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      });
      await manager.save(order);

      // Create order items
      for (const item of items) {
        const orderItem = manager.create(OrderItem, {
          ...item,
          orderId: order.id,
        });
        await manager.save(orderItem);

        // Update product stock
        await manager.decrement(Product, { id: item.productId }, 'stock', item.quantity);
      }

      return order;
    });
  }
}
```

---

## Drizzle ORM

### Setup

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

### Schema Definition

```typescript
// schema/users.ts
import { pgTable, uuid, varchar, timestamp, boolean, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  bio: text('bio'),
  avatar: varchar('avatar', { length: 500 }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content'),
  published: boolean('published').default(false).notNull(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

### Queries

```typescript
// repositories/UserRepository.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, like, or } from 'drizzle-orm';
import { users, profiles } from '../schema/users';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export class UserRepository {
  async create(userData: typeof users.$inferInsert) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async findById(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, id));

    return user;
  }

  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async update(id: string, userData: Partial<typeof users.$inferInsert>) {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();

    return user;
  }

  async delete(id: string) {
    await db.delete(users).where(eq(users.id, id));
  }

  async list(options: { page: number; pageSize: number; search?: string }) {
    const { page, pageSize, search } = options;
    const offset = (page - 1) * pageSize;

    let query = db.select().from(users);

    if (search) {
      query = query.where(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    const result = await query.limit(pageSize).offset(offset);

    return result;
  }
}

// Advanced queries
export class PostRepository {
  async findPublishedWithAuthor() {
    return await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.published, true))
      .orderBy(posts.createdAt);
  }
}
```

---

## Kysely

### Setup

```bash
npm install kysely pg
npm install -D @types/pg
```

### Type Definitions

```typescript
// types/database.ts
import { Generated, Selectable, Insertable, Updateable } from 'kysely';

export interface Database {
  users: UsersTable;
  profiles: ProfilesTable;
  posts: PostsTable;
  comments: CommentsTable;
}

export interface UsersTable {
  id: Generated<string>;
  email: string;
  name: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface ProfilesTable {
  id: Generated<string>;
  bio: string | null;
  avatar: string | null;
  user_id: string;
}

export interface PostsTable {
  id: Generated<string>;
  title: string;
  content: string | null;
  published: Generated<boolean>;
  author_id: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface CommentsTable {
  id: Generated<string>;
  content: string;
  post_id: string;
  author_id: string;
  created_at: Generated<Date>;
}

export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;

export type Post = Selectable<PostsTable>;
export type NewPost = Insertable<PostsTable>;
export type PostUpdate = Updateable<PostsTable>;
```

### Queries

```typescript
// repositories/UserRepository.ts
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database, User, NewUser, UserUpdate } from '../types/database';

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

export class UserRepository {
  async create(user: NewUser): Promise<User> {
    return await db
      .insertInto('users')
      .values(user)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string): Promise<User | undefined> {
    return await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();
  }

  async update(id: string, updateWith: UserUpdate): Promise<User> {
    return await db
      .updateTable('users')
      .set(updateWith)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(id: string): Promise<void> {
    await db.deleteFrom('users').where('id', '=', id).execute();
  }

  async list(options: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<User[]> {
    const { page, pageSize, search } = options;
    const offset = (page - 1) * pageSize;

    let query = db.selectFrom('users').selectAll();

    if (search) {
      query = query.where((eb) =>
        eb.or([
          eb('name', 'ilike', `%${search}%`),
          eb('email', 'ilike', `%${search}%`),
        ])
      );
    }

    return await query.limit(pageSize).offset(offset).execute();
  }
}

// Advanced queries with joins
export class PostRepository {
  async findPublishedWithAuthor() {
    return await db
      .selectFrom('posts')
      .innerJoin('users', 'users.id', 'posts.author_id')
      .select([
        'posts.id',
        'posts.title',
        'posts.content',
        'posts.created_at',
        'users.id as author_id',
        'users.name as author_name',
        'users.email as author_email',
      ])
      .where('posts.published', '=', true)
      .orderBy('posts.created_at', 'desc')
      .execute();
  }

  async getPostWithCommentCount() {
    return await db
      .selectFrom('posts')
      .leftJoin('comments', 'comments.post_id', 'posts.id')
      .select((eb) => [
        'posts.id',
        'posts.title',
        eb.fn.count<number>('comments.id').as('comment_count'),
      ])
      .groupBy('posts.id')
      .orderBy('comment_count', 'desc')
      .execute();
  }

  async searchPosts(query: string): Promise<Post[]> {
    return await db
      .selectFrom('posts')
      .selectAll()
      .where((eb) =>
        eb.or([
          eb('title', 'ilike', `%${query}%`),
          eb('content', 'ilike', `%${query}%`),
        ])
      )
      .execute();
  }
}

// Transactions
export class OrderService {
  async createOrder(userId: string, items: OrderItem[]): Promise<Order> {
    return await db.transaction().execute(async (trx) => {
      // Create order
      const order = await trx
        .insertInto('orders')
        .values({
          user_id: userId,
          total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      // Create order items
      for (const item of items) {
        await trx
          .insertInto('order_items')
          .values({
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price,
          })
          .execute();

        // Update product stock
        await trx
          .updateTable('products')
          .set((eb) => ({
            stock: eb('stock', '-', item.quantity),
          }))
          .where('id', '=', item.productId)
          .execute();
      }

      return order;
    });
  }
}
```

---

## Which ORM to Choose?

### Choose Prisma if:
- ✅ You want the best TypeScript experience
- ✅ You're building a new project
- ✅ You value developer experience over raw performance
- ✅ You want excellent tooling and VS Code integration
- ✅ You're okay with migrations via Prisma schema

### Choose TypeORM if:
- ✅ You need Active Record pattern
- ✅ You're migrating from other ORMs
- ✅ You need extensive database support
- ✅ You prefer decorator-based entities
- ✅ Your team is familiar with Java/C# ORMs

### Choose Drizzle if:
- ✅ You want the best performance
- ✅ You prefer SQL-like syntax
- ✅ You want zero runtime overhead
- ✅ You need lightweight ORM
- ✅ Type safety is critical

### Choose Kysely if:
- ✅ You want SQL-first approach
- ✅ You need maximum type safety
- ✅ You prefer query builders over ORM abstractions
- ✅ You want minimal magic
- ✅ You're comfortable writing SQL

---

## Best Practices

### 1. Use Repositories

```typescript
// ✅ Good: Repository pattern
class UserRepository {
  async findById(id: string): Promise<User | null> {
    return await this.db.users.findOne({ where: { id } });
  }
}

// ❌ Bad: Direct database access
const user = await prisma.user.findOne({ where: { id } });
```

### 2. Handle Errors

```typescript
// ✅ Good: Handle unique constraint violations
try {
  await userRepository.create({ email: 'test@example.com' });
} catch (error) {
  if (error.code === 'P2002') {
    throw new Error('Email already exists');
  }
  throw error;
}
```

### 3. Use Transactions

```typescript
// ✅ Good: Use transactions for multi-step operations
await db.transaction(async (trx) => {
  await trx.orders.create(order);
  await trx.orderItems.createMany(items);
  await trx.products.update(productUpdates);
});
```

---

## Next Steps

- [Clean Architecture](../clean-architecture/README.md) - Organize your data layer
- [Testing](../../06-testing/README.md) - Test your repositories
- [API Design](../api-design/README.md) - Expose your data

---

**Remember**: Choose the ORM that fits your team's expertise and project requirements!
