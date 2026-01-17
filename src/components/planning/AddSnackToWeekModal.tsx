import { useState, useMemo } from 'react';
import type { Snack } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddSnackToWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  snacks: Snack[];
  onAdd: (snackId: string, qty: number) => Promise<void>;
}

export function AddSnackToWeekModal({
  isOpen,
  onClose,
  snacks,
  onAdd,
}: AddSnackToWeekModalProps) {
  const [search, setSearch] = useState('');
  const [selectedSnack, setSelectedSnack] = useState<Snack | null>(null);
  const [qty, setQty] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter snacks by search term
  const filteredSnacks = useMemo(() => {
    if (!search.trim()) {
      return snacks.sort((a, b) => a.name.localeCompare(b.name));
    }
    const searchLower = search.toLowerCase();
    return snacks
      .filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          (s.brand && s.brand.toLowerCase().includes(searchLower))
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [snacks, search]);

  const handleClose = () => {
    setSearch('');
    setSelectedSnack(null);
    setQty(1);
    setError(null);
    onClose();
  };

  const handleSelectSnack = (snack: Snack) => {
    setSelectedSnack(snack);
    setQty(1);
  };

  const handleBack = () => {
    setSelectedSnack(null);
    setQty(1);
  };

  const handleConfirm = async () => {
    if (!selectedSnack) return;

    setSaving(true);
    setError(null);

    try {
      await onAdd(selectedSnack.id, qty);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add snack');
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
            onClick={selectedSnack ? handleBack : handleClose}
            className="w-11 h-11 rounded-full hover:bg-charcoal/5 text-charcoal p-0"
            aria-label={selectedSnack ? 'Back' : 'Close'}
          >
            <span className="text-2xl">{selectedSnack ? '←' : '×'}</span>
          </Button>
          <DialogTitle className="text-lg font-semibold text-charcoal">
            {selectedSnack ? 'Set Quantity' : 'Add Snack to Week'}
          </DialogTitle>
          {selectedSnack ? (
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
            <div className="w-11" /> /* Spacer */
          )}
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-soft text-sm mb-4">
              {error}
            </div>
          )}

          {selectedSnack ? (
            /* Quantity Selection */
            <div className="space-y-4">
              {/* Snack Preview */}
              <div className="flex items-center gap-4 p-4 bg-white rounded-soft">
                {selectedSnack.imageUrl ? (
                  <img
                    src={selectedSnack.imageUrl}
                    alt=""
                    className="w-16 h-16 rounded-soft object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-soft bg-sage/20 flex items-center justify-center">
                    <span className="text-2xl">🍿</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-charcoal truncate">
                    {selectedSnack.name}
                  </h3>
                  {selectedSnack.brand && (
                    <p className="text-sm text-charcoal/60">{selectedSnack.brand}</p>
                  )}
                </div>
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">
                  How many do you need this week?
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-12 h-12 rounded-full border-charcoal/20 text-charcoal text-xl"
                    disabled={qty <= 1}
                  >
                    −
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 h-12 text-center text-xl font-medium"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setQty(Math.min(99, qty + 1))}
                    className="w-12 h-12 rounded-full border-charcoal/20 text-charcoal text-xl"
                    disabled={qty >= 99}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Snack List */
            <div className="space-y-4">
              {/* Search */}
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search snacks..."
                className="h-11"
              />

              {/* Snack List */}
              {snacks.length === 0 ? (
                <div className="text-center py-8 text-charcoal/60">
                  <span className="text-4xl block mb-2">🍿</span>
                  <p>No snacks in your library yet.</p>
                  <p className="text-sm">Add some snacks first!</p>
                </div>
              ) : filteredSnacks.length === 0 ? (
                <div className="text-center py-8 text-charcoal/60">
                  <p>No snacks match "{search}"</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSnacks.map((snack) => (
                    <button
                      key={snack.id}
                      onClick={() => handleSelectSnack(snack)}
                      className="w-full flex items-center gap-3 p-3 bg-white rounded-soft hover:shadow-soft transition-shadow text-left"
                    >
                      {snack.imageUrl ? (
                        <img
                          src={snack.imageUrl}
                          alt=""
                          className="w-12 h-12 rounded-soft object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-soft bg-sage/20 flex items-center justify-center">
                          <span className="text-xl">🍿</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-charcoal truncate">
                          {snack.name}
                        </h3>
                        {snack.brand && (
                          <p className="text-xs text-charcoal/60 truncate">
                            {snack.brand}
                          </p>
                        )}
                      </div>
                      <span className="text-terracotta text-sm">→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
