---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces using shadcn/ui components. Use this skill when building React components, pages, or UI for the Our Kitchen app. Leverages the shadcn MCP server to browse, search, and install components.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - mcp__shadcn__*
---

This skill guides creation of distinctive, production-grade frontend interfaces using shadcn/ui components while avoiding generic "AI slop" aesthetics. The shadcn MCP server provides direct access to component documentation, source code, and installation.

## Stack Context

This project uses:
- **React 19** with TypeScript
- **Vite 7** as the build tool
- **Tailwind CSS 4** for styling
- **shadcn/ui** for accessible component primitives

## Using the shadcn MCP Server

When this plugin is active, you have access to shadcn MCP tools:

1. **Browse components**: List all available shadcn/ui components
2. **Search components**: Find components by name or functionality
3. **Get component details**: View source code, usage examples, and props
4. **Install components**: Add components to the project with `pnpm dlx shadcn@latest add [component]`

**Always check what's available** before building custom components - shadcn likely has an accessible, well-tested primitive you can customize.

## Our Kitchen Theme Integration

When using shadcn components, customize them with the Our Kitchen warm theme:

```css
/* Theme Colors */
--cream: #FDF8F3        /* backgrounds */
--terracotta: #C4755B   /* primary actions */
--sage: #87A878         /* secondary/success */
--honey: #E8B86D        /* accents/warnings */
--charcoal: #3D3D3D     /* text */

/* Theme Spacing */
--touch-target: 44px (h-11)
--rounded-soft: 12px
--rounded-softer: 16px
```

When installing shadcn components, modify their default styles to match:
- Replace blue/slate defaults with terracotta/cream
- Use `rounded-xl` or custom `rounded-soft` instead of default rounding
- Apply `shadow-soft` for elevation
- Ensure 44px minimum touch targets

## Design Thinking

Before coding, understand the context and commit to a cohesive aesthetic:

1. **Purpose**: What problem does this interface solve? Who uses it?
2. **Tone**: Our Kitchen = warm, cozy, inviting - like a kitchen. Not sterile or corporate.
3. **Component Selection**: Use shadcn MCP to find the right primitives
4. **Customization**: Apply Our Kitchen theme tokens to shadcn defaults

## Component Installation Workflow

1. **Search** for what you need using shadcn MCP
2. **Review** the component's props and variants
3. **Install** with: `pnpm dlx shadcn@latest add [component-name]`
4. **Customize** the installed component with Our Kitchen theme
5. **Test** accessibility (shadcn components are accessible by default)

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Use the project's configured fonts, not shadcn defaults
- **Color & Theme**: Apply Our Kitchen CSS variables consistently
- **Motion**: Use subtle, purposeful animations - not flashy
- **Spatial Composition**: Generous padding, clear hierarchy
- **Accessibility**: shadcn components handle this - don't break it

## Anti-Patterns to Avoid

- Using shadcn components without customizing to match the theme
- Overriding accessibility features (focus states, ARIA attributes)
- Installing components you don't need
- Building custom components when shadcn has an equivalent
- Generic gray/blue color schemes instead of warm theme colors
