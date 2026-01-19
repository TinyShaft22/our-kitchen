# Phase 21: Import & Verification - Context

**Gathered:** 2026-01-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Import remaining broma recipe JSON files (muffins, brownies) into household 0428 and verify all broma recipes display correctly. Bars and cookies are already imported with images.

**Scope:**
- Import: Muffins (21 recipes) + Brownies (21 recipes)
- Already done: Bars (36) + Cookies (27) — skip these
- Target household: 0428

</domain>

<decisions>
## Implementation Decisions

### Issue Handling
- **Markdown rendering issues**: Claude's discretion — fix immediately if critical, log and continue if minor
- **Wrong ingredient categories**: Leave as-is, manual edit later when noticed — don't fix mapping rules
- **Missing recipes**: Document what's missing, don't block phase on completeness
- **Import failures**: Claude decides recovery strategy (retry, smaller batches, different approach)

### Import Confirmation
- **Pre-import validation**: Yes — verify JSON files exist, have expected recipe count, valid structure
- **Import method**: Claude decides — App Settings UI (browser handoff) or direct Firestore script
- **Batch confirmation**: Claude decides — confirm each batch or import together
- **Post-import summary**: Brief — just "X recipes imported successfully"

### Claude's Discretion
- Import method (UI vs direct Firestore)
- Batch strategy (together vs separate confirmation)
- Recovery approach for failures
- Severity assessment for rendering issues

</decisions>

<specifics>
## Specific Ideas

- All broma recipes go into household 0428
- Bars and cookies are already loaded — don't re-import
- Images for bars and cookies are already uploaded
- Muffins and brownies still need their images (handled in Phase 22)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 21-import-verification*
*Context gathered: 2026-01-19*
