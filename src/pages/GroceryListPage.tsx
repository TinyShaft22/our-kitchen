import { useState, useMemo, useEffect, useRef } from 'react';
import { useHousehold } from '../hooks/useHousehold';
import { useMeals } from '../hooks/useMeals';
import { useWeeklyPlan } from '../hooks/useWeeklyPlan';
import { useGroceryList } from '../hooks/useGroceryList';
import { useStaples } from '../hooks/useStaples';
import { useBaking } from '../hooks/useBaking';
import { generateGroceryItems, generateBakingGroceryItems } from '../utils/generateGroceryItems';
import { GroceryItemCard } from '../components/grocery/GroceryItemCard';
import { StapleCard } from '../components/grocery/StapleCard';
import { AddStapleModal } from '../components/grocery/AddStapleModal';
import { EditStapleModal } from '../components/grocery/EditStapleModal';
import { VoiceInputModal } from '../components/grocery/VoiceInputModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Button } from '../components/ui/button';
import { GroceryItemSkeleton, Skeleton } from '../components/ui/skeleton';
import { EmptyGroceryList, EmptyStaples } from '../components/ui/EmptyState';
import { CATEGORIES, STORES } from '../types';
import type { GroceryItem, Category, Store, Staple } from '../types';

function GroceryListPage() {
  const { householdCode } = useHousehold();
  const { meals, loading: mealsLoading } = useMeals(householdCode);
  const { currentWeek, loading: weekLoading, toggleAlreadyHave } = useWeeklyPlan(householdCode);
  const { items, loading: groceryLoading, addItem, generateFromWeeklyPlan, updateStatus, updateItem, deleteItem, completeTrip } = useGroceryList(householdCode);
  const { staples, enabledStaples, loading: staplesLoading, addStaple, updateStaple, toggleEnabled, deleteStaple } = useStaples(householdCode);
  const { essentials, loading: bakingLoading } = useBaking(householdCode);
  const [completing, setCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Ref to track if initial load is complete
  const initialLoadComplete = useRef(false);
  const [selectedStore, setSelectedStore] = useState<Store | 'all'>('all');
  const [staplesExpanded, setStaplesExpanded] = useState(false);
  const [alreadyHaveExpanded, setAlreadyHaveExpanded] = useState(false);
  const [showAddStaple, setShowAddStaple] = useState(false);
  const [editingStaple, setEditingStaple] = useState<Staple | null>(null);
  const [deleteConfirmStaple, setDeleteConfirmStaple] = useState<Staple | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Combined loading state
  const loading = mealsLoading || weekLoading || groceryLoading || staplesLoading || bakingLoading;

  // Auto-sync effect: regenerate grocery list when dependencies change
  useEffect(() => {
    // Skip if still loading initial data
    if (loading) {
      return;
    }

    // Mark initial load as complete
    if (!initialLoadComplete.current) {
      initialLoadComplete.current = true;
    }

    // Debounce regeneration to avoid rapid-fire updates
    const timeoutId = setTimeout(async () => {
      try {
        const alreadyHave = currentWeek?.alreadyHave || [];
        // Generate regular meal grocery items (excludes baking recipes)
        const generatedItems = currentWeek?.meals.length
          ? generateGroceryItems(meals, currentWeek.meals, alreadyHave)
          : [];
        // Generate baking grocery items via inventory cross-check
        const bakingItems = currentWeek?.meals.length
          ? generateBakingGroceryItems(meals, currentWeek.meals, essentials)
          : [];
        await generateFromWeeklyPlan(generatedItems, enabledStaples, bakingItems);
      } catch (err) {
        console.error('Failed to auto-generate grocery list:', err);
      }
    }, 300);

    // Cleanup timeout on dependency change or unmount
    return () => clearTimeout(timeoutId);
  }, [loading, currentWeek?.meals, currentWeek?.alreadyHave, enabledStaples, essentials, meals, generateFromWeeklyPlan]);

  // Filter items by selected store
  const filteredItems = useMemo(() => {
    if (selectedStore === 'all') {
      return items;
    }
    return items.filter((item) => item.store === selectedStore);
  }, [items, selectedStore]);

  // Calculate in-cart progress for filtered items
  const inCartCount = useMemo(() => {
    return filteredItems.filter((item) => item.status === 'in-cart').length;
  }, [filteredItems]);
  const totalCount = filteredItems.length;

  // Get stores that have items we still need (not in-cart)
  const storesWithItems = useMemo(() => {
    const storeSet = new Set<Store>();
    for (const item of items) {
      // Only count items we still need, not ones already in cart
      if (item.status === 'need') {
        storeSet.add(item.store);
      }
    }
    return STORES.filter((store) => storeSet.has(store.id));
  }, [items]);

  // Group filtered items by category
  const groupedItems = useMemo(() => {
    const groups = new Map<Category, GroceryItem[]>();

    // Initialize groups in CATEGORIES order
    for (const cat of CATEGORIES) {
      groups.set(cat.id, []);
    }

    // Add items to their category groups
    for (const item of filteredItems) {
      const group = groups.get(item.category);
      if (group) {
        group.push(item);
      }
    }

    // Filter out empty categories and convert to array
    return CATEGORIES.filter((cat) => {
      const group = groups.get(cat.id);
      return group && group.length > 0;
    }).map((cat) => ({
      category: cat,
      items: groups.get(cat.id) || [],
    }));
  }, [filteredItems]);

  const handleCompleteTrip = async () => {
    if (selectedStore === 'all') return;
    setCompleting(true);
    try {
      await completeTrip(selectedStore);
      // Show celebration animation
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    } catch (err) {
      console.error('Failed to complete trip:', err);
    } finally {
      setCompleting(false);
    }
  };

  // Generate confetti particles
  const confettiParticles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 2,
      color: ['#C4755B', '#87A878', '#E8B86D', '#FDF8F3'][Math.floor(Math.random() * 4)],
      size: 6 + Math.random() * 8,
    }));
  }, []);

  // Shopping mode is active when a specific store is selected
  const isShoppingMode = selectedStore !== 'all';

  if (loading) {
    return (
      <div className="pb-32">
        <div className="hero-gradient-sage px-4 pt-6 pb-4">
          <h1 className="text-2xl font-display font-semibold text-charcoal">Grocery List</h1>
          <p className="text-sm text-charcoal/60 mt-1">Loading items...</p>
        </div>
        <div className="px-4 space-y-6 mt-4">
          {/* Store filter skeleton */}
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-24 rounded-full shrink-0" />
            ))}
          </div>
          {/* Staples section skeleton */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          {/* Grocery items skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ animationDelay: `${i * 80}ms` }}>
                  <GroceryItemSkeleton />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-20" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ animationDelay: `${(i + 4) * 80}ms` }}>
                  <GroceryItemSkeleton />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Hero section with sage gradient */}
      <div className="hero-gradient-sage px-4 pt-6 pb-4">
        <h1 className="text-2xl font-display font-semibold text-charcoal">Grocery List</h1>
        <p className="text-sm text-charcoal/60 mt-1">
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          {selectedStore !== 'all' && ` at ${STORES.find((s) => s.id === selectedStore)?.name}`}
        </p>
      </div>

      <div className="px-4">

      {/* Store filter pills - only show stores that have items */}
      {items.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 mt-4">
          <Button
            variant={selectedStore === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedStore('all')}
            className="rounded-full whitespace-nowrap min-h-[44px]"
          >
            All
          </Button>
          {storesWithItems.map((store) => (
            <Button
              key={store.id}
              variant={selectedStore === store.id ? 'default' : 'outline'}
              onClick={() => setSelectedStore(store.id)}
              className="rounded-full whitespace-nowrap min-h-[44px]"
            >
              {store.name}
            </Button>
          ))}
        </div>
      )}

      {/* Shopping progress bar - only when store selected */}
      {selectedStore !== 'all' && totalCount > 0 && (
        <div className="mt-4 mb-2">
          <p className="text-sm text-charcoal/70 mb-1">
            {inCartCount} of {totalCount} in cart
          </p>
          <div className="h-2 bg-charcoal/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage transition-all duration-300"
              style={{ width: `${(inCartCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Staples section - collapsible */}
      <div className="mt-4">
        <button
          onClick={() => setStaplesExpanded(!staplesExpanded)}
          className="w-full flex items-center justify-between py-2"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-display font-semibold text-charcoal">Staples</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-charcoal/10 text-charcoal/70">
              {enabledStaples.length}/{staples.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowAddStaple(true);
              }}
              className="rounded-full"
              aria-label="Add staple"
            >
              +
            </Button>
            <span
              className={`text-charcoal/50 transition-transform duration-200 transition-spring ${
                staplesExpanded ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </div>
        </button>

        {/* Collapsed summary */}
        {!staplesExpanded && staples.length > 0 && (
          <p className="text-sm text-charcoal/60 -mt-1">
            {enabledStaples.length} of {staples.length} enabled
          </p>
        )}

        {/* Expanded staple list */}
        {staplesExpanded && (
          <div className="space-y-2 mt-2">
            {staples.length === 0 ? (
              <EmptyStaples onAdd={() => setShowAddStaple(true)} />
            ) : (
              staples.map((staple) => (
                <StapleCard
                  key={staple.id}
                  staple={staple}
                  onToggle={(enabled) => toggleEnabled(staple.id, enabled)}
                  onEdit={() => setEditingStaple(staple)}
                  onDelete={() => setDeleteConfirmStaple(staple)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Already Have section - collapsible */}
      {(currentWeek?.alreadyHave?.length ?? 0) > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setAlreadyHaveExpanded(!alreadyHaveExpanded)}
            className="w-full flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-display font-semibold text-charcoal">Already Have</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-charcoal/10 text-charcoal/70">
                {currentWeek?.alreadyHave?.length ?? 0}
              </span>
            </div>
            <span
              className={`text-charcoal/50 transition-transform ${
                alreadyHaveExpanded ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </button>

          {/* Collapsed summary */}
          {!alreadyHaveExpanded && (
            <p className="text-sm text-charcoal/60 -mt-1">
              {currentWeek?.alreadyHave?.length ?? 0} item{(currentWeek?.alreadyHave?.length ?? 0) !== 1 ? 's' : ''} excluded this week
            </p>
          )}

          {/* Expanded already have list */}
          {alreadyHaveExpanded && (
            <div className="space-y-2 mt-2">
              {currentWeek?.alreadyHave?.map((ingredientName) => (
                <div
                  key={ingredientName}
                  className="flex items-center justify-between bg-white rounded-soft shadow-soft p-3"
                >
                  <span className="text-charcoal capitalize">{ingredientName}</span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => toggleAlreadyHave(ingredientName)}
                    className="gap-1"
                    aria-label={`Re-add ${ingredientName} to grocery list`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    Re-add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="mt-8">
          <EmptyGroceryList hasWeeklyPlan={!!(currentWeek && currentWeek.meals && currentWeek.meals.length > 0)} />
        </div>
      )}

      {/* Grouped items */}
      {groupedItems.length > 0 && (
        <div className="mt-6 space-y-6">
          {groupedItems.map(({ category, items: categoryItems }) => (
            <section key={category.id}>
              <h2 className="text-lg font-display font-semibold text-charcoal mb-3">
                {category.name}
              </h2>
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <GroceryItemCard
                    key={item.id}
                    item={item}
                    onToggleInCart={() =>
                      updateStatus(item.id, item.status === 'in-cart' ? 'need' : 'in-cart')
                    }
                    onDelete={() => deleteItem(item.id)}
                    onStoreChange={(store) => updateItem(item.id, { store })}
                    onCategoryChange={(category) => updateItem(item.id, { category })}
                    onToggleAlreadyHave={
                      item.source === 'meal' ? () => toggleAlreadyHave(item.name) : undefined
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Complete Trip button - only in shopping mode with items in cart */}
      {isShoppingMode && inCartCount > 0 && (
        <Button
          variant="secondary"
          size="lg"
          onClick={handleCompleteTrip}
          loading={completing}
          className="fixed bottom-24 left-4 right-4 shadow-lg"
        >
          {completing ? 'Completing...' : `Complete Trip (${inCartCount} items)`}
        </Button>
      )}

      {/* Voice Input FAB - hidden during shopping mode */}
      {!isShoppingMode && (
        <Button
          size="icon-lg"
          onClick={() => setShowVoiceModal(true)}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg"
          aria-label="Add item by voice"
        >
          <span className="text-xl">🎙️</span>
        </Button>
      )}

      {/* Add Staple Modal */}
      <AddStapleModal
        isOpen={showAddStaple}
        onClose={() => setShowAddStaple(false)}
        onSave={async (staple) => {
          await addStaple(staple);
        }}
      />

      {/* Edit Staple Modal */}
      {editingStaple && (
        <EditStapleModal
          isOpen={!!editingStaple}
          onClose={() => setEditingStaple(null)}
          staple={editingStaple}
          onSave={async (updates) => {
            await updateStaple(editingStaple.id, updates);
            setEditingStaple(null);
          }}
        />
      )}

      {/* Delete Staple Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmStaple}
        onClose={() => setDeleteConfirmStaple(null)}
        onConfirm={async () => {
          if (deleteConfirmStaple) {
            await deleteStaple(deleteConfirmStaple.id);
            setDeleteConfirmStaple(null);
          }
        }}
        title="Delete Staple"
        message={`Are you sure you want to delete "${deleteConfirmStaple?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      {/* Voice Input Modal */}
      <VoiceInputModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onAddItem={addItem}
      />

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {/* Confetti particles */}
          {confettiParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute animate-bounce"
              style={{
                left: `${particle.left}%`,
                top: '-20px',
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `confetti-fall ${particle.duration}s ease-out forwards`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
          {/* Success message */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-sage text-white px-8 py-4 rounded-softer shadow-lifted animate-bounce-in font-display text-xl font-semibold">
              🎉 Shopping Complete!
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default GroceryListPage;
