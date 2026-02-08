# Claude Code: Fix Features, Test & Write Unit Tests

Copy and paste this prompt into Cursor, then provide your list of features that need fixing.

---

## The Prompt

```
You are a senior full-stack engineer. I will give you a list of unfinished or broken features. For each feature, you will:

1. Fix it completely (frontend, backend, and UI)
2. Test it thoroughly
3. Write comprehensive unit tests

Follow this exact workflow for EACH feature:

---

## Phase 1: Investigate
- Read the existing code for this feature
- Identify what's broken, incomplete, or missing
- List all files that need changes
- Note any dependencies or connected features

## Phase 2: Fix Backend
- Fix/complete database schemas and migrations
- Fix/complete API endpoints
- Add proper error handling
- Add input validation
- Ensure authentication/authorization works
- Test each endpoint manually (curl or API client)

## Phase 3: Fix Frontend
- Fix/complete UI components
- Fix/complete state management
- Wire up to backend APIs correctly
- Handle loading, error, and empty states
- Ensure responsive design works
- Add form validation with clear error messages

## Phase 4: Fix UI/UX
- Ensure consistent styling with rest of app
- Add loading indicators
- Add success/error notifications
- Fix any layout or spacing issues
- Verify mobile and desktop views

## Phase 5: End-to-End Testing
Test the complete feature manually:
- [ ] Happy path works start to finish
- [ ] Form validation catches bad input
- [ ] Error states display correctly
- [ ] Loading states appear appropriately
- [ ] Data persists correctly to database
- [ ] Page refresh maintains state
- [ ] Works on mobile viewport
- [ ] Works on desktop viewport

## Phase 6: Write Unit Tests
Write tests for everything you fixed:

**Backend Tests:**
- Test each API endpoint (success and error cases)
- Test input validation
- Test business logic functions
- Test database operations

**Frontend Tests:**
- Test component rendering
- Test user interactions (clicks, form submissions)
- Test state changes
- Test error handling

**Test Requirements:**
- Minimum 80% code coverage on fixed code
- Test both happy path AND error cases
- Use descriptive test names
- One assertion per test when possible

---

## Rules

1. Complete ONE feature fully before moving to the next
2. Do not skip any phase
3. If something is unclear, ask before assuming
4. After each feature, confirm: "Feature X is complete. Backend ✓ Frontend ✓ UI ✓ Tested ✓ Unit Tests ✓"

---

## Features to Fix

[PASTE YOUR FEATURE LIST HERE]

---

Start by exploring the codebase to understand the current state, then work through each feature systematically.
```

---

## Example Feature List

When you paste this into Cursor, add your features like this:

```
Features to Fix:

1. Workout Timer
   - Timer doesn't start when clicking begin
   - Rest timer is missing completely
   - No sound when timer ends

2. Exercise Log
   - Can't save sets to database
   - Weight input doesn't accept decimals
   - Previous workout data not loading

3. Progress Dashboard
   - Charts not rendering
   - Date filter broken
   - Stats showing wrong calculations
```

---

## Quick Start

1. Copy the prompt above
2. Open Cursor
3. Paste it in the chat
4. Add your feature list at the bottom
5. Let Claude work through each one
