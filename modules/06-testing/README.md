# Module 6: Testing Strategies

Master comprehensive testing strategies for TypeScript applications from unit tests to end-to-end testing.

## 🎯 Learning Objectives

By the end of this module, you will be able to:

- Write effective unit tests with Jest and Vitest
- Implement integration tests for complex workflows
- Create end-to-end tests with Playwright and Cypress
- Use contract testing for API compatibility
- Apply property-based testing techniques
- Follow test-driven development (TDD) workflow
- Test TypeScript types themselves
- Mock dependencies type-safely
- Achieve meaningful test coverage

## ⏱️ Estimated Time

**2 weeks** (assuming 5-10 hours per week)

## 📚 Module Structure

### [01. Unit Testing](./unit-testing/README.md)
- Jest setup and configuration
- Vitest for modern projects
- Writing testable code
- Mocking and spying
- Testing async code
- Coverage reporting
- Best practices

### [02. Integration Testing](./integration-testing/README.md)
- Testing multiple components together
- Database integration tests
- API integration tests
- Testing with real dependencies
- Test containers
- Cleanup strategies

### [03. E2E Testing](./e2e-testing/README.md)
- Playwright setup and usage
- Cypress for web applications
- Page Object Model pattern
- Testing user workflows
- Visual regression testing
- Performance testing

### [04. Contract Testing](./contract-testing/README.md)
- Consumer-driven contracts
- Pact framework
- API contract testing
- Breaking change detection
- Provider verification

### [05. Property-Based Testing](./property-testing/README.md)
- Fast-check library
- Generating test data
- Property definitions
- Shrinking failures
- When to use property tests

### [06. TDD Workflow](./tdd-workflow/README.md)
- Red-Green-Refactor cycle
- Writing tests first
- TDD best practices
- Common pitfalls
- TDD with TypeScript

### [07. Type Testing](./type-testing/README.md)
- Testing types with tsd
- expect-type library
- Testing generic types
- Ensuring type safety
- Type regression tests

## 🔑 Key Concepts

### Unit Testing with Vitest

```typescript
// sum.ts
export function sum(a: number, b: number): number {
  return a + b;
}

export function asyncSum(a: number, b: number): Promise<number> {
  return Promise.resolve(a + b);
}

// sum.test.ts
import { describe, it, expect } from 'vitest';
import { sum, asyncSum } from './sum';

describe('sum', () => {
  it('should add two numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });

  it('should handle negative numbers', () => {
    expect(sum(-1, 1)).toBe(0);
  });

  it('should handle decimals', () => {
    expect(sum(0.1, 0.2)).toBeCloseTo(0.3);
  });
});

describe('asyncSum', () => {
  it('should add two numbers asynchronously', async () => {
    const result = await asyncSum(2, 3);
    expect(result).toBe(5);
  });
});
```

### Mocking with Type Safety

```typescript
// userService.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface UserRepository {
  findById(id: number): Promise<User | null>;
  save(user: User): Promise<User>;
}

export class UserService {
  constructor(private repository: UserRepository) {}

  async getUser(id: number): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async createUser(name: string, email: string): Promise<User> {
    const user: User = {
      id: Math.floor(Math.random() * 1000),
      name,
      email,
    };
    return this.repository.save(user);
  }
}

// userService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { UserService, UserRepository, User } from './userService';

describe('UserService', () => {
  it('should get user by id', async () => {
    // Create type-safe mock
    const mockRepository: UserRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
      }),
      save: vi.fn(),
    };

    const service = new UserService(mockRepository);
    const user = await service.getUser(1);

    expect(user.name).toBe('Alice');
    expect(mockRepository.findById).toHaveBeenCalledWith(1);
  });

  it('should throw error when user not found', async () => {
    const mockRepository: UserRepository = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
    };

    const service = new UserService(mockRepository);

    await expect(service.getUser(999)).rejects.toThrow('User not found');
  });

  it('should create a new user', async () => {
    const mockRepository: UserRepository = {
      findById: vi.fn(),
      save: vi.fn().mockImplementation((user: User) => Promise.resolve(user)),
    };

    const service = new UserService(mockRepository);
    const user = await service.createUser('Bob', 'bob@example.com');

    expect(user.name).toBe('Bob');
    expect(user.email).toBe('bob@example.com');
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Bob',
        email: 'bob@example.com',
      })
    );
  });
});
```

