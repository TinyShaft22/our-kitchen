# Alexa Skill Research: Our Kitchen Integration

> Research conducted: 2026-01-16
> Purpose: Adding voice + visual UI to Our Kitchen food app via Echo Show

## Executive Summary

Building an Alexa skill with visual UI (APL) for the Our Kitchen food app is **feasible and free** for personal use. The skill will allow voice commands to browse meals, view recipes step-by-step, and manage grocery lists—all with visual feedback on Echo Show devices.

---

## Technical Stack

### Alexa Presentation Language (APL)

APL is Amazon's visual design framework for building interactive voice + visual experiences on Echo Show devices.

**Key Facts:**
- JSON-based templates (similar to React Native's approach)
- Current version: **APL 2024.3**
- Supports: images, video, animations, touch interaction, slideshows
- Responsive layouts adapt to different Echo Show screen sizes

**How APL Works:**
1. Skill returns a response with an APL directive
2. Directive contains two parts:
   - **APL Document**: JSON defining visual structure/layout
   - **APL Data Source**: JSON providing content to populate the template
3. Device renders the visual while Alexa speaks the response

**APL Components Relevant to Food App:**
| Component | Use Case |
|-----------|----------|
| `Sequence` | Scrollable list of meals/recipes |
| `Pager` | Step-by-step cooking instructions (swipeable) |
| `TouchWrapper` | Tap to select a meal |
| `Image` | Recipe photos |
| `Video` | Could show cooking videos if desired |

**Supported Devices:**
- Echo Show 8, 10, 15, 21
- Fire TV, Fire Tablet
- Note: Echo Spot (2024) does NOT support APL

### Alexa-Hosted Skills (Recommended)

Amazon provides free hosting—no AWS account required.

**What's Included:**
- AWS Lambda endpoints in all 3 Alexa regions (auto-provisioned)
- AWS CodeCommit repository for code management
- Basic storage

**Free Tier Limits (Always Free, Not Trial):**
| Resource | Monthly Limit |
|----------|---------------|
| Lambda Invocations | 1,000,000 |
| Lambda Compute | 400,000 GB-seconds |
| DynamoDB Storage | 25 GB |
| S3 Storage | 5 GB |

**Cost Reality Check:**
- 10 invocations/day = ~300/month = **FREE**
- Family heavy use = ~3,000/month = **FREE**
- You'd need 30,000+ invocations/day to exceed free tier

### Development Stack

**Recommended (Best Amazon Support):**
- Language: **Node.js** (ASK SDK v2)
- Hosting: **Alexa-Hosted Skills** (no AWS account needed)
- Tools: ASK CLI, Alexa Developer Console

**Alternative:**
- Python with ASK SDK
- Self-hosted AWS Lambda (if you need more control)

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Echo Show     │────▶│  Alexa Service   │────▶│  Lambda (Hosted)│
│   (User Voice)  │     │  (NLU/Intent)    │     │  (Skill Logic)  │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   APL Visual    │◀────│  APL Document +  │◀────│  Our Kitchen    │
│   (On Screen)   │     │  Data Source     │     │  Firestore API  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

**Data Flow:**
1. User speaks: "Alexa, ask Our Kitchen what's for dinner"
2. Alexa parses intent → sends to Lambda
3. Lambda queries Our Kitchen Firestore (via REST/SDK)
4. Lambda builds APL response with meal data
5. Echo Show displays visual + Alexa speaks response

### API Integration Options

**Option A: Direct Firestore Access**
- Lambda uses Firebase Admin SDK
- Requires service account credentials in Lambda
- Pro: Direct access, real-time capable
- Con: Credential management

**Option B: REST API Layer**
- Create Firebase Cloud Functions as API endpoints
- Lambda calls REST endpoints
- Pro: Cleaner separation, existing auth patterns
- Con: Additional latency

**Recommendation:** Option B—you already have Cloud Functions (OpenRouter integration). Add endpoints for meals/grocery data.

---

## Proposed Voice Commands

### Meal Browsing
| Utterance | Intent | Response |
|-----------|--------|----------|
| "What's for dinner this week?" | GetWeeklyMeals | List of planned meals |
| "Show me my meals" | BrowseMeals | Scrollable meal library |
| "Show me [category] recipes" | BrowseByCategory | Filtered list (Baking, Main Dishes) |

### Recipe Viewing
| Utterance | Intent | Response |
|-----------|--------|----------|
| "Show me the recipe for {meal}" | GetRecipe | Recipe detail with ingredients |
| "What are the ingredients for {meal}?" | GetIngredients | Ingredient list |
| "Start cooking {meal}" | StartCooking | Step-by-step cooking mode |

### Cooking Mode (Step-by-Step)
| Utterance | Intent | Response |
|-----------|--------|----------|
| "Next step" | NextStep | Advance to next instruction |
| "Previous step" / "Go back" | PreviousStep | Return to previous instruction |
| "Repeat" | RepeatStep | Re-read current step |
| "What step am I on?" | CurrentStep | Current step number/content |

### Grocery Management
| Utterance | Intent | Response |
|-----------|--------|----------|
| "What's on my grocery list?" | GetGroceryList | List items by store/category |
| "Add {item} to grocery list" | AddGroceryItem | Confirm item added |
| "Add {item} from {store}" | AddGroceryItemWithStore | Item + store assignment |

---

## Constraints & Considerations

### Technical Constraints
- **WSL Limitation**: Code editing in WSL, but deployment/testing requires PowerShell handoff (per CLAUDE.md)
- **No Browser Automation**: Can't use Alexa Developer Console directly from WSL
- **Testing**: Requires physical Echo Show device

### Platform Concerns (2024-2025)
- Amazon shut down Alexa Developer Forums (Jan 2024)
- AWS promotional credits for Alexa ended (June 2024)
- List Management API deprecated (July 2024)
- Some skills sunset November 2025

**Mitigation:** Use core APL features (stable), avoid deprecated APIs, keep skill simple.

### Development Workflow

```
WSL (Claude Code)                    PowerShell (User)
─────────────────                    ─────────────────
1. Write Lambda code         ──▶
2. Write APL templates       ──▶
3. Write interaction model   ──▶
4. Generate deployment files ──▶     5. Run `ask deploy`
                                     6. Test on Echo Show
                             ◀──     7. Report issues
8. Fix/iterate               ──▶     9. Redeploy
```

---

## Development Tools

### Multimodal Response Builder (Beginner-Friendly)
- Visual tool in Alexa Developer Console
- Create APL templates without writing JSON
- Get started in ~15 minutes
- Good for prototyping

### APL Authoring Tool (Advanced)
- Full JSON editor with preview
- Device simulator for different Echo Show sizes
- More control, steeper learning curve

### ASK CLI
- Command-line deployment
- `ask new` - scaffold new skill
- `ask deploy` - deploy to Alexa
- `ask dialog` - test intents locally

---

## Documentation Links

**Official Amazon:**
- [APL Overview](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/add-visuals-and-audio-to-your-skill.html)
- [APL Interface Reference](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-interface.html)
- [What's New in APL 2024.3](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-latest-version.html)
- [Alexa-Hosted Skills](https://developer.amazon.com/en-US/docs/alexa/hosted-skills/build-a-skill-end-to-end-using-an-alexa-hosted-skill.html)
- [Custom Skill Steps](https://developer.amazon.com/en-US/docs/alexa/custom-skills/steps-to-build-a-custom-skill.html)
- [APL Authoring Tool](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-authoring-tool.html)

**Tutorials:**
- [APL Getting Started](https://blog.rocketinsights.com/alexa-presentation-language-tutorial-getting-started/)
- [APL Walkthrough](https://www.talkingtocomputers.com/apl-alexa-presentation-language)
- [Intro to APL (Alexa Haus)](https://developer.amazon.com/en-US/alexa/alexa-haus/intro-to-apl)

---

## Proposed Milestone Structure

**Milestone:** v2.0 Alexa Integration
**Phases:** 23-30 (8 phases)

| Phase | Name | Goal | Research Needed |
|-------|------|------|-----------------|
| 23 | Alexa Setup | Developer account, Alexa-Hosted Skill creation, basic "hello world" | Likely |
| 24 | Interaction Model | Define intents, slots, utterances for all voice commands | Likely |
| 25 | Lambda Backend | Skill handler with Firebase connection, basic intent handling | Unlikely |
| 26 | APL Recipe List | Visual template for browsing meals with images | Likely |
| 27 | APL Recipe Detail | Ingredients + instructions display | Unlikely |
| 28 | Cooking Mode | Step-by-step pager with voice navigation | Unlikely |
| 29 | Grocery Integration | List viewing and item addition via voice | Unlikely |
| 30 | Testing & Polish | End-to-end testing on Echo Show, refinements | Unlikely |

---

## Questions to Resolve (for /gsd:discuss-milestone)

1. **Which Echo Show do you have?** (8, 10, 15?) - affects viewport testing
2. **Skill invocation name?** "Our Kitchen" or something shorter?
3. **Priority features?** What's must-have vs nice-to-have?
4. **Cooking mode detail level?** Parse markdown into steps, or show full instructions?
5. **Grocery list scope?** View only, or also add/remove items?
6. **Authentication?** Skill needs household ID - voice PIN or account linking?

---

## Files to Reference

When continuing this work, reference:
- `.planning/research/alexa-skill-research.md` (this file)
- `.planning/PROJECT.md` (app context, core value, architecture)
- `.planning/ROADMAP.md` (current phases, milestone structure)
- `.planning/STATE.md` (current position, decisions)
- `src/hooks/` (existing Firestore hooks to understand data access)
- `src/types/index.ts` (TypeScript types for Meal, GroceryItem, etc.)
