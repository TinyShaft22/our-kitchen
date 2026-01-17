import { useState } from 'react';

interface FloatingActionButtonProps {
  onClick: () => void;
  ariaLabel?: string;
}

export function FloatingActionButton({
  onClick,
  ariaLabel = 'Add new item',
}: FloatingActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    onClick();
    // Reset after animation
    setTimeout(() => setIsPressed(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setTimeout(() => setIsPressed(false), 150)}
      onMouseLeave={() => setIsPressed(false)}
      className={`fixed bottom-[100px] right-4 w-14 h-14 bg-terracotta text-white rounded-full shadow-lifted flex items-center justify-center z-40 transition-all duration-200 ${
        isPressed
          ? 'scale-90 shadow-soft'
          : 'hover:scale-105 hover:shadow-xl animate-gentle-pulse'
      }`}
      style={{
        transitionTimingFunction: 'var(--ease-spring)',
      }}
      aria-label={ariaLabel}
    >
      <span
        className={`text-2xl font-bold transition-transform duration-200 ${
          isPressed ? 'rotate-90 scale-110' : ''
        }`}
        style={{ transitionTimingFunction: 'var(--ease-spring)' }}
      >
        +
      </span>
    </button>
  );
}