### E2E Testing with Playwright

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error')).toContainText('Invalid credentials');
  });
});
```

### Type Testing

```typescript
// types.ts
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// types.test-d.ts
import { expectType } from 'tsd';
import { DeepReadonly } from './types';

interface User {
  name: string;
  address: {
    street: string;
    city: string;
  };
}

type ReadonlyUser = DeepReadonly<User>;

// Test that properties are readonly
const user: ReadonlyUser = {
  name: 'Alice',
  address: { street: '123 Main', city: 'NYC' },
};

// These should cause type errors (which is what we want to test)
// user.name = 'Bob'; // Error: readonly
// user.address.city = 'LA'; // Error: readonly

// Use tsd to verify types
expectType<Readonly<User>>(user);
expectType<string>(user.name);
expectType<Readonly<{ street: string; city: string }>>(user.address);
```

### Property-Based Testing

```typescript
// sort.ts
export function sort(arr: number[]): number[] {
  return [...arr].sort((a, b) => a - b);
}

// sort.test.ts
import { fc, test } from '@fast-check/vitest';
import { sort } from './sort';

test.prop([fc.array(fc.integer())])('sorted array should be ordered', (arr) => {
  const sorted = sort(arr);

  // Property: Each element should be <= next element
  for (let i = 0; i < sorted.length - 1; i++) {
    expect(sorted[i]).toBeLessThanOrEqual(sorted[i + 1]);
  }
});

test.prop([fc.array(fc.integer())])(
  'sorted array should have same length',
  (arr) => {
    const sorted = sort(arr);
    expect(sorted.length).toBe(arr.length);
  }
);

test.prop([fc.array(fc.integer())])(
  'sorted array should contain same elements',
  (arr) => {
    const sorted = sort(arr);
    const original = [...arr].sort((a, b) => a - b);

    expect(sorted).toEqual(original);
  }
);
```

## 🛠️ Testing Configuration

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    setupFiles: ['./test/setup.ts'],
  },
});
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 📊 Testing Pyramid

```
       /\
      /  \     E2E Tests (Few)
     /    \    - Slow, expensive
    /------\   - Test critical paths
   /        \
  /  Integ.  \ Integration Tests (Some)
 /    Tests   \- Test components together
/--------------\
|              |
|  Unit Tests  | Unit Tests (Many)
|              | - Fast, cheap
|   (Many)     | - Test individual units
|______________|
```

**Best Practices:**
- **Many** unit tests (fast, cheap)
- **Some** integration tests (moderate)
- **Few** E2E tests (slow, expensive)

## 🎯 Test Coverage Goals

| Type | Coverage Goal | Priority |
|------|--------------|----------|
| **Critical Paths** | 100% | Highest |
| **Business Logic** | 90-100% | High |
| **Utils/Helpers** | 80-90% | Medium |
| **UI Components** | 60-80% | Medium |
| **Config/Setup** | 50-70% | Low |

**Remember:** Coverage % is not everything. Focus on testing behavior, not implementation.

## ✅ Testing Best Practices

### 1. Arrange-Act-Assert (AAA)

```typescript
it('should calculate total price with tax', () => {
  // Arrange
  const price = 100;
  const taxRate = 0.1;

  // Act
  const total = calculateTotal(price, taxRate);

  // Assert
  expect(total).toBe(110);
});
```

### 2. Test One Thing Per Test

```typescript
// ❌ Bad: Testing multiple things
it('should handle user creation and update', async () => {
  const user = await createUser('Alice');
  expect(user.name).toBe('Alice');

  const updated = await updateUser(user.id, { name: 'Bob' });
  expect(updated.name).toBe('Bob');
});

