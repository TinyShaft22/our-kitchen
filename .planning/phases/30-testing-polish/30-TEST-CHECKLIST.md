# Alexa End-to-End Test Checklist

## Test Environment

- **Device:** Echo Show 5
- **Invocation:** "Alexa, open our kitchen"
- **PWA:** [your deployed PWA URL]
- **Household PIN:** [your 4-digit PIN from PWA Settings]
- **Skill Status:** Development mode

## Prerequisites

Before testing, ensure:

- [x] Cloud Functions deployed (8 functions)
- [x] Alexa Lambda deployed (via CodeCommit)
- [ ] At least 2 meals in weekly plan
- [ ] At least 3 items on grocery list (from different stores)
- [ ] At least 1 saved household item
- [ ] At least 1 recipe with cooking instructions
- [ ] Alexa skill is in development mode on your Amazon account

---

## Test Scenarios

### 1. Household Linking

| #   | Voice Command                            | Expected Response                     | APL Display | Pass? |
| --- | ---------------------------------------- | ------------------------------------- | ----------- | ----- |
| 1.1 | "Alexa, open our kitchen" (new device)   | "Welcome! Please say your 4-digit PIN" | None        | [ ]   |
| 1.2 | Say your 4-digit PIN                     | "Great! You're linked to household X" | None        | [ ]   |
| 1.3 | "Alexa, open our kitchen" (linked)       | "Welcome back! What would you like?"  | None        | [ ]   |
| 1.4 | Say wrong PIN 3 times                    | "Too many attempts. Try again later"  | None        | [ ]   |

### 2. Meal Browsing

| #   | Voice Command                  | Expected Response                        | APL Display                   | Pass? |
| --- | ------------------------------ | ---------------------------------------- | ----------------------------- | ----- |
| 2.1 | "What's for dinner this week"  | Lists up to 5 meals by name              | Scrollable meal list w/images | [ ]   |
| 2.2 | "Show me our meals"            | Same as above                            | Meal list                     | [ ]   |
| 2.3 | "Show me baking"               | Lists recipes in Baking category         | Filtered meal list            | [ ]   |
| 2.4 | "Show me cookies"              | Lists recipes in Cookies subcategory     | Filtered meal list            | [ ]   |
| 2.5 | "Show me desserts"             | Lists recipes in Dessert category        | Filtered meal list            | [ ]   |
| 2.6 | Tap a meal on screen           | Opens recipe detail for that meal        | Recipe detail view            | [ ]   |

### 3. Recipe Detail

| #   | Voice Command                  | Expected Response                                          | APL Display                        | Pass? |
| --- | ------------------------------ | ---------------------------------------------------------- | ---------------------------------- | ----- |
| 3.1 | "Recipe for [meal name]"       | "Here's [meal]. Would you like ingredients or instructions?" | Recipe with image & ingredients   | [ ]   |
| 3.2 | "What's in [meal name]"        | Reads ingredient list (up to 7)                            | Recipe detail scrolled to ingredients | [ ]   |
| 3.3 | "Read the ingredients"         | Lists ingredients for current recipe                       | Same view                          | [ ]   |
| 3.4 | "Read the instructions"        | Reads instruction summary                                  | Recipe detail                      | [ ]   |
| 3.5 | Tap "Start Cooking" button     | Enters cooking mode at step 0                              | Cooking pager view                 | [ ]   |
| 3.6 | Tap back button in header      | Returns to meal list                                       | Meal list                          | [ ]   |

### 4. Cooking Mode - Voice Navigation

| #   | Voice Command                  | Expected Response                        | APL Display                   | Pass? |
| --- | ------------------------------ | ---------------------------------------- | ----------------------------- | ----- |
| 4.1 | "Let's cook [meal name]"       | "First, gather your ingredients: [list]" | Pager on step 0 (ingredients) | [ ]   |
| 4.2 | "Start cooking [meal name]"    | Same as above                            | Pager on step 0               | [ ]   |
| 4.3 | "Next"                         | Reads step 1 aloud                       | Pager advances to step 1      | [ ]   |
| 4.4 | "Next step"                    | Reads next step                          | Pager advances                | [ ]   |
| 4.5 | "Previous"                     | Reads previous step                      | Pager goes back               | [ ]   |
| 4.6 | "Go back"                      | Same as previous                         | Pager goes back               | [ ]   |
| 4.7 | "Repeat"                       | Reads current step again                 | No pager change               | [ ]   |
| 4.8 | "Repeat that"                  | Same as repeat                           | No pager change               | [ ]   |
| 4.9 | Navigate to final step + "Next"| "Enjoy your meal! Happy cooking!"        | Shows last step               | [ ]   |
| 4.10| "Stop" or "Cancel"             | Exits cooking mode                       | Returns to home/recipe        | [ ]   |
| 4.11| "Exit cooking"                 | Exits cooking mode                       | Returns to recipe detail      | [ ]   |

