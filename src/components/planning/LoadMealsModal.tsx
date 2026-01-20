import { useState, useMemo } from 'react';
import type { Meal } from '../../types';
import { buildFolderTree, type FolderTreeNode } from '../../utils/subcategoryUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, EmptySearch } from '@/components/ui/EmptyState';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';

interface LoadMealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  meals: Meal[];
  onAdd: (mealId: string, servings: number) => Promise<void>;
}

interface FolderSectionProps {
  node: FolderTreeNode;
  depth: number;
  onSelectMeal: (meal: Meal) => void;
}

function FolderSection({ node, depth, onSelectMeal }: FolderSectionProps) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = node.children.size > 0;
  const hasMeals = node.meals.length > 0;

  if (!hasChildren && !hasMeals) return null;

  const sortedMeals = [...node.meals].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className={depth > 0 ? 'ml-4' : ''}>
      {/* Folder header (only show if not root) */}
      {depth > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-2 py-2 px-2 hover:bg-charcoal/5 rounded-soft text-left"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-charcoal/60" />
          ) : (
            <ChevronRight className="h-4 w-4 text-charcoal/60" />
          )}
          {expanded ? (
            <FolderOpen className="h-4 w-4 text-terracotta" />
          ) : (
            <Folder className="h-4 w-4 text-terracotta" />
          )}
          <span className="font-medium text-charcoal">{node.name}</span>
          <span className="text-xs text-charcoal/50">({node.totalMealCount})</span>
        </button>
      )}

      {/* Content (meals and subfolders) */}
      {(expanded || depth === 0) && (
        <div className={depth > 0 ? 'ml-2 border-l border-charcoal/10 pl-2' : ''}>
          {/* Meals at this level */}
          {sortedMeals.map((meal) => (
            <button
              key={meal.id}
              onClick={() => onSelectMeal(meal)}
              className="w-full flex items-center gap-3 p-3 hover:bg-white rounded-soft transition-colors text-left"
            >
              {meal.imageUrl ? (
                <img
                  src={meal.imageUrl}
                  alt=""
                  className="w-10 h-10 rounded-soft object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-soft bg-terracotta/10 flex items-center justify-center flex-shrink-0">
                  <span>{meal.isBaking ? '🧁' : '🍽️'}</span>
                </div>
              )}
              <span className="font-medium text-charcoal truncate">{meal.name}</span>
              <span className="text-terracotta text-sm ml-auto">→</span>
            </button>
          ))}

          {/* Child folders */}
          {Array.from(node.children.values()).map((child) => (
            <FolderSection
              key={child.fullPath}
              node={child}
              depth={depth + 1}
              onSelectMeal={onSelectMeal}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function LoadMealsModal({ isOpen, onClose, meals, onAdd }: LoadMealsModalProps) {
  const [search, setSearch] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [servings, setServings] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter meals that are not baking (main dishes only)
  const mainDishes = useMemo(
    () => meals.filter((m) => !m.isBaking),
    [meals]
  );

  // Build folder tree from main dishes
  const folderTree = useMemo(
    () => buildFolderTree(mainDishes),
    [mainDishes]
  );

  // Search-filtered meals (flat list when searching)
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const searchLower = search.toLowerCase();
    return mainDishes
      .filter((m) => m.name.toLowerCase().includes(searchLower))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [mainDishes, search]);

  const handleClose = () => {
    setSearch('');
    setSelectedMeal(null);
    setServings(1);
    setError(null);
    onClose();
  };

  const handleSelectMeal = (meal: Meal) => {
    setSelectedMeal(meal);
    setServings(meal.servings);
  };

  const handleBack = () => {
    setSelectedMeal(null);
    setServings(1);
  };

  const handleConfirm = async () => {
    if (!selectedMeal) return;

    setSaving(true);
    setError(null);

    try {
      await onAdd(selectedMeal.id, servings);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add meal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-cream rounded-softer max-w-lg max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <DialogHeader className="sticky top-0 bg-cream border-b border-charcoal/10 px-4 py-3 flex flex-row items-center justify-between z-10 space-y-0">
          <Button
            variant="ghost"
            onClick={selectedMeal ? handleBack : handleClose}
            className="w-11 h-11 rounded-full hover:bg-charcoal/5 text-charcoal p-0"
            aria-label={selectedMeal ? 'Back' : 'Close'}
          >
            <span className="text-2xl">{selectedMeal ? '←' : '×'}</span>
          </Button>
          <DialogTitle className="text-lg font-semibold text-charcoal">
            {selectedMeal ? 'Set Servings' : 'Load Meals'}
          </DialogTitle>
          {selectedMeal ? (
            <Button
              onClick={handleConfirm}
              disabled={saving}
              className="w-11 h-11 rounded-full bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50 p-0"
              aria-label="Confirm"
            >
              {saving ? (
                <span className="text-sm">...</span>
              ) : (
                <span className="text-lg font-bold">&#10003;</span>
              )}
            </Button>
          ) : (
            <div className="w-11" />
          )}
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-soft text-sm mb-4">
              {error}
            </div>
          )}

          {selectedMeal ? (
            /* Servings Selection */
            <div className="space-y-4">
              {/* Meal Preview */}
              <div className="flex items-center gap-4 p-4 bg-white rounded-soft">
                {selectedMeal.imageUrl ? (
                  <img
                    src={selectedMeal.imageUrl}
                    alt=""
                    className="w-16 h-16 rounded-soft object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-soft bg-terracotta/20 flex items-center justify-center">
                    <span className="text-2xl">🍽️</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-charcoal truncate">
                    {selectedMeal.name}
                  </h3>
                  <p className="text-sm text-charcoal/60">
                    Recipe serves {selectedMeal.servings}
                  </p>
                </div>
              </div>

              {/* Servings Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">
                  How many servings?
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    className="w-12 h-12 rounded-full border-charcoal/20 text-charcoal text-xl"
                    disabled={servings <= 1}
                  >
                    −
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    value={servings}
                    onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 h-12 text-center text-xl font-medium"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setServings(Math.min(99, servings + 1))}
                    className="w-12 h-12 rounded-full border-charcoal/20 text-charcoal text-xl"
                    disabled={servings >= 99}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Meal List with Folders */
            <div className="space-y-4">
              {/* Search */}
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search meals..."
                className="h-11"
              />

              {/* Content */}
              {mainDishes.length === 0 ? (
                <EmptyState
                  icon="🍽️"
                  title="No meals yet"
                  description="Add some meals to your library first!"
                  variant="terracotta"
                />
              ) : searchResults !== null ? (
                /* Search Results (flat list) */
                searchResults.length === 0 ? (
                  <EmptySearch />
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((meal) => (
                      <button
                        key={meal.id}
                        onClick={() => handleSelectMeal(meal)}
                        className="w-full flex items-center gap-3 p-3 bg-white rounded-soft hover:shadow-soft transition-shadow text-left"
                      >
                        {meal.imageUrl ? (
                          <img
                            src={meal.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-soft object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-soft bg-terracotta/10 flex items-center justify-center">
                            <span>🍽️</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-charcoal truncate">
                            {meal.name}
                          </h3>
                          {meal.subcategory && (
                            <p className="text-xs text-charcoal/50 truncate">
                              {meal.subcategory}
                            </p>
                          )}
                        </div>
                        <span className="text-terracotta text-sm">→</span>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                /* Folder Tree */
                <FolderSection node={folderTree} depth={0} onSelectMeal={handleSelectMeal} />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
