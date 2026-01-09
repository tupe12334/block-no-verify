---
description: Create and test use cases for developed features with automated fixes
---

# Use Case Testing & Validation

Create comprehensive use cases for the feature you developed, test them all systematically, and ensure everything works correctly. Fix any issues found during testing.

## Instructions

Follow this systematic approach to validate your feature through real-world use cases:

### Phase 1: Use Case Creation

**Identify the feature context:**

- Review what was just implemented or changed
- Examine recent commits and modified files
- Understand the feature's purpose and scope

**Generate comprehensive use cases:**

1. **Happy Path Scenarios** - Normal, expected usage flows
2. **Edge Cases** - Boundary conditions and unusual inputs
3. **Error Cases** - Invalid inputs, network failures, missing data
4. **User Journeys** - End-to-end workflows involving the feature
5. **Integration Points** - How the feature interacts with other components

**Document each use case with:**

```markdown
## Use Case #: [Title]

**Type:** Happy Path | Edge Case | Error Case | User Journey | Integration
**Description:** What this use case validates
**Preconditions:** What must be true before testing
**Steps:**

1. Action 1
2. Action 2
3. ...
   **Expected Outcome:** What should happen
   **Test Method:** Unit | Integration | E2E | Playwright
```

### Phase 2: Determine Testing Strategy

**For Backend/API/Server Features:**

- Use unit tests (Vitest, Jest, etc.)
- Use integration tests for database/API interactions
- Use API testing tools (curl, fetch) for endpoint validation
- Run existing test suites to catch regressions

**For Frontend/Client Features:**

- Use Playwright MCP for browser-based testing
- Test UI interactions, form submissions, navigation
- Validate visual elements and user feedback
- Check responsive behavior if applicable
- Verify accessibility if relevant

**For Full-Stack Features:**

- Combine both approaches
- Test API endpoints first
- Then test client integration with Playwright
- Verify end-to-end data flow

### Phase 3: Execute Tests Systematically

**Create a test execution plan:**

```bash
# Example test plan
1. Run existing test suite to ensure no regressions
2. Execute Use Case 1: [Title]
3. Execute Use Case 2: [Title]
4. Execute Use Case 3: [Title]
...
```

**For each use case:**

1. **Setup:** Prepare test environment, data, and preconditions
2. **Execute:** Run the test following the documented steps
3. **Verify:** Check that actual outcome matches expected outcome
4. **Document:** Record result (✅ Pass | ❌ Fail with details)

**Use TodoWrite to track progress:**

```
- [ ] Use Case 1: User login with valid credentials
- [ ] Use Case 2: User login with invalid credentials
- [ ] Use Case 3: Password reset flow
...
```

### Phase 4: Playwright Testing (Client Features)

**When to use Playwright MCP:**

- Any feature involving the browser/UI
- Form interactions and submissions
- Navigation and routing changes
- Visual feedback and animations
- Client-side state management
- User interactions (clicks, typing, selections)

**Playwright testing workflow:**

1. **Navigate to the feature:**

   ```
   Use mcp__playwright__browser_navigate to open the page
   Use mcp__playwright__browser_snapshot to see current state
   ```

2. **Interact with elements:**

   ```
   Use mcp__playwright__browser_click to click buttons/links
   Use mcp__playwright__browser_type to fill forms
   Use mcp__playwright__browser_select_option for dropdowns
   ```

3. **Verify outcomes:**

   ```
   Use mcp__playwright__browser_snapshot to verify UI state
   Use mcp__playwright__browser_console_messages for console errors
   Use mcp__playwright__browser_take_screenshot for visual verification
   ```

4. **Test different scenarios:**
   - Valid inputs → success paths
   - Invalid inputs → error messages
   - Edge cases → proper handling
   - Network conditions → loading states

**Example Playwright test flow:**

```markdown
Testing: User Registration Form

1. Navigate to /register
2. Take snapshot to verify form elements exist
3. Fill in valid user details
4. Click submit button
5. Verify success message appears
6. Check console for errors (should be none)
7. Navigate to login page
8. Verify can login with new credentials
```

