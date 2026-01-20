# Phase 26: APL Meal List - Research

**Researched:** 2026-01-20
**Domain:** Alexa Presentation Language (APL), responsive templates, multimodal voice + visual
**Confidence:** HIGH

## Summary

This research covers implementing visual APL templates for browsing meals on Echo Show devices. The Lambda handlers from Phase 25 already return meal data; this phase adds the visual layer that complements voice responses while maintaining full functionality on voice-only devices.

The standard approach uses Alexa Responsive Templates (specifically AlexaImageList for meals with images, AlexaTextList for meals without) imported from the `alexa-layouts` package. These templates automatically adapt to all Echo Show sizes (5, 8, 10, 15), Fire TV, and Fire tablets using viewport profiles rather than device-specific code. Touch selection triggers `SendEvent` commands that the Lambda handles via `Alexa.Presentation.APL.UserEvent` request type.

For theming, APL supports `dark` and `light` theme properties. Custom colors can be defined in the document's `resources` section using viewport-conditional logic. The warm colors from the PWA (terracotta, sage, honey) can be applied via custom color resources.

**Primary recommendation:** Use AlexaImageList with SendEvent for meal selection, check `Alexa.Presentation.APL` in supportedInterfaces before sending APL directives, and gracefully degrade to voice-only on unsupported devices.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| alexa-layouts | 1.7.0 | Responsive components/templates | Official Amazon package, auto-adapts to viewports |
| alexa-viewport-profiles | 1.6.0 | Viewport profile resources | Standard device detection |
| APL | 2024.3 | Document version | Current stable, backward compatible |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| alexa-styles | 1.7.0 | Typography, colors | Consistent Alexa design language |
| ask-sdk-core | ^2.14.0 | Lambda SDK | Already installed from Phase 25 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| AlexaImageList | AlexaGridList | Grid for 4+ items in dense grid; ImageList scrolls horizontally, better for browsing |
| AlexaImageList | Custom layout | Full control but loses auto-responsiveness, more maintenance |
| Built-in themes | Full custom theming | Custom theming requires more conditional resources |

**No additional installation required** - APL documents are JSON files rendered by the device. Lambda already has ask-sdk-core from Phase 25.

## Architecture Patterns

### Recommended Project Structure
```
our-kitchen-alexa/
  lambda/
    index.js                    # SkillBuilder with APL handler
    handlers/
      MealHandlers.js           # Update to add APL directives
      AplEventHandlers.js       # NEW: Handle APL UserEvents
    apl/
      meal-list.json            # AlexaImageList template
      meal-list-data.js         # DataSource builder
      resources.js              # Custom color definitions
```

### Pattern 1: APL-Enabled Response with Device Check
**What:** Check for APL support before adding RenderDocument directive
**When to use:** Every handler that displays visual content
**Example:**
```javascript
// Source: https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/use-apl-with-ask-sdk.html
const Alexa = require('ask-sdk-core');

const BrowseMealsIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BrowseMealsIntent';
  },
  async handle(handlerInput) {
    // ... existing meal fetching logic ...
    const meals = result.meals || [];

    // Voice response (works on all devices)
    const speakOutput = formatMealListForVoice(meals);

    // Check if device supports APL
    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
      // Add visual display
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'mealListToken',
        document: require('../apl/meal-list.json'),
        datasources: buildMealListDataSource(meals)
      });
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Which meal would you like to see?")
      .getResponse();
  }
};
```

### Pattern 2: AlexaImageList with SendEvent
**What:** Responsive image list with touch selection that sends events to Lambda
**When to use:** Displaying meals with images, enabling touch navigation
**Example:**
```json
{
  "type": "APL",
  "version": "2024.3",
  "import": [
    { "name": "alexa-layouts", "version": "1.7.0" },
    { "name": "alexa-viewport-profiles", "version": "1.6.0" }
  ],
  "mainTemplate": {
    "parameters": ["mealListData"],
    "items": [
      {
        "type": "AlexaImageList",
        "id": "mealList",
        "headerTitle": "${mealListData.headerTitle}",
        "headerAttributionImage": "${mealListData.logoUrl}",
        "listItems": "${mealListData.listItems}",
        "imageAspectRatio": "square",
        "defaultImageSource": "",
        "hideOrdinal": true,
        "theme": "${mealListData.theme}",
        "primaryAction": {
          "type": "SendEvent",
          "arguments": ["MealSelected", "${ordinal}", "${data.mealId}"]
        }
      }
    ]
  }
}
```

