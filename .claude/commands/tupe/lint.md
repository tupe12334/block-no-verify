---
description: Fix all ESLint errors systematically using the project's existing ESLint configuration, ensuring tests and builds pass after each fix
---

# Systematic ESLint Error Fixer

You are an expert ESLint error fixer focused on methodically resolving linting issues while maintaining code quality and functionality.

## Your Mission

Fix ALL ESLint errors in the project systematically, one by one, while ensuring:

1. **Respect the project's existing ESLint configuration** - DO NOT modify or override it
2. Tests continue to pass after each fix
3. Build continues to work after each fix
4. No new linting errors are introduced
5. Code logic and functionality remain intact

## Critical: Do NOT Modify ESLint Configuration

**IMPORTANT**: This command fixes lint errors by fixing the CODE, not by changing the rules.

- ❌ DO NOT modify `eslint.config.mjs` or any ESLint configuration files
- ❌ DO NOT add, remove, or change any ESLint rules
- ❌ DO NOT install or update `eslint-config-agent` or any ESLint packages
- ✅ DO fix the actual code to comply with the existing rules
- ✅ DO respect all project-specific rule customizations

The project's ESLint configuration is intentional. Your job is to make the code comply with it, not to change it.

## Using the Lint Fixer Agent

**IMPORTANT**: For complex linting scenarios with many errors, you can delegate to the specialized `lint-fixer` agent:

```
Use the Task tool with subagent_type='lint-fixer' to get intelligent lint error analysis and strategic fixing.
```

The lint-fixer agent provides:

- Deep error analysis and categorization
- Strategic fixing plans (prioritization, dependencies)
- Systematic execution with continuous validation
- Progress tracking and comprehensive reporting

**When to use the agent**:

- 20+ lint errors to fix
- Complex error dependencies
- Need strategic planning before fixing
- Want detailed progress tracking
- Prefer phased approach over immediate fixes

**When to handle directly**:

- < 10 simple errors
- Quick autofix scenarios
- Straightforward single-file fixes

## Phase 1: Analysis (No Configuration Changes)

### Step 1: Verify ESLint is Available

1. **Check that ESLint is installed**:

   ```bash
   pnpm exec eslint --version
   ```

2. **If ESLint is not installed**, inform the user and stop:
   - Do NOT automatically install ESLint packages
   - Ask the user to run `/tupe:package-setup` first if they need ESLint setup

3. **Read the existing ESLint configuration** (for understanding, NOT for modification):
   - Check for `eslint.config.mjs`, `.eslintrc.*`, or `package.json` eslintConfig
   - Understand what rules are enabled so you can fix code appropriately
   - Note any project-specific customizations

### Step 2: Initial Analysis

1. **Run ESLint to get all errors**:

   ```bash
   pnpm exec eslint . --format json --output-file eslint-report.json
   ```

2. **Also get human-readable output**:

   ```bash
   pnpm exec eslint . 2>&1 | tee eslint-errors.txt
   ```

3. **Read and analyze the error report**:
   - Count total errors
   - Categorize errors by type
   - Identify files with most errors
   - Create a prioritized fix list

4. **Create a todo list** with all errors to track progress

## Phase 2: Systematic Error Fixing

For EACH error in the list, follow this process:

### Fix Cycle (Repeat for Each Error)

#### 1. Select Next Error

- Pick ONE error from the list (start with easiest/most common)
- Note the file, line, and rule being violated
- Read the file and surrounding context

#### 2. Understand the Error

- Analyze what the ESLint rule is trying to enforce
- Understand the current code logic
- Plan the fix that maintains functionality

#### 3. Apply the Fix

- Make the minimal change needed to fix THIS error
- Use the Edit tool to apply the fix
- Ensure you preserve the code's logic and behavior
- Add comments if the fix needs explanation

#### 4. Verify the Fix

Run these checks in sequence:

**A. Check Linting**:

```bash
pnpm exec eslint [fixed-file] --format compact
```

- Ensure the specific error is gone
- Check if any NEW errors appeared in this file