### Phase 5: Fix Failures

**When tests fail:**

1. **Analyze the failure:**
   - Read error messages carefully
   - Check console logs and network requests
   - Review stack traces
   - Identify root cause

2. **Categorize the issue:**
   - Implementation bug
   - Test case error
   - Environment issue
   - Missing dependency

3. **Fix systematically:**
   - Fix implementation bugs in source code
   - Update tests if expectations were wrong
   - Document any environment requirements
   - Add missing error handling

4. **Verify the fix:**
   - Re-run the failed test
   - Run related tests to ensure no new issues
   - Run full test suite if significant changes made

5. **Update use case documentation:**
   - Note any changes to expected behavior
   - Update preconditions if needed
   - Refine test steps for clarity

### Phase 6: Regression Prevention

**After all tests pass:**

1. **Convert use cases to automated tests:**
   - Write unit/integration tests for backend use cases
   - Create Playwright test scripts for client use cases
   - Add tests to CI/CD pipeline if possible

2. **Document test coverage:**
   - List all validated use cases
   - Note any use cases that need manual testing
   - Identify gaps in test coverage

3. **Run full test suite:**

   ```bash
   npm test  # or pnpm test, yarn test
   npm run test:e2e  # if applicable
   ```

4. **Verify no regressions:**
   - All existing tests still pass
   - New tests pass
   - No console errors or warnings
   - Application builds successfully

### Phase 7: Final Validation

**Comprehensive checks:**

- [ ] All use cases documented
- [ ] All use cases tested (automated or manual)
- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript/linting errors
- [ ] Code builds successfully
- [ ] Documentation updated if needed
- [ ] Ready for code review/deployment

**Report results:**

```markdown
## Use Case Testing Summary

**Feature:** [Feature name]
**Total Use Cases:** X
**Passed:** Y
**Failed (Fixed):** Z
**Test Coverage:** Backend | Frontend | Full-Stack

### Use Cases Validated:

1. ✅ [Use Case 1]
2. ✅ [Use Case 2]
3. ✅ [Use Case 3] (initially failed, fixed: [brief description])
   ...

### Issues Found & Fixed:

- [Issue 1]: [Description] → [Fix applied]
- [Issue 2]: [Description] → [Fix applied]

### Test Artifacts:

- Unit tests: [file paths]
- Playwright tests: [scenarios covered]
- Screenshots: [if applicable]

**Status:** ✅ All use cases validated, feature ready for review
```

## Best Practices

**Use Case Creation:**

- Think from user's perspective
- Cover both technical and business requirements
- Include accessibility and performance considerations
- Don't just test happy paths

**Testing Execution:**

- Test in isolation first, then integration
- Use realistic test data
- Test with different user roles/permissions if applicable
- Consider mobile/responsive scenarios for UI features

**Playwright Usage:**

- Always check browser console for errors
- Take screenshots of important states
- Test keyboard navigation for accessibility
- Verify loading states and transitions
- Test error messages are user-friendly

**Fixing Issues:**

- Fix root causes, not symptoms
- Add validation to prevent similar issues
- Update related documentation
- Consider if fix needs broader changes

**Quality Standards:**

- Zero console errors
- All tests passing
- Code follows project conventions
- Feature works as specified
- Edge cases handled gracefully

## Example Workflow

```bash
# 1. Analyze what was implemented
git diff main...HEAD --stat
git log -5 --oneline

# 2. Create use cases document (if complex feature)
# Create use-cases.md in feature directory or spec

# 3. Run existing tests first
npm test

# 4. For client features: start Playwright
# Navigate and test through Playwright MCP tools

# 5. For backend features: write and run tests
# Create test files, run npm test

# 6. Track progress with TodoWrite
# Mark each use case as completed

# 7. Fix any failures
# Edit source code, re-run tests

# 8. Final validation
npm run build
npm test
npm run lint

# 9. Report results
# Provide summary of what was tested and validated
```

---

**Remember:** Thorough use case testing catches issues before users do. Test realistically, fix properly, and ensure your feature works in all scenarios it will encounter in production.
