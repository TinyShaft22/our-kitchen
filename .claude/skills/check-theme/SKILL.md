---
name: check-theme
description: Audit React components for Our Kitchen theme compliance. Use when checking if components follow the warm & cozy theme (terracotta, sage, honey colors, rounded-soft borders, shadow-soft). Triggers on requests to check theme, audit styling, verify colors, or validate UI consistency.
---

# Check Theme

Audit components to ensure they follow the Our Kitchen warm & cozy theme.

## Theme Specification

### Required Colors (Tailwind classes)
| Use | Class | Hex |
|-----|-------|-----|
| Background | `bg-cream` | #FDF8F3 |
| Primary/CTA | `bg-terracotta`, `text-terracotta` | #C4755B |
| Secondary | `bg-sage`, `text-sage` | #87A878 |
| Accent | `bg-honey`, `text-honey` | #E8B86D |
| Text | `text-charcoal` | #3D3D3D |
| Muted | `text-charcoal/60` | #3D3D3D @ 60% |

### Forbidden Raw Colors
- `bg-gray-*`, `text-gray-*` (use charcoal variants)
- `bg-red-*`, `bg-blue-*`, etc. (use theme colors)
- Hex codes in className

### Required Spacing
- Touch targets: `h-11` minimum (44px)
- Border radius: `rounded-soft` (12px) or `rounded-softer` (16px)
- Shadow: `shadow-soft`

## Checks to Run

```bash
# Forbidden colors
grep -rn "text-gray-\|bg-gray-\|bg-red-\|bg-blue-\|bg-green-" src/components src/pages

# Non-theme rounded classes
grep -rn "rounded-md\|rounded-lg\|rounded-xl\|rounded-2xl" src/components src/pages

# Non-theme shadows
grep -rn "shadow-sm\|shadow-md\|shadow-lg\|shadow-xl" src/components src/pages

# text-black (should use text-charcoal)
grep -rn "text-black" src/components src/pages
```

## Report Format

| Check | Status | Violations |
|-------|--------|------------|
| Forbidden Colors | PASS/FAIL | N |
| Touch Targets | PASS/FAIL | N |
| Border Radius | PASS/FAIL | N |
| Shadows | PASS/FAIL | N |

Provide fix suggestions for any violations found.