### 5. Cooking Mode - Touch Navigation

| #   | Touch Action                   | Expected Behavior                        | Pass? |
| --- | ------------------------------ | ---------------------------------------- | ----- |
| 5.1 | Swipe left on pager            | Advances to next cooking step            | [ ]   |
| 5.2 | Swipe right on pager           | Goes to previous cooking step            | [ ]   |
| 5.3 | Swipe, then say "Next"         | Voice continues from swipe position      | [ ]   |
| 5.4 | Swipe to last step             | Shows completion message on final swipe  | [ ]   |
| 5.5 | Tap "Exit" button              | Returns to recipe detail view            | [ ]   |

### 6. Cooking Resume

| #   | Action                                   | Expected Response                        | Pass? |
| --- | ---------------------------------------- | ---------------------------------------- | ----- |
| 6.1 | Exit mid-recipe, then "open our kitchen" | "Continue cooking [meal] at step X?"     | [ ]   |
| 6.2 | "Yes" to resume prompt                   | Resumes at saved step                    | [ ]   |
| 6.3 | "No" to resume prompt                    | Clears progress, shows welcome           | [ ]   |
| 6.4 | Wait 24+ hours, then "open our kitchen"  | No resume offered (expired)              | [ ]   |

### 7. Grocery List - Reading

| #   | Voice Command                        | Expected Response                      | APL Display              | Pass? |
| --- | ------------------------------------ | -------------------------------------- | ------------------------ | ----- |
| 7.1 | "What's on the grocery list"         | Lists items grouped by store (up to 5) | Grocery list with stores | [ ]   |
| 7.2 | "Show me the grocery list"           | Same as above                          | Grocery list             | [ ]   |
| 7.3 | "What do I need at Costco"           | Lists only Costco items                | Filtered to Costco       | [ ]   |
| 7.4 | "What do I need at Trader Joe's"     | Lists only TJ items                    | Filtered to TJ           | [ ]   |
| 7.5 | "What do I need at Safeway"          | Lists only Safeway items               | Filtered to Safeway      | [ ]   |
| 7.6 | (Empty grocery list)                 | "Your grocery list is empty"           | Empty state              | [ ]   |

### 8. Grocery List - Adding Items

| #   | Voice Command                              | Expected Response                        | Pass? |
| --- | ------------------------------------------ | ---------------------------------------- | ----- |
| 8.1 | "Add eggs"                                 | "Added eggs. Say undo to remove it."     | [ ]   |
| 8.2 | "Undo"                                     | "Removed eggs from the list"             | [ ]   |
| 8.3 | "Add milk to the list"                     | "Added milk. Say undo..."                | [ ]   |
| 8.4 | "Put bread on the grocery list"            | "Added bread. Say undo..."               | [ ]   |
| 8.5 | "Add [saved household item]"               | Uses saved store/category from library   | [ ]   |
| 8.6 | "Add [item already on list]"               | "You already have X. Add duplicate?"     | [ ]   |
| 8.7 | "Yes" to duplicate prompt                  | "Added another X"                        | [ ]   |
| 8.8 | "No" to duplicate prompt                   | "Okay, keeping just one"                 | [ ]   |
| 8.9 | "Add eggs and milk"                        | Adds both items separately               | [ ]   |

### 9. Grocery List - Removing Items

| #   | Voice Command                        | Expected Response                  | Pass? |
| --- | ------------------------------------ | ---------------------------------- | ----- |
| 9.1 | "Remove eggs from the list"          | "Removed eggs from your list"      | [ ]   |
| 9.2 | "Take milk off the list"             | "Removed milk from your list"      | [ ]   |
| 9.3 | "Check off bread"                    | "Checked off bread"                | [ ]   |
| 9.4 | "Got the eggs"                       | "Checked off eggs"                 | [ ]   |
| 9.5 | "Remove [nonexistent item]"          | "I couldn't find X on your list"   | [ ]   |

### 10. Navigation & Help

