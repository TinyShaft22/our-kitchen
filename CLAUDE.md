# Project Instructions

## Protected Files & Directories (DO NOT DELETE)

The following are **essential configuration files** that must NEVER be removed during code sweeps, cleanup operations, or refactoring:

```
.claude/                    # ENTIRE directory is protected
├── plugins/                # Claude plugins with bundled MCP servers
│   └── frontend-ui/        # shadcn MCP + frontend design skill
│       ├── .claude-plugin/
│       ├── .mcp.json       # shadcn MCP - only loads when plugin enabled
│       └── skills/
├── skills/                 # Claude skills - NOT unused code
│   ├── check-theme/
│   ├── deploy-firebase/
│   ├── frontend-design/
│   ├── mcp-builder/
│   ├── pdf/
│   ├── scaffold-component/
│   ├── skill-creator/
│   ├── test-flow/
│   ├── test-pwa/
│   ├── theme-factory/
│   ├── webapp-testing/
│   └── xlsx/
├── commands/               # GSD workflow commands
├── get-shit-done/          # GSD templates and references
└── SKILLS.md               # Skill index
.planning/                  # Planning documents
```

**Why these exist:** Skills and commands are markdown-based configuration that Claude Code uses at runtime. They are NOT "dead code" even though no TypeScript/React files import them. Deleting them breaks Claude's ability to use specialized workflows.

**During any cleanup task:** Explicitly exclude `.claude/` and `.planning/` directories

## Custom Plugins with Embedded MCPs

A **user-level custom marketplace** exists at `~/.claude/plugins/marketplaces/custom/` for plugins that bundle MCP servers with skills.

### Installed Plugins

| Plugin | MCP Server | Auto-Activates When... |
|--------|------------|------------------------|
| `frontend-ui` | shadcn | Building UI, components, pages, React work |

### How It Works

1. **Skills auto-activate** based on their description matching your request
2. **MCP tools become available** when the skill activates
3. **No special commands needed** - just ask for what you want

Example triggers for `frontend-ui`:
- "Build a settings page" → skill activates, shadcn MCP available
- "Add a dialog component" → skill activates, can browse/install shadcn components
- "What shadcn components are available?" → uses MCP to list components

### Adding New Plugins

See template at: `~/.claude/plugins/marketplaces/custom/PLUGIN-TEMPLATE.md`

Quick steps:
1. Create plugin folder with `.claude-plugin/plugin.json` and `.mcp.json`
2. Add skill in `skills/[name]/SKILL.md`
3. Register in marketplace.json
4. Run `claude plugin install [name]@custom`
5. Restart Claude Code

## WSL + Browser Automation Handoff

This project runs in WSL. Browser automation (Playwright, Claude-in-Chrome) does NOT work from WSL.

**When browser automation is needed:**

1. DO NOT attempt to use `mcp__playwright__*` or `mcp__claude-in-chrome__*` tools - they will fail
2. Instead, generate a **HANDOFF PROMPT** for the user to run in PowerShell

### Handoff Format

When browser testing/automation is required, output this block:

```
--- POWERSHELL HANDOFF ---
Run this in PowerShell (not WSL):
1. Open PowerShell
2. cd "C:\Users\Nick M\Desktop\Food App Idea"
3. Run: claude
4. Paste this prompt:

[PROMPT FOR POWERSHELL CLAUDE]

When done, return to WSL and tell me: [what to report back]
--- END HANDOFF ---
```

### What triggers a handoff:
- Testing the app in a browser
- Taking screenshots of the UI
- Verifying visual changes
- Any task requiring browser interaction

### What stays in WSL:
- All code editing
- Running dev server (npm run dev)
- Git operations
- File operations
- Everything except browser automation
