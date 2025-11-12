# Module 10: Production Best Practices

Learn how to deploy and maintain production-ready TypeScript applications with confidence.

## 🎯 Learning Objectives

By the end of this module, you will be able to:

- Implement robust error handling strategies
- Set up logging and monitoring systems
- Manage configuration across environments
- Apply security best practices
- Deploy TypeScript applications
- Handle database migrations
- Set up CI/CD pipelines
- Generate and maintain documentation
- Follow semantic versioning
- Monitor application health

## ⏱️ Estimated Time

**2 weeks** (assuming 5-10 hours per week)

## 📚 Module Structure

### [01. Error Handling](./error-handling/README.md)
- Error types and hierarchies
- Custom error classes
- Error boundaries
- Graceful degradation
- Error logging
- User-friendly error messages

### [02. Logging & Monitoring](./logging-monitoring/README.md)
- Structured logging
- Log levels and formats
- Winston and Pino
- Application monitoring
- Performance monitoring
- Alert systems

### [03. Configuration](./configuration/README.md)
- Environment variables
- Configuration management
- Secrets handling
- Feature flags
- Multi-environment setup

### [04. Security](./security/README.md)
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection
- Authentication patterns
- Authorization strategies
- Rate limiting
- Security headers

### [05. Deployment](./deployment/README.md)
- Build optimization
- Docker containerization
- CI/CD pipelines
- Blue-green deployment
- Rolling updates
- Health checks
- Database migrations

### [06. Documentation](./documentation/README.md)
- TypeDoc for API docs
- README best practices
- Architecture documentation
- API documentation
- Changelog management
- Contributing guidelines

## 🔑 Key Concepts

### Error Handling

```typescript
// Custom error hierarchy
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
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

// Global error handler (Express)
import { Request, Response, NextFunction } from 'express';

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
      ...(err instanceof ValidationError && { fields: err.fields }),
    });
  }

  // Log unexpected errors
  logger.error('Unexpected error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Don't leak internal errors
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}

// Usage
app.post('/api/users', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required', {
        email: !email ? 'Email is required' : undefined,
        password: !password ? 'Password is required' : undefined,
      });
    }

    const user = await createUser(email, password);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});
```

### Structured Logging

```typescript
// logger.ts
import winston from 'winston';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(logColors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  transports: [
    new winston.transports.Console({ format }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.json(),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.json(),
    }),
  ],
});

// Usage
logger.info('User logged in', { userId: 123, ip: '192.168.1.1' });
logger.error('Database connection failed', { error: err.message });
logger.debug('Query executed', { query: sql, duration: '15ms' });
```

### Configuration Management

```typescript
// config.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
});

export type Config = z.infer<typeof envSchema>;

function loadConfig(): Config {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export const config = loadConfig();

// Usage
console.log(`Server starting on port ${config.PORT}`);
console.log(`Environment: ${config.NODE_ENV}`);
```

### Security Middleware

```typescript
// security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Rate limiting
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Sanitize inputs
export const sanitizeInputs = mongoSanitize({
  replaceWith: '_',
});

// Input validation
export const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().isLength({ min: 2, max: 50 }),
];

export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
}

// Apply middleware
app.use(securityHeaders);
app.use(limiter);
app.use(sanitizeInputs);
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  postgres_data:
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t myapp:latest .

      - name: Run security scan
        run: docker scan myapp:latest

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to production
        run: |
          # Add deployment script here
          echo "Deploying to production..."
```

### Database Migrations

```typescript
// migrations/001_create_users_table.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.string('name').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
```

### API Documentation

```typescript
/**
 * User service for managing user accounts
 * @module UserService
 */

/**
 * Creates a new user account
 *
 * @param email - User's email address
 * @param password - User's password (will be hashed)
 * @param name - User's full name
 * @returns Created user object
 * @throws {ValidationError} If email is invalid or already exists
 * @throws {DatabaseError} If database operation fails
 *
 * @example
 * ```typescript
 * const user = await createUser(
 *   'user@example.com',
 *   'securePassword123',
 *   'John Doe'
 * );
 * console.log(user.id); // 1
 * ```
 */
export async function createUser(
  email: string,
  password: string,
  name: string
): Promise<User> {
  // Implementation
}
```

## 🚀 Production Checklist

### Before Deployment

- [ ] **Security**
  - [ ] All inputs validated
  - [ ] SQL injection prevented
  - [ ] XSS protection enabled
  - [ ] CSRF tokens implemented
  - [ ] Security headers configured
  - [ ] Rate limiting enabled
  - [ ] Secrets not in code

- [ ] **Performance**
  - [ ] Database indexed properly
  - [ ] Queries optimized
  - [ ] Caching implemented
  - [ ] Static assets compressed
  - [ ] Bundle size optimized

- [ ] **Monitoring**
  - [ ] Logging configured
  - [ ] Error tracking set up
  - [ ] Performance monitoring enabled
  - [ ] Health checks implemented
  - [ ] Alerts configured

- [ ] **Testing**
  - [ ] Unit tests passing
  - [ ] Integration tests passing
  - [ ] E2E tests passing
  - [ ] Load testing completed
  - [ ] Security testing done

- [ ] **Documentation**
  - [ ] API documented
  - [ ] README up to date
  - [ ] Environment variables documented
  - [ ] Deployment guide written
  - [ ] Changelog updated

### After Deployment

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all features working
- [ ] Test critical user paths
- [ ] Monitor resource usage
- [ ] Check logs for issues

## 📊 Monitoring Dashboards

### Application Metrics

```typescript
// metrics.ts
import prometheus from 'prom-client';

// Create a Registry
export const register = new prometheus.Registry();

// Add default metrics
prometheus.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

export const totalRequests = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(activeConnections);
register.registerMetric(totalRequests);

// Middleware to track metrics
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;

    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);

    totalRequests
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });

  next();
}

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

## 🔐 Security Best Practices

### 1. Never Trust User Input

```typescript
// ❌ Bad
app.get('/user/:id', (req, res) => {
  const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
  // SQL injection vulnerability!
});

// ✅ Good
app.get('/user/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
});
```

### 2. Hash Passwords Properly

```typescript
import bcrypt from 'bcrypt';

// Hash password
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 3. Use Environment Variables for Secrets

```typescript
// ❌ Bad
const JWT_SECRET = 'my-secret-key';

// ✅ Good
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined');
}
```

### 4. Implement Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
});

app.post('/api/login', loginLimiter, loginHandler);
```

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [12 Factor App](https://12factor.net/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [TypeDoc Documentation](https://typedoc.org/)

## ✅ Module Completion Checklist

Before deploying to production, ensure you:

- [ ] Implement comprehensive error handling
- [ ] Set up structured logging
- [ ] Configure all environments properly
- [ ] Apply security best practices
- [ ] Create Docker containers
- [ ] Set up CI/CD pipeline
- [ ] Write complete documentation
- [ ] Monitor application health
- [ ] Plan database migrations
- [ ] Test disaster recovery

## 🚀 Next Steps

Congratulations on completing the TypeScript Mastery course!

- Apply these practices in [Module 9: Real-World Projects](../09-projects/README.md)
- Contribute to open-source TypeScript projects
- Share your knowledge with the community
- Keep learning and stay updated

---

**Ready for production?** Follow these best practices to deploy with confidence!

**Questions?** Check the [Troubleshooting Guide](../../resources/troubleshooting.md) or open an issue.
