# iOS Shortcut Integration for Our Kitchen

This guide explains how to modify your "Recipe to Notes" iOS Shortcut to import recipes directly into the Our Kitchen PWA.

## Step 1: Deploy the Cloud Function

First, deploy the Firebase Cloud Function:

```bash
cd functions
npm install
firebase deploy --only functions
```

After deployment, you'll get a URL like:
```
https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/importRecipe
```

Replace `YOUR_PROJECT_ID` with your actual Firebase project ID.

## Step 2: Modify Your iOS Shortcut

Open the Shortcuts app and edit your "Recipe to Notes" shortcut.

### Actions to KEEP (1-31):
Keep all actions from the beginning through the Apple Intelligence extraction:
- Receive URL input
- TikTok/Instagram/YouTube/Facebook detection
- Content extraction
- Apple Intelligence (askllm) recipe extraction
- Screenshot capture

### Actions to REMOVE (32-37):
Delete these actions:
- Choose from Menu (Notes folder selection)
- Create Note
- Append to Note  
- Show Note

### Actions to ADD (replace removed actions):

#### A. First-Time Setup (Add once at the beginning)
Add these at the very start of the shortcut, before all other actions:

1. **If** (Shortcut Input = Nothing)
   - Add condition: Shortcut Input does not have any value

2. **Ask for Input** - "Enter your Our Kitchen household code:"
   - Input Type: Text
   - Set Variable: `HouseholdCode`

3. **Save to File** - Save `HouseholdCode` to "Shortcuts/OurKitchen/config.txt"
   - Destination: iCloud Drive
   
4. **End If**

5. **Get File** - Get "Shortcuts/OurKitchen/config.txt" from iCloud Drive
   - Set Variable: `HouseholdCode`

#### B. Replace Note Actions (at the end)
After the screenshot action, replace the Note actions with:

1. **Get contents of URL** (POST request)
   - URL: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/importRecipe`
   - Method: POST
   - Headers:
     - Content-Type: application/json
   - Request Body: JSON
     ```json
     {
       "name": [Text from Apple Intelligence - title],
       "servings": 4,
       "ingredients": [Split ingredients by newline],
       "instructions": [Text from Apple Intelligence - steps],
       "imageBase64": [Base64 Encode Screenshot],
       "sourceUrl": [Original URL input],
       "householdCode": [HouseholdCode variable]
     }
     ```

2. **Get Dictionary Value** - Get "success" from response

3. **If** (success = true)
   - **Show Alert**: "Recipe imported to Our Kitchen!"
   
4. **Otherwise**
   - **Get Dictionary Value** - Get "error" from response
   - **Show Alert**: "Import failed: [error]"
   
5. **End If**

## Step 3: Detailed Shortcut Modification

Here's exactly what each new action should look like:

### Setting Up Household Code Variable
```
1. [If] Shortcut Input | does not have any value
2.   [Ask for Input] "Enter your Our Kitchen household code"
       Default Answer: (leave empty)
       Variable Name: SetupCode
3.   [Save File] SetupCode
       Service: iCloud Drive
       Ask Where to Save: OFF
       Destination Path: Shortcuts/OurKitchen/config.txt
4.   [Stop Shortcut]
       with: Nothing
5. [End If]

6. [Get File] 
     Service: iCloud Drive  
     File Path: Shortcuts/OurKitchen/config.txt
     Variable Name: HouseholdCode
```

### After Screenshot (Replace Note Actions)
```
32. [Base64 Encode]
      Input: Screenshot
      Variable Name: ImageData

33. [Text]
      Content: (paste the JSON template - see below)
      Variable Name: RequestBody
      
34. [Get Contents of URL]
      URL: https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/importRecipe
      Method: POST
      Headers: Content-Type = application/json
      Request Body: RequestBody
      Variable Name: Response
      
35. [Get Dictionary Value]
      Dictionary: Response
      Key: success
      Variable Name: Success

36. [If] Success | is | 1
37.   [Show Alert] "Recipe imported to Our Kitchen!"
38. [Otherwise]
39.   [Get Dictionary Value]
        Dictionary: Response
        Key: error
        Variable Name: ErrorMsg
40.   [Show Alert] "Import failed: " + ErrorMsg
41. [End If]
```

### JSON Request Body Template
Use this in the Text action (step 33):

```json
{
  "name": "[Apple Intelligence Title Variable]",
  "servings": 4,
  "ingredients": [
    [Split Apple Intelligence Ingredients by newline - as list]
  ],
  "instructions": "[Apple Intelligence Steps Variable]",
  "imageBase64": "[ImageData Variable]",
  "sourceUrl": "[Shortcut Input URL]",
  "householdCode": "[HouseholdCode Variable]"
}
```

## Multi-Device / Multi-Household Support

Each device stores its own household code:
- When you first run the shortcut, it prompts for your household code
- The code is saved to iCloud Drive for future runs
- To change households, delete `iCloud Drive/Shortcuts/OurKitchen/config.txt`

When sharing the shortcut:
1. Share via iCloud link
2. Recipient installs shortcut
3. On first run, they enter THEIR household code
4. Recipes go to their household

## Troubleshooting

### "Household not found" error
- Verify your household code in the Our Kitchen app (Settings page)
- Delete the config file and re-enter the code

### Image not showing
- Ensure you have Firebase Storage configured with proper CORS
- Check that the screenshot was captured before the HTTP request

### Function timeout
- Large images may take longer to upload
- The function has a 60-second timeout by default

## API Reference

**Endpoint:** `POST /importRecipe`

**Request Body:**
```typescript
{
  name: string;           // Recipe title (required)
  servings: number;       // Default: 4
  ingredients: string[];  // Array of ingredient strings
  instructions: string;   // Recipe steps/method
  imageBase64?: string;   // Screenshot as base64 (optional)
  sourceUrl?: string;     // Original URL (optional)
  householdCode: string;  // Your household code (required)
}
```

**Response:**
```typescript
{
  success: boolean;
  mealId?: string;        // ID of created meal (on success)
  message?: string;       // Success message
  error?: string;         // Error description (on failure)
}
```
