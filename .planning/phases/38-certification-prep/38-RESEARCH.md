# Phase 38: Certification Prep - Research

**Researched:** 2026-01-30
**Domain:** Amazon Alexa Skill Certification & Store Publication
**Confidence:** HIGH

## Summary

Amazon Alexa skill certification requires passing policy, security, functional, and voice interface/UX tests. For "Kitchen Helper," the key work involves: completing store listing metadata (name, descriptions, icons, example phrases), hosting a privacy policy on Firebase, providing test credentials/instructions for reviewers, and verifying all required built-in intents work correctly.

The skill already has AMAZON.StopIntent, AMAZON.CancelIntent, AMAZON.HelpIntent, and AMAZON.FallbackIntent handlers (implemented in Phase 23). The primary new work is metadata, privacy policy page, test account setup, and a compliance audit of existing handlers.

**Primary recommendation:** Focus on store listing metadata, privacy policy hosting, and test account creation. The skill code is likely already compliant -- certification prep is mostly configuration and content work.

## Standard Stack

No new libraries needed. This phase is content/configuration work.

### Core Tools
| Tool | Purpose | Why Standard |
|------|---------|--------------|
| Alexa Developer Console | Store listing, distribution settings, submission | Required by Amazon |
| ASK CLI | Skill manifest updates, validation | Already in use |
| Firebase Hosting | Privacy policy page | Already deployed |

## Architecture Patterns

### Store Listing Metadata (Distribution Tab)

All fields must be completed in the Alexa Developer Console under Distribution > Skill Preview:

| Field | Requirement | Notes |
|-------|-------------|-------|
| **Skill Name** | Display name in store | "Kitchen Helper" |
| **One-Line Description** | Short summary | Max ~160 chars |
| **Detailed Description** | Full description | What skill does, how to use it |
| **What's New** | Optional | For updates |
| **Example Phrases** | Exactly 3 required | Must start with "Alexa," + launch word + invocation name |
| **Keywords** | Search terms | Comma-separated |
| **Category** | Skill category | COOKING_AND_RECIPE (already set) |
| **Small Icon** | 108x108 pixels | PNG or JPG |
| **Large Icon** | 512x512 pixels | PNG |
| **Privacy Policy URL** | Required (we collect data) | Must be HTTPS, accessible, matching skill language |
| **Terms of Use URL** | Optional | Can skip if not needed |

### Example Phrases Rules (Critical for Certification)

Example phrases are the number one rejection reason. Rules:
1. Must start with wake word "Alexa"
2. Must include a supported launch word: "open," "ask," "start," "launch," "begin," "tell"
3. Must include the exact invocation name: "kitchen helper"
4. Must exactly match sample utterances in the interaction model
5. Must work without errors when tested

Good examples:
- "Alexa, open kitchen helper"
- "Alexa, ask kitchen helper what's for dinner"
- "Alexa, ask kitchen helper to read my grocery list"

### Privacy Policy Page Structure

Host at: `https://[firebase-project].web.app/privacy` or similar

Required content:
- Skill name and developer name
- What data is collected (household PIN linking, meal/grocery data, device ID)
- How data is used (meal planning, grocery management)
- No third-party sharing statement
- Data storage location (Firebase/Firestore)
- Contact information
- Must be in English (matching skill language)
- Must be a valid, accessible HTTPS URL

### Testing Instructions for Reviewers

Provided in Distribution > Privacy & Compliance > Testing Instructions field:

