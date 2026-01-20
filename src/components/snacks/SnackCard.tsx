import { useState } from 'react';
import type { Snack } from '../../types';
import { STORES, CATEGORIES } from '../../types';
import { Button } from '@/components/ui/button';
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

interface SnackCardProps {
  snack: Snack;
  onEdit: (snack: Snack) => void;
  onDelete: (snack: Snack) => void;
}

export function SnackCard({ snack, onEdit, onDelete }: SnackCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete(snack);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(snack);
  };

  const storeName = STORES.find((s) => s.id === snack.defaultStore)?.name || snack.defaultStore;
  const categoryName = CATEGORIES.find((c) => c.id === snack.category)?.name || snack.category;

  return (
    <div className="bg-white rounded-soft shadow-soft overflow-hidden">
      {/* Collapsed Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-cream/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`snack-details-${snack.id}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Small thumbnail if image exists */}
          {snack.imageUrl ? (
            <img
              src={snack.imageUrl}
              alt=""
              className="w-10 h-10 rounded-soft object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-soft bg-sage/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🍿</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-charcoal truncate">
              {snack.name}
            </h3>
            <p className="text-xs text-charcoal/60">
              {snack.brand && `${snack.brand} • `}{storeName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-2">
          {/* Expand indicator */}
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
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={handleDeleteClick}
            className="rounded-full hover:bg-red-50 active:bg-red-100"
            aria-label={`Delete ${snack.name}`}
          >
            <span className="text-lg">🗑️</span>
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      <div
        id={`snack-details-${snack.id}`}
        className="border-t border-charcoal/10 overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isExpanded ? '500px' : '0',
          opacity: isExpanded ? 1 : 0,
          transitionTimingFunction: 'var(--ease-spring)',
        }}
      >
        {isExpanded && (
          <div className="p-4 space-y-4">
            {/* Photo and Details Row */}
            <div className="flex gap-4">
              {/* Square Photo */}
              {snack.imageUrl && (
                <img
                  src={snack.imageUrl}
                  alt={snack.name}
                  className="w-32 h-32 rounded-soft object-cover flex-shrink-0"
                />
              )}
              {/* Details */}
              <div className="flex-1 space-y-2">
                {snack.brand && (
                  <div className="text-sm">
                    <span className="font-medium text-charcoal">Brand:</span>{' '}
                    <span className="text-charcoal/70">{snack.brand}</span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-medium text-charcoal">Store:</span>{' '}
                  <span className="text-charcoal/70">{storeName}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-charcoal">Category:</span>{' '}
                  <span className="text-charcoal/70">{categoryName}</span>
                </div>
                {snack.barcode && (
                  <div className="text-sm">
                    <span className="font-medium text-charcoal">Barcode:</span>{' '}
                    <span className="text-charcoal/50 font-mono text-xs">{snack.barcode}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <Button
              size="lg"
              onClick={handleEditClick}
              className="w-full"
            >
              <span>✏️</span>
              <span>Edit Snack</span>
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-cream rounded-soft max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-charcoal">
              Delete Snack?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-charcoal/70">
              Are you sure you want to delete &quot;{snack.name}&quot;? This cannot be undone.
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
