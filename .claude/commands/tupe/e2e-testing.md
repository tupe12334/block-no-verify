---
description: Create comprehensive end-to-end tests for features developed in the current session
---

# E2E Test Generation

Automatically create comprehensive end-to-end tests for the feature you've been working on in this chat thread, leveraging the specialized e2e-tester agent.

## Overview

This command analyzes your current development session, gathers all relevant context (specs, requirements, design docs, modified files), and spawns the **e2e-tester** agent to create production-ready end-to-end tests.

**What it does**:

1. Analyzes conversation history to identify the feature being developed
2. Discovers and reads relevant specification documents
3. Identifies all files modified in the current session
4. Gathers project testing configuration and conventions
5. Spawns the e2e-tester agent with comprehensive context
6. Agent creates complete e2e test suite covering all scenarios

## When to Use

Use this command after:

- ✅ Feature implementation is complete
- ✅ Unit tests are written
- ✅ Code is working locally
- ✅ Ready to add comprehensive e2e coverage

**Perfect for**:

- Full-stack features requiring end-to-end validation
- User-facing features with complex workflows
- API endpoints with multiple integration points
- Features with cross-component interactions
- Critical business flows requiring thorough testing

## Phase 1: Session Context Analysis

### Step 1: Identify Feature from Conversation

**Analyze the chat thread** to understand what feature was developed:

1. **Review conversation history**:
   - Look for feature descriptions, requirements discussions
   - Identify what was implemented, modified, or added
   - Extract feature name, purpose, and scope
   - Note any acceptance criteria mentioned

2. **Extract key information**:
   - Feature name or identifier
   - Feature type (API, UI, full-stack, integration)
   - Main functionality and purpose
   - Key workflows and user journeys
   - Dependencies and integration points

3. **Document findings**:

```markdown
## Session Feature Analysis

**Feature Name:** [Extracted from conversation]
**Feature Type:** API | UI | Full-Stack | Integration | Backend | Frontend
**Primary Purpose:** [What problem does it solve]
**Key Workflows:** [Main user/system flows]
**Session Scope:** [What was implemented in this chat]
```

### Step 2: Discover Specification Documents

**Search for feature-related specs** in common locations:

```bash
# Search for spec files
find . -type f -name "requirements.md" -o -name "design.md" -o -name "spec.md" 2>/dev/null

# Search for feature-related docs
find . -type d -name "specs" -o -name "specifications" 2>/dev/null
```

**Read all relevant documentation**:

- `specifications/` or `specs/` - Feature specifications
- `docs/` directory - Any related documentation
- `README.md` sections - Feature documentation

**Extract from specs**:

- Functional requirements
- Non-functional requirements (performance, security, accessibility)
- Acceptance criteria
- User stories or use cases
- Integration requirements
- Edge cases and error scenarios
- Expected inputs and outputs

### Step 3: Identify Modified Files

**Determine what was changed in this session**:

```bash
# Check git status
git status --porcelain

# Check recent commits if already committed
git log -5 --oneline --stat

# List modified files
git diff --name-only HEAD
git ls-files --modified
```

**Categorize modifications**:

- **Source files**: Implementation files (.ts, .js, .tsx, .jsx, .py, .go, etc.)
- **Configuration**: Config files, environment setup
- **Database**: Schema files, migrations
- **API**: Route definitions, controllers, services
- **UI**: Components, pages, styles
- **Tests**: Existing test files (to understand patterns)

**Build file context map**:

```markdown
## Files Modified in Session

### Source Files

- src/features/auth/login.ts - Login endpoint implementation
- src/features/auth/middleware.ts - Auth middleware
- src/components/LoginForm.tsx - Login UI component

### Configuration

- .env.example - Added AUTH_SECRET env var

### Database

- migrations/001_add_users_table.sql - User table

### API Routes

- src/routes/auth.routes.ts - Auth endpoints
```

## Phase 2: Project Context Discovery

