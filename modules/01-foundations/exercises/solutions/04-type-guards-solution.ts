/**
 * Exercise 4: Type Guards - Payment Processing System
 *
 * This solution demonstrates:
 * - Discriminated unions
 * - Type guards with type predicates
 * - Exhaustiveness checking
 * - Pattern matching with switch
 * - Type-safe payment processing
 */

// Payment method types (discriminated union)
interface CreditCard {
  type: 'credit';
  cardNumber: string;
  cvv: string;
  expiry: string;
  cardholderName: string;
}

interface PayPal {
  type: 'paypal';
  email: string;
}

interface Bitcoin {
  type: 'bitcoin';
  walletAddress: string;
}

// Union type for all payment methods
type PaymentMethod = CreditCard | PayPal | Bitcoin;

/**
 * Type guard for CreditCard
 */
function isCreditCard(payment: PaymentMethod): payment is CreditCard {
  return payment.type === 'credit';
}

/**
 * Type guard for PayPal
 */
function isPayPal(payment: PaymentMethod): payment is PayPal {
  return payment.type === 'paypal';
}

/**
 * Type guard for Bitcoin
 */
function isBitcoin(payment: PaymentMethod): payment is Bitcoin {
  return payment.type === 'bitcoin';
}

/**
 * Process payment based on payment method
 */
function processPayment(payment: PaymentMethod, amount: number): string {
  // Using type guards with if-else
  if (isCreditCard(payment)) {
    return processCreditCard(payment, amount);
  } else if (isPayPal(payment)) {
    return processPayPal(payment, amount);
  } else if (isBitcoin(payment)) {
    return processBitcoin(payment, amount);
  } else {
    // Exhaustiveness check - TypeScript knows all cases are handled
    const exhaustiveCheck: never = payment;
    throw new Error(`Unhandled payment type: ${exhaustiveCheck}`);
  }
}

/**
 * Alternative: Process payment using switch (preferred for discriminated unions)
 */
function processPaymentSwitch(payment: PaymentMethod, amount: number): string {
  switch (payment.type) {
    case 'credit':
      return processCreditCard(payment, amount);
    case 'paypal':
      return processPayPal(payment, amount);
    case 'bitcoin':
      return processBitcoin(payment, amount);
    default:
      // Exhaustiveness check
      const exhaustiveCheck: never = payment;
      throw new Error(`Unhandled payment type: ${exhaustiveCheck}`);
  }
}

/**
 * Process credit card payment
 */
function processCreditCard(payment: CreditCard, amount: number): string {
  // Validate credit card
  if (!isValidCreditCard(payment)) {
    throw new Error('Invalid credit card details');
  }

  // In real app, integrate with payment gateway
  const maskedCard = payment.cardNumber.replace(/\d(?=\d{4})/g, '*');
  return `Charged $${amount.toFixed(2)} to credit card ${maskedCard}`;
}

/**
 * Process PayPal payment
 */
function processPayPal(payment: PayPal, amount: number): string {
  // Validate email
  if (!isValidEmail(payment.email)) {
    throw new Error('Invalid PayPal email');
  }

  return `Charged $${amount.toFixed(2)} to PayPal account ${payment.email}`;
}

/**
 * Process Bitcoin payment
 */
function processBitcoin(payment: Bitcoin, amount: number): string {
  // Validate wallet address
  if (!isValidBitcoinAddress(payment.walletAddress)) {
    throw new Error('Invalid Bitcoin wallet address');
  }

  return `Charged ${(amount / 40000).toFixed(8)} BTC to wallet ${payment.walletAddress}`;
}

/**
 * Validation helpers
 */
