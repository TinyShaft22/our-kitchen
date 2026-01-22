# API Key Deployment Guide

This document explains how to set the `ALEXA_API_KEY` environment variable for both Cloud Functions and Lambda deployments.

## Cloud Functions (Firebase)

### Local Development

1. Copy the example environment file:
   ```bash
   cd functions
   cp .env.example .env
   ```

2. Edit `.env` and set your API key:
   ```
   ALEXA_API_KEY=your-api-key-here
   ```

3. The `.env` file is gitignored and will not be committed.

### Production Deployment

**Option 1: Firebase Deploy with .env file**

Firebase Functions v2 automatically reads from `functions/.env` during deployment:

```bash
firebase deploy --only functions
```

The environment variables in `.env` are uploaded to the Cloud Functions runtime.

**Option 2: Set via Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Functions > Configuration
4. Add environment variable: `ALEXA_API_KEY` = your-key

**Option 3: Use Firebase Secrets (recommended for production)**

For sensitive values, use Firebase Secrets Manager:

```bash
firebase functions:secrets:set ALEXA_API_KEY
```

Then update your functions to use `defineSecret`:

```typescript
import { defineSecret } from "firebase-functions/params";
const apiKey = defineSecret("ALEXA_API_KEY");
```

### Verifying Deployment

After deploying, test with curl:

```bash
curl -X POST https://us-central1-grocery-store-app-c3aa5.cloudfunctions.net/verifyPin \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"pin": "test123"}'
```

If the API key is correct, you should get a JSON response (valid: true/false).
If the API key is wrong, you'll get a 401 Unauthorized error.

## Lambda (Alexa-Hosted Skill)

### Setting Environment Variables

**Option 1: Alexa Developer Console (recommended)**

1. Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
2. Select your skill
3. Navigate to **Build** > **Code**
4. Click the **Environment Variables** tab
5. Add new variable:
   - Key: `ALEXA_API_KEY`
   - Value: your-api-key
6. Click **Save**
7. Deploy your skill

**Option 2: ASK CLI**

If using ASK CLI for deployment, environment variables can be set via the skill manifest or deployment configuration.

### Verifying Lambda Configuration

1. Open the Alexa Developer Console
2. Go to **Test** tab
3. Say or type: "open kitchen helper"
4. If the API key is not set, you'll see an error in the CloudWatch logs

### CloudWatch Logs

To check Lambda logs for errors:

1. Go to AWS CloudWatch
2. Find the log group: `/aws/lambda/your-skill-function`
3. Look for error messages containing "ALEXA_API_KEY environment variable is not set"

## Rollback Procedure

If deployment fails or the API key is incorrect:

### Cloud Functions Rollback

1. Check recent deployments:
   ```bash
   firebase functions:log --only importRecipe
   ```

2. Roll back to previous version via Firebase Console:
   - Go to Functions > importRecipe
   - Click "Rollback" on a previous version

3. Or redeploy with corrected `.env`:
   ```bash
   firebase deploy --only functions
   ```

### Lambda Rollback

1. Go to Alexa Developer Console
2. Navigate to **Build** > **Code**
3. Check git history for previous working version
4. Or update the `ALEXA_API_KEY` environment variable to correct value
5. Redeploy

## Security Notes

- **Never commit the actual API key** to version control
- The `functions/.env` file is gitignored
- `functions/.env.example` is committed as a template (with placeholder value)
- Consider rotating the API key periodically
- For production, use a strong random key (e.g., `openssl rand -hex 32`)

## Generating a New API Key

To generate a secure random API key:

```bash
# Generate 32-character hex string
openssl rand -hex 16

# Or generate 44-character base64 string
openssl rand -base64 32
```

After generating a new key:

1. Update `functions/.env` locally
2. Update Firebase Console or redeploy functions
3. Update Alexa Developer Console environment variable
4. Test both integrations
