# Firebase Cloud Functions Deployment Guide

## Project Info
- **Project ID:** `grocery-store-app-c3aa5`
- **Region:** `us-central1`
- **Functions URL Base:** `https://us-central1-grocery-store-app-c3aa5.cloudfunctions.net/`

## Deployed Functions

| Function | Purpose | Public |
|----------|---------|--------|
| `groceryList` | Get grocery list items | Yes |
| `addGroceryItem` | Add item to grocery list | Yes |
| `removeGroceryItem` | Remove item from list | Yes |
| `updateGroceryItem` | Update item (quantity, checked) | Yes |
| `weeklyPlan` | Get weekly meal plan | Yes |
| `mealLibrary` | Get all meals | Yes |
| `recipeDetails` | Get recipe for a meal | Yes |
| `householdMembers` | Get household members | Yes |

## Deployment Steps

### Step 1: Navigate to Functions Directory
```bash
cd "/mnt/c/Users/Nick M/Desktop/Food App Idea/functions"
```

### Step 2: Deploy All Functions
```bash
firebase deploy --only functions --project grocery-store-app-c3aa5
```

### Step 3: Deploy Single Function (faster for updates)
```bash
firebase deploy --only functions:groceryList --project grocery-store-app-c3aa5
```

## Testing Functions

### Test with curl
```bash
curl "https://us-central1-grocery-store-app-c3aa5.cloudfunctions.net/groceryList?householdCode=TEST&apiKey=ourkitchen2024"
```

### Expected Response
```json
{
  "items": [...],
  "stores": [...]
}
```

## Common Issues & Fixes

### ❌ "Permission denied" for allUsers
**Symptom:** Functions deploy but return 403 when called.

**Cause:** Google Cloud org policy blocks public function access.

**Fix:** Update org policy:
```bash
gcloud resource-manager org-policies set-policy policy.yaml --project=grocery-store-app-c3aa5
```

With `policy.yaml`:
```yaml
constraint: constraints/iam.allowedPolicyMemberDomains
listPolicy:
  allValues: ALLOW
```

Then redeploy functions or manually add `allUsers` invoker permission.

### ❌ "Function not found" after deploy
**Cause:** Sometimes Cloud Functions console doesn't reflect latest deployment.

**Fix:** Wait 1-2 minutes, then test with curl. Console may lag behind actual deployment.

### ❌ CORS errors from web app
**Cause:** Missing CORS headers in function response.

**Fix:** Ensure functions include:
```javascript
res.set('Access-Control-Allow-Origin', '*');
res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
```

## Source Files Location

```
functions/
├── index.js          # Main entry point, exports all functions
├── package.json      # Dependencies
├── functions.yaml    # Function configurations
└── .env              # Environment variables (API keys)
```

## API Key

All functions require `apiKey=ourkitchen2024` query parameter for authentication.

## Logs

View function logs:
```bash
firebase functions:log --project grocery-store-app-c3aa5
```

Or in Google Cloud Console:
https://console.cloud.google.com/functions?project=grocery-store-app-c3aa5