### Step 4: Understand Testing Setup

**Identify existing test infrastructure**:

```bash
# Check package.json for test scripts and dependencies
cat package.json | grep -A 20 '"scripts"'
cat package.json | grep -A 50 '"devDependencies"'

# Look for test configuration files
ls -la | grep -E "vitest|jest|playwright|cypress"

# Check test directories
find . -type d -name "test" -o -name "tests" -o -name "__tests__" -o -name "e2e" 2>/dev/null
```

**Discover testing frameworks in use**:

- **Playwright**: Check for `playwright.config.ts`, `@playwright/test`
- **Cypress**: Check for `cypress.config.js`, `cypress/`
- **Puppeteer**: Check for puppeteer in dependencies
- **Jest/Vitest**: Check for unit test setup
- **Supertest**: For API testing
- **Testing Library**: For React/Vue component testing

**Extract testing conventions**:

- Test file naming (`.test.ts`, `.spec.ts`, `.e2e.ts`)
- Test file location (co-located, separate directory)
- Test structure patterns (describe/it, test, etc.)
- Common utilities and helpers
- Fixtures and test data patterns
- Mocking strategies

### Step 5: Analyze Project Architecture

**Understand the project structure**:

```bash
# Get project type
if [ -f "package.json" ]; then
  echo "Node.js project"
  cat package.json | grep '"type"'
elif [ -f "requirements.txt" ]; then
  echo "Python project"
elif [ -f "go.mod" ]; then
  echo "Go project"
elif [ -f "Cargo.toml" ]; then
  echo "Rust project"
fi

# Identify framework
grep -E "next|react|vue|angular|express|fastify|nestjs" package.json 2>/dev/null
```

**Map architecture patterns**:

- **Frontend**: React, Vue, Angular, Svelte, vanilla
- **Backend**: Express, Fastify, NestJS, Django, Flask
- **Full-stack**: Next.js, Remix, SvelteKit, Nuxt
- **API Style**: REST, GraphQL, tRPC, gRPC
- **Database**: PostgreSQL, MySQL, MongoDB, Redis
- **Authentication**: JWT, OAuth, Session-based

## Phase 3: Spawn E2E Tester Agent

### Step 6: Prepare Agent Context

**Compile comprehensive context document**:

```markdown
# E2E Testing Context for Agent

## Feature Summary

**Name:** [Feature name]
**Type:** [API/UI/Full-stack]
**Description:** [What it does]
**Session Scope:** [What was implemented]

## Requirements & Specifications

[Copy all relevant requirements from specs]

### Acceptance Criteria

1. [Criterion 1]
2. [Criterion 2]
   ...

### User Stories / Use Cases

[Copy from specs or infer from conversation]

## Implementation Details

### Modified Files

[List all files with brief description of changes]

### API Endpoints (if applicable)

- POST /api/auth/login - User login
- GET /api/auth/me - Get current user
  ...

### UI Components (if applicable)

- LoginForm - User login form with validation
- AuthProvider - Authentication context provider
  ...

### Data Models

[Database schemas, TypeScript types, etc.]

## Testing Infrastructure

### Frameworks Available

- [Playwright 1.x.x] - E2E testing
- [Vitest 4.x.x] - Unit testing
  ...

### Testing Conventions

- Test file pattern: `*.e2e.ts`
- Test location: `tests/e2e/` or co-located
- Fixtures location: `tests/fixtures/`
  ...

### Project Configuration

- Base URL: http://localhost:3000
- API Base: http://localhost:3000/api
- Database: Test database setup required
- Environment: .env.test
  ...

## Test Coverage Requirements

### Must Test

1. [Primary user flow]
2. [Happy path scenarios]
3. [Error cases]
4. [Edge cases]
5. [Integration points]

### Should Test

1. [Performance scenarios]
2. [Security scenarios]
3. [Accessibility]
4. [Mobile/responsive]

### Nice to Have

1. [Visual regression]
2. [Load testing scenarios]
```