**B. Run Tests**:

```bash
pnpm test
```

- Ensure all tests still pass
- If tests fail, analyze why and adjust the fix
- DO NOT proceed if tests are broken

**C. Run Build**:

```bash
pnpm build
```

- Ensure build completes successfully
- If build fails, analyze why and adjust the fix
- DO NOT proceed if build is broken

**D. Full Lint Check**:

```bash
pnpm exec eslint . --format compact
```

- Count remaining errors
- Verify error count decreased by at least 1
- Check if new errors were introduced elsewhere

#### 5. Handle New Errors (If Any)

If new errors were introduced:

- Identify all new errors
- Add them to your todo list
- Fix them immediately before proceeding to the next original error
- Run the full verification cycle for each new error fix

#### 6. Update Progress

- Mark the error as fixed in your todo list
- Show progress: "Fixed X of Y errors (Z remaining)"
- Commit the fix with a descriptive message:

  ```bash
  git add [files]
  git commit -m "fix(lint): resolve [rule-name] in [file-name]

  - Fixed: [brief description]
  - File: [file-path]:[line]
  - Tests: passing
  - Build: successful"
  ```

#### 7. Continue to Next Error

- Repeat the entire cycle for the next error
- Keep going until ALL errors are fixed

## Phase 3: Final Verification

After all errors are fixed:

1. **Final Lint Check**:

   ```bash
   pnpm exec eslint . --format stylish
   ```

   - Should show 0 errors
   - Document any warnings

2. **Final Test Run**:

   ```bash
   pnpm test
   ```

   - All tests must pass

3. **Final Build**:

   ```bash
   pnpm build
   ```

   - Build must complete successfully

4. **Generate Report**:
   - Total errors fixed
   - Time taken
   - Files modified
   - Any remaining warnings
   - Summary of changes made

5. **Cleanup Generated Files**:

   ```bash
   # Remove all report files generated during the linting process
   rm -f eslint-report.json
   rm -f eslint-errors.txt
   rm -f eslint-errors-*.txt
   rm -f .eslintcache

   # Show what was cleaned up
   echo "🧹 Cleaned up generated report files"
   ```

   **Files to remove**:
   - `eslint-report.json` - JSON error report
   - `eslint-errors.txt` - Text error output
   - `eslint-errors-*.txt` - Any variant error files
   - `.eslintcache` - ESLint cache file
   - Any other temporary files created during the process

## Important Guidelines

### DO:

- ✅ Fix ONE error at a time
- ✅ Run full verification after EACH fix
- ✅ Commit after each successful fix
- ✅ Preserve code logic and functionality
- ✅ Add comments when fixes need explanation
- ✅ Fix cascading errors immediately
- ✅ Keep the user informed of progress

### DO NOT:

- ❌ Fix multiple errors at once
- ❌ Skip verification steps
- ❌ Proceed if tests fail
- ❌ Proceed if build fails
- ❌ Change code logic unnecessarily
- ❌ Ignore new errors that appear
- ❌ Make bulk changes without testing

## Error Handling

If you get stuck on an error:

1. Document why it's challenging
2. Try alternative fixes
3. If no fix works without breaking functionality:
   - Document the issue
   - Consider if the rule should be disabled for that specific line
   - Use `// eslint-disable-next-line [rule-name]` with a comment explaining why
   - Mark it for manual review

## Progress Tracking

Maintain a todo list showing:

- Total errors found: [number]
- Errors fixed: [number]
- Errors remaining: [number]
- Current file: [file-path]
- Current error: [rule-name]
- Cascading errors fixed: [number]

Update after each fix to show clear progress.

## Success Criteria

You are done when:

1. ✅ `pnpm exec eslint .` shows 0 errors
2. ✅ `pnpm test` passes all tests
3. ✅ `pnpm build` completes successfully
4. ✅ All fixes are committed
5. ✅ Final report is generated
6. ✅ All generated report files are cleaned up

Now begin the systematic linting error fixing process!
