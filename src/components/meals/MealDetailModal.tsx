import ReactMarkdown from 'react-markdown';
import type { Meal } from '../../types';

interface MealDetailModalProps {
  meal: Meal | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
}

export function MealDetailModal({ meal, isOpen, onClose, onEdit, onDelete }: MealDetailModalProps) {
  if (!isOpen || !meal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel - slides up on mobile */}
      <div className="relative bg-cream rounded-t-2xl sm:rounded-softer w-full sm:max-w-lg max-h-[90vh] overflow-hidden shadow-xl animate-fade-in-up">
        {/* Hero Image */}
        {meal.imageUrl ? (
          <div className="relative h-56 sm:h-64">
            <img
              src={meal.imageUrl}
              alt={meal.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />

            {/* Close button on image */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-colors"
              aria-label="Close"
            >
              <span className="text-charcoal text-xl">&times;</span>
            </button>

            {/* Title on image */}
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h2 className="font-display text-2xl font-semibold text-white drop-shadow-lg">
                {meal.name}
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {meal.isBaking ? `Makes ${meal.servings}` : `${meal.servings} servings`} • {meal.ingredients.length} ingredients
              </p>
            </div>
          </div>
        ) : (
          /* Header without image */
          <div className="relative bg-gradient-to-br from-cream via-terracotta/5 to-sage/10 p-4 pt-14">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-charcoal/10 flex items-center justify-center hover:bg-charcoal/20 transition-colors"
              aria-label="Close"
            >
              <span className="text-charcoal text-xl">&times;</span>
            </button>

            <div className="text-center mb-2">
              <span className="text-5xl opacity-30">{meal.isBaking ? '🧁' : '🍽️'}</span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-charcoal text-center">
              {meal.name}
            </h2>
            <p className="text-charcoal/60 text-sm text-center mt-1">
              {meal.isBaking ? `Makes ${meal.servings}` : `${meal.servings} servings`} • {meal.ingredients.length} ingredients
            </p>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[50vh] p-4 space-y-4">
          {/* Ingredients */}
          <div>
            <h3 className="font-display font-semibold text-charcoal mb-2">Ingredients</h3>
            <div className="flex flex-wrap gap-2">
              {meal.ingredients.map((ing, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-white rounded-full text-sm text-charcoal shadow-soft"
                >
                  {ing.qty && ing.unit ? `${ing.qty} ${ing.unit} ` : ''}{ing.name}
                </span>
              ))}
            </div>
          </div>

          {/* Recipe */}
          {meal.instructions && meal.instructions.trim() && (
            <div>
              <h3 className="font-display font-semibold text-charcoal mb-2">Instructions</h3>
              <div className="bg-white rounded-soft p-4 shadow-soft prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="text-charcoal/80 mb-3 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="text-charcoal/80 list-disc list-inside mb-3 space-y-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="text-charcoal/80 list-decimal list-inside mb-3 space-y-1">{children}</ol>
                    ),
                    li: ({ children }) => <li>{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    h1: ({ children }) => (
                      <h4 className="font-display font-semibold text-charcoal mt-4 mb-2">{children}</h4>
                    ),
                    h2: ({ children }) => (
                      <h5 className="font-display font-medium text-charcoal mt-3 mb-2">{children}</h5>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-3 border-terracotta/50 pl-3 italic text-charcoal/70 my-3">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {meal.instructions}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-charcoal/10 p-4 flex gap-3">
          <button
            onClick={() => {
              onEdit(meal);
              onClose();
            }}
            className="flex-1 h-12 rounded-soft bg-terracotta text-white font-medium hover:bg-terracotta/90 transition-colors flex items-center justify-center gap-2"
          >
            <span>✏️</span>
            <span>Edit</span>
          </button>
          <button
            onClick={() => {
              onDelete(meal);
              onClose();
            }}
            className="w-12 h-12 rounded-soft border border-red-300 text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center"
            aria-label="Delete"
          >
            <span>🗑️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