Must include:
1. Test household credentials (PIN code)
2. Step-by-step testing flow
3. Explain voice PIN linking (since we don't use standard account linking)
4. Note that skill connects to external Firebase backend
5. Sample data already populated in test household

Format:
```
Test Account:
- Open the skill: "Alexa, open kitchen helper"
- When prompted for PIN, say: "[TEST_PIN]"
- This links to a test household with pre-populated data

Test Flows:
1. Meal list: "What's for dinner?"
2. Grocery list: "Read my grocery list"
3. Add item: "Add milk to grocery list"
...

Notes:
- Skill uses voice PIN authentication (not standard account linking)
- Backend hosted on Firebase Cloud Functions
- Test household contains sample meals, recipes, and grocery items
```

### Distribution Settings

| Setting | Value |
|---------|-------|
| Countries | Start with US, expand later |
| Paid/Free | Free |
| Child-directed | No |
| Contains advertising | No |
| Export compliance | Standard |

### Privacy & Compliance Questions

The console asks yes/no questions:
- Does this skill allow users to make purchases? **No**
- Does this Alexa skill collect personal information? **Yes** (household data, device ID)
- Is this skill directed to children under 13? **No**
- Does this skill contain advertising? **No**

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Privacy policy page | Complex legal template | Simple static HTML page on Firebase Hosting | Just needs basic coverage of data practices |
| Skill icons | Complex design software | Alexa Icon Builder tool or simple Canva design | Amazon provides free icon builder |
| Certification validation | Manual testing | ASK CLI `ask smapi validate-skill` | Catches errors before submission |

## Common Pitfalls

### Pitfall 1: Example Phrases Don't Match Utterances
**What goes wrong:** Example phrases in store listing don't exactly match sample utterances in interaction model
**Why it happens:** Typos, different wording, missing slot values
**How to avoid:** Copy example phrases directly from tested utterances. Test each one in the simulator.
**Warning signs:** Validation warnings in developer console

### Pitfall 2: Missing Privacy Policy for Data-Collecting Skills
**What goes wrong:** Certification rejected because privacy policy URL is missing or returns 404
**Why it happens:** Privacy policy page not deployed or URL incorrect
**How to avoid:** Deploy privacy policy page BEFORE submitting. Verify URL is accessible.
**Warning signs:** Console validation error on Distribution tab

### Pitfall 3: Session Management Issues
**What goes wrong:** Skill leaves session open after completing a task without prompting for next action, or closes session during Help
**Why it happens:** Incorrect shouldEndSession values
**How to avoid:** After task completion: either prompt for next action OR close session. Help must keep session open.
**Warning signs:** Skill hangs silently after responses

### Pitfall 4: StopIntent Doesn't End Session
**What goes wrong:** AMAZON.StopIntent response has shouldEndSession=false
**Why it happens:** Copy-paste error or missing flag
**How to avoid:** Verify StopIntent handler always sets shouldEndSession=true (or null)

### Pitfall 5: Missing Test Credentials
**What goes wrong:** Certification team can't test the skill because they don't have PIN/account info
**Why it happens:** Developer forgets to provide test instructions
**How to avoid:** Create dedicated test household with sample data, provide clear instructions with PIN

### Pitfall 6: Error Responses Don't Guide User
**What goes wrong:** Errors return generic message and close session
**Why it happens:** Error handler too simple
**How to avoid:** Error responses should explain what went wrong and prompt user to try again

## Code Examples

### Privacy Policy Page (Static HTML)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kitchen Helper Alexa Skill - Privacy Policy</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    h2 { color: #555; margin-top: 24px; }
    p { line-height: 1.6; color: #444; }
  </style>
</head>
<body>
  <h1>Privacy Policy - Kitchen Helper Alexa Skill</h1>
  <p><strong>Last updated:</strong> [DATE]</p>

  <h2>Information We Collect</h2>
  <p>Kitchen Helper collects the following information:</p>
  <ul>
    <li>Device identifier (to remember your household link)</li>
    <li>Voice PIN (to link your device to your household)</li>
    <li>Meal planning data, recipes, and grocery lists (stored in your household)</li>
  </ul>

  <h2>How We Use Your Information</h2>
  <p>Your information is used solely to provide meal planning and grocery list management through the Kitchen Helper skill.</p>

  <h2>Data Storage</h2>
  <p>Your data is stored securely using Google Firebase/Firestore infrastructure.</p>

  <h2>Third-Party Sharing</h2>
  <p>We do not sell, trade, or share your personal information with third parties.</p>

  <h2>Data Deletion</h2>
  <p>You can unlink your device at any time by saying "Alexa, tell kitchen helper to unlink." Your household data can be managed through the Kitchen Helper web app.</p>

  <h2>Contact</h2>
  <p>For questions about this privacy policy, contact: [EMAIL]</p>
</body>
</html>
```

### ASK CLI Validation Command
```bash
# Run validation before submitting
ask smapi validate-skill --skill-id [SKILL_ID] --stage development

# Check validation status
ask smapi get-skill-validations --skill-id [SKILL_ID] --validation-id [ID] --stage development
```

### Skill Manifest Distribution Fields (skill.json)
```json
{
  "publishingInformation": {
    "locales": {
      "en-US": {
        "summary": "Manage your household meals and grocery list with voice",
        "description": "Kitchen Helper lets you check what's for dinner, browse recipes, manage your grocery list, and cook step-by-step -- all hands-free. Link your device to your household with a voice PIN to access your family's meal plan and shopping list.",
        "examplePhrases": [
          "Alexa, open kitchen helper",
          "Alexa, ask kitchen helper what's for dinner",
          "Alexa, ask kitchen helper to read my grocery list"
        ],
        "keywords": [
          "cooking",
          "recipes",
          "grocery list",
          "meal planning",
          "kitchen",
          "dinner",
          "shopping list"
        ],
        "smallIconUri": "https://[path-to-108x108-icon]",
        "largeIconUri": "https://[path-to-512x512-icon]"
      }
    },
    "isAvailableWorldwide": false,
    "distributionCountries": ["US"],
    "distributionMode": "PUBLIC",
    "category": "COOKING_AND_RECIPE",
    "testingInstructions": "See testing instructions field"
  },
  "privacyAndCompliance": {
    "allowsPurchases": false,
    "usesPersonalInfo": true,
    "isChildDirected": false,
    "isExportCompliant": true,
    "containsAds": false,
    "locales": {
      "en-US": {
        "privacyPolicyUrl": "https://[firebase-project].web.app/privacy",
        "termsOfUseUrl": ""
      }
    }
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual certification only | ASK CLI validation + console validation | 2023+ | Catch errors before submission |
| Privacy policy optional | Privacy policy required for data-collecting skills | 2023 enforcement | Must have valid URL |

## Open Questions

1. **NFI-specific certification requirements**
   - What we know: NFI (CanFulfillIntentRequest) is already deployed and building
   - What's unclear: Whether NFI has additional certification requirements beyond standard
   - Recommendation: Submit normally; NFI is opt-in and should not cause issues. Amazon validates NFI builds separately.

2. **Skill icon creation**
   - What we know: Need 108x108 and 512x512 PNG icons
   - What's unclear: Who creates them (this is a design task, not code)
   - Recommendation: Use Amazon's Alexa Icon Builder or create simple icons with a kitchen/food theme

3. **Test household creation timing**
   - What we know: Need a dedicated test household with sample data
   - What's unclear: Whether test household should be created via the PWA or directly in Firestore
   - Recommendation: Create via Firestore admin/script for reliability, with known PIN

## Sources

### Primary (HIGH confidence)
- [Certification Requirements for Custom Skills](https://developer.amazon.com/en-US/docs/alexa/custom-skills/certification-requirements-for-custom-skills.html)
- [Policy Requirements for Alexa Skills](https://developer.amazon.com/en-US/docs/alexa/custom-skills/policy-requirements-for-an-alexa-skill.html)
- [Define Skill Store Details](https://developer.amazon.com/en-US/docs/alexa/devconsole/launch-your-skill.html)
- [Troubleshooting Common Certification Failures](https://developer.amazon.com/en-US/docs/alexa/custom-skills/troubleshooting-common-certification-failures.html)
- [Implement Built-in Intents](https://developer.amazon.com/en-US/docs/alexa/custom-skills/implement-the-built-in-intents.html)

### Secondary (MEDIUM confidence)
- [Five Common Certification Failures Blog](https://developer.amazon.com/en-US/blogs/alexa/alexa-skills-kit/2022/10/five-common-reasons-skills-dont-get-certified)
- [Privacy Policy URL Requirements Blog](https://developer.amazon.com/en-US/blogs/alexa/alexa-skills-kit/2023/02/certification-requirements-privacy-urls-feb-2023)
- [Submit Skills for Certification](https://developer.amazon.com/en-US/docs/alexa/devconsole/test-and-submit-your-skill.html)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Amazon documentation
- Architecture (metadata fields, icon specs): HIGH - Official docs
- Pitfalls: HIGH - Amazon's own blog posts on common failures
- Privacy policy requirements: HIGH - Official enforcement since 2023
- NFI certification specifics: LOW - No specific NFI certification docs found

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (certification requirements change slowly)
