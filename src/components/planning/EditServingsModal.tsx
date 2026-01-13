import { useState, useEffect } from 'react';

interface EditServingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealName: string;
  currentServings: number;
  onSave: (servings: number) => Promise<void>;
}

export function EditServingsModal({
  isOpen,
  onClose,
  mealName,
  currentServings,
  onSave,
}: EditServingsModalProps) {
  const [servings, setServings] = useState(currentServings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-initialize state when modal opens or currentServings changes
  useEffect(() => {
    setServings(currentServings);
    setError(null);
  }, [currentServings, isOpen]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSave = async () => {
    // Validate servings
    if (servings < 1) {
      setError('Servings must be at least 1');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(servings);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update servings');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative bg-cream rounded-softer w-full max-w-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-charcoal/10 px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-cream text-charcoal"
            aria-label="Cancel"
          >
            <span className="text-2xl">&times;</span>
          </button>
          <h2 className="text-lg font-semibold text-charcoal">Edit Servings</h2>
          <div className="w-11" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-soft text-sm">
              {error}
            </div>
          )}

          {/* Meal Name (read-only) */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Meal
            </label>
            <p className="text-charcoal/70">{mealName}</p>
          </div>

          {/* Servings Input */}
          <div>
            <label
              htmlFor="edit-servings"
              className="block text-sm font-medium text-charcoal mb-1"
            >
              Servings
            </label>
            <input
              id="edit-servings"
              type="number"
              min="1"
              max="99"
              value={servings}
              onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClose}
              className="flex-1 h-11 rounded-soft border border-charcoal/20 text-charcoal text-sm font-medium hover:bg-charcoal/5 active:bg-charcoal/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-11 rounded-soft bg-terracotta text-white text-sm font-medium hover:bg-terracotta/90 active:bg-terracotta/80 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
