---
name: scaffold-component
description: Create new React components following Our Kitchen theme conventions. Use when creating pages, cards, modals, or list components. Triggers on requests to scaffold, create, or generate new React components with proper TypeScript types and theme styling.
---

# Scaffold Component

Create React components with correct structure, TypeScript types, and theme styling.

## Theme Quick Reference

**Colors:** `bg-cream`, `bg-terracotta`, `bg-sage`, `bg-honey`, `text-charcoal`
**Sizing:** `h-11` touch targets, `rounded-soft`, `shadow-soft`

## Templates

### Page
```tsx
export function {Name}() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-charcoal">{Title}</h1>
    </div>
  );
}
```

### Card
```tsx
interface {Name}CardProps {
  item: {Type};
  onTap?: () => void;
}

export function {Name}Card({ item, onTap }: {Name}CardProps) {
  return (
    <button
      onClick={onTap}
      className="w-full bg-white rounded-softer shadow-soft p-4 text-left active:scale-[0.98] transition-transform"
    >
      <h3 className="font-semibold text-charcoal">{item.name}</h3>
    </button>
  );
}
```

### Modal
```tsx
interface {Name}ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function {Name}Modal({ isOpen, onClose }: {Name}ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-cream rounded-t-softer sm:rounded-softer w-full sm:max-w-md max-h-[80vh] overflow-auto p-6 space-y-4">
        <h2 className="text-lg font-bold text-charcoal">{Title}</h2>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 bg-white border border-charcoal/20 text-charcoal rounded-soft">Cancel</button>
          <button className="flex-1 h-11 bg-terracotta text-white rounded-soft font-semibold">Confirm</button>
        </div>
      </div>
    </div>
  );
}
```

## Process

1. Determine component type from name (Page, Card, Modal, List)
2. Create directory if needed
3. Generate file with TypeScript interface and theme styling
