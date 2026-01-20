import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Meal } from '../../types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface MealCardProps {
  meal: Meal;
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
}

export function MealCard({ meal, onEdit, onDelete }: MealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't toggle expand when clicking delete
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete(meal);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't toggle expand when clicking edit
    onEdit(meal);
  };

  return (
    <div className="bg-white rounded-soft shadow-soft hover:shadow-lifted overflow-hidden transition-shadow duration-200 transition-spring">
      {/* Collapsed Header - Always visible, clickable to expand */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-cream/30 transition-colors duration-200 transition-spring"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`meal-details-${meal.id}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Small thumbnail if image exists */}
          {meal.imageUrl && (
            <img
              src={meal.imageUrl}
              alt=""
              className="w-10 h-10 rounded-soft object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-charcoal truncate">
              {meal.name}
            </h3>
            <p className="text-xs text-charcoal/60">
              {meal.isBaking ? `Qty: ${meal.servings}` : `${meal.servings} servings`} • {meal.ingredients.length} ingredient{meal.ingredients.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-2">
          {/* Expand indicator with spring animation */}
          <span
            className={`text-xs text-charcoal/50 transition-transform duration-300 transition-spring ${
              isExpanded ? 'rotate-180' : 'rotate-0'
            }`}
          >
            ▼
          </span>
          {/* Delete button */}
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={handleDeleteClick}
            className="rounded-full hover:bg-red-50 active:bg-red-100"
            aria-label={`Delete ${meal.name}`}
          >
            <span className="text-lg">🗑️</span>
          </Button>
        </div>
      </div>

      {/* Expanded Content with spring animation */}
      <div
        id={`meal-details-${meal.id}`}
        className={`border-t border-charcoal/10 overflow-hidden transition-all duration-300 transition-spring ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {isExpanded && (
          <div className="p-4 space-y-4">
            {/* Photo and Servings Row */}
            <div className="flex gap-4">
              {/* Square Photo */}
              {meal.imageUrl && (
                <img
                  src={meal.imageUrl}
                  alt={meal.name}
                  className="w-48 h-48 rounded-soft object-cover flex-shrink-0"
                />
              )}
              {/* Servings/Quantity Info */}
              <div className="flex-1">
                <div className="text-sm text-charcoal/70">
                  <span className="font-medium text-charcoal">{meal.isBaking ? 'Quantity:' : 'Servings:'}</span> {meal.servings}
                </div>
                <p className="text-xs text-charcoal/50 mt-1">
                  {meal.isBaking ? 'How many this recipe makes' : 'How many people this recipe serves'}
                </p>
              </div>
            </div>

            {/* Ingredients List */}
            <div>
              <h4 className="text-sm font-medium text-charcoal mb-2">
                Ingredients ({meal.ingredients.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {meal.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-cream rounded-soft text-sm text-charcoal/80"
                  >
                    {ing.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Recipe Section */}
            {meal.instructions && meal.instructions.trim() && (
              <div>
                <h4 className="text-sm font-medium text-charcoal mb-2">Recipe</h4>
                <div className="bg-cream/50 rounded-soft p-3">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="text-sm text-charcoal/80 mb-2 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="text-sm text-charcoal/80 list-disc list-inside mb-2 last:mb-0 space-y-1">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="text-sm text-charcoal/80 list-decimal list-inside mb-2 last:mb-0 space-y-1">{children}</ol>
                      ),
                      li: ({ children }) => <li>{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      del: ({ children }) => <del className="line-through">{children}</del>,
                      h1: ({ children }) => (
                        <h3 className="text-lg font-bold text-charcoal mb-2 mt-3 first:mt-0">{children}</h3>
                      ),
                      h2: ({ children }) => (
                        <h4 className="text-base font-semibold text-charcoal mb-2 mt-3 first:mt-0">{children}</h4>
                      ),
                      h3: ({ children }) => (
                        <h5 className="text-sm font-semibold text-charcoal mb-1 mt-2 first:mt-0">{children}</h5>
                      ),
                      h4: ({ children }) => (
                        <h6 className="text-sm font-medium text-charcoal mb-1 mt-2 first:mt-0">{children}</h6>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-terracotta/50 pl-3 italic text-charcoal/70 my-2">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-charcoal/10 px-1 rounded text-sm">{children}</code>
                      ),
                      hr: () => <hr className="border-charcoal/20 my-3" />,
                    }}
                  >
                    {meal.instructions}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Edit Button */}
            <Button
              size="lg"
              onClick={handleEditClick}
              className="w-full"
            >
              <span>✏️</span>
              <span>Edit Meal</span>
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-cream rounded-soft max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-charcoal">
              Delete Meal?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-charcoal/70">
              Are you sure you want to delete &quot;{meal.name}&quot;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3">
            <AlertDialogCancel className="flex-1 h-11 rounded-soft border border-charcoal/20 text-charcoal text-sm font-medium hover:bg-charcoal/5 active:bg-charcoal/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="flex-1 h-11 rounded-soft bg-destructive text-white text-sm font-medium hover:bg-destructive/90 active:bg-destructive/80"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
