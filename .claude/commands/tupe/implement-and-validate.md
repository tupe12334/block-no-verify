---
description: End-to-end implementation and validation of spec tasks
allowed-tools: Task, Bash, Read, Write, Edit, MultiEdit, Grep, Glob, WebFetch, WebSearch, mcp__playwright__*
argument-hint: <feature-name>
---

# Implement and Validate Feature

Complete end-to-end implementation and validation for feature: **$1**

Executes ALL pending tasks using TDD methodology, then runs comprehensive validation with testing and bug analysis.

## Overview

This command combines:

1. **Implementation Phase**: Execute all pending tasks using TDD methodology
2. **Validation Phase**: Comprehensive feature validation with testing (`/tupe:validate-feature`)

## Prerequisites Check

Before implementation, gather context about the feature:

**Look for documentation in**:

- `docs/` directory - Feature documentation
- `specifications/` or `specs/` - Specification documents
- `README.md` - Feature descriptions
- Code comments and existing implementation

**If no documentation exists**:

- Work with user to define requirements
- Infer scope from conversation context
- Document decisions as you implement

---

## Phase 1: Context Loading

Load project context for implementation:

### Project Documentation

- Check for architecture docs, tech stack docs, coding conventions
- Review existing patterns in the codebase
- Understand project structure and organization

### Feature Context

- Gather requirements from documentation or conversation
- Understand the scope of what needs to be implemented
- Identify acceptance criteria

---

## Phase 2: TDD Implementation (All Tasks)

Execute **ALL pending tasks** (unchecked `- [ ]` items) using strict Test-Driven Development methodology.

### Task Identification

Identify tasks from documentation, conversation, or create a task breakdown:

- Break the feature into discrete, implementable tasks
- Prioritize tasks by dependencies
- Estimate complexity of each task

**Output Example**:

```
📋 Task Analysis for feature: $1
   Total tasks: 15
   ✅ Completed: 3
   ⏳ Pending: 12

   Pending tasks to implement:
   - [ ] 1.2 Implement authentication service
   - [ ] 2. Build user management system
   - [ ] 2.1 Create user CRUD operations
   - [ ] 2.2 Add user validation logic
   ... (list all pending tasks)
```

### TDD Cycle for Each Task

For each pending task in sequential order:

#### 1. RED Phase - Write Failing Tests First

**Before any implementation code**:

- Analyze task requirements from tasks.md details
- Reference requirements and design documents for expected behavior
- Write comprehensive test cases covering:
  - Happy path scenarios
  - Edge cases and boundary conditions
  - Error conditions and validation
  - Integration points with existing code
- Run tests to confirm they fail (no implementation yet)

**Test File Naming**:

- Follow project conventions
- Common pattern: `*.spec.ts` files next to implementation
- Place tests next to the logic they test for better discoverability

#### 2. GREEN Phase - Minimal Implementation

**Write just enough code to pass the tests**:

- Implement ONLY what the current task requires
- Follow design specifications if available
- Use existing project patterns and conventions
- Aim for simplest solution that passes tests
- No premature optimization
- No extra features beyond task scope

**Implementation Guidelines**:

- Single responsibility per function/class
- Clear, descriptive naming
- Type safety (TypeScript: proper types, avoid `any`)
- Input validation and error handling
- Consistent with existing codebase patterns

#### 3. REFACTOR Phase - Clean and Improve

**After tests pass, improve code quality**:

- Remove duplication
- Improve naming and clarity
- Extract reusable components
- Optimize data structures
- Add helpful comments for complex logic
- Ensure consistent formatting
- Maintain test coverage

**Refactoring Checklist**:

