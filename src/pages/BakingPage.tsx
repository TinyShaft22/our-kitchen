import { useState, useMemo } from 'react';
import { useHousehold } from '../hooks/useHousehold';
import { useBaking } from '../hooks/useBaking';
import { useGroceryList } from '../hooks/useGroceryList';
import { BakingEssentialCard } from '../components/baking/BakingEssentialCard';
import { AddBakingModal } from '../components/baking/AddBakingModal';
import { EditBakingModal } from '../components/baking/EditBakingModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { BakingEssentialSkeleton, Skeleton } from '../components/ui/skeleton';
import { EmptyBakingEssentials, EmptyFilteredList } from '../components/ui/EmptyState';
import type { BakingStatus, BakingEssential } from '../types';
import { BAKING_SUBCATEGORIES } from '../types';

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

  // Collapsible subcategory state - all expanded by default
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(
    new Set(BAKING_SUBCATEGORIES.map((s) => s.id))
  );

  const toggleSubcategory = (subcategory: string) => {
    setExpandedSubcategories((prev) => {
      const next = new Set(prev);
      if (next.has(subcategory)) {
        next.delete(subcategory);
      } else {
        next.add(subcategory);
      }
      return next;
    });
  };

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEssential, setEditingEssential] = useState<BakingEssential | null>(null);
  const [deleteConfirmEssential, setDeleteConfirmEssential] = useState<BakingEssential | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

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

  // Collect all unique subcategories (built-in + custom)
  const allSubcategories = useMemo(() => {
    const builtInIds = new Set(BAKING_SUBCATEGORIES.map((s) => s.id));
    const customCategories: { id: string; name: string; emoji: string }[] = [];

    // Find custom subcategories from essentials
    for (const essential of essentials) {
      if (essential.subcategory && !builtInIds.has(essential.subcategory as any)) {
        // Check if we already have this custom category
        if (!customCategories.some((c) => c.id === essential.subcategory)) {
          customCategories.push({
            id: essential.subcategory,
            name: essential.subcategory,
            emoji: '📁',
          });
        }
      }
    }

    // Combine built-in and custom, with custom at the end
    return [...BAKING_SUBCATEGORIES, ...customCategories];
  }, [essentials]);

  // Group essentials by subcategory
  const groupedEssentials = useMemo(() => {
    const groups: Record<string, BakingEssential[]> = {
      uncategorized: [],
    };

    // Initialize groups for all known subcategories
    for (const subcat of allSubcategories) {
      groups[subcat.id] = [];
    }

    for (const essential of filteredEssentials) {
      const subcategory = essential.subcategory || 'uncategorized';
      if (subcategory in groups) {
        groups[subcategory].push(essential);
      } else {
        // Custom category not yet in allSubcategories (edge case)
        groups[subcategory] = [essential];
      }
    }

    return groups;
  }, [filteredEssentials, allSubcategories]);

  // Handler for creating new folder
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      // Just expand the new folder - items will be added to it via the Add modal
      setExpandedSubcategories((prev) => new Set([...prev, newFolderName.trim()]));
      setShowNewFolderModal(false);
      setNewFolderName('');
    }
  };

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
      <div className="pb-32">
        <div className="hero-gradient-honey px-4 pt-6 pb-4">
          <h1 className="text-2xl font-display font-semibold text-charcoal">🧁 Baking Corner</h1>
          <p className="text-sm text-charcoal/60 mt-1">Loading essentials...</p>
        </div>
        <div className="px-4 space-y-4 mt-4">
          {/* Filter pills skeleton */}
          <div className="flex gap-2 overflow-hidden -mx-4 px-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-20 rounded-full shrink-0" />
            ))}
          </div>
          {/* Essential items skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ animationDelay: `${i * 80}ms` }}>
                <BakingEssentialSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="hero-gradient-honey px-4 pt-6 pb-4">
          <h1 className="text-2xl font-display font-semibold text-charcoal">🧁 Baking Corner</h1>
        </div>
        <p className="text-terracotta mt-4 px-4">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Hero section with honey gradient */}
      <div className="hero-gradient-honey px-4 pt-6 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-semibold text-charcoal">🧁 Baking Corner</h1>
            <p className="text-sm text-charcoal/60 mt-1">
              {essentials.length} item{essentials.length !== 1 ? 's' : ''}
              {lowStockItems.length > 0 && (
                <span className="text-terracotta font-medium"> · {lowStockItems.length} need restocking</span>
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Bulk restock button */}
            {lowStockItems.length > 0 && (
              <button
                onClick={handleRestockAll}
                disabled={bulkRestocking}
                className="px-3 py-2 rounded-full text-sm font-medium bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50 whitespace-nowrap min-h-[44px] transition-colors shadow-soft"
              >
                {bulkRestocking ? '...' : `🛒 ${lowStockItems.length}`}
              </button>
            )}
            {/* New Folder button */}
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="w-11 h-11 rounded-full bg-honey/20 text-honey hover:bg-honey/30 transition-colors flex items-center justify-center text-lg"
              title="New Folder"
            >
              📁
            </button>
            {/* Add Item button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="w-11 h-11 rounded-full bg-honey text-white hover:bg-honey/90 transition-colors shadow-soft flex items-center justify-center text-xl font-bold"
              title="Add Item"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="px-4">

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

      {/* Essentials list grouped by subcategory */}
      <div className="mt-4 space-y-4">
        {filteredEssentials.length === 0 ? (
          essentials.length === 0 ? (
            <EmptyBakingEssentials onAdd={() => setShowAddModal(true)} />
          ) : (
            <EmptyFilteredList filterName={selectedFilter} />
          )
        ) : (
          <>
            {/* Render each subcategory as collapsible section */}
            {allSubcategories.map((subcategory) => {
              const items = groupedEssentials[subcategory.id] || [];
              if (items.length === 0) return null;

              const isExpanded = expandedSubcategories.has(subcategory.id);
              const lowCount = items.filter((e) => e.status === 'low' || e.status === 'out').length;

              return (
                <div key={subcategory.id}>
                  <button
                    onClick={() => toggleSubcategory(subcategory.id)}
                    className="w-full flex items-center gap-3 py-2 text-left"
                  >
                    <span
                      className={`text-charcoal/40 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    >
                      ▶
                    </span>
                    <span className="text-xl">{subcategory.emoji}</span>
                    <span className="text-lg font-semibold text-charcoal flex-1">
                      {subcategory.name}
                    </span>
                    <span className="text-sm text-charcoal/50">
                      {items.length}
                      {lowCount > 0 && (
                        <span className="text-terracotta ml-1">({lowCount} low)</span>
                      )}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="space-y-2 ml-2 pl-6 border-l-2 border-charcoal/10">
                      {items.map((essential) => (
                        <BakingEssentialCard
                          key={essential.id}
                          essential={essential}
                          onEdit={() => setEditingEssential(essential)}
                          onDelete={() => setDeleteConfirmEssential(essential)}
                          onStatusChange={(status) => handleStatusChange(essential.id, status)}
                          onRestock={() => handleRestock(essential)}
                          isRestocking={restockingId === essential.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Uncategorized items */}
            {groupedEssentials.uncategorized.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSubcategory('uncategorized')}
                  className="w-full flex items-center gap-3 py-2 text-left"
                >
                  <span
                    className={`text-charcoal/40 transition-transform duration-200 ${
                      expandedSubcategories.has('uncategorized') ? 'rotate-90' : ''
                    }`}
                  >
                    ▶
                  </span>
                  <span className="text-xl">📦</span>
                  <span className="text-lg font-semibold text-charcoal flex-1">
                    Other
                  </span>
                  <span className="text-sm text-charcoal/50">
                    {groupedEssentials.uncategorized.length}
                  </span>
                </button>
                {expandedSubcategories.has('uncategorized') && (
                  <div className="space-y-2 ml-2 pl-6 border-l-2 border-charcoal/10">
                    {groupedEssentials.uncategorized.map((essential) => (
                      <BakingEssentialCard
                        key={essential.id}
                        essential={essential}
                        onEdit={() => setEditingEssential(essential)}
                        onDelete={() => setDeleteConfirmEssential(essential)}
                        onStatusChange={(status) => handleStatusChange(essential.id, status)}
                        onRestock={() => handleRestock(essential)}
                        isRestocking={restockingId === essential.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Modal */}
      <AddBakingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAdd}
        householdCode={householdCode || ''}
        customSubcategories={allSubcategories.filter(
          (s) => !BAKING_SUBCATEGORIES.some((b) => b.id === s.id)
        )}
      />

      {/* Edit Modal */}
      <EditBakingModal
        isOpen={!!editingEssential}
        essential={editingEssential}
        onClose={() => setEditingEssential(null)}
        onSave={handleEdit}
        householdCode={householdCode || ''}
        customSubcategories={allSubcategories.filter(
          (s) => !BAKING_SUBCATEGORIES.some((b) => b.id === s.id)
        )}
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

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-soft p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-display font-semibold text-charcoal mb-4">
              Create New Folder
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal/70 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g., Holiday Baking"
                  className="w-full px-3 py-2 border border-charcoal/20 rounded-soft focus:outline-none focus:ring-2 focus:ring-honey/50"
                  autoFocus
                />
              </div>
              <p className="text-xs text-charcoal/50">
                After creating a folder, add items to it using the + button and selecting this folder as the category.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="flex-1 px-4 py-2 border border-charcoal/20 rounded-soft text-charcoal hover:bg-charcoal/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 px-4 py-2 bg-honey text-white rounded-soft hover:bg-honey/90 transition-colors disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default BakingPage;
