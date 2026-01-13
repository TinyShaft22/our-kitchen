import type { Category, Store } from '../types';

interface ParsedItem {
  name: string;
  category: Category;
  store: Store;
}

// Common grocery items mapped to categories
const ITEM_CATEGORIES: Record<string, Category> = {
  // Produce
  apple: 'produce',
  apples: 'produce',
  banana: 'produce',
  bananas: 'produce',
  orange: 'produce',
  oranges: 'produce',
  lemon: 'produce',
  lemons: 'produce',
  lime: 'produce',
  limes: 'produce',
  avocado: 'produce',
  avocados: 'produce',
  tomato: 'produce',
  tomatoes: 'produce',
  potato: 'produce',
  potatoes: 'produce',
  onion: 'produce',
  onions: 'produce',
  garlic: 'produce',
  carrot: 'produce',
  carrots: 'produce',
  celery: 'produce',
  lettuce: 'produce',
  spinach: 'produce',
  kale: 'produce',
  broccoli: 'produce',
  cauliflower: 'produce',
  cucumber: 'produce',
  cucumbers: 'produce',
  pepper: 'produce',
  peppers: 'produce',
  'bell pepper': 'produce',
  'bell peppers': 'produce',
  mushroom: 'produce',
  mushrooms: 'produce',
  zucchini: 'produce',
  squash: 'produce',
  corn: 'produce',
  'green beans': 'produce',
  asparagus: 'produce',
  cabbage: 'produce',
  berries: 'produce',
  strawberries: 'produce',
  blueberries: 'produce',
  raspberries: 'produce',
  grapes: 'produce',
  melon: 'produce',
  watermelon: 'produce',
  cantaloupe: 'produce',
  pineapple: 'produce',
  mango: 'produce',
  mangoes: 'produce',
  peach: 'produce',
  peaches: 'produce',
  pear: 'produce',
  pears: 'produce',
  plum: 'produce',
  plums: 'produce',
  cherries: 'produce',
  ginger: 'produce',
  cilantro: 'produce',
  parsley: 'produce',
  basil: 'produce',
  mint: 'produce',
  jalapeño: 'produce',
  jalapeno: 'produce',

  // Dairy
  milk: 'dairy',
  egg: 'dairy',
  eggs: 'dairy',
  cheese: 'dairy',
  butter: 'dairy',
  yogurt: 'dairy',
  'sour cream': 'dairy',
  'cream cheese': 'dairy',
  'heavy cream': 'dairy',
  cream: 'dairy',
  'half and half': 'dairy',
  'cottage cheese': 'dairy',
  'string cheese': 'dairy',
  parmesan: 'dairy',
  mozzarella: 'dairy',
  cheddar: 'dairy',
  'shredded cheese': 'dairy',
  'almond milk': 'dairy',
  'oat milk': 'dairy',
  'soy milk': 'dairy',

  // Meat
  chicken: 'meat',
  'chicken breast': 'meat',
  'chicken thighs': 'meat',
  beef: 'meat',
  'ground beef': 'meat',
  steak: 'meat',
  pork: 'meat',
  'pork chops': 'meat',
  bacon: 'meat',
  sausage: 'meat',
  'ground turkey': 'meat',
  turkey: 'meat',
  ham: 'meat',
  'lunch meat': 'meat',
  'deli meat': 'meat',
  fish: 'meat',
  salmon: 'meat',
  tuna: 'meat',
  shrimp: 'meat',
  'hot dogs': 'meat',
  'ground pork': 'meat',
  ribs: 'meat',
  lamb: 'meat',

  // Pantry
  rice: 'pantry',
  pasta: 'pantry',
  spaghetti: 'pantry',
  noodles: 'pantry',
  bread: 'pantry',
  'peanut butter': 'pantry',
  jelly: 'pantry',
  jam: 'pantry',
  cereal: 'pantry',
  oatmeal: 'pantry',
  'olive oil': 'pantry',
  oil: 'pantry',
  vinegar: 'pantry',
  salt: 'pantry',
  'soy sauce': 'pantry',
  'tomato sauce': 'pantry',
  'pasta sauce': 'pantry',
  'canned tomatoes': 'pantry',
  beans: 'pantry',
  'black beans': 'pantry',
  'kidney beans': 'pantry',
  lentils: 'pantry',
  'chicken broth': 'pantry',
  broth: 'pantry',
  stock: 'pantry',
  soup: 'pantry',
  'canned soup': 'pantry',
  honey: 'pantry',
  'maple syrup': 'pantry',
  ketchup: 'pantry',
  mustard: 'pantry',
  mayo: 'pantry',
  mayonnaise: 'pantry',
  'hot sauce': 'pantry',
  salsa: 'pantry',
  tortillas: 'pantry',
  crackers: 'pantry',
  nuts: 'pantry',
  almonds: 'pantry',
  walnuts: 'pantry',
  peanuts: 'pantry',
  'dried fruit': 'pantry',
  raisins: 'pantry',
  quinoa: 'pantry',
  couscous: 'pantry',

  // Frozen
  'ice cream': 'frozen',
  'frozen pizza': 'frozen',
  'frozen vegetables': 'frozen',
  'frozen fruit': 'frozen',
  'frozen berries': 'frozen',
  'frozen chicken': 'frozen',
  'frozen fish': 'frozen',
  'frozen shrimp': 'frozen',
  'ice': 'frozen',
  'frozen waffles': 'frozen',
  'frozen fries': 'frozen',
  'french fries': 'frozen',
  popsicles: 'frozen',

  // Bakery
  bagels: 'bakery',
  muffins: 'bakery',
  croissants: 'bakery',
  rolls: 'bakery',
  buns: 'bakery',
  'hamburger buns': 'bakery',
  'hot dog buns': 'bakery',
  donuts: 'bakery',
  doughnuts: 'bakery',
  cake: 'bakery',
  pie: 'bakery',
  cookies: 'bakery',
  brownies: 'bakery',
  'french bread': 'bakery',
  baguette: 'bakery',

  // Snacks
  chips: 'snacks',
  'potato chips': 'snacks',
  'tortilla chips': 'snacks',
  pretzels: 'snacks',
  popcorn: 'snacks',
  candy: 'snacks',
  chocolate: 'snacks',
  'granola bars': 'snacks',
  'protein bars': 'snacks',
  'fruit snacks': 'snacks',
  'trail mix': 'snacks',
  goldfish: 'snacks',
  cheezits: 'snacks',
  'cheez its': 'snacks',
  oreos: 'snacks',

  // Beverages
  water: 'beverages',
  'bottled water': 'beverages',
  juice: 'beverages',
  'orange juice': 'beverages',
  'apple juice': 'beverages',
  soda: 'beverages',
  'sparkling water': 'beverages',
  'la croix': 'beverages',
  coffee: 'beverages',
  tea: 'beverages',
  'iced tea': 'beverages',
  lemonade: 'beverages',
  'sports drink': 'beverages',
  gatorade: 'beverages',
  beer: 'beverages',
  wine: 'beverages',
  'energy drink': 'beverages',
  kombucha: 'beverages',

  // Baking
  flour: 'baking',
  sugar: 'baking',
  'brown sugar': 'baking',
  'powdered sugar': 'baking',
  'baking soda': 'baking',
  'baking powder': 'baking',
  yeast: 'baking',
  'vanilla extract': 'baking',
  vanilla: 'baking',
  'chocolate chips': 'baking',
  cocoa: 'baking',
  'cocoa powder': 'baking',
  'cake mix': 'baking',
  frosting: 'baking',
  sprinkles: 'baking',
  'food coloring': 'baking',
  cornstarch: 'baking',
  'corn starch': 'baking',
};