function isValidCreditCard(card: CreditCard): boolean {
  // Basic validation (in real app, use Luhn algorithm)
  return (
    card.cardNumber.length === 16 &&
    card.cvv.length === 3 &&
    /^\d{2}\/\d{2}$/.test(card.expiry)
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidBitcoinAddress(address: string): boolean {
  // Simplified validation
  return address.length >= 26 && address.length <= 35;
}

/**
 * Get payment method description
 */
function getPaymentDescription(payment: PaymentMethod): string {
  switch (payment.type) {
    case 'credit':
      return `Credit Card ending in ${payment.cardNumber.slice(-4)}`;
    case 'paypal':
      return `PayPal (${payment.email})`;
    case 'bitcoin':
      return `Bitcoin (${payment.walletAddress.slice(0, 8)}...)`;
  }
}

/**
 * Calculate processing fee based on payment method
 */
function calculateProcessingFee(payment: PaymentMethod, amount: number): number {
  switch (payment.type) {
    case 'credit':
      return amount * 0.029 + 0.3; // 2.9% + $0.30
    case 'paypal':
      return amount * 0.034 + 0.3; // 3.4% + $0.30
    case 'bitcoin':
      return amount * 0.01; // 1%
  }
}

// Example usage and tests
console.log('=== Payment Processing System ===\n');

// Create payment methods
const creditCard: CreditCard = {
  type: 'credit',
  cardNumber: '4532123456789012',
  cvv: '123',
  expiry: '12/25',
  cardholderName: 'John Doe',
};

const paypal: PayPal = {
  type: 'paypal',
  email: 'user@example.com',
};

const bitcoin: Bitcoin = {
  type: 'bitcoin',
  walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
};

const amount = 100.00;

// Test 1: Process credit card
try {
  const result = processPayment(creditCard, amount);
  console.log('Credit Card:', result);
  const fee = calculateProcessingFee(creditCard, amount);
  console.log(`  Fee: $${fee.toFixed(2)}`);
} catch (error) {
  console.error('Error:', (error as Error).message);
}

// Test 2: Process PayPal
try {
  const result = processPayment(paypal, amount);
  console.log('\nPayPal:', result);
  const fee = calculateProcessingFee(paypal, amount);
  console.log(`  Fee: $${fee.toFixed(2)}`);
} catch (error) {
  console.error('Error:', (error as Error).message);
}

// Test 3: Process Bitcoin
try {
  const result = processPayment(bitcoin, amount);
  console.log('\nBitcoin:', result);
  const fee = calculateProcessingFee(bitcoin, amount);
  console.log(`  Fee: $${fee.toFixed(2)}`);
} catch (error) {
  console.error('Error:', (error as Error).message);
}

// Test 4: Invalid credit card
const invalidCard: CreditCard = {
  type: 'credit',
  cardNumber: '123', // Invalid
  cvv: '12', // Invalid
  expiry: '13/25', // Invalid
  cardholderName: 'Invalid User',
};

try {
  const result = processPayment(invalidCard, amount);
  console.log('\nInvalid Card:', result);
} catch (error) {
  console.log('\n✓ Caught expected error:', (error as Error).message);
}

// Test 5: Get descriptions
console.log('\n=== Payment Descriptions ===');
console.log('Credit Card:', getPaymentDescription(creditCard));
console.log('PayPal:', getPaymentDescription(paypal));
console.log('Bitcoin:', getPaymentDescription(bitcoin));

// Test 6: Type narrowing in action
function printPaymentDetails(payment: PaymentMethod): void {
  console.log(`\nPayment type: ${payment.type}`);

  if (isCreditCard(payment)) {
    // TypeScript knows this is CreditCard
    console.log(`  Card: **** **** **** ${payment.cardNumber.slice(-4)}`);
    console.log(`  Expiry: ${payment.expiry}`);
    console.log(`  Cardholder: ${payment.cardholderName}`);
  } else if (isPayPal(payment)) {
    // TypeScript knows this is PayPal
    console.log(`  Email: ${payment.email}`);
  } else {
    // TypeScript knows this is Bitcoin
    console.log(`  Wallet: ${payment.walletAddress}`);
  }
}

console.log('\n=== Detailed Payment Info ===');
printPaymentDetails(creditCard);
printPaymentDetails(paypal);
printPaymentDetails(bitcoin);

export {
  PaymentMethod,
  CreditCard,
  PayPal,
  Bitcoin,
  isCreditCard,
  isPayPal,
  isBitcoin,
  processPayment,
  getPaymentDescription,
  calculateProcessingFee,
};