- [ ] Code is DRY (Don't Repeat Yourself)
- [ ] Names are clear and descriptive
- [ ] Functions are small and focused
- [ ] No code smells detected
- [ ] Follows project conventions
- [ ] Tests still pass after refactoring

#### 4. VERIFY Phase - Quality Assurance

**Before marking task complete**:

- Run ALL project tests (not just new ones)
  ```bash
  npm test || pnpm test || yarn test
  ```
- Verify no regressions in existing functionality
- Run linter if configured
  ```bash
  npm run lint || pnpm lint || yarn lint
  ```
- Run type checker (TypeScript)
  ```bash
  tsc --noEmit || npm run type-check
  ```
- Check test coverage (if configured)
- Manual smoke test of the feature

**Quality Gates** (MUST PASS before continuing):

- ✅ All tests passing
- ✅ No linting errors
- ✅ No type errors
- ✅ Test coverage maintained or improved
- ✅ No console errors or warnings

**If any gate fails**:

- Fix issues immediately
- Re-run verification
- Do NOT proceed to next task until all gates pass

#### 5. MARK COMPLETE Phase - Update Task Status

**After successful verification**:

- Track task completion using TodoWrite tool
- Commit the implementation with descriptive message:

  ```bash
  git add [relevant files only]
  git commit -m "$(cat <<'EOF'
  feat($1): implement task X.Y - [task description]

  [Brief explanation of what was implemented]
  - Added [feature/component]
  - Implemented [functionality]
  - Tests: [test coverage added]

  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  EOF
  )"
  ```

### Task Execution Loop

**Repeat TDD cycle for ALL pending tasks**:

```
For task in pending_tasks:
  ├─ 1. RED: Write failing tests
  ├─ 2. GREEN: Implement to pass tests
  ├─ 3. REFACTOR: Clean and improve
  ├─ 4. VERIFY: Run all quality gates
  └─ 5. MARK COMPLETE: Update tasks.md & commit

Next task...
```

### Progress Tracking

**After each task completion, output progress**:

```
✅ Task 2.1 completed: Create user CRUD operations
   Progress: 4/15 tasks complete (27%)
   Remaining: 11 tasks

   Next task: 2.2 Add user validation logic
```

### Integration Tasks

**Pay special attention to integration tasks**:

- These wire together previously implemented components
- Test end-to-end flows
- Verify components work together correctly
- Check for integration bugs
- Validate complete feature functionality

### Implementation Complete

**When all tasks are checked**:

```
🎉 Implementation Phase Complete!

   Feature: $1
   Total tasks completed: 15/15

   All tests passing ✅
   All quality gates passed ✅
   All tasks committed ✅

   Moving to Validation Phase...
```

---

## Phase 3: Comprehensive Validation

After implementation completes, run **ultra-thorough validation** using the same methodology as `/tupe:validate-feature`.

### Validation Overview

Execute six-phase comprehensive validation:

1. Documentation Discovery & Analysis
2. Codebase Deep Dive
3. Behavioral & Requirements Analysis
4. Interactive Testing with Playwright
5. Bug Analysis & Issue Identification
6. Report Generation

---

### Phase 3.1: Documentation Discovery

**Adaptive Documentation Search** - works with ANY project structure:

**Search Locations** (use Task tool with Explore agent):

- `README*.md` - Feature descriptions
- `docs/**/*.md` - Documentation folders
- `specifications/**/*.md` or `specs/**/*.md` - Specs
- `design/**/*.md` - Design documents
- `*.md` files in project root
- Code comments and JSDoc/TSDoc

**Search Strategy**:

1. Use Task tool (Explore agent, "very thorough" mode) to find all docs mentioning "$1"
2. Extract expected behavior from documentation
3. Identify requirements, acceptance criteria, success metrics
4. Note any project-level architecture/tech/product docs

**Fallback**: If minimal documentation, infer from code and conversation context.

**Documentation Quality Assessment**:

- Completeness: Are all aspects documented?
- Accuracy: Does documentation match implementation?
- Clarity: Is documentation understandable?
- Maintainability: Is documentation up-to-date?
- Gaps: What's missing that should be documented?

---

### Phase 3.2: Codebase Deep Dive

**Implementation Discovery** (use Task tool with Explore agent, "very thorough"):

**Find and analyze**:

- ALL files implementing the feature
- Complete code flow and execution paths
- Data flow through the system
- Integration points and dependencies
- Test coverage for feature components
- Configuration files related to feature

**Code Quality Analysis**:

**Architecture**:

- Alignment with existing project patterns
- Modularity and separation of concerns
- Component boundaries and responsibilities
- Dependency management
- Integration approach

**Code Consistency**:

- Follows codebase conventions
- Consistent naming patterns
- Consistent error handling approach
- Consistent file organization
- Matches existing code style

**Error Handling**:

- Input validation present and thorough
- Edge cases covered (null, undefined, empty, boundary values)
- Error messages clear and actionable
- Graceful degradation on failures
- Proper exception handling

**Security Assessment**:

- Input sanitization (prevent injection attacks)
- Authentication and authorization checks
- XSS prevention (sanitize user input in UI)
- SQL injection prevention (parameterized queries)
- CSRF protection (if applicable)
- Sensitive data handling (no secrets in code/logs)
- Rate limiting (if applicable for APIs)

**Performance Analysis**:

- Algorithm efficiency (no O(n²) where O(n) possible)
- Database query optimization (no N+1 queries)
- Caching strategies (appropriate memoization)
- Memory management (no leaks, proper cleanup)
- Bundle size impact (for frontend)
- Response time measurements

**Type Safety** (TypeScript projects):

- Proper type definitions (interfaces, types)
- Avoid excessive `any` usage
- Type guards for runtime safety
- Consistent type patterns
- Generic usage where appropriate

**Code Duplication**:

- DRY principle adherence
- Reusable components extracted
- Shared utilities utilized
- No copy-paste code

**Technical Debt Identification**:

- TODO/FIXME/HACK comments (with file:line references)
- Workarounds or temporary solutions
- Known limitations
- Areas needing refactoring
- Dependencies on deprecated libraries

---

### Phase 3.3: Behavioral & Requirements Analysis

**Expected Behavior Extraction**:

From documentation and conversation context:

- Core functionality requirements
- User stories and use cases
- Business rules and constraints
- Integration requirements
- Performance requirements
- Security requirements
- Acceptance criteria

**Implementation Verification**:

**Requirements Traceability**:
For each identified requirement:

```
REQ-X.X: [Requirement description]
Status: ✅ Implemented / ⚠️ Partial / ❌ Missing
Implementation: [file:line references]
Tests: [test file references covering this requirement]
Notes: [Any deviations, concerns, or limitations]
```

**Gap Analysis**:

- Missing functionality: Requirements not implemented
- Extra functionality: Implemented features not in requirements (scope creep?)
- Inconsistencies: Docs say X, code does Y
- Incomplete implementations: Partial functionality
- Test coverage gaps: Requirements without tests

---

### Phase 3.4: Interactive Testing with Playwright

**Test Planning**:

- Identify all user-facing surfaces (UI, API, CLI)
- Map user flows from requirements
- List edge cases and error scenarios
- Define acceptance test cases

**Automated Testing Execution**:

#### For UI Features (Web Application)

**Browser Testing with Playwright MCP**:

1. **Setup**:

   ```
   - Launch browser (desktop viewport)
   - Navigate to feature location
   - Ensure clean state (logged out/in as appropriate)
   ```

2. **Primary User Flows**:
   - Test main happy path scenarios
   - Follow exact steps from requirements/user stories
   - Verify UI updates correctly
   - Check navigation flows

3. **Form Validation**:
   - Test required field validation
   - Test input format validation (email, phone, etc.)
   - Test length limits (min/max)
   - Test invalid input handling
   - Verify error message quality

4. **Error Scenarios**:
   - Test server error handling (500 errors)
   - Test network failure handling
   - Test timeout handling
   - Verify error messages to user
   - Check error recovery

5. **Edge Cases**:
   - Empty states (no data)
   - Maximum data (pagination, long lists)
   - Boundary values (min, max, zero, negative)
   - Special characters in inputs
   - Concurrent operations

6. **Responsive Testing**:
   - Desktop viewport (1920x1080)
   - Tablet viewport (768x1024)
   - Mobile viewport (375x667)
   - Test key interactions on each

7. **Accessibility Testing**:
   - ARIA labels present (`role`, `aria-label`, `aria-describedby`)
   - Keyboard navigation works (Tab, Enter, Escape)
   - Focus indicators visible
   - Color contrast adequate (WCAG AA minimum)
   - Screen reader friendly structure

8. **Visual Verification**:
   - Capture screenshots of key states (save to `/tmp/`)
   - Screenshot success states
   - Screenshot error states
   - Screenshot loading states
   - Screenshot empty states

9. **Console Monitoring**:
   - Check for JavaScript errors
   - Check for console warnings
   - Check for failed network requests
   - Log any issues found

10. **Performance Checks**:
    - Measure page load times
    - Check for slow API calls
    - Monitor memory usage (if possible)
    - Verify no memory leaks in long sessions

#### For API Features (Backend/REST/GraphQL)

**API Testing Strategy**:

1. **Endpoint Discovery**:
   - List ALL endpoints for feature
   - Identify HTTP methods (GET, POST, PUT, PATCH, DELETE)
   - Document expected request/response formats

2. **Success Path Testing**:

   ```bash
   # Test successful operations
   curl -X POST /api/feature -d '{"valid": "data"}' -H "Content-Type: application/json"

   # Verify response:
   # - Correct status code (200, 201, etc.)
   # - Correct response structure
   # - Correct data returned
   # - Headers set properly
   ```

3. **HTTP Method Testing**:
   - GET: Retrieve resources (test with valid IDs, query params)
   - POST: Create resources (test validation, conflict handling)
   - PUT: Replace resources (test full updates)
   - PATCH: Partial updates (test field updates)
   - DELETE: Remove resources (test idempotency)
   - OPTIONS: CORS preflight (if applicable)

4. **Error Condition Testing**:
   - 400 Bad Request: Invalid input, malformed JSON
   - 401 Unauthorized: Missing or invalid auth token
   - 403 Forbidden: Insufficient permissions
   - 404 Not Found: Resource doesn't exist
   - 409 Conflict: Duplicate resource creation
   - 422 Unprocessable Entity: Validation errors
   - 429 Too Many Requests: Rate limiting
   - 500 Internal Server Error: Server failures
   - 503 Service Unavailable: Service down

5. **Input Validation Testing**:
   - Required fields missing
   - Invalid data types (string where number expected)
   - Out-of-range values (negative where positive required)
   - SQL injection attempts (in string inputs)
   - XSS payloads (in text fields)
   - Excessively large payloads
   - Special characters handling

6. **Authentication/Authorization Testing**:
   - Unauthenticated requests (no token)
   - Invalid tokens (expired, malformed)
   - Insufficient permissions (user role checks)
   - Cross-user access attempts (user A accessing user B data)

7. **Rate Limiting Testing** (if applicable):
   - Send requests beyond rate limit
   - Verify 429 response
   - Check rate limit headers
   - Test limit reset

8. **Response Validation**:
   - Response structure matches API contract
   - Data types correct (number, string, boolean, array, object)
   - Required fields present
   - Optional fields handled
   - Pagination working (if applicable)
   - Sorting working (if applicable)
   - Filtering working (if applicable)

9. **Performance Testing**:
   - Measure response times for each endpoint
   - Test with varying payload sizes
   - Check database query efficiency
   - Monitor server resource usage

10. **Integration Testing**:
    - Test API calls in sequence (create → read → update → delete)
    - Verify data consistency across operations
    - Test dependent endpoints together

#### For CLI/Backend Features (Command-Line)

**CLI Testing Strategy**:

1. **Command Discovery**:
   - List all CLI commands for feature
   - Document expected arguments and flags
   - Identify default behaviors

2. **Valid Input Testing**:

   ```bash
   # Test with valid inputs
   ./cli feature-command --arg value

   # Verify:
   # - Exit code 0
   # - Expected output format
   # - Side effects (files created, DB updated)
   # - No errors in stderr
   ```

3. **Invalid Input Testing**:
   - Missing required arguments
   - Invalid argument values
   - Unknown flags
   - Conflicting options
   - File not found errors

4. **Error Handling**:
   - Verify helpful error messages
   - Check non-zero exit codes on failure
   - Test error recovery
   - Check stderr output

5. **Output Validation**:
   - Output format correct (JSON, table, plain text)
   - Output content accurate
   - Colors/formatting appropriate (if using)
   - Progress indicators working (if long-running)

### Test Result Documentation

**Comprehensive Test Log**:

```
📊 Testing Results for feature: $1

UI Testing (Playwright):
├─ ✅ Primary user flows: 8/8 passed
├─ ✅ Form validation: 12/12 passed
├─ ⚠️  Error scenarios: 4/5 passed (1 issue found)
├─ ✅ Edge cases: 6/6 passed
├─ ✅ Responsive: Desktop ✅, Tablet ✅, Mobile ✅
├─ ⚠️  Accessibility: 8/10 checks passed (2 issues)
├─ 📸 Screenshots: 15 captured (saved to /tmp/)
└─ ⚠️  Console: 2 warnings detected

API Testing (curl/httpie):
├─ ✅ GET /api/feature: Success path passed
├─ ✅ POST /api/feature: Success + validation passed
├─ ✅ PUT /api/feature/:id: Update passed
├─ ✅ DELETE /api/feature/:id: Delete passed
├─ ✅ Error responses: All status codes correct
├─ ✅ Auth/authz: All security checks passed
├─ ✅ Rate limiting: Working as expected
└─ ⚡ Performance: Avg response time 45ms

CLI Testing:
├─ ✅ Valid inputs: All commands working
├─ ✅ Invalid inputs: Error handling working
└─ ✅ Output format: Consistent and correct

Overall: 93% tests passed (3 issues found)
```

---

### Phase 3.5: Bug Analysis & Issue Identification

**Comprehensive Bug Detection**:

Identify bugs across all categories:

**Functional Bugs**:

- Feature doesn't work as designed
- Wrong output or behavior
- Logic errors in implementation
- Missing functionality from requirements

**UI/UX Issues**:

- Confusing user interactions
- Poor feedback to user actions
- Inconsistent visual design
- Accessibility problems
- Responsive layout issues

**Performance Problems**:

- Slow response times (>500ms for API, >3s for page load)
- Memory leaks
- Inefficient algorithms (O(n²) where O(n) possible)
- N+1 query problems
- Large bundle sizes

**Security Vulnerabilities**:

- XSS vulnerabilities (unsanitized user input in HTML)
- SQL injection vulnerabilities (string concatenation in queries)
- Authentication bypass
- Authorization failures (accessing other users' data)
- Sensitive data exposure (secrets in logs, client-side code)
- CSRF vulnerabilities

**Accessibility Issues**:

- Missing ARIA labels
- Keyboard navigation broken
- Poor color contrast (<4.5:1 for normal text)
- Screen reader unfriendly structure
- Focus management problems

**Edge Case Failures**:

- Null/undefined handling missing
- Empty state handling broken
- Boundary value errors (0, negative, MAX_INT)
- Concurrent operation issues
- Race conditions

**Error Handling Gaps**:

- Uncaught exceptions
- Poor error messages (technical jargon or "Error occurred")
- No error recovery mechanism
- Errors not logged properly

**Integration Issues**:

- API call failures not handled
- Database connection errors not caught
- Third-party service failures not handled
- Network timeout issues

### Bug Classification

For each bug identified, classify severity:

**🔴 Critical** (Ship blocker):

- Feature completely broken
- Data loss or data corruption
- Security vulnerability (XSS, SQL injection, auth bypass)
- System crash or unrecoverable error
- Complete inaccessibility

**🟠 High** (Ship risk):

- Major functionality severely impaired
- Poor user experience causing user frustration
- Security concern (not exploitable but concerning)
- Performance severely degraded (>5s page loads)
- Accessibility failure (feature unusable for disabled users)

**🟡 Medium** (Should fix before ship):

- Minor functionality issue
- Edge case failure
- Moderate performance impact (slow but usable)
- Cosmetic accessibility issue
- Confusing error messages

**🟢 Low** (Nice to fix):

- Cosmetic issues
- Minor inconsistencies
- Small UX improvements
- Non-critical code quality issues

### Root Cause Analysis

For **each bug found**, provide detailed analysis:

```markdown
🔴 BUG-001: User session expires without warning, losing form data

**Severity**: High

**Category**: UX Issue / Data Loss Risk

**Location**: src/auth/session-manager.ts:45, src/components/UserForm.tsx:120

**Reproduction Steps**:

1. Log in to the application
2. Navigate to the user profile form
3. Fill out the form with data (don't submit)
4. Wait 15 minutes (session timeout)
5. Click "Save" button
6. Observe: Session expired error, form data lost

**Expected Behavior**:

- User should receive warning before session expires (at 13-14 min mark)
- Form data should be auto-saved to localStorage as fallback
- On session expiry, user should be redirected to login with return URL
- After re-login, user should return to form with data restored

**Actual Behavior**:

- No warning given before session expires
- Form submission fails with generic error: "Authentication required"
- User is not redirected to login page automatically
- All form data is lost (user must re-enter everything)

**Root Cause**:
The session manager (session-manager.ts:45) checks auth status only on API calls, not proactively. The UserForm component does not implement auto-save or session monitoring. When the API call fails due to expired token, the error handling (UserForm.tsx:120) only shows a generic error and doesn't preserve form state.

Technical details:

- Session timeout: 15 minutes (set in auth config)
- No client-side session monitoring or warning system
- No localStorage backup for form data
- Error handler catches 401 but doesn't trigger re-auth flow

**Impact**:

- High user frustration (data loss)
- Affects all forms in the application with long fill times
- Poor user experience, especially for users who are interrupted
- Lost productivity for users who must re-enter data
- Potential for users to abandon the application

**Suggested Fix**:

1. **Implement Session Warning** (Priority 1):
   - Add session monitoring in session-manager.ts
   - Show modal warning at 13-minute mark: "Your session will expire in 2 minutes. Save your work or click here to extend."
   - Provide "Extend Session" button that calls a keep-alive endpoint
   - Implementation: Use setInterval to check session expiry time

2. **Add Form Auto-Save** (Priority 1):
   - Implement auto-save to localStorage in UserForm
   - Save form state every 30 seconds or on input change (debounced)
   - Key format: `autosave_userform_${userId}_${formId}`
   - Restore from localStorage on component mount
   - Clear localStorage on successful submission

3. **Improve Error Handling** (Priority 2):
   - On 401 error, save form state to sessionStorage
   - Redirect to login with return URL
   - After successful login, redirect back and restore form state
   - Show message: "Your session expired. Please log in again to continue."

4. **Add Session Extension API** (Priority 2):
   - Create GET /api/auth/extend-session endpoint
   - Extends session by another 15 minutes
   - Call on user activity (mouse move, keyboard input) with throttling

**Fix Effort Estimate**: 6-8 hours

- Session warning: 2-3 hours
- Form auto-save: 2-3 hours
- Error handling improvements: 1-2 hours
- Testing: 1 hour

**Testing Approach**:

1. Mock short session timeout (2 minutes for testing)
2. Verify warning shows at expected time
3. Test "Extend Session" button works
4. Verify form auto-save by filling form, refreshing page
5. Test session expiry during form submission
6. Verify redirect to login and return flow
7. Test across all forms in application

**Risks**:

- localStorage quota could be exceeded (mitigate: limit autosave data size)
- Session extension could be exploited (mitigate: limit extensions per session)
- Multiple tabs could conflict (mitigate: use unique keys per tab)
```

**Repeat this detailed analysis for EVERY bug found.**

---

### Phase 3.6: Comprehensive Report Generation

**CRITICAL**: Output report directly to user. Do NOT create files in repository.

Generate detailed validation report with the following structure:

---

## 📊 Feature Validation Report: $1

### Executive Summary

**Feature**: $1

**Overall Result**:

- ✅ **PASS** - Feature fully functional, production ready
- ⚠️ **PASS WITH ISSUES** - Feature works but has non-critical issues (X bugs: Y high, Z medium)
- ❌ **FAIL** - Feature has critical bugs or missing core functionality

**Key Findings**:
[2-3 sentence summary highlighting the most important discoveries]

**Bugs Identified**: X Critical, Y High, Z Medium, W Low

**Test Coverage**: [XX% or "Not measured"]

**Recommendation**:

- **PRODUCTION READY** - Deploy with confidence ✅
- **NEEDS FIXES** - Fix X critical/high issues before deployment ⚠️
- **REQUIRES REWORK** - Significant changes needed ❌

---

### Feature Overview

**Feature Description**:
[From requirements.md and design.md]

**Scope**:
[What the feature is supposed to do, from requirements]

**Implementation Summary**:

- **Files created/modified**: X files (list key files with file:line counts)
- **Lines of code**: ~XXX LOC implementation, ~XXX LOC tests
- **Test coverage**: XX% (or "Not measured")
- **Tasks completed**: All X/X tasks ✅
- **Documentation found**: [List docs found or "Limited documentation"]

---

### Documentation Analysis

**Documentation Found**:
[List all docs found: README sections, code comments, API docs, specs, etc.]
OR: "⚠️ Limited documentation found"

**Documentation Quality**: Excellent / Good / Fair / Poor

**Documentation Gaps Identified**:

- [List what should be documented but isn't]
- [Examples: User guide, API documentation, deployment guide, troubleshooting, etc.]

**Recommendations**:

1. [Documentation that should be created]
2. [Documentation that should be updated]
3. [Documentation that should be improved]

---

### Implementation Analysis

**Architecture Alignment**: Excellent / Good / Fair / Poor

**Assessment**:

- Follows existing project patterns: [Yes/No/Partially]
- Integration points properly implemented: [assessment]
- Modularity and separation of concerns: [assessment]
- Dependencies managed appropriately: [assessment]

**Code Quality**: Excellent / Good / Fair / Poor

**Assessment**:

- Readability: [Clear naming, well-structured / Adequate / Needs improvement]
- Maintainability: [Easy to modify / Moderate / Difficult]
- Consistency with codebase: [Matches conventions / Mostly matches / Inconsistent]
- Code patterns used: [List notable patterns: factory, strategy, observer, etc.]
- DRY principle: [No duplication / Minor duplication / Significant duplication]

**Error Handling**: Excellent / Good / Fair / Poor

**Assessment**:

- Edge case coverage: [Comprehensive / Adequate / Insufficient]
- Error messages quality: [Clear and actionable / Adequate / Poor]
- Graceful degradation: [Handles failures well / Adequate / Missing]
- Input validation: [Thorough / Basic / Missing]

**Security**: Excellent / Good / Fair / Poor

**Assessment**:

- Input validation: [All inputs validated / Most validated / Validation missing]
- Authentication/Authorization: [Properly implemented / Adequate / Issues found]
- Data sanitization: [XSS prevention in place / Basic / Missing]
- SQL injection prevention: [Parameterized queries used / Mostly safe / Vulnerable]
- Vulnerabilities found: [List specific issues or "None detected"]

**Performance**: Excellent / Good / Fair / Poor

**Assessment**:

- Response times: [<100ms / <500ms / >500ms] (for API endpoints)
- Page load times: [<2s / <3s / >3s] (for UI pages)
- Database queries: [Optimized / Acceptable / N+1 issues detected]
- Algorithm efficiency: [Optimal / Acceptable / Inefficient algorithms found]
- Resource usage: [Low / Moderate / High]
- Scalability concerns: [List any concerns or "None identified"]

**Type Safety** (TypeScript projects): Excellent / Good / Fair / Poor

**Assessment**:

- Proper type definitions: [All typed / Mostly typed / Many any types]
- `any` usage: [Minimal (<5%) / Moderate (5-15%) / Excessive (>15%)]
- Type guards: [Appropriate runtime checks / Some checks / Missing checks]
- Type safety violations: [None / Minor / Significant]

**Technical Debt Identified**:

1. **TODO/FIXME Items** (X found):
   - [file.ts:line]: [description of TODO]
   - [file.ts:line]: [description of FIXME]
     ...

2. **Code Duplication** (X instances):
   - [description of duplication with file references]
     ...

3. **Refactoring Opportunities**:
   - [area needing refactoring with rationale]
     ...

4. **Deprecated Dependencies**:
   - [library@version]: [reason to upgrade/replace]
     ...

---

### Testing Results

**Automated Test Suite**:

- Total tests executed: X
- Passed: X ✅
- Failed: X ❌
- Test coverage: XX% (or "Not measured")

**Playwright Interactive Testing Results**:

**UI Testing** (if applicable):

**User Flows Tested**:

1. [Flow name]: ✅ PASS / ❌ FAIL [details]
2. [Flow name]: ✅ PASS / ❌ FAIL [details]
   ...

**Form Validation Testing**:

- Required fields: ✅ PASS / ❌ FAIL
- Format validation: ✅ PASS / ❌ FAIL
- Length limits: ✅ PASS / ❌ FAIL
- Error messages: ✅ PASS / ❌ FAIL

**Edge Cases Tested**:

1. [Edge case]: ✅ PASS / ❌ FAIL [details]
2. [Edge case]: ✅ PASS / ❌ FAIL [details]
   ...

**Responsive Testing**:

- Desktop (1920x1080): ✅ PASS / ❌ FAIL
- Tablet (768x1024): ✅ PASS / ❌ FAIL
- Mobile (375x667): ✅ PASS / ❌ FAIL

**Accessibility Testing**:

- ARIA labels: ✅ Present / ⚠️ Partial / ❌ Missing
- Keyboard navigation: ✅ Works / ⚠️ Partial / ❌ Broken
- Color contrast: ✅ WCAG AA / ⚠️ Some issues / ❌ WCAG fail
- Screen reader support: ✅ Good / ⚠️ Fair / ❌ Poor

**Console Output**:

- Errors: X errors detected [list if any]
- Warnings: X warnings detected [list if any]
- Network failures: X failures [list if any]

**Visual Verification**:

- Screenshots captured: X (saved to /tmp/)
- Key states verified: [list states: success, error, loading, empty, etc.]

**API Testing** (if applicable):

**Endpoints Tested**:

- GET /api/endpoint: ✅ PASS / ❌ FAIL (XXms avg response time)
- POST /api/endpoint: ✅ PASS / ❌ FAIL (XXms avg response time)
- PUT /api/endpoint/:id: ✅ PASS / ❌ FAIL (XXms avg response time)
- DELETE /api/endpoint/:id: ✅ PASS / ❌ FAIL (XXms avg response time)

**API Test Coverage**:

- Success scenarios: XX/XX passed
- Error scenarios: XX/XX passed
- Validation scenarios: XX/XX passed
- Auth/authz scenarios: XX/XX passed
- Rate limiting: ✅ Working / N/A

**API Performance**:

- Average response time: XXms
- P95 response time: XXms
- P99 response time: XXms

**CLI Testing** (if applicable):

**Commands Tested**:

- Valid inputs: ✅ PASS / ❌ FAIL
- Invalid inputs: ✅ PASS / ❌ FAIL
- Error handling: ✅ PASS / ❌ FAIL
- Output format: ✅ PASS / ❌ FAIL

---

### Bugs & Issues Identified

**Summary**: Total bugs: X Critical 🔴, Y High 🟠, Z Medium 🟡, W Low 🟢

---

[For each bug, use the detailed format from Phase 3.5 Bug Classification]

🔴 BUG-001: [Title]
[Full detailed bug report as shown in Phase 3.5]

🟠 BUG-002: [Title]
[Full detailed bug report]

[Continue for all bugs...]

---

**OR**: "✅ No bugs identified during comprehensive testing"

---

### Requirements Compliance

**Requirements Traceability**:

For each identified requirement:

```
REQ-1.1: [Requirement description]
Status: ✅ Implemented / ⚠️ Partially Implemented / ❌ Not Implemented
Implementation: [file.ts:line references]
Tests: [test-file.spec.ts:line references]
Test Results: ✅ All passing / ⚠️ Some failing / ❌ No tests
Notes: [Any deviations or concerns]

REQ-1.2: [Requirement description]
...
```

**Coverage Summary**:

- Total requirements: X
- ✅ Fully implemented: X (XX%)
- ⚠️ Partially implemented: X (XX%)
- ❌ Not implemented: X (XX%)

**Missing Requirements**:
[List requirements that are not implemented with explanations]

**Extra Functionality**:
[List implemented features not in requirements - assess if good additions or scope creep]

---

### Fix & Improvement Plan

#### Immediate Actions Required (Critical/High Bugs)

**Must fix before deployment**:

[For each critical/high bug:]

**1. BUG-XXX: [Bug Title]**

- **Priority**: P0 (Critical) / P1 (High)
- **Severity**: [Impact on users/system]
- **Location**: [file.ts:line]
- **Effort**: [X hours/days]
- **Dependencies**: [Any dependencies or blockers]

**Fix Approach**:

1.  [Specific implementation step 1]
2.  [Specific implementation step 2]
3.  [Specific implementation step 3]
    ...

**Testing Approach**:

- [How to test the fix]
- [Regression testing needed]
- [Expected test results]

**Success Criteria**:

- [How to know the fix is complete]

**Risks**:

- [Any risks in implementing this fix]
- [Mitigation strategies]

[Repeat for each critical/high bug]

---

#### Secondary Improvements (Medium Priority)

**Should fix for quality**:

**1. Issue: [Title]**

- **Location**: [file.ts:line]
- **Effort**: [X hours]
- **Improvement Approach**:
  - [Step 1]
  - [Step 2]

[Repeat for each medium issue]

---

#### Technical Debt Remediation (Low Priority / Optional)

**Nice to have for maintainability**:

**1. Debt Item: [Description]**

- **Location**: [file.ts:line]
- **Effort**: [X hours]
- **Refactoring Approach**:
  - [How to clean up]
- **Benefits**:
  - [Why this matters for future development]

[Repeat for each debt item]

---

#### Documentation Improvements Needed

1. **[Doc type]**: [What needs to be documented]
   - **Priority**: High / Medium / Low
   - **Effort**: [X hours]
   - **Content needed**: [Brief outline]

2. **[Doc type]**: [What needs to be documented]
   ...

---

#### Implementation Timeline

**Phase 1: Critical Fixes** (Must complete before deployment)

- [List of P0 bugs]
- **Estimated effort**: X hours/days
- **Testing time**: Y hours

**Phase 2: High Priority Fixes** (Should complete before deployment)

- [List of P1 bugs]
- **Estimated effort**: X hours/days
- **Testing time**: Y hours

**Phase 3: Medium Improvements** (Post-deployment acceptable)

- [List of medium issues]
- **Estimated effort**: X hours/days

**Phase 4: Technical Debt & Documentation** (Ongoing)

- [List of low priority items]
- **Estimated effort**: X hours/days

**Total Estimated Effort**:

- **Pre-deployment**: X hours/days (Phase 1 + 2)
- **Post-deployment**: Y hours/days (Phase 3 + 4)
- **Grand total**: Z hours/days

---

#### Testing Strategy After Fixes

**Regression Testing**:

- Areas affected by fixes: [list components/features]
- Full test suite: Run all X tests
- Manual testing needed: [list specific flows]

**New Test Cases to Add**:

1. [Test case for bug reproduction]
2. [Test case for edge case coverage]
   ...

**Validation Approach**:

- [ ] All critical bugs verified fixed
- [ ] All high priority bugs verified fixed
- [ ] No regressions introduced
- [ ] Test coverage increased/maintained
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] Accessibility audit passed

---

### Production Readiness Assessment

**Production Readiness Checklist**:

- [ ] **Critical bugs**: All fixed (X/X complete)
- [ ] **High priority bugs**: All fixed or risk-accepted (X/X complete)
- [ ] **Core functionality**: Working as expected ✅/❌
- [ ] **Test coverage**: Adequate (>70% recommended) - currently XX%
- [ ] **Security review**: Passed - no critical vulnerabilities ✅/❌
- [ ] **Performance**: Acceptable for expected load ✅/❌
  - API response times: [assessment]
  - Page load times: [assessment]
  - Resource usage: [assessment]
- [ ] **Documentation**: Sufficient for users/developers ✅/⚠️/❌
- [ ] **Edge cases**: Handled gracefully ✅/⚠️/❌
- [ ] **Error messages**: Clear and actionable ✅/⚠️/❌
- [ ] **Accessibility**: Requirements met (WCAG AA minimum) ✅/⚠️/❌/N/A
- [ ] **Monitoring/Logging**: In place ✅/⚠️/❌
- [ ] **Rollback plan**: Documented ✅/⚠️/❌

**Checklist Score**: X/12 items complete

**Risk Assessment**:

- 🟢 **Low Risk**: 10-12 items complete, no critical issues
- 🟡 **Medium Risk**: 7-9 items complete, some concerns
- 🔴 **High Risk**: <7 items complete, major concerns

**Current Risk Level**: [Low / Medium / High]

**Blocking Issues**:
[List any issues preventing production deployment, or "✅ No blocking issues"]

**Final Recommendation**:

[Provide detailed, actionable recommendation. Examples:]

**Example 1 (Production Ready)**:

```
✅ PRODUCTION READY

This feature is well-implemented and thoroughly tested. All core functionality works as designed, with good code quality and comprehensive test coverage (87%). No critical or high-priority bugs were found during validation.

Minor issues identified (2 medium, 1 low) can be addressed post-deployment without user impact. The implementation follows project patterns, has proper error handling, and passes security and accessibility checks.

**Confidence Level**: High
**Recommendation**: Deploy to production
**Post-Deployment**: Monitor [key metrics], address medium issues in next sprint
```

**Example 2 (Needs Fixes)**:

```
⚠️ NEEDS FIXES BEFORE DEPLOYMENT

The feature is functionally complete but has 2 high-priority bugs that should be fixed before production:
1. BUG-003: Session timeout causes data loss (High - 6 hours to fix)
2. BUG-007: Missing input validation allows invalid data (High - 3 hours to fix)

These issues would impact user experience and data integrity. All other aspects (performance, security, accessibility) are acceptable.

**Estimated Fix Time**: 9 hours + 2 hours testing = ~11 hours total
**Confidence Level**: Medium (after fixes)
**Recommendation**: Fix high-priority bugs, then deploy
**Next Steps**: Implement fixes from "Immediate Actions Required" section above
```

**Example 3 (Requires Rework)**:

```
❌ REQUIRES REWORK BEFORE DEPLOYMENT

The feature has 3 critical bugs that indicate fundamental issues requiring significant rework:
1. BUG-001: Complete feature failure on edge case (Critical)
2. BUG-002: SQL injection vulnerability (Critical)
3. BUG-005: Data corruption on concurrent access (Critical)

Additionally, test coverage is only 34%, security concerns exist, and performance is unacceptable (>5s response times). The implementation deviates significantly from project patterns and would be difficult to maintain.

**Estimated Rework Time**: 3-5 days
**Confidence Level**: Low
**Recommendation**: Do not deploy; significant rework needed
**Next Steps**:
1. Fix all critical bugs (highest priority)
2. Add comprehensive test coverage
3. Address security vulnerabilities
4. Performance optimization
5. Re-validate after fixes
```

---

### Recommendations

#### Immediate Next Steps (Priority Order)

1. **[Most important action]**
   - **Why**: [Rationale]
   - **How**: [Brief approach]
   - **Effort**: [Time estimate]

2. **[Second most important action]**
   - **Why**: [Rationale]
   - **How**: [Brief approach]
   - **Effort**: [Time estimate]

3. **[Third most important action]**
   - **Why**: [Rationale]
   - **How**: [Brief approach]
   - **Effort**: [Time estimate]

#### Long-term Improvements

**Strategic Improvements** (for future iterations):

- [Improvement 1]: [Rationale and benefits]
- [Improvement 2]: [Rationale and benefits]
- [Improvement 3]: [Rationale and benefits]

**Architecture Evolution**:

- [Consideration 1]: [Why and when]
- [Consideration 2]: [Why and when]

**Tooling/Process Improvements**:

- [Tool/process 1]: [How it would help]
- [Tool/process 2]: [How it would help]

#### Monitoring Recommendations

**Production Monitoring** (what to watch post-deployment):

**Key Metrics to Track**:

1. **Performance**:
   - API response times (alert if >500ms p95)
   - Page load times (alert if >3s p95)
   - Database query times
   - Error rates

2. **Functionality**:
   - Feature usage (number of users, frequency)
   - Success rates (completed flows vs abandoned)
   - Error occurrences (by type)

3. **User Experience**:
   - User feedback/complaints
   - Support tickets related to feature
   - Task completion rates

**Alerts to Set Up**:

- [ ] API response time >500ms for 5+ minutes
- [ ] Error rate >1% for 5+ minutes
- [ ] Failed requests >10/minute
- [ ] Database connection pool exhausted
- [ ] [Feature-specific alert]

**Logging Requirements**:

- [ ] All errors logged with stack traces
- [ ] User actions logged (for debugging)
- [ ] Performance metrics logged
- [ ] Security events logged (auth failures, etc.)

**Dashboard Widgets**:

- Real-time request rate
- Error rate over time
- p50/p95/p99 response times
- Active users count
- [Feature-specific metric]

---

## Report Complete

**Report Generated**: [ISO 8601 timestamp]
**Feature**: $1
**Total Validation Time**: [X hours/minutes]

---

[End of report - output directly to user, NOT saved to file]

---

## Phase 4: Final Status Update

After validation report is delivered, update spec metadata:

**Final Output**:

```
✨ Implementation and Validation Complete!

Feature: $1
✅ All tasks implemented and tested
✅ Comprehensive validation performed
✅ Report delivered

Summary:
- Tasks: X/X completed (100%)
- Bugs found: X Critical, Y High, Z Medium, W Low
- Production readiness: [Ready / Needs fixes / Requires rework]

Recommendation: [Final recommendation summary]

Next steps: [Based on production readiness assessment]
```

---

## Usage

```bash
# Execute all tasks and validate feature
/tupe:implement-and-validate feature-name

# Example
/tupe:implement-and-validate user-authentication
/tupe:implement-and-validate payment-processing
```

**Prerequisites**:

- Feature scope must be understood (from docs or conversation)
- Tasks must be identified (from docs or created during planning)

**What it does**:

1. ✅ Gathers feature context
2. 📚 Loads project documentation
3. 🔨 Implements ALL pending tasks using TDD
4. 🧪 Tests each task thoroughly
5. ✅ Tracks task completion
6. 🔍 Validates implementation comprehensively
7. 🐛 Identifies bugs and issues
8. 📊 Generates production readiness report
9. 💡 Provides actionable fix plans

**Time Estimate**:

- Small feature (5 tasks): 2-4 hours
- Medium feature (10-15 tasks): 4-8 hours
- Large feature (20+ tasks): 8-16 hours

This is a fully automated end-to-end process. Sit back and watch the feature come to life! 🚀
