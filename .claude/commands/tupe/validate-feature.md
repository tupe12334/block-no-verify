---
description: Comprehensive feature validation with testing and bug analysis
allowed-tools: Task, Bash, Glob, Grep, Read, WebSearch, mcp__playwright__*
argument-hint: <feature-name>
---

# Comprehensive Feature Validation

Deep validation and testing of feature: **$1**

## Context Discovery

**IMPORTANT**: This command works with ANY project structure. No specific folder layout required.

### Phase 0: Documentation Discovery

Automatically search for feature documentation in common locations:

**Documentation Patterns to Search**:

- `README*.md` - Feature descriptions in main README
- `docs/**/*.md` - Documentation folders
- `specifications/**/*.md` or `specs/**/*.md` - Specification documents
- `design/**/*.md` - Design documents
- `*.md` files in project root
- Code comments and JSDoc/TSDoc in source files

**Search Strategy**:

1. Use Task tool with Explore agent to find all documentation mentioning "$1"
2. Search for files containing feature name in title or content
3. Identify requirements, design docs, API docs, user guides
4. Extract any available context about the feature

**Fallback Strategy**:
If no documentation found:

- Proceed with code-only analysis
- Infer feature scope from code implementation
- Document the lack of documentation as a finding

### Project Context Discovery

Search for project-level documentation (if available):

- Architecture docs: `docs/architecture.md`, `ARCHITECTURE.md`
- Tech stack: `docs/tech.md`, `TECH_STACK.md`
- Product context: `docs/product.md`
- Contributing guide: `CONTRIBUTING.md`, `docs/CONTRIBUTING.md`

**Adaptive Approach**: Use whatever documentation exists, don't require specific structure.

## Task: Ultra-Comprehensive Feature Validation

### Phase 1: Documentation Analysis

**Documentation Discovery & Review**:
Use Task tool with Explore agent to:

- Find ALL documentation related to "$1" feature
- Search across entire codebase for mentions of the feature
- Extract expected behavior from any available docs
- Identify acceptance criteria (if documented)
- Note success metrics (if defined)

**Documentation Quality Assessment**:

