---
description: Stage, commit and push only relevant changes from the latest task using gitops agent with CI/CD validation
allowed-tools: Task, Bash, Read, Glob, Grep
---

# Smart Commit and Push with GitOps Agent

Stage, commit, and push only the changes relevant to the latest task using the specialized **gitops agent**. Analyzes git status, recent changes, and active specifications to determine what should be committed, then validates CI/CD pipeline success.

## Current State

### Repository Status

- Current branch: !`git branch --show-current 2>/dev/null || echo "N/A"`
- Upstream status: !`git status -sb 2>/dev/null || echo "N/A"`
- Unstaged files: !`git status --short 2>/dev/null || echo "No changes"`
- Last commit: !`git log -1 --pretty=format:"%h - %s (%ar)" 2>/dev/null || echo "N/A"`

### Recent Changes

- Modified files: !`git status --porcelain 2>/dev/null | grep -E '^\s*M' || echo "None"`
- New files: !`git status --porcelain 2>/dev/null | grep -E '^\?\?' || echo "None"`
- Staged files: !`git status --porcelain 2>/dev/null | grep -E '^[MADRC]' || echo "None"`

### Active Context

- Recent command changes: !`git status --porcelain .claude/commands/ 2>/dev/null || echo "No command changes"`

## Instructions

**IMPORTANT**: This command delegates all git operations to the **gitops agent** for intelligent, context-aware repository management with safety checks and validation.

Follow these steps to intelligently commit and push only relevant changes:

### Phase 1: Analyze the Context

**Identify the latest task** by examining:

- Recent changes in the working directory
- Last commit message for context
- Modified files to understand what was being worked on
- Conversation history to identify what was changed in THIS session

**Determine change scope**:

- Are changes related to a specific feature/spec?
- Are they related to new commands or configuration?
- Are they bug fixes or refactoring?
- Are there any test files or documentation changes?

**Document your findings** before proceeding:

```text
Task Identified: [Brief description]
Relevant Files: [List of files related to this task]
Excluded Files: [Any modified files not related to this task]
Rationale: [Why these files should be committed together]
```

### Phase 2: Delegate to GitOps Agent

**Use the Task tool to invoke the gitops agent**:

```
Use the Task tool with subagent_type='gitops' to handle the commit and push operations.
```

**Provide the gitops agent with clear instructions**:

```text
Create a commit for the following changes related to [task description]:

Files to commit:
- file1.ts: [reason]
- file2.ts: [reason]
- file3.md: [reason]

Exclude these files (even if modified):
- unrelated-file.ts: [reason for exclusion]

Commit message should:
- Type: [feat/fix/docs/etc]
- Scope: [component/feature name]
- Description: [what changed]
- Include details about [specific aspects]

After committing and pushing, proceed to Phase 3 for CI/CD validation.
```

**The gitops agent will**:

1. Analyze repository structure (monorepo/polyrepo/submodules)
2. Verify only session-relevant files are staged
3. Run pre-commit safety checks:
   - Check for secrets and credentials
   - Validate file sizes
   - Run tests if applicable
   - Run build if applicable
4. Create commit following repository conventions
5. Push to remote branch
6. Return commit hash and status

### Phase 3: Validate CI/CD Pipeline

**CRITICAL**: After pushing, validate that CI/CD passes before considering the task complete.

**Step 1: Wait for CI/CD to Start**

```bash
# Give CI/CD a moment to start (5-10 seconds)
sleep 10

# Check if CI/CD workflow exists
gh run list --limit 1 --branch $(git branch --show-current)
```

**Step 2: Monitor CI/CD Status**

```bash
# Get the latest run ID for the current commit
COMMIT_SHA=$(git rev-parse HEAD)
RUN_ID=$(gh run list --commit $COMMIT_SHA --limit 1 --json databaseId --jq '.[0].databaseId')

# Watch the run status
gh run watch $RUN_ID
```

**Step 3: Validate CI/CD Success**

```bash
# Check final status
gh run view $RUN_ID --json conclusion,status,url

# Expected output:
# {
#   "conclusion": "success",
#   "status": "completed",
#   "url": "https://github.com/..."
# }
```

**Step 4: Handle CI/CD Results**

**If CI/CD passes** ✅:

```text
✅ CI/CD Pipeline: SUCCESS

All checks passed:
- Tests: ✅ Passed
- Lint: ✅ Passed
- Build: ✅ Passed
- [Other checks]: ✅ Passed

View details: [GitHub Actions URL]

The changes have been successfully committed, pushed, and validated.
```

**If CI/CD fails** ❌:

```text
❌ CI/CD Pipeline: FAILED

Failed checks:
- [Check name]: ❌ Failed
  Error: [Brief error summary]

View details: [GitHub Actions URL]

Action required:
1. Review the failure logs
2. Fix the issues locally
3. Run the same validation locally (pnpm test/lint/build)
4. Commit and push the fix
5. Re-run this command to validate again
```

