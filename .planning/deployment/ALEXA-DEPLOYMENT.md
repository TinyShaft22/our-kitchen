# Alexa Skill Deployment Guide

## Skill Info
- **Skill ID:** `amzn1.ask.skill.839253af-0423-40bc-acd9-a40f1788cf7f`
- **CodeCommit URL:** `https://git-codecommit.us-east-1.amazonaws.com/v1/repos/839253af-0423-40bc-acd9-a40f1788cf7f`
- **Deploy Branch:** `master` (pushes trigger deployment to development stage)

## What DOESN'T Work

### ❌ Git Credential Helper
```bash
# This causes errors - DON'T USE
git config credential."https://git-codecommit.us-east-1.amazonaws.com".helper '!ask util git-credentials-helper'
```

### ❌ Working in the our-kitchen-alexa Directory
The local `our-kitchen-alexa` repo has divergent git history from the Alexa-hosted CodeCommit repo. Attempting to push/pull causes conflicts.

### ❌ Checkout to alexa/master
Uncommitted changes in the parent directory block `git checkout alexa/master`.

## What WORKS: Fresh Clone Approach

### Step 1: Generate Temporary Credentials
```bash
ask smapi generate-credentials-for-alexa-hosted-skill \
  --skill-id amzn1.ask.skill.839253af-0423-40bc-acd9-a40f1788cf7f \
  --repository-url "https://git-codecommit.us-east-1.amazonaws.com/v1/repos/839253af-0423-40bc-acd9-a40f1788cf7f" \
  --repository-type GIT
```

This returns JSON with `username` and `password` (valid ~15 minutes).

### Step 2: Create GIT_ASKPASS Script
```bash
cat > /tmp/askpass.sh << 'EOF'
#!/bin/bash
if [[ "$1" == *"Username"* ]]; then
  echo "PASTE_USERNAME_HERE"
else
  echo "PASTE_PASSWORD_HERE"
fi
EOF
chmod +x /tmp/askpass.sh
```

Replace `PASTE_USERNAME_HERE` and `PASTE_PASSWORD_HERE` with values from Step 1.

### Step 3: Fresh Clone to /tmp
```bash
cd /tmp && rm -rf alexa-temp
GIT_ASKPASS=/tmp/askpass.sh git clone https://git-codecommit.us-east-1.amazonaws.com/v1/repos/839253af-0423-40bc-acd9-a40f1788cf7f alexa-temp
```

### Step 4: Copy Files from Source
```bash
cd /tmp/alexa-temp/lambda

# Create directories (Alexa repo may have flat structure initially)
mkdir -p api handlers interceptors util apl

# Copy all lambda code
cp -r "/mnt/c/Users/Nick M/Desktop/Food App Idea/our-kitchen-alexa/lambda/api/"* api/
cp -r "/mnt/c/Users/Nick M/Desktop/Food App Idea/our-kitchen-alexa/lambda/handlers/"* handlers/
cp -r "/mnt/c/Users/Nick M/Desktop/Food App Idea/our-kitchen-alexa/lambda/interceptors/"* interceptors/
cp -r "/mnt/c/Users/Nick M/Desktop/Food App Idea/our-kitchen-alexa/lambda/util/"* util/
cp -r "/mnt/c/Users/Nick M/Desktop/Food App Idea/our-kitchen-alexa/lambda/apl/"* apl/
cp "/mnt/c/Users/Nick M/Desktop/Food App Idea/our-kitchen-alexa/lambda/index.js" .
cp "/mnt/c/Users/Nick M/Desktop/Food App Idea/our-kitchen-alexa/lambda/package.json" .
cp "/mnt/c/Users/Nick M/Desktop/Food App Idea/our-kitchen-alexa/lambda/package-lock.json" .

# Copy interaction model
cp "/mnt/c/Users/Nick M/Desktop/Food App Idea/our-kitchen-alexa/skill-package/interactionModels/custom/en-US.json" \
   /tmp/alexa-temp/skill-package/interactionModels/custom/
```

### Step 5: Commit and Push
```bash
cd /tmp/alexa-temp
git add -A
git commit -m "feat: description of changes"
GIT_ASKPASS=/tmp/askpass.sh git push origin master
```

## Directory Structure

### Source (our-kitchen-alexa)
```
our-kitchen-alexa/
├── lambda/
│   ├── api/firebaseClient.js
│   ├── apl/
│   │   ├── grocery-list.json
│   │   └── grocery-list-data.js
│   ├── handlers/
│   │   ├── GroceryHandlers.js
│   │   ├── MealHandlers.js
│   │   ├── CookingHandlers.js
│   │   ├── HouseholdHandlers.js
│   │   └── AplEventHandlers.js
│   ├── interceptors/
│   ├── util/
│   ├── index.js
│   └── package.json
└── skill-package/
    └── interactionModels/custom/en-US.json
```

### Target (Alexa CodeCommit)
Same structure after deployment.

## After Deployment

Test with: **"Alexa, open kitchen helper"** then **"What's on the grocery list?"**

The push to `master` triggers automatic deployment to the development stage.

## Credentials Expiration

Credentials from `generate-credentials-for-alexa-hosted-skill` expire in ~15 minutes. If push fails with auth error, regenerate credentials and update the askpass script.