### Pattern 3: UserEvent Handler for Touch Selection
**What:** Handle touch events from APL SendEvent commands
**When to use:** Processing user touch selections from visual interface
**Example:**
```javascript
// Source: https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/use-apl-with-ask-sdk.html
const MealSelectedEventHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.APL.UserEvent'
      && handlerInput.requestEnvelope.request.arguments[0] === 'MealSelected';
  },
  async handle(handlerInput) {
    const args = handlerInput.requestEnvelope.request.arguments;
    const ordinal = args[1];  // Position in list (1-indexed)
    const mealId = args[2];   // Meal ID passed from APL

    // Fetch recipe and navigate to detail (Phase 27)
    // For now, store selection and respond
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.selectedMealId = mealId;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak("Opening that recipe. Ready for the ingredients?")
      .reprompt("Would you like to hear the ingredients?")
      .getResponse();
  }
};
```

### Pattern 4: Conditional Layout for Meals Without Images
**What:** Show text-only card when meal has no imageUrl
**When to use:** Gracefully handle meals without images
**Example:**
```json
{
  "listItems": [
    {
      "primaryText": "${data.name}",
      "imageSource": "${data.imageUrl}",
      "mealId": "${data.id}"
    }
  ]
}
```
Note: When `imageSource` is empty/null, AlexaImageList displays text-only with the `defaultImageSource` fallback. Setting `defaultImageSource` to empty string shows text prominently without placeholder.

### Pattern 5: DataSource Builder
**What:** Transform meal data from Firebase into APL datasource format
**When to use:** Preparing data for APL templates
**Example:**
```javascript
// apl/meal-list-data.js
function buildMealListDataSource(meals, options = {}) {
  const theme = options.darkMode ? 'dark' : 'dark'; // Default dark for Echo

  return {
    mealListData: {
      type: 'object',
      objectId: 'mealList',
      headerTitle: options.headerTitle || 'Our Kitchen',
      logoUrl: options.logoUrl || '',
      theme: theme,
      listItems: meals.map((meal, index) => ({
        primaryText: meal.name,
        imageSource: meal.imageUrl || '', // Empty triggers text-only display
        mealId: meal.id
      }))
    }
  };
}

module.exports = { buildMealListDataSource };
```

### Anti-Patterns to Avoid
- **Hardcoding viewport dimensions:** Use viewport profiles, not pixel values
- **Forgetting voice-only fallback:** Always provide speech output even when adding APL
- **Sending APL to unsupported devices:** Always check `supportedInterfaces` first
- **Building custom layouts instead of using responsive templates:** Loses auto-adaptation
- **Using deprecated display templates:** Use APL responsive templates, not Display.RenderTemplate

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive grid layout | Custom Container + repeat | AlexaImageList / AlexaGridList | Auto-adapts to 7 aspect ratios, all viewports |
| Device size detection | Manual viewport.width checks | `@viewportProfile == @hubLandscapeMedium` | Viewport profiles handle device variations |
| Touch selection events | Custom TouchWrapper logic | AlexaImageList `primaryAction` | Built-in, consistent behavior |
| Dark/light theming | Custom color switching | `theme: "dark"` property | Responsive templates handle it |
| Image aspect ratios | Manual sizing | `imageAspectRatio: "square"` | 7 presets that scale correctly |
| Back button | Custom button component | `headerBackButton: true` | Standard Alexa UX |

**Key insight:** Alexa responsive templates (AlexaImageList, AlexaTextList, AlexaGridList) handle 90% of common visual patterns. Custom layouts are only needed for truly unique experiences.

## Common Pitfalls

### Pitfall 1: Sending APL to Voice-Only Devices
**What goes wrong:** Skill crashes or returns error on Echo Dot, Echo, etc.
**Why it happens:** RenderDocument directive sent without checking supportedInterfaces
**How to avoid:**
```javascript
if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
  // Safe to add APL directive
}
```
**Warning signs:** "There was a problem with the requested skill's response" on voice-only devices

### Pitfall 2: Missing Token on RenderDocument
**What goes wrong:** APL document doesn't display, skill returns error
**Why it happens:** `token` property omitted from directive
**How to avoid:** Always include unique token: `token: 'mealListToken'`
**Warning signs:** Simulator shows error, APL doesn't render

### Pitfall 3: Incorrect DataSource Binding
**What goes wrong:** Template shows `${undefined}` or blank content
**Why it happens:** DataSource structure doesn't match template parameter names
**How to avoid:**
- Template `parameters: ["mealListData"]` must match datasource key
- Use `${mealListData.listItems}` in template, provide `{ mealListData: { listItems: [...] } }` in datasource
**Warning signs:** Template renders but data is missing

