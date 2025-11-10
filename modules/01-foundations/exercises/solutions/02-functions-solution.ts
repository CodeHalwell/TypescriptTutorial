/**
 * Exercise 2: Functions - User Validation System
 *
 * This solution demonstrates:
 * - Function type annotations
 * - Input validation
 * - Function overloads
 * - Error handling
 * - Regular expressions
 * - Optional parameters
 */

interface User {
  username: string;
  email: string;
  age?: number;
  password: string;
}

/**
 * Validates username (3-20 characters, alphanumeric and underscore)
 */
function validateUsername(username: string): boolean {
  if (username.length < 3 || username.length > 20) {
    return false;
  }
  // Only alphanumeric and underscore
  return /^[a-zA-Z0-9_]+$/.test(username);
}

/**
 * Validates email format
 */
function validateEmail(email: string): boolean {
  // Basic email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates age (13-120)
 */
function validateAge(age: number): boolean {
  return age >= 13 && age <= 120;
}

/**
 * Validates password (minimum 8 characters)
 */
function validatePassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Creates a user without age
 */
function createUser(username: string, email: string, password: string): User;

/**
 * Creates a user with age
 */
function createUser(
  username: string,
  email: string,
  password: string,
  age: number
): User;

/**
 * Implementation of createUser with validation
 */
function createUser(
  username: string,
  email: string,
  password: string,
  age?: number
): User {
  // Validate username
  if (!validateUsername(username)) {
    throw new Error(
      'Invalid username: Must be 3-20 characters, alphanumeric and underscore only'
    );
  }

  // Validate email
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }

  // Validate password
  if (!validatePassword(password)) {
    throw new Error('Invalid password: Must be at least 8 characters');
  }

  // Validate age if provided
  if (age !== undefined && !validateAge(age)) {
    throw new Error('Invalid age: Must be between 13 and 120');
  }

  // Create user object
  const user: User = {
    username,
    email,
    password, // In real app, this would be hashed
  };

  if (age !== undefined) {
    user.age = age;
  }

  return user;
}

/**
 * Additional: Validate all fields and return detailed errors
 */
interface ValidationResult {
  isValid: boolean;
  errors: {
    username?: string;
    email?: string;
    password?: string;
    age?: string;
  };
}

function validateUserInput(
  username: string,
  email: string,
  password: string,
  age?: number
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: {},
  };

  if (!validateUsername(username)) {
    result.isValid = false;
    result.errors.username =
      'Username must be 3-20 characters, alphanumeric and underscore only';
  }

  if (!validateEmail(email)) {
    result.isValid = false;
    result.errors.email = 'Invalid email format';
  }

  if (!validatePassword(password)) {
    result.isValid = false;
    result.errors.password = 'Password must be at least 8 characters';
  }

  if (age !== undefined && !validateAge(age)) {
    result.isValid = false;
    result.errors.age = 'Age must be between 13 and 120';
  }

  return result;
}

// Example usage and tests
console.log('=== User Validation System ===\n');

// Test 1: Valid user without age
try {
  const user1 = createUser('john_doe', 'john@example.com', 'password123');
  console.log('✓ User created successfully:', user1.username);
} catch (error) {
  console.error('✗ Error:', (error as Error).message);
}

// Test 2: Valid user with age
try {
  const user2 = createUser('jane_smith', 'jane@example.com', 'securepass', 25);
  console.log('✓ User created successfully:', user2.username, `(age: ${user2.age})`);
} catch (error) {
  console.error('✗ Error:', (error as Error).message);
}

// Test 3: Invalid username (too short)
try {
  const user3 = createUser('ab', 'test@example.com', 'password123');
  console.log('✓ User created:', user3.username);
} catch (error) {
  console.log('✓ Caught expected error:', (error as Error).message);
}

// Test 4: Invalid email
try {
  const user4 = createUser('valid_user', 'invalid-email', 'password123');
  console.log('✓ User created:', user4.username);
} catch (error) {
  console.log('✓ Caught expected error:', (error as Error).message);
}

// Test 5: Invalid password (too short)
try {
  const user5 = createUser('valid_user', 'test@example.com', 'pass');
  console.log('✓ User created:', user5.username);
} catch (error) {
  console.log('✓ Caught expected error:', (error as Error).message);
}

// Test 6: Invalid age
try {
  const user6 = createUser('valid_user', 'test@example.com', 'password123', 10);
  console.log('✓ User created:', user6.username);
} catch (error) {
  console.log('✓ Caught expected error:', (error as Error).message);
}

// Test 7: Detailed validation
console.log('\n=== Detailed Validation ===');
const validation = validateUserInput('ab', 'invalid', 'pass', 10);
console.log('Is valid:', validation.isValid);
if (!validation.isValid) {
  console.log('Errors:');
  Object.entries(validation.errors).forEach(([field, message]) => {
    console.log(`  - ${field}: ${message}`);
  });
}

// Test 8: All valid
const validation2 = validateUserInput('john_doe', 'john@example.com', 'password123', 25);
console.log('\nAll valid:', validation2.isValid);

export {
  User,
  validateUsername,
  validateEmail,
  validateAge,
  validatePassword,
  createUser,
  validateUserInput,
};
