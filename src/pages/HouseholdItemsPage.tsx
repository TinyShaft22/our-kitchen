import { useState, useMemo } from 'react';
import { useHousehold } from '../hooks/useHousehold';
import { useHouseholdItems } from '../hooks/useHouseholdItems';
import { useGroceryList } from '../hooks/useGroceryList';
import { HouseholdItemCard } from '../components/household/HouseholdItemCard';
import { AddHouseholdItemModal } from '../components/household/AddHouseholdItemModal';
import { EditHouseholdItemModal } from '../components/household/EditHouseholdItemModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import type { HouseholdItem } from '../types';

function HouseholdItemsPage() {
  const { householdCode } = useHousehold();
  const { items, loading, addItem, updateItem, deleteItem } = useHouseholdItems(householdCode);
  const { addItem: addGroceryItem } = useGroceryList(householdCode);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<HouseholdItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<HouseholdItem | null>(null);

  // Sort items alphabetically
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // Add household item to grocery list
  const addToGroceryList = async (item: HouseholdItem) => {
    await addGroceryItem({
      name: item.name,
      qty: 1,
      unit: 'each',
      category: item.category,
      store: item.store,
      status: 'need',
      source: 'manual',
    });
  };

  if (loading) {
    return (
      <div className="pb-32">
        <div className="hero-gradient-honey px-4 pt-6 pb-4">
          <h1 className="text-2xl font-display font-semibold text-charcoal">Household Items</h1>
          <p className="text-sm text-charcoal/60 mt-1">Loading...</p>
        </div>
        <div className="px-4 mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-soft" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Hero section */}
      <div className="hero-gradient-honey px-4 pt-6 pb-4">
        <h1 className="text-2xl font-display font-semibold text-charcoal">Household Items</h1>
        <p className="text-sm text-charcoal/60 mt-1">
          {items.length} saved item{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="px-4">
        {/* Description */}
        <p className="text-sm text-charcoal/70 mt-4 mb-4">
          Save recurring household products here. Tap "+ Add" to quickly add them to your grocery list.
        </p>

        {/* Add button */}
        <Button
          onClick={() => setShowAddModal(true)}
          className="w-full mb-4"
        >
          + Add Household Item
        </Button>

        {/* Items list */}
        {sortedItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-charcoal/60 mb-2">No household items yet</p>
            <p className="text-sm text-charcoal/50">
              Add products like paper towels, cleaning supplies, or toiletries
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedItems.map((item) => (
              <HouseholdItemCard
                key={item.id}
                item={item}
                onAddToList={() => addToGroceryList(item)}
                onEdit={() => setEditingItem(item)}
                onDelete={() => setDeleteConfirm(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AddHouseholdItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={async (item) => {
          await addItem(item);
        }}
      />

      {/* Edit Modal */}
      {editingItem && (
        <EditHouseholdItemModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          onSave={async (updates) => {
            await updateItem(editingItem.id, updates);
            setEditingItem(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={async () => {
          if (deleteConfirm) {
            await deleteItem(deleteConfirm.id);
            setDeleteConfirm(null);
          }
        }}
        title="Delete Household Item"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}

export default HouseholdItemsPage;