### Step 7: Invoke E2E Tester Agent

**Spawn the specialized agent**:

Use the Task tool to launch the e2e-tester agent:

```
Task tool parameters:
- subagent_type: "e2e-tester"
- description: "Generate e2e tests for [feature-name]"
- prompt: """
Create comprehensive end-to-end tests for the following feature:

[Paste the complete context document from Step 6]

**Requirements**:
1. Create complete e2e test suite covering all scenarios
2. Follow project testing conventions and patterns
3. Include setup/teardown and fixtures
4. Cover happy paths, edge cases, and error scenarios
5. Add comments explaining test logic
6. Ensure tests are maintainable and readable
7. Include test data and mocking strategies
8. Validate against all acceptance criteria
9. Generate helper functions for reusability
10. Create README for running tests

**Deliverables**:
- Complete test files following project structure
- Test fixtures and helpers
- Test configuration if needed
- Documentation on running tests
- Summary of test coverage
"""
```

**Monitor agent progress**:

- Agent will analyze the context
- Create test structure and organization
- Generate test files
- Create fixtures and helpers
- Validate coverage against requirements
- Provide comprehensive report

## Phase 4: Post-Generation Validation

### Step 8: Review Generated Tests

**Verify test quality**:

1. **Structure Check**:
   - [ ] Tests organized logically
   - [ ] Follows project conventions
   - [ ] Proper setup/teardown
   - [ ] Clear test descriptions

2. **Coverage Check**:
   - [ ] All acceptance criteria tested
   - [ ] Happy paths covered
   - [ ] Error scenarios tested
   - [ ] Edge cases included
   - [ ] Integration points validated

3. **Code Quality**:
   - [ ] Clean, readable code
   - [ ] Proper async/await usage
   - [ ] No hardcoded values
   - [ ] Good use of fixtures
   - [ ] Helpful comments

### Step 9: Run Tests

**Execute the test suite**:

```bash
# Install any new dependencies if needed
pnpm install

# Run the e2e tests
pnpm test:e2e  # or npm run test:e2e

# Or run with specific test file
pnpm exec playwright test tests/e2e/feature-name.e2e.ts

# Run with UI mode for debugging
pnpm exec playwright test --ui

# Generate HTML report
pnpm exec playwright test --reporter=html
```

**Verify results**:

- All tests pass ✅
- No unexpected errors
- Tests run in reasonable time
- Proper cleanup after tests
- No test pollution (tests affect each other)

### Step 10: Iterate if Needed

**If tests fail or need adjustment**:

1. **Review failure details**:
   - Read error messages and stack traces
   - Check test logs and screenshots
   - Identify root cause

2. **Categorize issues**:
   - **Test issues**: Fix test logic
   - **Implementation bugs**: Fix source code
   - **Environment issues**: Fix setup/config
   - **Timing issues**: Add proper waits

3. **Fix systematically**:
   - Update tests or implementation
   - Re-run to verify fixes
   - Ensure no regressions

## Phase 5: Integration & Documentation

### Step 11: Integrate into CI/CD

**Add to continuous integration**:

```yaml
# Example GitHub Actions workflow
- name: Run E2E Tests
  run: pnpm test:e2e

# Or with Playwright specific setup
- name: Install Playwright Browsers
  run: pnpm exec playwright install --with-deps
- name: Run Playwright Tests
  run: pnpm exec playwright test
```

**Configure test environments**:

- Set up test database
- Configure test environment variables
- Add test data seeding
- Ensure cleanup between runs

### Step 12: Document Test Suite

**Create or update test documentation**:

