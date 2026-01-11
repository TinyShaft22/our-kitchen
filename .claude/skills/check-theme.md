---
name: check-theme
description: Audit components for Our Kitchen theme compliance
argument-hint: "[path: specific file or directory to check] (optional)"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
---

<objective>
Audit React components to ensure they follow the Our Kitchen warm & cozy theme.

Purpose: Maintain visual consistency across the app.
Output: Theme compliance report with any violations.
</objective>

<context>
Path to check: $ARGUMENTS (defaults to src/components and src/pages if not specified)

@src/index.css (theme definitions)
@.planning/SPEC.md (design spec)
</context>

<theme_spec>
## Our Kitchen Theme Specification

### Required Colors (custom Tailwind classes)
| Use | Class | Hex |
|-----|-------|-----|
| Background | `bg-cream` | #FDF8F3 |
| Primary/CTA | `bg-terracotta`, `text-terracotta` | #C4755B |
| Secondary | `bg-sage`, `text-sage` | #87A878 |
| Accent | `bg-honey`, `text-honey` | #E8B86D |
| Text | `text-charcoal` | #3D3D3D |
| Muted | `text-charcoal/60` | #3D3D3D @ 60% |

### Forbidden Raw Colors
These should NOT appear in component files:
- `bg-white` (use `bg-cream` or `bg-white` only for cards)
- `bg-gray-*` (use charcoal variants)
- `text-gray-*` (use charcoal variants)
- `bg-red-*`, `bg-blue-*`, etc. (use theme colors)
- Hex codes in className (use theme classes)

### Required Spacing
- Touch targets: `h-11` minimum (44px)
- Border radius: `rounded-soft` (12px) or `rounded-softer` (16px)
- Shadow: `shadow-soft`

### Typography
- Headings: `font-semibold` or `font-bold`
- Use `text-charcoal` for body text
- Use `text-charcoal/60` for secondary text
</theme_spec>

<checks>

<check name="forbidden_colors">
## Check: Forbidden Color Classes

Scan for non-theme color classes:
```bash
# Look for gray classes (should use charcoal)
grep -rn "text-gray-\|bg-gray-" src/components src/pages 2>/dev/null

# Look for raw color classes (should use theme)
grep -rn "bg-red-\|bg-blue-\|bg-green-\|bg-yellow-\|bg-purple-\|bg-pink-" src/components src/pages 2>/dev/null

# Look for hardcoded hex colors in className
grep -rn 'className="[^"]*#[0-9a-fA-F]' src/components src/pages 2>/dev/null
```

**Expected**: No matches (all files should use theme classes)
</check>

<check name="touch_targets">
## Check: Touch Target Sizes

Scan for buttons and interactive elements:
```bash
# Find all buttons
grep -rn "<button" src/components src/pages 2>/dev/null

# Check if they have h-11 or min-h-\[44px\]
grep -rn "<button" src/components src/pages | grep -v "h-11\|h-12\|min-h-" 2>/dev/null
```

**Expected**: All buttons should have `h-11` or larger
</check>

<check name="border_radius">
## Check: Border Radius

Scan for rounded classes:
```bash
# Look for non-theme rounded classes
grep -rn "rounded-md\|rounded-lg\|rounded-xl\|rounded-2xl\|rounded-full" src/components src/pages 2>/dev/null
```

**Expected**: Should use `rounded-soft` (12px) or `rounded-softer` (16px)
Exception: `rounded-full` is OK for circular elements (avatars, icons)
</check>

<check name="shadows">
## Check: Shadows

Scan for shadow classes:
```bash
# Look for non-theme shadow classes
grep -rn "shadow-sm\|shadow-md\|shadow-lg\|shadow-xl" src/components src/pages 2>/dev/null
```

**Expected**: Should use `shadow-soft`
</check>

<check name="backgrounds">
## Check: Background Colors

Verify cream background usage:
```bash
# Main containers should use bg-cream
grep -rn "bg-white" src/pages 2>/dev/null

# Cards can use bg-white, but pages should use bg-cream
```

**Expected**:
- Pages use `bg-cream`
- Cards/modals can use `bg-white`
</check>

<check name="typography">
## Check: Text Colors

Verify text color usage:
```bash
# Look for text-black (should use text-charcoal)
grep -rn "text-black" src/components src/pages 2>/dev/null

# Look for opacity variants that aren't charcoal
grep -rn "text-white/\|text-black/" src/components src/pages 2>/dev/null
```

**Expected**: Use `text-charcoal` and `text-charcoal/60`
</check>

</checks>

<process>
1. Determine scope from $ARGUMENTS (specific path or all components/pages)
2. Run each check as a grep scan
3. Collect violations
4. For each violation:
   - File and line number
   - What was found
   - What it should be
5. Generate report:
   - Total files scanned
   - Violations by category
   - Overall compliance score
6. Provide fix suggestions
</process>

<report_format>
## Theme Compliance Report

**Scope**: [path scanned]
**Files Scanned**: [count]

### Summary
| Check | Status | Violations |
|-------|--------|------------|
| Forbidden Colors | PASS/FAIL | N |
| Touch Targets | PASS/FAIL | N |
| Border Radius | PASS/FAIL | N |
| Shadows | PASS/FAIL | N |
| Backgrounds | PASS/FAIL | N |
| Typography | PASS/FAIL | N |

### Violations

[List each violation with file:line and fix]

### Compliance Score: X/6 checks passing
</report_format>

<success_criteria>
- [ ] Scope determined
- [ ] All checks executed
- [ ] Violations collected with locations
- [ ] Report generated
- [ ] Fix suggestions provided
- [ ] Compliance score calculated
</success_criteria>
