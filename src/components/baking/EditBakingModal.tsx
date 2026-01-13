import { useState, useEffect } from 'react';
import type { BakingEssential, BakingStatus } from '../../types';

const BAKING_UNITS = ['cups', 'oz', 'lbs', 'tbsp', 'tsp', 'each', 'bags', 'boxes'];

const STATUS_OPTIONS: { id: BakingStatus; label: string }[] = [
  { id: 'stocked', label: 'Stocked' },
  { id: 'low', label: 'Low' },
  { id: 'out', label: 'Out' },
];

interface EditBakingModalProps {
  isOpen: boolean;
  essential: BakingEssential | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Omit<BakingEssential, 'id' | 'householdCode'>>) => Promise<void>;
}

export function EditBakingModal({ isOpen, essential, onClose, onSave }: EditBakingModalProps) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('cups');
  const [status, setStatus] = useState<BakingStatus>('stocked');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form when essential changes
  useEffect(() => {
    if (essential) {
      setName(essential.name);
      setQty(essential.qty.toString());
      setUnit(essential.unit);
      setStatus(essential.status);
      setError(null);
    }
  }, [essential]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSave = async () => {
    if (!essential) return;

    // Validate
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!qty || parseFloat(qty) <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(essential.id, {
        name: name.trim(),
        qty: parseFloat(qty),
        unit,
        status,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !essential) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative bg-cream rounded-t-softer w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-cream border-b border-charcoal/10 px-4 py-3 flex items-center justify-between z-10">
          <button
            onClick={handleClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-charcoal/10 text-charcoal"
            aria-label="Cancel"
          >
            <span className="text-2xl">&times;</span>
          </button>
          <h2 className="text-lg font-semibold text-charcoal">Edit Baking Essential</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50"
            aria-label="Save"
          >
            {saving ? (
              <span className="text-sm">...</span>
            ) : (
              <span className="text-lg font-bold">&#10003;</span>
            )}
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-soft text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="edit-baking-name" className="block text-sm font-medium text-charcoal mb-1">
              Name
            </label>
            <input
              id="edit-baking-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., All-Purpose Flour"
              className="w-full h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            />
          </div>

          {/* Quantity and Unit (side by side) */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="edit-baking-qty" className="block text-sm font-medium text-charcoal mb-1">
                Quantity
              </label>
              <input
                id="edit-baking-qty"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.25"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="2"
                className="w-full h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="edit-baking-unit" className="block text-sm font-medium text-charcoal mb-1">
                Unit
              </label>
              <select
                id="edit-baking-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
              >
                {BAKING_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="edit-baking-status" className="block text-sm font-medium text-charcoal mb-1">
              Status
            </label>
            <select
              id="edit-baking-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BakingStatus)}
              className="w-full h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
