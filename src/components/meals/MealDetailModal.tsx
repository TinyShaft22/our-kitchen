import ReactMarkdown from 'react-markdown';
import type { Meal } from '../../types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface MealDetailModalProps {
  meal: Meal | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
}

export function MealDetailModal({ meal, isOpen, onClose, onEdit, onDelete }: MealDetailModalProps) {
  if (!meal) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="bg-cream rounded-t-2xl max-h-[85vh] overflow-hidden flex flex-col p-0"
      >
        {/* Hero Image */}
        {meal.imageUrl ? (
          <div className="relative h-48 sm:h-56 flex-shrink-0">
            <img
              src={meal.imageUrl}
              alt={meal.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />

            {/* Title on image */}
            <SheetHeader className="absolute inset-x-0 bottom-0 p-4 space-y-0">
              <SheetTitle className="font-display text-2xl font-semibold text-white drop-shadow-lg">
                {meal.name}
              </SheetTitle>
              <SheetDescription className="text-white/80 text-sm mt-1">
                {meal.isBaking ? `Makes ${meal.servings}` : `${meal.servings} servings`} • {meal.ingredients.length} ingredients
              </SheetDescription>
            </SheetHeader>
          </div>
        ) : (
          /* Header without image */
          <SheetHeader className="bg-gradient-to-br from-cream via-terracotta/5 to-sage/10 p-4 pt-10 text-center flex-shrink-0">
            <div className="mb-2">
              <span className="text-5xl opacity-30">{meal.isBaking ? '🧁' : '🍽️'}</span>
            </div>
            <SheetTitle className="font-display text-2xl font-semibold text-charcoal">
              {meal.name}
            </SheetTitle>
            <SheetDescription className="text-charcoal/60 text-sm mt-1">
              {meal.isBaking ? `Makes ${meal.servings}` : `${meal.servings} servings`} • {meal.ingredients.length} ingredients
            </SheetDescription>
          </SheetHeader>
        )}

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
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
        <SheetFooter className="border-t border-charcoal/10 p-4 flex-row gap-3 flex-shrink-0">
          <Button
            onClick={() => {
              onEdit(meal);
              onClose();
            }}
            className="flex-1 h-12 rounded-soft bg-terracotta text-white font-medium hover:bg-terracotta/90"
          >
            <span>✏️</span>
            <span>Edit</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onDelete(meal);
              onClose();
            }}
            className="w-12 h-12 rounded-soft border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600"
            aria-label="Delete"
          >
            <span>🗑️</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