// Items that are typically bought at specific stores
const ITEM_STORES: Record<string, Store> = {
  // Costco items (bulk)
  'toilet paper': 'costco',
  'paper towels': 'costco',
  'laundry detergent': 'costco',
  'dish soap': 'costco',

  // Trader Joe's specialties
  'everything but the bagel': 'trader-joes',
  'cauliflower gnocchi': 'trader-joes',
  'mandarin chicken': 'trader-joes',
};

/**
 * Parse a voice transcript into individual grocery items with categories
 */
export function parseGroceryItems(transcript: string): ParsedItem[] {
  // Normalize the transcript
  const normalized = transcript
    .toLowerCase()
    .trim()
    // Remove filler words
    .replace(/\b(um|uh|like|so|well|okay|oh|and also|also)\b/g, ' ')
    // Normalize "and" variations
    .replace(/\s+and\s+/g, ', ')
    // Handle "some" prefix
    .replace(/\bsome\s+/g, '')
    // Handle "a" or "an" prefix
    .replace(/\b(a|an)\s+/g, '')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();

  // Split on common separators
  const rawItems = normalized
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  // Process each item
  const parsedItems: ParsedItem[] = [];

  for (const rawItem of rawItems) {
    // Skip empty or very short items
    if (rawItem.length < 2) continue;

    // Try to find the best category match
    const category = findCategory(rawItem);
    const store = findStore(rawItem);

    parsedItems.push({
      name: capitalizeItem(rawItem),
      category,
      store,
    });
  }

  return parsedItems;
}

/**
 * Find the best category for an item
 */
function findCategory(item: string): Category {
  const lowerItem = item.toLowerCase();

  // Direct match
  if (ITEM_CATEGORIES[lowerItem]) {
    return ITEM_CATEGORIES[lowerItem];
  }

  // Check if item contains a known keyword
  for (const [keyword, category] of Object.entries(ITEM_CATEGORIES)) {
    if (lowerItem.includes(keyword) || keyword.includes(lowerItem)) {
      return category;
    }
  }

  // Default to pantry
  return 'pantry';
}

/**
 * Find the best store for an item
 */
function findStore(item: string): Store {
  const lowerItem = item.toLowerCase();

  // Direct match
  if (ITEM_STORES[lowerItem]) {
    return ITEM_STORES[lowerItem];
  }

  // Check if item contains a known keyword
  for (const [keyword, store] of Object.entries(ITEM_STORES)) {
    if (lowerItem.includes(keyword)) {
      return store;
    }
  }

  // Default to safeway
  return 'safeway';
}

/**
 * Capitalize item name properly
 */
function capitalizeItem(item: string): string {
  return item
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
