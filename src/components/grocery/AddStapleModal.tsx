import { useState } from 'react';
import { STORES, CATEGORIES } from '../../types';
import type { Staple, Store, Category } from '../../types';

interface AddStapleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staple: Omit<Staple, 'id' | 'householdCode'>) => Promise<void>;
}

export function AddStapleModal({ isOpen, onClose, onSave }: AddStapleModalProps) {
  const [name, setName] = useState('');
  const [store, setStore] = useState<Store>('safeway');
  const [category, setCategory] = useState<Category>('produce');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setStore('safeway');
    setCategory('produce');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    // Validate name
    if (!name.trim()) {
      setError('Staple name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        name: name.trim(),
        store,
        category,
        enabled: true, // New staples are enabled by default
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save staple');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

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
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-cream text-charcoal"
            aria-label="Cancel"
          >
            <span className="text-2xl">&times;</span>
          </button>
          <h2 className="text-lg font-semibold text-charcoal">Add Staple</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50"
            aria-label="Save staple"
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
            <label
              htmlFor="staple-name"
              className="block text-sm font-medium text-charcoal mb-1"
            >
              Name
            </label>
            <input
              id="staple-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Eggs, Milk, Bread"
              className="w-full h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            />
          </div>

          {/* Store */}
          <div>
            <label
              htmlFor="staple-store"
              className="block text-sm font-medium text-charcoal mb-1"
            >
              Store
            </label>
            <select
              id="staple-store"
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

          {/* Category */}
          <div>
            <label
              htmlFor="staple-category"
              className="block text-sm font-medium text-charcoal mb-1"
            >
              Category
            </label>
            <select
              id="staple-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