### Pitfall 4: UserEvent Handler Not Registered
**What goes wrong:** Touch selection does nothing, no skill response
**Why it happens:** APL UserEvent handler not added to SkillBuilder
**How to avoid:** Register handler: `.addRequestHandlers(..., MealSelectedEventHandler, ...)`
**Warning signs:** Tap on list item, nothing happens

### Pitfall 5: Device-Specific Code Instead of Viewport Profiles
**What goes wrong:** Layout breaks on new devices or different screen sizes
**Why it happens:** Checking `viewport.width == 1280` instead of using profiles
**How to avoid:** Use `${@viewportProfile == @hubLandscapeMedium}` for conditionals
**Warning signs:** Works on Echo Show 8, breaks on Echo Show 5 or 15

### Pitfall 6: Forgetting Voice Response with APL
**What goes wrong:** User sees visual but hears nothing, confusing experience
**Why it happens:** Returning only APL directive without `.speak()`
**How to avoid:** Always include speech: `.speak("Here are your meals...")` alongside APL
**Warning signs:** Display shows content but Alexa is silent

## Code Examples

Verified patterns from official sources:

### Complete APL Document: Meal List
```json
{
  "type": "APL",
  "version": "2024.3",
  "description": "Our Kitchen meal browsing list",
  "import": [
    { "name": "alexa-layouts", "version": "1.7.0" },
    { "name": "alexa-viewport-profiles", "version": "1.6.0" }
  ],
  "resources": [
    {
      "description": "Custom colors - default (dark theme)",
      "colors": {
        "colorBackground": "#1A1A1A",
        "colorAccent": "#C4704B"
      }
    },
    {
      "description": "Custom colors - light theme",
      "when": "${viewport.theme == 'light'}",
      "colors": {
        "colorBackground": "#FFF8F0",
        "colorAccent": "#C4704B"
      }
    }
  ],
  "mainTemplate": {
    "parameters": ["mealListData"],
    "items": [
      {
        "type": "AlexaImageList",
        "id": "mealListView",
        "headerTitle": "${mealListData.headerTitle}",
        "headerDivider": true,
        "backgroundColor": "@colorBackground",
        "listItems": "${mealListData.listItems}",
        "listId": "mealList",
        "imageAspectRatio": "square",
        "imageRoundedCorner": true,
        "imageScale": "best-fill",
        "defaultImageSource": "",
        "hideOrdinal": true,
        "theme": "dark",
        "primaryAction": {
          "type": "SendEvent",
          "arguments": ["MealSelected", "${ordinal}", "${data.mealId}"]
        }
      }
    ]
  }
}
```

### DataSource for Meal List
```javascript
// apl/meal-list-data.js
// Source: https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-interface.html

function buildMealListDataSource(meals, headerTitle = 'Our Kitchen') {
  return {
    mealListData: {
      type: 'object',
      objectId: 'mealListDS',
      headerTitle: headerTitle,
      listItems: meals.map(meal => ({
        primaryText: meal.name,
        imageSource: meal.imageUrl || '',
        mealId: meal.id
      }))
    }
  };
}

module.exports = { buildMealListDataSource };
```

### Updated Handler with APL
```javascript
// handlers/MealHandlers.js - BrowseMealsIntentHandler update
const mealListDocument = require('../apl/meal-list.json');
const { buildMealListDataSource } = require('../apl/meal-list-data');

// Inside handle() after fetching meals:
const responseBuilder = handlerInput.responseBuilder
  .speak(speakOutput)
  .reprompt("Which meal would you like?");

// Add APL if supported
if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
  responseBuilder.addDirective({
    type: 'Alexa.Presentation.APL.RenderDocument',
    token: 'mealListToken',
    document: mealListDocument,
    datasources: buildMealListDataSource(meals)
  });
}

return responseBuilder.getResponse();
```

### APL UserEvent Handler
```javascript
// handlers/AplEventHandlers.js
const Alexa = require('ask-sdk-core');

const MealSelectedEventHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'Alexa.Presentation.APL.UserEvent'
      && request.arguments
      && request.arguments[0] === 'MealSelected';
  },
  async handle(handlerInput) {
    const args = handlerInput.requestEnvelope.request.arguments;
    const mealId = args[2];

    // Store selected meal for recipe display (Phase 27)
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.selectedMealId = mealId;
    sessionAttributes.navigationSource = 'mealList';
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    // For Phase 26, acknowledge selection
    // Phase 27 will add recipe detail APL
    return handlerInput.responseBuilder
      .speak("Great choice! Ready for the recipe?")
      .reprompt("Would you like to hear the ingredients?")
      .getResponse();
  }
};

module.exports = { MealSelectedEventHandler };
```

## Viewport Profile Reference