**If CI/CD is still running** ⏳:

```text
⏳ CI/CD Pipeline: IN PROGRESS

Current status:
- Workflow: [Name]
- Duration: [Time elapsed]
- Running checks: [List]

Waiting for completion... (checking every 30 seconds)

View live status: [GitHub Actions URL]
```

**Step 5: Provide Summary**

After validation completes, provide comprehensive summary:

```text
📊 Commit and Push Summary

Commit: [commit hash]
Branch: [branch name]
Files Changed: [count]
  ✓ file1.ts
  ✓ file2.ts
  ✓ file3.md

Remote: [remote URL/commit URL]

CI/CD Status: [SUCCESS/FAILED]
Pipeline URL: [GitHub Actions URL]

Checks:
  ✅ Tests: Passed (X tests, Y.YYs)
  ✅ Lint: Passed (0 errors)
  ✅ Build: Passed
  ✅ [Other checks]

Next Steps:
[Any recommendations or follow-up actions]
```

## Safety Checks

**The gitops agent handles these automatically**, but you should verify:

**Before delegating to gitops agent**:

- [ ] Identify all files changed in THIS session
- [ ] Confirm changes are related to the current task only
- [ ] Document rationale for including/excluding files
- [ ] Verify no secrets or credentials in changed files
- [ ] Ensure no `.env` or sensitive config files are included

**The gitops agent will automatically**:

- ✅ Check for secrets and credentials in staged files
- ✅ Validate file sizes (warn on large files)
- ✅ Run tests if test command exists
- ✅ Run build if build command exists
- ✅ Verify repository structure (monorepo/polyrepo/submodules)
- ✅ Follow repository commit conventions
- ✅ Only stage files from current session

**DO NOT commit**:

- Files containing secrets, tokens, or credentials
- Large binary files unless intentional
- Generated files that should be gitignored
- Unrelated changes from other tasks
- Debug/temporary files

## Output Format

Provide clear output showing:

1. **Phase 1 - Analysis**:
   - Task identified
   - Files to include with reasons
   - Files to exclude with reasons

2. **Phase 2 - GitOps Agent**:
   - Agent invocation status
   - Repository analysis results
   - Pre-commit check results
   - Commit hash and message
   - Push status

3. **Phase 3 - CI/CD Validation**:
   - Workflow start confirmation
   - Real-time status updates
   - Final validation results
   - Detailed check breakdown
   - GitHub Actions URL

4. **Summary**:
   - Complete overview of the operation
   - Files committed
   - CI/CD status
   - Next steps or recommendations

## Example Workflow

### Scenario: Adding new tupe command

#### Phase 1: Analyze

```text
Task Identified: Update commit-push command to use gitops agent and add CI/CD validation

Relevant Files:
- commands/tupe/commit-push.md: Updated to use gitops agent and validate CI/CD

Excluded Files:
- None (only one file modified)

Rationale: Single focused change to improve commit-push command workflow
```

#### Phase 2: Delegate to GitOps

```text
Invoking gitops agent with instructions:

Create a commit for updating the commit-push command:

Files to commit:
- commands/tupe/commit-push.md: Add gitops agent integration and CI/CD validation

Commit message should:
- Type: feat
- Scope: commands
- Description: integrate gitops agent and CI/CD validation in commit-push
- Include details about the new workflow phases

[GitOps Agent Working...]

✅ Repository Analysis: Polyrepo
✅ Pre-commit Checks: Passed
✅ Commit Created: abc1234
✅ Pushed to: origin/main
```

#### Phase 3: Validate CI/CD

```bash
# Wait for CI/CD to start
sleep 10

# Monitor CI/CD
gh run watch [run-id]

# Check final status
gh run view [run-id] --json conclusion,status,url
```

#### Result

```text
📊 Commit and Push Summary

Commit: abc1234
Branch: main
Files Changed: 1
  ✓ commands/tupe/commit-push.md

Remote: https://github.com/user/repo/commit/abc1234

CI/CD Status: SUCCESS ✅
Pipeline URL: https://github.com/user/repo/actions/runs/12345

Checks:
  ✅ Tests: Passed (15 tests, 2.4s)
  ✅ Lint: Passed (0 errors)
  ✅ Build: Passed
  ✅ Format Check: Passed
  ✅ Spell Check: Passed

Next Steps:
- Changes are live and validated
- CI/CD pipeline confirms all quality checks passed
- No further action required
```

---

**Remember**: This command uses the **gitops agent** for intelligent git operations and validates CI/CD success to ensure changes are production-ready. Only commit what's directly related to the latest task. Keep commits clean, focused, and meaningful.