```markdown
# E2E Tests for [Feature Name]

## Overview

[Brief description of what these tests cover]

## Prerequisites

- Node.js 20+
- Playwright installed: `pnpm install`
- Test database available
- Environment variables set in `.env.test`

## Running Tests

### All Tests

\`\`\`bash
pnpm test:e2e
\`\`\`

### Specific Feature

\`\`\`bash
pnpm exec playwright test tests/e2e/feature-name
\`\`\`

### With UI Mode

\`\`\`bash
pnpm exec playwright test --ui
\`\`\`

### Debug Mode

\`\`\`bash
pnpm exec playwright test --debug
\`\`\`

## Test Coverage

### Happy Paths

- [Scenario 1]
- [Scenario 2]

### Error Cases

- [Error case 1]
- [Error case 2]

### Edge Cases

- [Edge case 1]
- [Edge case 2]

## Test Data

- Fixtures: `tests/fixtures/`
- Test users: `tests/fixtures/users.json`
- Mock data: `tests/fixtures/mock-data.ts`

## Troubleshooting

[Common issues and solutions]
```

## Best Practices

### Feature Context Gathering

- ✅ Read the entire conversation to understand scope
- ✅ Include all spec documents found
- ✅ List every modified file with context
- ✅ Extract acceptance criteria explicitly
- ✅ Note any technical constraints or requirements

### Agent Prompting

- ✅ Provide complete context, don't summarize
- ✅ Include examples from existing tests
- ✅ Specify exact test framework and version
- ✅ List all scenarios that must be covered
- ✅ Request documentation and helpers

### Test Quality

- ✅ Tests should be independent (no shared state)
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Include proper cleanup
- ✅ Use page objects for UI tests
- ✅ Mock external dependencies appropriately

### Coverage Standards

- ✅ Cover all acceptance criteria
- ✅ Test authentication/authorization
- ✅ Test input validation
- ✅ Test error responses
- ✅ Test integration points
- ✅ Consider performance implications

## Example Workflow

```bash
# 1. User completes feature implementation
# (In this chat session, you implemented a new login feature)

# 2. User runs this command
/tupe:e2e-testing

# 3. Command analyzes session
# - Identifies "login feature" from conversation
# - Finds specs/auth/requirements.md or other docs
# - Lists modified files (LoginForm.tsx, auth.routes.ts, etc.)
# - Gathers testing setup (Playwright configured)

# 4. Command spawns e2e-tester agent with context

# 5. Agent generates tests
# - tests/e2e/auth/login.e2e.ts
# - tests/fixtures/users.json
# - tests/helpers/auth-helpers.ts
# - tests/e2e/auth/README.md

# 6. Tests are executed
pnpm test:e2e

# 7. All tests pass ✅

# 8. Tests committed with feature
git add tests/e2e/auth/
git commit -m "test(auth): add comprehensive e2e tests for login feature"
```

## Success Criteria

By the end of this command execution:

- ✅ Comprehensive e2e test suite created
- ✅ All acceptance criteria covered
- ✅ Happy paths, error cases, edge cases tested
- ✅ Tests follow project conventions
- ✅ Tests are runnable and pass
- ✅ Fixtures and helpers created
- ✅ Documentation provided
- ✅ Ready for CI/CD integration
- ✅ Maintainable and readable code
- ✅ No flaky tests

## Notes

**Difference from /tupe:use-case-testing**:

- **use-case-testing**: Manual validation through Playwright MCP, interactive testing, fixes issues
- **e2e-testing**: Automated test generation, creates test files, CI/CD ready, long-term regression prevention

**When to use each**:

- Use **use-case-testing** for immediate validation during development
- Use **e2e-testing** to create permanent automated test suite after feature completion

**Agent intelligence**:
The e2e-tester agent is specialized in:

- Understanding project architecture and patterns
- Selecting appropriate testing strategies
- Creating realistic test scenarios
- Following testing best practices
- Generating maintainable test code
- Ensuring comprehensive coverage

---

**Remember**: Good e2e tests prevent regressions, document expected behavior, and provide confidence for future changes. Invest time in creating thorough, maintainable tests now to save debugging time later.