| Profile | Devices | Width Range | Height Range |
|---------|---------|-------------|--------------|
| hubRoundSmall | Echo Spot | 100-599 dp | 100-599 dp |
| hubLandscapeSmall | Echo Show 5 | 960-1279 dp | 100-599 dp |
| hubLandscapeMedium | Echo Show 8 | 960-1279 dp | 600-959 dp |
| hubLandscapeLarge | Echo Show 10 | 1280-1920 dp | 600-1279 dp |
| hubLandscapeXLarge | Echo Show 15 (landscape) | 1920-2560 dp | 960-1279 dp |
| hubPortraitMedium | Echo Show 15 (portrait) | 960-1279 dp | 1920-2560 dp |
| tvLandscapeXLarge | Fire TV | 960 dp | 540 dp (fixed) |

**AlexaImageList defaults** (items per row by viewport and aspect ratio):

| Aspect Ratio | Small (Show 5) | Medium (Show 8) | Large (Show 10) | XLarge (Show 15) |
|--------------|----------------|-----------------|-----------------|------------------|
| square | 3 | 3 | 3 | 4 |
| standard_landscape | 2 | 2 | 3 | 3 |
| poster_portrait | 3 | 4 | 5 | 6 |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Display Templates (Body, List) | APL Responsive Templates | 2021 | Display templates deprecated, use APL |
| Device-specific layouts | Viewport profiles | 2019 | Single document works on all devices |
| APL 1.x document version | APL 2024.3 | 2024 | Better SVG support, performance |
| Manual component layouts | AlexaImageList, AlexaTextList | alexa-layouts 1.0 | Less code, auto-responsive |

**Deprecated/outdated:**
- `Display.RenderTemplate`: Use `Alexa.Presentation.APL.RenderDocument` instead
- Display templates (BodyTemplate, ListTemplate): Replaced by APL responsive templates
- APL versions before 2023.1: Still work but miss latest features

## Open Questions

1. **Dark mode trigger mechanism**
   - What we know: `viewport.theme` can be `dark` or `light`, custom resources can switch
   - What's unclear: Whether to honor system setting or add voice command "enable dark mode"
   - Recommendation: Default to `dark` theme (better for most Echo Show use), add voice toggle in future phase

2. **Fire TV optimization effort**
   - What we know: tvLandscapeXLarge viewport profile works with same templates
   - What's unclear: Whether 10-foot UI needs larger text/touch targets
   - Recommendation: Test on Fire TV simulator; AlexaImageList should auto-adapt adequately

3. **Recipe detail navigation from touch**
   - What we know: SendEvent can pass mealId, Phase 27 will handle recipe detail
   - What's unclear: Whether to navigate immediately or confirm selection first
   - Recommendation: Per CONTEXT.md "selecting goes directly to recipe detail" - navigate immediately

## Sources

### Primary (HIGH confidence)
- [AlexaImageList Layout](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-alexa-image-list-layout.html) - Template properties, item structure
- [Add APL Support to Your Skill Code](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/use-apl-with-ask-sdk.html) - Lambda integration, device checks
- [SendEvent Command](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-send-event-command.html) - Touch event handling
- [Viewport Profiles Package](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-alexa-viewport-profiles-package.html) - Device profiles
- [Build Responsive APL Documents](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-build-responsive-apl-documents.html) - Responsive design patterns
- [APL Interface Reference](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-interface.html) - RenderDocument, DataSources

### Secondary (MEDIUM confidence)
- [Responsive Components and Templates](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-layouts-overview.html) - Template overview
- [AlexaTextList Layout](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-alexa-text-list-layout.html) - Text-only fallback
- [AlexaGridList Layout](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-alexa-grid-list-layout.html) - Alternative for dense grids
- [Optimizing for Echo Show 15](https://developer.amazon.com/en-US/blogs/alexa/alexa-skills-kit/2021/09/optimizing-your-multimodal-experiences-on-the-new-echo-show-15) - XLarge viewport

### Tertiary (LOW confidence)
- [skill-sample-nodejs-responsive-layouts](https://github.com/alexa-samples/skill-sample-nodejs-responsive-layouts) - GitHub sample code
- [APL Best Practices](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-best-practices-for-developers.html) - Performance tips

## Metadata

**Confidence breakdown:**
- APL document structure: HIGH - Official Amazon documentation with examples
- AlexaImageList usage: HIGH - Official documentation, responsive template
- SendEvent/UserEvent handling: HIGH - Official documentation with code samples
- Viewport profiles: HIGH - Official package documentation
- Custom theming (warm colors): MEDIUM - Resource syntax documented, exact color mapping needs testing
- Fire TV support: MEDIUM - Same templates should work, needs testing

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - APL specification is stable, alexa-layouts at 1.7.0)