| #   | Voice Command                  | Expected Response                          | Pass? |
| --- | ------------------------------ | ------------------------------------------ | ----- |
| 10.1| "Help"                         | Lists available commands                   | [ ]   |
| 10.2| "What can I do"                | Same as help                               | [ ]   |
| 10.3| "Go to meals"                  | Shows meal list                            | [ ]   |
| 10.4| "Go to grocery list"           | Shows grocery list                         | [ ]   |
| 10.5| "Exit" or "Stop"               | "Goodbye!" and closes skill               | [ ]   |

### 11. Error Handling

| #   | Scenario                               | Expected Response                          | Pass? |
| --- | -------------------------------------- | ------------------------------------------ | ----- |
| 11.1| Unrecognized command while linked      | "I didn't catch that. You can say..."      | [ ]   |
| 11.2| Recipe request for nonexistent meal    | "I couldn't find a recipe called X"        | [ ]   |
| 11.3| "Start cooking" with no recipe context | "Which recipe would you like to cook?"     | [ ]   |
| 11.4| Network error (simulate offline)       | Graceful error message, skill stays open   | [ ]   |

### 12. APL Visual Quality

| #   | Check                          | Expected                                   | Pass? |
| --- | ------------------------------ | ------------------------------------------ | ----- |
| 12.1| Theme colors                   | Dark background, terracotta accent (#C4704B) | [ ]   |
| 12.2| Text readability               | Clear, legible on Echo Show 5 screen       | [ ]   |
| 12.3| Image loading                  | Meal images load within 2 seconds          | [ ]   |
| 12.4| Scrolling performance          | Smooth, responsive scrolling               | [ ]   |
| 12.5| Touch targets                  | Easy to tap, 44px+ hit areas               | [ ]   |
| 12.6| Pager responsiveness           | Swipes register reliably                   | [ ]   |
| 12.7| Step numbers visible           | "Step X of Y" clearly shown                | [ ]   |
| 12.8| Navigation hints               | "Swipe or say next" hint visible           | [ ]   |

### 13. Multi-Turn Conversations

| #   | Conversation Flow                      | Expected Behavior                          | Pass? |
| --- | -------------------------------------- | ------------------------------------------ | ----- |
| 13.1| "What's for dinner" -> tap meal -> "Read ingredients" | Seamless flow through meal to recipe | [ ]   |
| 13.2| "Add eggs" -> "Add milk" -> "What's on the list" | All items appear on list           | [ ]   |
| 13.3| "Start cooking X" -> navigate all steps -> exit | Complete cooking flow without issues | [ ]   |
| 13.4| Session timeout (8+ seconds silence)   | Session ends gracefully                    | [ ]   |

---

## Issues Found

| #   | Description | Severity | Category | Notes |
| --- | ----------- | -------- | -------- | ----- |
| 1   |             |          |          |       |
| 2   |             |          |          |       |
| 3   |             |          |          |       |
| 4   |             |          |          |       |
| 5   |             |          |          |       |

**Severity levels:**
- **Critical:** Skill crashes, security issue, data loss
- **High:** Feature doesn't work at all
- **Medium:** Feature works but poorly or inconsistently
- **Low:** Minor annoyance, cosmetic issue

---

## Test Results Summary

| Category                    | Total | Passed | Failed | Blocked |
| --------------------------- | ----- | ------ | ------ | ------- |
| 1. Household Linking        | 4     |        |        |         |
| 2. Meal Browsing            | 6     |        |        |         |
| 3. Recipe Detail            | 6     |        |        |         |
| 4. Cooking Mode - Voice     | 11    |        |        |         |
| 5. Cooking Mode - Touch     | 5     |        |        |         |
| 6. Cooking Resume           | 4     |        |        |         |
| 7. Grocery List - Reading   | 6     |        |        |         |
| 8. Grocery List - Adding    | 9     |        |        |         |
| 9. Grocery List - Removing  | 5     |        |        |         |
| 10. Navigation & Help       | 5     |        |        |         |
| 11. Error Handling          | 4     |        |        |         |
| 12. APL Visual Quality      | 8     |        |        |         |
| 13. Multi-Turn Conversations| 4     |        |        |         |
| **TOTAL**                   | **77**|        |        |         |

---

## Post-Testing Actions

After completing all tests:

1. **If all tests pass:** Mark plan 30-01 as complete
2. **If issues found:**
   - Log issues in the table above
   - Create fix tasks for Phase 30-02
   - Prioritize by severity
3. **Polish items identified:** Add to Phase 30-03 improvements list

---

## Tester Notes

_Space for additional observations during testing:_

---

## Sign-off

- **Tested by:** _______________
- **Date:** _______________
- **Device firmware:** _______________
- **Overall result:** [ ] Pass / [ ] Pass with issues / [ ] Fail
