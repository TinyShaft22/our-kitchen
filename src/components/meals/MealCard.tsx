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

  return (
    <div className="bg-white rounded-soft shadow-soft overflow-hidden">
      {/* Image thumbnail at top */}
      {meal.imageUrl && (
        <img
          src={meal.imageUrl}
          alt={meal.name}
          className="w-full h-32 object-cover"
        />
      )}

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-charcoal truncate">
              {meal.name}
            </h3>
            <p className="text-sm text-warm-gray mt-1">
              {meal.servings} servings • {meal.ingredients.length} ingredient
              {meal.ingredients.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2 ml-2">
            <button
              onClick={() => onEdit(meal)}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-cream-dark active:bg-cream-dark transition-colors"
              aria-label={`Edit ${meal.name}`}
            >
              <span className="text-lg">✏️</span>
            </button>
            <button
              onClick={() => onDelete(meal)}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-cream-dark active:bg-cream-dark transition-colors"
              aria-label={`Delete ${meal.name}`}
            >
              <span className="text-lg">🗑️</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Recipe Section */}
      {meal.instructions && meal.instructions.trim() && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full h-10 px-4 flex items-center justify-between border-t border-charcoal/10 text-sm text-charcoal/70 hover:bg-cream/50 active:bg-cream/50 transition-colors"
            aria-expanded={isExpanded}
            aria-controls={`recipe-${meal.id}`}
          >
            <span>📝 Recipe</span>
            <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
          </button>
          {isExpanded && (
            <div
              id={`recipe-${meal.id}`}
              className="px-4 pb-4 bg-cream/50 rounded-b-soft prose prose-sm prose-charcoal max-w-none"
            >
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="text-sm text-charcoal/80 mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="text-sm text-charcoal/80 list-disc list-inside mb-2 last:mb-0">{children}</ul>,
                  ol: ({ children }) => <ol className="text-sm text-charcoal/80 list-decimal list-inside mb-2 last:mb-0">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  h1: ({ children }) => <h3 className="text-base font-semibold text-charcoal mb-2">{children}</h3>,
                  h2: ({ children }) => <h4 className="text-sm font-semibold text-charcoal mb-2">{children}</h4>,
                  h3: ({ children }) => <h5 className="text-sm font-medium text-charcoal mb-1">{children}</h5>,
                }}
              >
                {meal.instructions}
              </ReactMarkdown>
            </div>
          )}
        </>
      )}
    </div>
  );
}
