import { useState, useMemo } from 'react';
import { useHousehold } from '../hooks/useHousehold';
import { useBaking } from '../hooks/useBaking';
import { useGroceryList } from '../hooks/useGroceryList';
import { BakingEssentialCard } from '../components/baking/BakingEssentialCard';
import { AddBakingModal } from '../components/baking/AddBakingModal';
import { EditBakingModal } from '../components/baking/EditBakingModal';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import type { BakingStatus, BakingEssential } from '../types';

type StatusFilter = BakingStatus | 'all';

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'stocked', label: 'Stocked' },
  { id: 'low', label: 'Low' },
  { id: 'out', label: 'Out' },
];

// Sort priority: out (0) > low (1) > stocked (2)
const STATUS_PRIORITY: Record<BakingStatus, number> = {
  out: 0,
  low: 1,
  stocked: 2,
};

function BakingPage() {
  const { householdCode } = useHousehold();
  const {
    essentials,
    lowStockItems,
    loading,
    error,
    addEssential,
    updateEssential,
    deleteEssential,
    updateStatus,
  } = useBaking(householdCode);
  const { addItem } = useGroceryList(householdCode);

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState<StatusFilter>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEssential, setEditingEssential] = useState<BakingEssential | null>(null);
  const [deleteConfirmEssential, setDeleteConfirmEssential] = useState<BakingEssential | null>(null);

  // Restock states
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [bulkRestocking, setBulkRestocking] = useState(false);
  const [restockFeedback, setRestockFeedback] = useState<string | null>(null);

  // Filter and sort essentials
  const filteredEssentials = useMemo(() => {
    let filtered = essentials;

    // Filter by status if not 'all'
    if (selectedFilter !== 'all') {
      filtered = essentials.filter((e) => e.status === selectedFilter);
    }

    // Sort by urgency (out first, then low, then stocked)
    return [...filtered].sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);
  }, [essentials, selectedFilter]);

  // Show feedback briefly
  const showFeedback = (message: string) => {
    setRestockFeedback(message);
    setTimeout(() => setRestockFeedback(null), 2500);
  };

  // Handlers
  const handleAdd = async (essential: Omit<BakingEssential, 'id' | 'householdCode'>) => {
    await addEssential(essential);
  };

  const handleEdit = async (id: string, updates: Partial<Omit<BakingEssential, 'id' | 'householdCode'>>) => {
    await updateEssential(id, updates);
  };

  const handleDelete = async () => {
    if (!deleteConfirmEssential) return;
    try {
      await deleteEssential(deleteConfirmEssential.id);
      setDeleteConfirmEssential(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleStatusChange = async (id: string, status: BakingStatus) => {
    try {
      await updateStatus(id, status);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Restock single item
  const handleRestock = async (essential: BakingEssential) => {
    setRestockingId(essential.id);
    try {
      await addItem({
        name: essential.name,
        qty: 1,
        unit: 'each',
        category: 'baking',
        store: essential.store,
        status: 'need',
        source: 'baking',
      });
      // Mark as stocked after adding to grocery
      await updateStatus(essential.id, 'stocked');
      showFeedback(`Added ${essential.name} to grocery list`);
    } catch (err) {
      console.error('Failed to restock:', err);
      showFeedback('Failed to add to grocery list');
    } finally {
      setRestockingId(null);
    }
  };

  // Restock all low/out items
  const handleRestockAll = async () => {
    if (lowStockItems.length === 0) return;

    setBulkRestocking(true);
    try {
      // Add all items to grocery list
      await Promise.all(
        lowStockItems.map((essential) =>
          addItem({
            name: essential.name,
            qty: 1,
            unit: 'each',
            category: 'baking',
            store: essential.store,
            status: 'need',
            source: 'baking',
          })
        )
      );

      // Mark all as stocked
      await Promise.all(
        lowStockItems.map((essential) => updateStatus(essential.id, 'stocked'))
      );

      showFeedback(`Added ${lowStockItems.length} item${lowStockItems.length !== 1 ? 's' : ''} to grocery list`);
    } catch (err) {
      console.error('Failed to restock all:', err);
      showFeedback('Failed to add items to grocery list');
    } finally {
      setBulkRestocking(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold text-charcoal">🧁 Baking Corner</h1>
        <p className="text-warm-gray mt-4">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold text-charcoal">🧁 Baking Corner</h1>
        <p className="text-terracotta mt-4">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-32">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-charcoal">🧁 Baking Corner</h1>
          <p className="text-sm text-warm-gray mt-1">
            {essentials.length} item{essentials.length !== 1 ? 's' : ''}
            {lowStockItems.length > 0 && (
              <span className="text-terracotta"> ({lowStockItems.length} need restocking)</span>
            )}
          </p>
        </div>

        {/* Bulk restock button */}
        {lowStockItems.length > 0 && (
          <button
            onClick={handleRestockAll}
            disabled={bulkRestocking}
            className="px-4 py-2 rounded-full text-sm font-medium bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50 whitespace-nowrap min-h-[44px] transition-colors"
          >
            {bulkRestocking ? 'Adding...' : `🛒 Restock ${lowStockItems.length}`}
          </button>
        )}
      </div>

      {/* Feedback toast */}
      {restockFeedback && (
        <div className="mt-3 px-4 py-2 bg-sage/20 text-sage rounded-soft text-sm font-medium animate-pulse">
          ✓ {restockFeedback}
        </div>
      )}

      {/* Status filter pills */}
      {essentials.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 mt-4">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap min-h-[44px] transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-terracotta text-white'
                  : 'bg-white text-charcoal border border-charcoal/20'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* Essentials list */}
      <div className="mt-4 space-y-3">
        {filteredEssentials.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-warm-gray">
              {essentials.length === 0
                ? 'No baking essentials yet. Add some to get started!'
                : `No ${selectedFilter} items.`}
            </p>
          </div>
        ) : (
          filteredEssentials.map((essential) => (
            <BakingEssentialCard
              key={essential.id}
              essential={essential}
              onEdit={() => setEditingEssential(essential)}
              onDelete={() => setDeleteConfirmEssential(essential)}
              onStatusChange={(status) => handleStatusChange(essential.id, status)}
              onRestock={() => handleRestock(essential)}
              isRestocking={restockingId === essential.id}
            />
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => setShowAddModal(true)}
        ariaLabel="Add baking essential"
      />

      {/* Add Modal */}
      <AddBakingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAdd}
        householdCode={householdCode || ''}
      />

      {/* Edit Modal */}
      <EditBakingModal
        isOpen={!!editingEssential}
        essential={editingEssential}
        onClose={() => setEditingEssential(null)}
        onSave={handleEdit}
        householdCode={householdCode || ''}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmEssential}
        onClose={() => setDeleteConfirmEssential(null)}
        onConfirm={handleDelete}
        title="Delete Essential"
        message={`Are you sure you want to delete "${deleteConfirmEssential?.name}"?`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}

export default BakingPage;
