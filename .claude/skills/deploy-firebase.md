---
name: deploy-firebase
description: Deploy Firestore security rules and verify Firebase connection
argument-hint: "[action: rules, check, init]"
allowed-tools:
  - Read
  - Bash
  - Write
  - AskUserQuestion
---

<objective>
Deploy Firestore security rules or verify Firebase configuration.

Purpose: Manage Firebase infrastructure for the Our Kitchen app.
Output: Deployed rules or verified configuration.
</objective>

<context>
Action: $ARGUMENTS (rules, check, or init)

- **rules** - Deploy firestore.rules to Firebase
- **check** - Verify Firebase connection and config
- **init** - Initialize Firebase CLI in project (one-time setup)

Firebase project: grocery-store-app-c3aa5

@firestore.rules
@.env.example
</context>

<actions>

<action name="init">
## Initialize Firebase CLI

### Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Logged in: `firebase login`

### Setup Steps
```bash
# Check if firebase.json exists
ls firebase.json 2>/dev/null || echo "Need to initialize"

# Initialize Firestore only (we don't need hosting - using Netlify)
firebase init firestore

# This creates:
# - firebase.json (config)
# - firestore.rules (if not exists)
# - firestore.indexes.json (indexes)
```

### Expected Files After Init
- `firebase.json` - Points to rules and indexes files
- `firestore.rules` - Security rules
- `firestore.indexes.json` - Index definitions
</action>

<action name="rules">
## Deploy Security Rules

### Verify Rules File
```bash
cat firestore.rules
```

### Deploy
```bash
firebase deploy --only firestore:rules
```

### Expected Output
```
=== Deploying to 'grocery-store-app-c3aa5'...

i  firestore: reading indexes from firestore.indexes.json...
i  cloud.firestore: checking firestore.rules for compilation errors...
✔  cloud.firestore: rules file firestore.rules compiled successfully
i  firestore: deploying rules...
✔  firestore: deployed rules firestore.rules to grocery-store-app-c3aa5

✔  Deploy complete!
```

### Common Errors
- **Not logged in**: Run `firebase login`
- **Wrong project**: Run `firebase use grocery-store-app-c3aa5`
- **Syntax error**: Check rules file for typos
</action>

<action name="check">
## Verify Firebase Configuration

### 1. Check Environment Variables
```bash
# Verify .env exists and has values (don't print actual values)
if [ -f .env ]; then
  echo "✓ .env file exists"
  grep -q "VITE_FIREBASE_API_KEY=" .env && echo "✓ API_KEY set" || echo "✗ API_KEY missing"
  grep -q "VITE_FIREBASE_PROJECT_ID=" .env && echo "✓ PROJECT_ID set" || echo "✗ PROJECT_ID missing"
else
  echo "✗ .env file missing - copy from .env.example"
fi
```

### 2. Check Firebase Config File
```bash
cat src/config/firebase.ts 2>/dev/null || echo "✗ firebase.ts not yet created"
```

### 3. Test Connection (requires app running)
Open browser console and run:
```javascript
// Should log Firestore instance info
console.log(window.__FIREBASE_DB__ || 'Firebase not exposed - check app code')
```

### 4. Check Firebase CLI Project
```bash
firebase projects:list | grep grocery-store-app
firebase use
```

### 5. Verify Rules Deployed
```bash
firebase firestore:rules:get 2>/dev/null || echo "Run 'firebase login' first"
```
</action>

</actions>

<process>
1. Parse $ARGUMENTS for action (rules, check, init)
2. If no argument, default to "check"
3. Execute relevant action steps
4. For "rules" and "init", may need authentication gate if not logged in
5. Report results and any issues
6. Suggest next steps
</process>

<auth_gate>
If Firebase CLI commands fail with auth error:

```
════════════════════════════════════════
AUTHENTICATION REQUIRED
════════════════════════════════════════

Firebase CLI needs authentication.

Run this command in your terminal:
  firebase login

This will open a browser for Google authentication.
After logging in, type "done" to continue.
════════════════════════════════════════
```
</auth_gate>

<success_criteria>
- [ ] Action determined from argument
- [ ] Prerequisites checked
- [ ] Action executed
- [ ] Results verified
- [ ] Any errors explained with fixes
- [ ] Next steps provided
</success_criteria>
