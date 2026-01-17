---
name: deploy-firebase
description: Deploy Firestore security rules and verify Firebase configuration. Use when deploying rules, checking Firebase setup, or initializing Firebase CLI. Triggers on requests to deploy firebase, update security rules, check firebase config, or verify firestore connection.
---

# Deploy Firebase

Manage Firebase infrastructure for the Our Kitchen app.

**Project ID:** grocery-store-app-c3aa5

## Actions

### Deploy Rules
```bash
# Verify rules file
cat firestore.rules

# Deploy
firebase deploy --only firestore:rules
```

### Check Configuration
```bash
# Verify .env exists
if [ -f .env ]; then
  grep -q "VITE_FIREBASE_API_KEY=" .env && echo "API_KEY set"
  grep -q "VITE_FIREBASE_PROJECT_ID=" .env && echo "PROJECT_ID set"
fi

# Check Firebase CLI project
firebase projects:list | grep grocery-store-app
firebase use
```

### Initialize (one-time)
```bash
# Prerequisites
npm install -g firebase-tools
firebase login

# Initialize Firestore
firebase init firestore
```

## Common Errors

- **Not logged in**: Run `firebase login`
- **Wrong project**: Run `firebase use grocery-store-app-c3aa5`
- **Syntax error**: Check rules file for typos

## Authentication Gate

If Firebase CLI commands fail with auth error, prompt user to run `firebase login` in terminal.
