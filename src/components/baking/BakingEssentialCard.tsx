import { useState } from 'react';
import type { BakingEssential, BakingStatus } from '../../types';
import { STORES } from '../../types';

interface BakingEssentialCardProps {
  essential: BakingEssential;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: BakingStatus) => void;
  onRestock?: () => void;
  isRestocking?: boolean;
}

const STATUS_CONFIG: Record<BakingStatus, { label: string; bgClass: string; textClass: string }> = {
  stocked: {
    label: 'Stocked',
    bgClass: 'bg-sage/20',
    textClass: 'text-sage',
  },
  low: {
    label: 'Low',
    bgClass: 'bg-honey/30',
    textClass: 'text-amber-700',
  },
  out: {
    label: 'Out',
    bgClass: 'bg-terracotta/20',
    textClass: 'text-terracotta',
  },
};

const STATUS_CYCLE: Record<BakingStatus, BakingStatus> = {
  stocked: 'low',
  low: 'out',
  out: 'stocked',
};

export function BakingEssentialCard({
  essential,
  onEdit,
  onDelete,
  onStatusChange,
  onRestock,
  isRestocking = false,
}: BakingEssentialCardProps) {
  const [showActions, setShowActions] = useState(false);

  const statusConfig = STATUS_CONFIG[essential.status];
  const needsRestock = essential.status === 'low' || essential.status === 'out';
  const storeName = STORES.find((s) => s.id === essential.store)?.name || essential.store;

  const handleStatusCycle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = STATUS_CYCLE[essential.status];
    onStatusChange(nextStatus);
  };

  const handleRestock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRestock && !isRestocking) {
      onRestock();
    }
  };

  return (
    <div
      className="bg-white rounded-soft shadow-soft p-3 min-h-[44px] flex items-center justify-between gap-3"
      onClick={() => setShowActions(!showActions)}
    >
      {/* Left side: Name and store */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-charcoal truncate">{essential.name}</p>
        <p className="text-sm text-charcoal/60">{storeName}</p>
      </div>

      {/* Action buttons (shown on tap) */}
      {showActions && (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-charcoal/10 transition-colors"
            aria-label="Edit essential"
          >
            <span className="text-lg">✏️</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-charcoal/10 transition-colors"
            aria-label="Delete essential"
          >
            <span className="text-lg">🗑️</span>
          </button>
        </div>
      )}

      {/* Restock button (only for low/out items) */}
      {needsRestock && onRestock && (
        <button
          onClick={handleRestock}
          disabled={isRestocking}
          className="px-3 py-1.5 rounded-full text-sm font-medium bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50 flex-shrink-0 transition-colors"
          aria-label="Add to grocery list"
        >
          {isRestocking ? '...' : '🛒 Restock'}
        </button>
      )}

      {/* Right side: Status badge (tappable to cycle) */}
      <button
        onClick={handleStatusCycle}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${statusConfig.bgClass} ${statusConfig.textClass}`}
        aria-label={`Status: ${statusConfig.label}. Tap to change.`}
      >
        {statusConfig.label}
      </button>
    </div>
  );
}
