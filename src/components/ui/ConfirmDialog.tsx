import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const confirmButtonClass =
    confirmVariant === 'danger'
      ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 border-red-500'
      : 'bg-terracotta text-white hover:bg-terracotta/90 active:bg-terracotta/80 border-terracotta';

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-cream rounded-soft max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-charcoal">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-charcoal/70">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-3">
          <AlertDialogCancel
            onClick={onClose}
            className="flex-1 h-11 rounded-soft border border-charcoal/20 text-charcoal text-sm font-medium hover:bg-charcoal/5 active:bg-charcoal/10"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={`flex-1 h-11 rounded-soft text-sm font-medium ${confirmButtonClass}`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
