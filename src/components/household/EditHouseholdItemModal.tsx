import { useState, useEffect } from 'react';
import { STORES, CATEGORIES } from '../../types';
import type { HouseholdItem, Store, Category } from '../../types';

interface EditHouseholdItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: HouseholdItem;
  onSave: (updates: Partial<Omit<HouseholdItem, 'id' | 'householdCode' | 'nameLower'>>) => Promise<void>;
}

export function EditHouseholdItemModal({ isOpen, onClose, item, onSave }: EditHouseholdItemModalProps) {
  const [name, setName] = useState(item.name);
  const [store, setStore] = useState<Store>(item.store);
  const [category, setCategory] = useState<Category>(item.category);
  const [brand, setBrand] = useState(item.brand || '');
  const [notes, setNotes] = useState(item.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-initialize state when item changes
  useEffect(() => {
    setName(item.name);
    setStore(item.store);
    setCategory(item.category);
    setBrand(item.brand || '');
    setNotes(item.notes || '');
    setError(null);
  }, [item]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSave = async () => {
    // Validate name
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        name: name.trim(),
        store,
        category,
        brand: brand.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update household item');
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
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-cream text-charcoal"
            aria-label="Cancel"
          >
            <span className="text-2xl">&times;</span>
          </button>
          <h2 className="text-lg font-semibold text-charcoal">Edit Household Item</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50"
            aria-label="Update household item"
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
              htmlFor="edit-household-name"
              className="block text-sm font-medium text-charcoal mb-1"
            >
              Name
            </label>
            <input
              id="edit-household-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Paper Towels, Dish Soap, Batteries"
              className="w-full h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            />
          </div>

          {/* Brand */}
          <div>
            <label
              htmlFor="edit-household-brand"
              className="block text-sm font-medium text-charcoal mb-1"
            >
              Brand (optional)
            </label>
            <input
              id="edit-household-brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Bounty, Charmin, Dawn"
              className="w-full h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            />
          </div>

          {/* Store */}
          <div>
            <label
              htmlFor="edit-household-store"
              className="block text-sm font-medium text-charcoal mb-1"
            >
              Store
            </label>
            <select
              id="edit-household-store"
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
              htmlFor="edit-household-category"
              className="block text-sm font-medium text-charcoal mb-1"
            >
              Category
            </label>
            <select
              id="edit-household-category"
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

          {/* Notes */}
          <div>
            <label
              htmlFor="edit-household-notes"
              className="block text-sm font-medium text-charcoal mb-1"
            >
              Notes (optional)
            </label>
            <input
              id="edit-household-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Get the big rolls, Need the unscented kind"
              className="w-full h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
