import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditSnackQtyModalProps {
  isOpen: boolean;
  onClose: () => void;
  snackName: string;
  currentQty: number;
  onSave: (qty: number) => Promise<void>;
}

export function EditSnackQtyModal({
  isOpen,
  onClose,
  snackName,
  currentQty,
  onSave,
}: EditSnackQtyModalProps) {
  const [qty, setQty] = useState(currentQty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-initialize state when modal opens or currentQty changes
  useEffect(() => {
    setQty(currentQty);
    setError(null);
  }, [currentQty, isOpen]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSave = async () => {
    if (qty < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(qty);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quantity');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-cream rounded-softer max-w-sm p-0 gap-0"
      >
        {/* Header */}
        <DialogHeader className="border-b border-charcoal/10 px-4 py-3 flex flex-row items-center justify-between space-y-0">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="w-11 h-11 rounded-full hover:bg-charcoal/5 text-charcoal p-0"
            aria-label="Cancel"
          >
            <span className="text-2xl">&times;</span>
          </Button>
          <DialogTitle className="text-lg font-semibold text-charcoal">Edit Quantity</DialogTitle>
          <div className="w-11" /> {/* Spacer for centering */}
        </DialogHeader>

        {/* Content */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-soft text-sm">
              {error}
            </div>
          )}

          {/* Snack Name (read-only) */}
          <div className="space-y-1">
            <Label>Snack</Label>
            <p className="text-charcoal/70">{snackName}</p>
          </div>

          {/* Quantity Input */}
          <div className="space-y-1">
            <Label htmlFor="edit-qty-input">Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 rounded-full border-charcoal/20 text-charcoal text-xl p-0"
                disabled={qty <= 1}
              >
                −
              </Button>
              <Input
                id="edit-qty-input"
                type="number"
                min={1}
                max={99}
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                onClick={() => setQty(Math.min(99, qty + 1))}
                className="w-10 h-10 rounded-full border-charcoal/20 text-charcoal text-xl p-0"
                disabled={qty >= 99}
              >
                +
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-11 rounded-soft border-charcoal/20 text-charcoal hover:bg-charcoal/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-11 rounded-soft bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
