---
phase: 33
plan: 01
title: "Environment Variables"
subsystem: security
tags: [api-key, env-vars, firebase-functions, lambda, secrets]

dependency_graph:
  requires:
    - "25-01" # Alexa REST API endpoints
  provides:
    - "Secure API key management via environment variables"
    - "Centralized config module for Cloud Functions"
    - "Deployment documentation for both platforms"
  affects:
    - "38-01" # Certification - security compliance

tech_stack:
  added: []
  patterns:
    - "Lazy evaluation for env vars in Firebase Functions v2"
    - "Axios request interceptor for API key injection"
    - "Centralized config module pattern"

key_files:
  created:
    - "functions/src/config.ts"
    - "functions/.env.example"
    - "functions/.env"
    - ".planning/phases/33-secure-api-keys/DEPLOYMENT.md"
  modified:
    - "functions/src/index.ts"
    - "functions/src/alexa/index.ts"
    - "functions/src/alexa/verifyPin.ts"
    - "functions/src/alexa/meals.ts"
    - "functions/src/alexa/recipe.ts"
    - "functions/src/alexa/groceryList.ts"
    - "functions/src/alexa/addGroceryItem.ts"
    - "functions/src/alexa/removeGroceryItem.ts"
    - "functions/src/alexa/checkDuplicateGrocery.ts"
    - "functions/src/alexa/lookupHouseholdItem.ts"
    - "functions/.gitignore"
    - "our-kitchen-alexa/lambda/api/firebaseClient.js"

decisions:
  - id: "lazy-eval"
    choice: "Lazy evaluation inside handlers"
    reason: "Firebase Functions v2 loads env vars at runtime, not import time"
  - id: "axios-interceptor"
    choice: "Axios request interceptor for Lambda"
    reason: "Ensures API key is evaluated at request time, not module load"
  - id: "env-example"
    choice: "Committed .env.example with placeholder"
    reason: "Documents required variables without exposing secrets"

metrics:
  duration: "~4 minutes"
  completed: "2026-01-22"
---

# Phase 33 Plan 01: Environment Variables Summary

Removed hardcoded API key from all source files and replaced with ALEXA_API_KEY environment variable across Cloud Functions and Lambda.

## One-liner

Centralized API key config via environment variables with lazy evaluation for Firebase Functions v2 runtime compatibility.

## Changes Made

### Task 1: Cloud Functions Config Module

**Created `functions/src/config.ts`:**
- Exports `getApiKey()` function reading from `process.env.ALEXA_API_KEY`
- Throws descriptive error if env var missing (fail fast)
- Includes JSDoc explaining Firebase Functions v2 pattern

**Created `functions/.env` (gitignored):**
- Local development value: `ALEXA_API_KEY=ourkitchen2024`

**Created `functions/.env.example` (committed):**
- Template showing required variable with placeholder

**Updated 10 endpoint files:**
- `functions/src/index.ts` - importRecipe endpoint
- `functions/src/alexa/verifyPin.ts`
- `functions/src/alexa/meals.ts`
- `functions/src/alexa/recipe.ts`
- `functions/src/alexa/groceryList.ts`
- `functions/src/alexa/addGroceryItem.ts`
- `functions/src/alexa/removeGroceryItem.ts`
- `functions/src/alexa/checkDuplicateGrocery.ts`
- `functions/src/alexa/lookupHouseholdItem.ts`
- `functions/src/alexa/index.ts` (updated comment)

All endpoints now call `getApiKey()` inside the handler function (not at module level) to ensure environment variables are loaded at runtime.

### Task 2: Lambda Environment Variable

**Updated `our-kitchen-alexa/lambda/api/firebaseClient.js`:**
- Added `getApiKey()` function reading from `process.env.ALEXA_API_KEY`
- Added axios request interceptor to inject API key per-request
- Added documentation comment explaining Developer Console setup

### Task 3: Documentation and Gitignore

**Updated `functions/.gitignore`:**
- Added `.env` to prevent committing secrets

**Created `DEPLOYMENT.md`:**
- Cloud Functions deployment options (env file, Console, Secrets Manager)
- Lambda deployment via Alexa Developer Console
- Rollback procedures
- Security notes and key generation guidance

## Commits

| Hash | Type | Description |
|------|------|-------------|
| e66ed89 | feat | Remove hardcoded API key from Cloud Functions |
| 8f03294 | feat | Remove hardcoded API key from Lambda |
| a3bc81b | docs | Add deployment documentation and update gitignore |

## Verification Results

- Zero occurrences of "ourkitchen2024" in source code
- All Cloud Functions import and use getApiKey() from config module
- Lambda reads from process.env.ALEXA_API_KEY
- functions/.env is gitignored
- functions/.env.example is committed with placeholder
- DEPLOYMENT.md created with full instructions
- TypeScript compiles without errors

## Deviations from Plan

None - plan executed exactly as written.

## Technical Details

### Why Lazy Evaluation?

Firebase Functions v2 uses a different initialization model than v1:
- Environment variables are loaded at runtime, not at module import time
- Module-level constants (`const API_KEY = getApiKey()`) would execute before env is available
- Calling `getApiKey()` inside the handler ensures env vars are loaded

### Axios Interceptor Pattern

For Lambda, we use an axios request interceptor instead of setting headers at client creation:
```javascript
client.interceptors.request.use((config) => {
  config.headers['X-API-Key'] = getApiKey();
  return config;
});
```
This ensures the API key is read at request time, not when the module loads.

## Next Steps

1. **Deploy to Firebase:** `firebase deploy --only functions`
2. **Set Lambda env var:** Alexa Developer Console > Build > Code > Environment Variables
3. **Test both integrations** with the configured API key
4. **Consider key rotation** before certification (Phase 38)
