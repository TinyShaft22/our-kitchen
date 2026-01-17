# Available Skills for Our Kitchen

This index helps Claude identify and use the right skill for each task.

## Plugins with Bundled MCP Servers (.claude/plugins/)

Plugins bundle skills WITH MCP servers. The MCP only loads when the plugin is enabled, saving context.

| Plugin | MCP Server | Skill | When to Use |
|--------|------------|-------|-------------|
| **frontend-ui** | shadcn MCP | frontend-design | **USE FOR ALL UI WORK** - Provides access to shadcn/ui component library. Browse, search, and install accessible React components. Customize with Our Kitchen theme. |

**To enable a plugin:** The plugin's MCP server and skills activate together. When disabled, no context is consumed.

**shadcn MCP capabilities:**
- Browse all available shadcn/ui components
- Search components by name or functionality
- View component source code and usage examples
- Install components: `pnpm dlx shadcn@latest add [component]`

---

## Project-Specific Skills (.claude/skills/)

These are tailored to the Our Kitchen app:

| Skill | Command | When to Use |
|-------|---------|-------------|
| **test-flow** | `/test-flow [flow]` | Manual UAT for app flows: household, meal, grocery, shopping, baking, pwa |
| **scaffold-component** | `/scaffold-component [path]` | Create new components with warm theme styling |
| **deploy-firebase** | `/deploy-firebase [action]` | Deploy security rules (rules), verify config (check), initialize (init) |
| **test-pwa** | `/test-pwa [device]` | PWA testing checklist for ios, android, desktop |
| **check-theme** | `/check-theme [path]` | Audit components for theme compliance |

## Global Skills (~/.claude/skills/)

These are available across all projects:

### High Priority for This Project

| Skill | Command | When to Use |
|-------|---------|-------------|
| **frontend-design** | (via plugin) | **NOW IN PLUGIN** - See `frontend-ui` plugin above. Includes shadcn MCP for component access. |
| **webapp-testing** | `/webapp-testing` | Automated Playwright testing for the web app. Use for regression testing, visual verification, browser automation. |

### Medium Priority

| Skill | Command | When to Use |
|-------|---------|-------------|
| **doc-coauthoring** | `/doc-coauthoring` | Structured workflow for documentation. Use when writing specs, proposals, or technical docs. |
| **theme-factory** | `/theme-factory` | 10 pre-set professional themes. We have our own warm theme, but could reference for inspiration. |
| **skill-creator** | `/skill-creator` | Guide for creating new skills. Use when adding new project skills. |

### Available But Not Primary

| Skill | Command | Purpose |
|-------|---------|---------|
| docx | `/docx` | Word document creation/editing |
| pdf | `/pdf` | PDF manipulation and forms |
| pptx | `/pptx` | PowerPoint creation |
| xlsx | `/xlsx` | Excel spreadsheets |
| canvas-design | `/canvas-design` | Visual art, posters |
| mcp-builder | `/mcp-builder` | Create MCP servers |
| web-artifacts-builder | `/web-artifacts-builder` | Complex React artifacts for claude.ai |
| brand-guidelines | `/brand-guidelines` | Anthropic brand styling |

## Skill Usage Guidelines

### Before Building UI Components
1. Enable `frontend-ui` plugin for shadcn MCP + design principles
2. Use shadcn MCP to find/install accessible component primitives
3. Use `/scaffold-component` for consistent structure
4. Run `/check-theme` after to verify theme compliance

### After Completing Features
1. Run `/test-flow [flow-name]` for manual UAT
2. Consider `/webapp-testing` for automated regression tests
3. Use `/gsd:verify-work` for GSD workflow integration

### For Firebase/Backend Work
1. Use `/deploy-firebase rules` after changing firestore.rules
2. Use `/deploy-firebase check` to verify configuration

### For PWA Phase
1. Use `/test-pwa ios` (primary device)
2. Use `/test-pwa android` for secondary testing
3. Use `/test-pwa desktop` for dev testing

## Proactive Skill Triggers

Claude should automatically consider using skills when:

| User Says... | Consider Using |
|--------------|----------------|
| "build a page/component" | `frontend-ui` plugin + `/scaffold-component` |
| "test the app" | `/test-flow` or `/webapp-testing` |
| "deploy rules" | `/deploy-firebase rules` |
| "check if it looks right" | `/check-theme` |
| "test on iPhone" | `/test-pwa ios` |
| "write documentation" | `/doc-coauthoring` |
| "create a new skill" | `/skill-creator` |

## Our Kitchen Theme Quick Reference

When using the `frontend-ui` plugin, apply these constraints:

```
Colors:
- bg-cream (#FDF8F3) - backgrounds
- bg-terracotta (#C4755B) - primary actions
- bg-sage (#87A878) - secondary
- bg-honey (#E8B86D) - accents
- text-charcoal (#3D3D3D) - text

Spacing:
- h-11 minimum touch targets (44px)
- rounded-soft (12px), rounded-softer (16px)
- shadow-soft for elevation

Vibe: Warm, cozy, inviting - like a kitchen
```
