import type { Meal } from '../types';

/**
 * Represents a node in the folder tree structure
 */
export interface FolderTreeNode {
  name: string;
  fullPath: string;
  children: Map<string, FolderTreeNode>;
  meals: Meal[];
  totalMealCount: number;
}

/**
 * Creates a new empty FolderTreeNode
 */
function createNode(name: string, fullPath: string): FolderTreeNode {
  return {
    name,
    fullPath,
    children: new Map(),
    meals: [],
    totalMealCount: 0,
  };
}

/**
 * Builds a tree structure from a flat list of meals by parsing "/" delimited paths
 * Meals without a subcategory are placed at the root level
 */
export function buildFolderTree(meals: Meal[]): FolderTreeNode {
  const root = createNode('', '');

  for (const meal of meals) {
    const path = meal.subcategory?.trim() || '';

    if (!path) {
      // Meal belongs at root level
      root.meals.push(meal);
    } else {
      // Navigate/create path and add meal to appropriate node
      const segments = path.split('/').filter((s) => s.length > 0);
      let currentNode = root;
      let currentPath = '';

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        currentPath = currentPath ? `${currentPath}/${segment}` : segment;

        if (!currentNode.children.has(segment)) {
          currentNode.children.set(segment, createNode(segment, currentPath));
        }

        currentNode = currentNode.children.get(segment)!;

        // Add meal to the final segment (leaf node for this meal's path)
        if (i === segments.length - 1) {
          currentNode.meals.push(meal);
        }
      }
    }
  }

  // Calculate total meal counts (including descendants)
  calculateTotalCounts(root);

  // Sort children alphabetically at each level
  sortChildren(root);

  return root;
}

/**
 * Recursively calculates total meal count for each node (including descendants)
 */
function calculateTotalCounts(node: FolderTreeNode): number {
  let total = node.meals.length;

  for (const child of node.children.values()) {
    total += calculateTotalCounts(child);
  }

  node.totalMealCount = total;
  return total;
}

/**
 * Recursively sorts children alphabetically at each level
 */
function sortChildren(node: FolderTreeNode): void {
  if (node.children.size === 0) return;

  // Get sorted entries
  const sortedEntries = Array.from(node.children.entries()).sort(([a], [b]) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );

  // Rebuild the map in sorted order
  node.children = new Map(sortedEntries);

  // Recursively sort children
  for (const child of node.children.values()) {
    sortChildren(child);
  }
}

/**
 * Returns a sorted array of all unique folder paths from the meals
 * Includes intermediate paths (e.g., if "Broma/Cookies" exists, "Broma" is also included)
 */
export function getAllFolderPaths(meals: Meal[]): string[] {
  const paths = new Set<string>();

  for (const meal of meals) {
    const path = meal.subcategory?.trim();
    if (!path) continue;

    // Add the full path and all intermediate paths
    const segments = path.split('/').filter((s) => s.length > 0);
    let currentPath = '';

    for (const segment of segments) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      paths.add(currentPath);
    }
  }

  // Return sorted array
  return Array.from(paths).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
}

/**
 * Returns the parent path for a given path
 * e.g., "Broma/Cookies" -> "Broma"
 * e.g., "Broma" -> ""
 * e.g., "" -> ""
 */
export function getParentPath(path: string): string {
  if (!path) return '';

  const segments = path.split('/').filter((s) => s.length > 0);

  if (segments.length <= 1) return '';

  return segments.slice(0, -1).join('/');
}

/**
 * Returns the last segment (leaf name) of a path
 * e.g., "Broma/Cookies" -> "Cookies"
 * e.g., "Broma" -> "Broma"
 * e.g., "" -> ""
 */
export function getLeafName(path: string): string {
  if (!path) return '';

  const segments = path.split('/').filter((s) => s.length > 0);

  if (segments.length === 0) return '';

  return segments[segments.length - 1];
}
