import { useState } from 'react';
import type { BakingEssential, BakingStatus, Store } from '../../types';
import { STORES } from '../../types';

const STATUS_OPTIONS: { id: BakingStatus; label: string }[] = [
  { id: 'stocked', label: 'Stocked' },
  { id: 'low', label: 'Low' },
  { id: 'out', label: 'Out' },
];

interface AddBakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (essential: Omit<BakingEssential, 'id' | 'householdCode'>) => Promise<void>;
}

export function AddBakingModal({ isOpen, onClose, onSave }: AddBakingModalProps) {
  const [name, setName] = useState('');
  const [store, setStore] = useState<Store>('costco');
  const [status, setStatus] = useState<BakingStatus>('stocked');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setStore('costco');
    setStatus('stocked');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    // Validate
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        name: name.trim(),
        store,
        status,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
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
      <div className="relative bg-cream rounded-softer w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-cream border-b border-charcoal/10 px-4 py-3 flex items-center justify-between z-10">
          <button
            onClick={handleClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-charcoal/10 text-charcoal"
            aria-label="Cancel"
          >
            <span className="text-2xl">&times;</span>
          </button>
          <h2 className="text-lg font-semibold text-charcoal">Add Baking Essential</h2>
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
            <label htmlFor="baking-name" className="block text-sm font-medium text-charcoal mb-1">
              Name
            </label>
            <input
              id="baking-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., All-Purpose Flour"
              className="w-full h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            />
          </div>

          {/* Store */}
          <div>
            <label htmlFor="baking-store" className="block text-sm font-medium text-charcoal mb-1">
              Store
            </label>
            <select
              id="baking-store"
              value={store}
              onChange={(e) => setStore(e.target.value as Store)}
              className="w-full h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            >
              {STORES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="baking-status" className="block text-sm font-medium text-charcoal mb-1">
              Status
            </label>
            <select
              id="baking-status"
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
