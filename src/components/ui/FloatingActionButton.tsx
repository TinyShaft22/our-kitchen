interface FloatingActionButtonProps {
  onClick: () => void;
  ariaLabel?: string;
}

export function FloatingActionButton({
  onClick,
  ariaLabel = 'Add new item',
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-[100px] right-4 w-14 h-14 bg-terracotta text-white rounded-full shadow-lg flex items-center justify-center hover:bg-terracotta/90 active:bg-terracotta/80 transition-colors z-40"
      aria-label={ariaLabel}
    >
      <span className="text-2xl font-bold">+</span>
    </button>
  );
}
