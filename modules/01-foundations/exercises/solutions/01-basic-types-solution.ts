/**
 * Exercise 1: Basic Types - Product Inventory System
 *
 * This solution demonstrates:
 * - Enum usage
 * - Interface definition
 * - Optional properties
 * - Array methods with type safety
 * - Function type annotations
 */

// Define product categories as an enum
enum Category {
  Electronics = "Electronics",
  Clothing = "Clothing",
  Food = "Food",
  Books = "Books"
}

// Define the Product interface
interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  category: Category;
  tags?: string[]; // Optional property
}

/**
 * Calculate the total price of all products in stock
 * @param products - Array of products
 * @returns Total price of in-stock products
 */
function calculateTotal(products: Product[]): number {
  return products
    .filter(product => product.inStock)
    .reduce((total, product) => total + product.price, 0);
}

/**
 * Filter products by category
 * @param products - Array of products
 * @param category - Category to filter by
 * @returns Filtered products
 */
function filterByCategory(products: Product[], category: Category): Product[] {
  return products.filter(product => product.category === category);
}

/**
 * Additional utility: Find products by tag
 * @param products - Array of products
 * @param tag - Tag to search for
 * @returns Products containing the tag
 */
function filterByTag(products: Product[], tag: string): Product[] {
  return products.filter(product => product.tags?.includes(tag) ?? false);
}

/**
 * Additional utility: Get out of stock products
 * @param products - Array of products
 * @returns Out of stock products
 */
function getOutOfStock(products: Product[]): Product[] {
  return products.filter(product => !product.inStock);
}

// Example usage
const products: Product[] = [
  {
    id: 1,
    name: "Laptop",
    price: 999.99,
    inStock: true,
    category: Category.Electronics,
    tags: ["computer", "portable", "work"]
  },
  {
    id: 2,
    name: "T-Shirt",
    price: 19.99,
    inStock: true,
    category: Category.Clothing,
    tags: ["casual", "cotton"]
  },
  {
    id: 3,
    name: "Apple",
    price: 0.99,
    inStock: false,
    category: Category.Food
  },
  {
    id: 4,
    name: "TypeScript Handbook",
    price: 39.99,
    inStock: true,
    category: Category.Books,
    tags: ["programming", "reference"]
  },
  {
    id: 5,
    name: "Headphones",
    price: 149.99,
    inStock: false,
    category: Category.Electronics,
    tags: ["audio", "wireless"]
  }
];

// Test the functions
console.log("=== Product Inventory System ===\n");

console.log("All products:", products.length);

const total = calculateTotal(products);
console.log(`\nTotal value of in-stock products: $${total.toFixed(2)}`);

const electronics = filterByCategory(products, Category.Electronics);
console.log(`\nElectronics (${electronics.length}):`, electronics.map(p => p.name));

const clothing = filterByCategory(products, Category.Clothing);
console.log(`Clothing (${clothing.length}):`, clothing.map(p => p.name));

const programmingBooks = filterByTag(products, "programming");
console.log(`\nProgramming items (${programmingBooks.length}):`, programmingBooks.map(p => p.name));

const outOfStock = getOutOfStock(products);
console.log(`\nOut of stock (${outOfStock.length}):`, outOfStock.map(p => p.name));

// Advanced: Group products by category
function groupByCategory(products: Product[]): Record<Category, Product[]> {
  return products.reduce((groups, product) => {
    const category = product.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {} as Record<Category, Product[]>);
}

console.log("\n=== Grouped by Category ===");
const grouped = groupByCategory(products);
for (const [category, items] of Object.entries(grouped)) {
  console.log(`${category}: ${items.length} items`);
}

export { Category, Product, calculateTotal, filterByCategory, filterByTag, getOutOfStock };