// ✅ Good: Separate tests
it('should create user', async () => {
  const user = await createUser('Alice');
  expect(user.name).toBe('Alice');
});

it('should update user', async () => {
  const user = await createUser('Alice');
  const updated = await updateUser(user.id, { name: 'Bob' });
  expect(updated.name).toBe('Bob');
});
```

### 3. Use Descriptive Test Names

```typescript
// ❌ Bad
it('works', () => { /* ... */ });

// ✅ Good
it('should return 404 when user not found', () => { /* ... */ });
it('should hash password before saving', () => { /* ... */ });
it('should throw error when email is invalid', () => { /* ... */ });
```

### 4. Don't Test Implementation Details

```typescript
// ❌ Bad: Testing internal state
it('should set isLoading to true', () => {
  service.fetchData();
  expect(service['isLoading']).toBe(true);
});

// ✅ Good: Testing behavior
it('should show loading indicator while fetching', () => {
  const promise = service.fetchData();
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  await promise;
});
```

### 5. Keep Tests Independent

```typescript
// ❌ Bad: Tests depend on each other
let user: User;

it('should create user', async () => {
  user = await createUser('Alice');
  expect(user.name).toBe('Alice');
});

it('should update user', async () => {
  await updateUser(user.id, { name: 'Bob' });
  // Depends on previous test
});

// ✅ Good: Each test is independent
it('should create user', async () => {
  const user = await createUser('Alice');
  expect(user.name).toBe('Alice');
});

it('should update user', async () => {
  const user = await createUser('Alice');
  await updateUser(user.id, { name: 'Bob' });
  const updated = await getUser(user.id);
  expect(updated.name).toBe('Bob');
});
```

## 🚀 Quick Start

### Install Testing Tools

```bash
# Vitest (recommended for new projects)
npm install -D vitest @vitest/ui

# Jest (traditional)
npm install -D jest ts-jest @types/jest

# Playwright (E2E)
npm install -D @playwright/test
npx playwright install

# Type testing
npm install -D tsd
# or
npm install -D expect-type

# Property-based testing
npm install -D @fast-check/vitest
```

### Run Tests

```bash
# Vitest
npm test              # Run tests
npm test -- --ui      # Open UI
npm test -- --coverage # Coverage report

# Jest
npm test              # Run tests
npm test -- --watch   # Watch mode
npm test -- --coverage # Coverage

# Playwright
npx playwright test   # Run E2E tests
npx playwright test --ui # UI mode
npx playwright show-report # View report

# Type tests
npm run test:types    # Run tsd
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Fast-check Documentation](https://fast-check.dev/)
- [Kent C. Dodds Testing Blog](https://kentcdodds.com/blog?q=testing)

## ✅ Module Completion Checklist

Before moving forward, ensure you can:

- [ ] Write unit tests for functions and classes
- [ ] Mock dependencies type-safely
- [ ] Test async code effectively
- [ ] Set up and run integration tests
- [ ] Create E2E tests for user workflows
- [ ] Achieve meaningful test coverage
- [ ] Follow TDD workflow
- [ ] Test TypeScript types
- [ ] Use property-based testing when appropriate

## 🚀 Next Steps

Once you complete this module:
- [Module 7: Advanced Patterns & Architecture](../07-architecture/README.md) - Architectural patterns
- [Module 9: Real-World Projects](../09-projects/README.md) - Apply testing to real projects
- [Module 10: Production Best Practices](../10-production/README.md) - Production deployment

---

**Ready to master testing?** Well-tested code is maintainable code!

**Questions?** Check the [Troubleshooting Guide](../../resources/troubleshooting.md) or open an issue.
