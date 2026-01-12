interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const confirmButtonClass =
    confirmVariant === 'danger'
      ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
      : 'bg-terracotta text-white hover:bg-terracotta/90 active:bg-terracotta/80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Panel */}
      <div className="relative bg-cream rounded-soft w-full max-w-sm mx-4 shadow-lg">
        {/* Content */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-charcoal mb-2">{title}</h2>
          <p className="text-sm text-charcoal/70">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-soft border border-charcoal/20 text-charcoal text-sm font-medium hover:bg-charcoal/5 active:bg-charcoal/10 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-11 rounded-soft text-sm font-medium transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
