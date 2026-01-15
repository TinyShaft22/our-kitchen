# Project Instructions

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
