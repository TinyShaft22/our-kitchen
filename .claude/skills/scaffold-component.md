---
name: scaffold-component
description: Create a new React component following Our Kitchen theme conventions
argument-hint: "[component-path, e.g., 'components/meals/MealCard' or 'pages/Settings']"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
---

<objective>
Scaffold a new React component with correct file structure, TypeScript types, and theme styling.

Purpose: Ensure all components follow project conventions for consistency.
Output: New component file(s) with correct structure and styling.
</objective>

<context>
Component path: $ARGUMENTS (e.g., "components/meals/MealCard" or "pages/Settings")

@.planning/SPEC.md
@src/index.css (for theme reference)
</context>

<theme_reference>
## Our Kitchen Theme

### Colors (use these Tailwind classes)
- Background: `bg-cream` (#FDF8F3)
- Primary action: `bg-terracotta` (#C4755B), `text-terracotta`
- Secondary: `bg-sage` (#87A878), `text-sage`
- Accent: `bg-honey` (#E8B86D), `text-honey`
- Text: `text-charcoal` (#3D3D3D)
- Muted text: `text-charcoal/60`

### Spacing & Sizing
- Touch targets: minimum `h-11` (44px)
- Card padding: `p-4` or `p-6`
- Section gaps: `gap-4` or `space-y-4`
- Border radius: `rounded-soft` (12px) or `rounded-softer` (16px)

### Shadows
- Cards/elevated: `shadow-soft`

### Typography
- Headings: `font-semibold` or `font-bold`
- Body: default weight
- Small/muted: `text-sm text-charcoal/60`

### Common Patterns
```tsx
// Button (primary)
<button className="bg-terracotta text-white rounded-soft h-11 px-6 font-semibold">
  Action
</button>

// Button (secondary)
<button className="bg-white border border-charcoal/20 text-charcoal rounded-soft h-11 px-6">
  Cancel
</button>

// Card
<div className="bg-white rounded-softer shadow-soft p-4">
  Content
</div>

// Input
<input className="w-full h-11 px-4 border-2 border-charcoal/20 rounded-soft focus:border-terracotta focus:outline-none" />

// Page container
<div className="p-4 space-y-4">
  Page content
</div>
```
</theme_reference>

<component_templates>

<template type="page">
```tsx
// src/pages/{Name}.tsx

export function {Name}() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-charcoal">{Title}</h1>

      {/* Content */}
    </div>
  );
}
```
</template>

<template type="component">
```tsx
// src/components/{path}/{Name}.tsx

interface {Name}Props {
  // Define props
}

export function {Name}({ }: {Name}Props) {
  return (
    <div className="">
      {/* Component content */}
    </div>
  );
}
```
</template>

<template type="card">
```tsx
// src/components/{path}/{Name}Card.tsx

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
      <p className="text-sm text-charcoal/60">{item.description}</p>
    </button>
  );
}
```
</template>

<template type="modal">
```tsx
// src/components/{path}/{Name}Modal.tsx

interface {Name}ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function {Name}Modal({ isOpen, onClose }: {Name}ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative bg-cream rounded-t-softer sm:rounded-softer w-full sm:max-w-md max-h-[80vh] overflow-auto p-6 space-y-4">
        <h2 className="text-lg font-bold text-charcoal">{Title}</h2>

        {/* Modal content */}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 bg-white border border-charcoal/20 text-charcoal rounded-soft"
          >
            Cancel
          </button>
          <button className="flex-1 h-11 bg-terracotta text-white rounded-soft font-semibold">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
```
</template>

<template type="list">
```tsx
// src/components/{path}/{Name}List.tsx

interface {Name}ListProps {
  items: {Type}[];
  onItemTap?: (item: {Type}) => void;
}

export function {Name}List({ items, onItemTap }: {Name}ListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-charcoal/60">
        No items yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <{Name}Card
          key={item.id}
          item={item}
          onTap={() => onItemTap?.(item)}
        />
      ))}
    </div>
  );
}
```
</template>

</component_templates>

<process>
1. Parse $ARGUMENTS to get component path
2. Determine component type from name/path:
   - Ends in "Page" or in pages/ → page template
   - Ends in "Card" → card template
   - Ends in "Modal" → modal template
   - Ends in "List" → list template
   - Otherwise → generic component template
3. Create directory if needed
4. Generate component file with:
   - Correct imports
   - TypeScript interface for props
   - Theme-compliant styling
   - Placeholder content
5. If component needs types, suggest type definition
6. Report what was created
</process>

<success_criteria>
- [ ] Component path parsed correctly
- [ ] Appropriate template selected
- [ ] Directory created if needed
- [ ] Component file created with theme styling
- [ ] TypeScript types defined
- [ ] Component exports correctly
</success_criteria>
