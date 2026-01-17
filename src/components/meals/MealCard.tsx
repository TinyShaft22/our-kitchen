import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Meal } from '../../types';

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

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't toggle expand when clicking edit
    onEdit(meal);
  };

  return (
    <div className="bg-white rounded-soft shadow-soft overflow-hidden">
      {/* Collapsed Header - Always visible, clickable to expand */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-cream/30 transition-colors"
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
            <p className="text-xs text-warm-gray">
              {meal.isBaking ? `Qty: ${meal.servings}` : `${meal.servings} servings`} • {meal.ingredients.length} ingredient{meal.ingredients.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-2">
          {/* Expand indicator with spring animation */}
          <span
            className="text-xs text-charcoal/50 transition-transform duration-300"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transitionTimingFunction: 'var(--ease-spring)',
            }}
          >
            ▼
          </span>
          {/* Delete button */}
          <button
            onClick={handleDeleteClick}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-red-50 active:bg-red-100 transition-colors"
            aria-label={`Delete ${meal.name}`}
          >
            <span className="text-lg">🗑️</span>
          </button>
        </div>
      </div>

      {/* Expanded Content with spring animation */}
      <div
        id={`meal-details-${meal.id}`}
        className="border-t border-charcoal/10 overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isExpanded ? '2000px' : '0',
          opacity: isExpanded ? 1 : 0,
          transitionTimingFunction: 'var(--ease-spring)',
        }}
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
            <button
              onClick={handleEditClick}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-soft bg-terracotta text-white font-medium hover:bg-terracotta/90 active:bg-terracotta/80 transition-colors"
            >
              <span>✏️</span>
              <span>Edit Meal</span>
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-charcoal/50"
            onClick={handleCancelDelete}
            aria-hidden="true"
          />
          <div className="relative bg-cream rounded-softer p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold text-charcoal mb-2">
              Delete Meal?
            </h3>
            <p className="text-sm text-charcoal/70 mb-4">
              Are you sure you want to delete "{meal.name}"? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 h-11 rounded-soft border border-charcoal/20 text-charcoal font-medium hover:bg-charcoal/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 h-11 rounded-soft bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