- Code comments alignment with implementation
- API documentation accuracy (if applicable)
- User-facing documentation completeness
- Technical debt documentation
- **Missing documentation identification** (what should be documented but isn't)

### Phase 2: Codebase Deep Dive

**Implementation Discovery**:
Use the Task tool with subagent_type=Explore (very thorough mode) to:

- Identify ALL files implementing the feature
- Map complete code flow and execution paths
- Trace data flow through the system
- Identify integration points and dependencies
- Check test coverage for feature components
- Find related configuration files

**Code Quality Analysis**:

- Architecture alignment with project patterns
- Code consistency with existing codebase conventions
- Error handling and edge case coverage
- Security considerations (input validation, auth, XSS, injection, etc.)
- Performance considerations (N+1 queries, inefficient algorithms, memory leaks)
- Type safety (TypeScript: proper types, avoid `any` overuse)
- Code duplication and reusability

**Technical Debt Assessment**:

- TODO/FIXME/HACK comments related to the feature
- Workarounds or temporary solutions
- Known limitations documented or discovered
- Areas requiring refactoring
- Dependencies on deprecated libraries or patterns

### Phase 3: Behavioral & Requirements Analysis

**Expected Behavior Extraction**:
From any available documentation:

- Core functionality requirements
- User stories or use cases
- Business rules and constraints
- Integration requirements
- Performance requirements
- Security requirements

**Implementation Verification**:

- Map each requirement (if documented) to implementation
- Identify implemented features not documented
- Find documented features not implemented
- Check acceptance criteria fulfillment

**Gap Analysis**:

- Missing functionality vs documentation
- Extra functionality not documented
- Inconsistencies between docs and code
- Incomplete implementations

### Phase 4: Interactive Testing with Playwright

**Test Planning**:

- Identify user-facing components requiring UI testing
- Map user flows based on requirements (or inferred from code)
- Identify edge cases and error scenarios
- Plan API endpoint testing (if applicable)

**Automated Testing Execution**:

**For UI Features**:

1. Launch browser with Playwright MCP
2. Navigate to feature location
3. Test primary user flows
4. Test form validation and error messages
5. Test edge cases and boundary conditions
6. Verify responsive behavior (desktop, mobile)
7. Check accessibility basics (ARIA labels, keyboard navigation)
8. Capture screenshots showing feature states (save to `/tmp/`)
9. Monitor console for errors and warnings
10. Test error recovery and user feedback

**For API Features**:

1. Test successful request/response flows
2. Test all HTTP methods (GET, POST, PUT, DELETE, PATCH)
3. Test error conditions (4xx, 5xx responses)
4. Test input validation and sanitization
5. Test authentication/authorization
6. Test rate limiting (if applicable)
7. Verify response data structure and types
8. Check error message quality

**For CLI/Backend Features**:

1. Test command-line interface (if applicable)
2. Test with valid inputs
3. Test with invalid inputs
4. Test error handling
5. Verify output format and content

**Test Result Documentation**:

- All tests executed with pass/fail outcomes
- Screenshots of UI states (stored in `/tmp/`, NOT repo)
- API response examples (stored in `/tmp/`, NOT repo)
- Performance metrics observed (response times, load times)
- Console errors, warnings, or network failures detected
- Accessibility issues found

### Phase 5: Bug Analysis & Issue Identification

**Comprehensive Bug Detection**:

- Functional bugs (feature doesn't work as expected)
- UI/UX issues (poor user experience, confusing interactions)
- Performance problems (slow responses, memory leaks)
- Security vulnerabilities (XSS, injection, auth bypass, data exposure)
- Accessibility issues (missing labels, keyboard nav, contrast)
- Edge case failures (boundary values, null/undefined, empty states)
- Error handling gaps (uncaught exceptions, poor error messages)
- Integration issues (API failures, database errors, third-party service problems)

**Bug Classification**:

- **Critical**: Feature broken, data loss/corruption, security vulnerability, system crash
- **High**: Major functionality impaired, poor UX, security concern, performance severely degraded
- **Medium**: Minor functionality issues, edge case failures, moderate performance impact
- **Low**: Cosmetic issues, minor inconsistencies, small UX improvements

**Root Cause Analysis**:
For each bug identified:

- Exact reproduction steps (numbered list)
- Expected behavior vs actual behavior
- Code location causing the issue (file:line references)
- Root cause analysis (technical explanation of WHY)
- Impact assessment (what users/systems are affected)
- Suggested fix with technical approach

### Phase 6: Comprehensive Report Generation

**CRITICAL**: Do NOT create files in the repository. Output the report directly to the user.

Generate a detailed validation report with:

#### Executive Summary

**Feature**: $1

**Overall Result**: [Choose one]

- ✅ **PASS** - Feature fully functional, production ready
- ⚠️ **PASS WITH ISSUES** - Feature works but has non-critical issues
- ❌ **FAIL** - Feature has critical bugs or missing core functionality

**Key Findings**: [2-3 sentence summary of most important discoveries]

**Recommendation**: [Choose one]

- **PRODUCTION READY** - Deploy with confidence
- **NEEDS FIXES** - Fix identified issues before deployment
- **REQUIRES REWORK** - Significant changes needed

---

#### Feature Overview

**Feature Description**: [From docs or inferred from code]

**Scope**: [What the feature is supposed to do]

**Implementation Summary**:

- Files created/modified: [count and list key files]
- Lines of code: [approximate]
- Test coverage: [percentage if available, or "Unknown"]
- Documentation found: [list of docs found, or "None found"]

---

#### Documentation Analysis

**Documentation Found**:

- [List all documentation files found with brief description]
- OR: "⚠️ No documentation found for this feature"

**Documentation Quality**: [Excellent / Good / Fair / Poor / Missing]

**Documentation Gaps Identified**:

- [List what should be documented but isn't]
- [Missing API docs, user guides, architecture decisions, etc.]

**Recommendations**:

- [What documentation should be created or improved]

---

#### Implementation Analysis

**Architecture Alignment**: [Excellent / Good / Fair / Poor]

- [How well does implementation follow project patterns]
- [Integration points and dependencies]
- [Modularity and separation of concerns]

**Code Quality**: [Excellent / Good / Fair / Poor]

- Readability: [assessment]
- Maintainability: [assessment]
- Consistency with codebase: [assessment]
- Code patterns used: [list notable patterns]

**Error Handling**: [Excellent / Good / Fair / Poor]

- Edge case coverage: [assessment]
- Error messages quality: [assessment]
- Graceful degradation: [assessment]

**Security**: [Excellent / Good / Fair / Poor]

- Input validation: [assessment]
- Authentication/Authorization: [assessment]
- Data sanitization: [assessment]
- Vulnerabilities found: [list or "None detected"]

**Performance**: [Excellent / Good / Fair / Poor]

- Response times: [measurements or observations]
- Resource usage: [assessment]
- Scalability concerns: [list or "None identified"]
- Optimization opportunities: [list or "None identified"]

**Type Safety** (if TypeScript): [Excellent / Good / Fair / Poor]

- Proper type definitions: [assessment]
- `any` usage: [assessment]
- Type safety violations: [list or "None found"]

**Technical Debt Identified**:

1. [TODO/FIXME items with file:line references]
2. [Workarounds or hacks that need proper solutions]
3. [Code duplication that should be refactored]
4. [Deprecated dependencies or patterns]

---

#### Testing Results

**Automated Tests Summary**:

- Total tests executed: [number]
- Passed: [number] ✅
- Failed: [number] ❌
- Test coverage: [percentage or "Not measured"]

**Playwright Testing Results** (if UI feature):

**User Flows Tested**:

1. [Flow 1] - ✅ PASS / ❌ FAIL
2. [Flow 2] - ✅ PASS / ❌ FAIL
   ...

**Edge Cases Tested**:

1. [Edge case 1] - ✅ PASS / ❌ FAIL
2. [Edge case 2] - ✅ PASS / ❌ FAIL
   ...

**Visual Testing**:

- Screenshots captured: [count] (saved to /tmp/)
- UI states verified: [list]
- Responsive testing: [Desktop ✅/❌, Mobile ✅/❌, Tablet ✅/❌]

**Console Output**:

- Errors detected: [count and list]
- Warnings detected: [count and list]
- Network failures: [count and list]

**API Testing Results** (if applicable):

- Endpoints tested: [list with HTTP methods]
- Success rate: [percentage]
- Average response time: [milliseconds]
- Error handling: [assessment]

**Accessibility Testing**:

- ARIA labels: [✅ Present / ❌ Missing / N/A]
- Keyboard navigation: [✅ Works / ❌ Broken / N/A]
- Color contrast: [✅ Adequate / ❌ Poor / N/A]
- Screen reader support: [✅ Good / ⚠️ Fair / ❌ Poor / N/A]

---

#### Bugs & Issues Identified

**Summary**: [Total bugs: X Critical, Y High, Z Medium, W Low]

For each bug found, use this format:

```
🔴 BUG-001: [Brief descriptive title]

**Severity**: Critical / High / Medium / Low

**Location**: [file.ts:line or component/function name]

**Reproduction Steps**:
1. [Step 1 - be very specific]
2. [Step 2]
3. [Step 3]
...

**Expected Behavior**:
[What should happen - be specific]

**Actual Behavior**:
[What actually happens - include error messages, wrong outputs, etc.]

**Root Cause**:
[Technical explanation of why this is happening - reference code]

**Impact**:
[Who/what is affected, how severe is the impact]

**Suggested Fix**:
[Concrete technical solution with approach]
```

[Repeat for each bug]

**OR**: "✅ No bugs identified during testing"

---

#### Requirements Compliance

**Requirements Traceability** (if requirements documented):

For each requirement:

```
REQ-001: [Requirement description]
Status: ✅ Implemented / ⚠️ Partial / ❌ Missing
Implementation: [file:line references or explanation]
Notes: [Any deviations or concerns]
```

**Missing Requirements**: [List functionality that should exist but doesn't]

**Extra Functionality**: [List implemented features not in requirements - may be good or scope creep]

**OR**: "⚠️ No formal requirements found - validation based on inferred expected behavior"

---

#### Fix & Improvement Plan

**Immediate Actions Required** (Critical/High bugs):

1. **BUG-XXX: [Title]**
   - **Priority**: P0 (Critical) / P1 (High)
   - **File**: [location]
   - **Effort**: [time estimate: hours/days]
   - **Fix Approach**:
     1. [Specific step 1]
     2. [Specific step 2]
        ...
   - **Testing Approach**: [How to verify the fix]
   - **Risks**: [Any risks in implementing this fix]

[Repeat for each critical/high bug]

**Secondary Improvements** (Medium priority):

1. **Issue: [Title]**
   - **File**: [location]
   - **Effort**: [time estimate]
   - **Improvement Approach**: [Steps to improve]

[Repeat for each medium issue]

**Technical Debt Remediation** (Low priority / Optional):

1. **Debt Item: [Description]**
   - **File**: [location]
   - **Effort**: [time estimate]
   - **Refactoring Approach**: [How to clean up]
   - **Benefits**: [Why this matters]

[Repeat for each debt item]

**Documentation Improvements Needed**:

1. [Create/update X documentation]
2. [Add API documentation for Y]
3. [Document architecture decision for Z]
   ...

**Implementation Timeline**:

- **Phase 1**: Critical fixes - [X hours/days]
- **Phase 2**: High priority fixes - [X hours/days]
- **Phase 3**: Medium improvements - [X hours/days]
- **Phase 4**: Technical debt & docs - [X hours/days]
- **Total Estimated Effort**: [X hours/days]

**Testing Strategy After Fixes**:

- Regression testing areas: [list affected areas]
- New test cases needed: [list tests to add]
- Validation approach: [how to verify all fixes]

---

#### Production Readiness Assessment

**Production Readiness Checklist**:

- [ ] All critical bugs fixed
- [ ] All high priority bugs fixed or risk-accepted
- [ ] Core functionality working as expected
- [ ] Test coverage adequate (>70% recommended)
- [ ] Security review passed (no critical vulnerabilities)
- [ ] Performance acceptable for expected load
- [ ] Documentation sufficient for users/developers
- [ ] Edge cases handled gracefully
- [ ] Error messages clear and actionable
- [ ] Accessibility requirements met (if applicable)
- [ ] Monitoring/logging in place
- [ ] Rollback plan exists

**Risk Assessment**: [Low / Medium / High]

**Blocking Issues**: [List any issues preventing production deployment, or "None"]

**Final Recommendation**:
[Detailed recommendation on whether to deploy, what needs to be done first, and any caveats]

---

#### Recommendations

**Immediate Next Steps**:

1. [Most important action to take]
2. [Second most important action]
3. [Third most important action]

**Long-term Improvements**:

- [Strategic improvements for future iterations]
- [Architecture changes to consider]
- [Tooling or process improvements]

**Monitoring Recommendations**:

- [What to monitor in production]
- [Key metrics to track]
- [Alerts to set up]

---

## Validation Guidelines

1. **Adaptive Discovery**: Work with whatever documentation and structure exists
2. **Deep & Thorough**: Examine every aspect - code, docs, behavior, security
3. **Evidence-Based**: Provide file:line references for all findings
4. **Objective Assessment**: Use clear metrics and criteria
5. **Actionable Output**: Every issue needs a concrete fix plan
6. **No Junk Files**: Report directly to user, NEVER commit reports
7. **Test Everything**: Actually run code and test user flows with Playwright
8. **Think Like User**: Test from user perspective, not just developer view
9. **Security First**: Always check for vulnerabilities (XSS, injection, auth)
10. **Ultra-Thorough**: Use deep reasoning for complex analysis

## Execution Instructions

1. **Use Task tool for discovery**: Launch Explore agent with "very thorough" mode
2. **Find all context**: Search entire codebase for feature documentation
3. **Adapt to structure**: Work with whatever exists, no rigid requirements
4. **Trace implementation**: Map feature to actual code
5. **Test comprehensively**: Use Playwright MCP for real interactive testing
6. **Think deeply**: Apply thorough analysis to identify root causes
7. **Document everything**: Clear evidence for every finding
8. **Provide solutions**: Every problem needs a concrete fix plan
9. **NO REPO FILES**: Output report directly to user, never commit reports

---

## Example Usage

```bash
# Validate any feature by name
/tupe:validate-feature user-authentication
/tupe:validate-feature payment-processing
/tupe:validate-feature dashboard-widgets
/tupe:validate-feature api-rate-limiting
```

The command will:

1. Search for any documentation about the feature
2. Analyze implementation in codebase
3. Test functionality with Playwright (if UI/API)
4. Identify bugs and issues
5. Generate comprehensive report with fix plan
6. Provide production readiness assessment

**No specific folder structure required** - works with any project organization!
