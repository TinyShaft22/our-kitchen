import type { Meal, Snack } from '../../types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface MealQuickViewModalProps {
  item: Meal | Snack | null;
  type: 'meal' | 'snack' | 'dessert';
  servings?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function MealQuickViewModal({ item, type, servings, isOpen, onClose }: MealQuickViewModalProps) {
  if (!item) return null;

  const emoji = type === 'meal' ? '🍽️' : type === 'snack' ? '🍿' : '🧁';

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="bg-cream rounded-t-3xl p-0 border-0"
        style={{ height: 'auto', maxHeight: '40vh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-charcoal/20 rounded-full" />
        </div>

        {item.imageUrl ? (
          /* With image - horizontal layout */
          <div className="flex gap-4 px-5 pb-5">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-24 h-24 rounded-xl object-cover flex-shrink-0 shadow-soft"
            />
            <div className="flex flex-col justify-center min-w-0">
              <SheetHeader className="space-y-1 text-left">
                <SheetTitle className="font-display text-lg font-semibold text-charcoal leading-tight">
                  {item.name}
                </SheetTitle>
                {servings && (
                  <SheetDescription className="text-charcoal/60 text-sm">
                    ×{servings} this week
                  </SheetDescription>
                )}
              </SheetHeader>
            </div>
          </div>
        ) : (
          /* Without image - centered layout */
          <div className="px-5 pb-5 text-center">
            <div className="mb-2">
              <span className="text-3xl">{emoji}</span>
            </div>
            <SheetHeader className="space-y-1">
              <SheetTitle className="font-display text-lg font-semibold text-charcoal">
                {item.name}
              </SheetTitle>
              {servings && (
                <SheetDescription className="text-charcoal/60 text-sm">
                  ×{servings} this week
                </SheetDescription>
              )}
            </SheetHeader>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
