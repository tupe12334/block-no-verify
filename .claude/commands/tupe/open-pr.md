---
description: Use the gitops agent to create a pull request with changes made in this thread. Multi-agent aware - only commits changes from this session.
---

# Open Pull Request

You are being asked to create a pull request with the changes you've made in THIS conversation thread.

## Critical Multi-Agent Context

**IMPORTANT**: Multiple Claude agents may be working on this codebase simultaneously. You MUST:

1. ✅ **Only commit YOUR changes** - Files you modified/created in THIS thread
2. ✅ **Preserve other agents' work** - Do not touch, delete, or modify files you didn't change
3. ✅ **Respect staged changes** - If files are already staged by others, skip them
4. ✅ **Avoid conflicts** - Check git status carefully before staging anything
5. ✅ **Session awareness** - Review the conversation history to identify YOUR changes
6. ✅ **NEVER CHANGE WORKSPACE BRANCH** - Use temporary clone for PR creation

## ⚠️ CRITICAL: Workspace Preservation

**DO NOT change the branch in the current workspace!** Multiple agents are working here concurrently.

**REQUIRED WORKFLOW**:

1. Create a temporary clone of the repository
2. Copy your session changes to the temp clone
3. Create PR from the temp clone
4. Clean up the temp clone
5. Leave the original workspace untouched on its current branch

**Why this matters**: Changing branches in the workspace would disrupt other agents' work and cause conflicts.

## Instructions

### Step 1: Review Your Session Changes

Before proceeding, analyze the conversation history to identify:

**Files YOU modified in this thread:**

- List each file you created, edited, or deleted
- Review each change you made

**Files to SKIP:**

- Files mentioned but not modified by you
- Files with pre-existing uncommitted changes
- Files staged by other agents or developers
- Any file you're uncertain about

### Step 2: Create Temporary Workspace

**CRITICAL**: Do NOT work in the current workspace directory! Create a temporary clone:

```bash
# Get current repository info
REPO_URL=$(git remote get-url origin)
CURRENT_DIR=$(pwd)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Create temporary directory
TEMP_DIR="/tmp/claude-pr-${TIMESTAMP}"
mkdir -p "$TEMP_DIR"

# Clone repository to temp location
git clone "$REPO_URL" "$TEMP_DIR"
cd "$TEMP_DIR"

# Fetch latest changes
git fetch origin

# Checkout the current working branch
ORIGINAL_BRANCH=$(cd "$CURRENT_DIR" && git branch --show-current)
git checkout "$ORIGINAL_BRANCH"
git pull origin "$ORIGINAL_BRANCH"

echo "Temporary workspace created at: $TEMP_DIR"
echo "Original workspace preserved at: $CURRENT_DIR"
```

**Copy your session changes to temp workspace**:

```bash
# For each file you modified in your session
# Copy from original workspace to temp workspace

cd "$CURRENT_DIR"
for file in [list of your modified files]; do
  # Create directory structure if needed
  mkdir -p "$TEMP_DIR/$(dirname "$file")"

  # Copy the modified file
  cp "$file" "$TEMP_DIR/$file"

  echo "Copied: $file"
done

cd "$TEMP_DIR"
echo "Session changes copied to temporary workspace"
```

**Verification**:

- Verify the temp workspace has your changes: `git status` in temp directory
- Verify original workspace is untouched: `git status` in original directory
- Original workspace should remain on the same branch

### Step 3: Invoke the GitOps Agent

**IMPORTANT**: The gitops agent will work in the temporary directory `$TEMP_DIR`, not the original workspace.

Use the **Task tool** to spawn the **gitops** agent:

```text
Use the Task tool with subagent_type='gitops' and provide:
- Temporary workspace directory path
- Clear description of what you accomplished in this thread
- List of specific files you modified (for agent verification)
- Instruction to create a pull request with ONLY these session changes
```

**Example prompt for gitops agent:**

```text
Create a pull request with the changes I made in this session.

## Working Directory

**CRITICAL**: Work in the temporary clone: /tmp/claude-pr-[timestamp]
DO NOT touch the original workspace!

Change to temp directory before any git operations:
cd /tmp/claude-pr-[timestamp]

## Session Changes Summary

[Describe what you accomplished - e.g., "Added authentication middleware and tests"]

## Files Modified in This Session

- src/auth/middleware.ts (created)
- src/auth/middleware.spec.ts (created)
- src/index.ts (modified - added auth import)

## Instructions

1. Verify you're in the temporary directory (not original workspace)
2. Review git status and verify these files
3. Stage ONLY these files (do not use `git add .`)
4. Create a descriptive commit following repository conventions
5. Create a new branch with appropriate naming (e.g., claude/feature-name-YYYYMMDD-HHMMSS)
6. Push to the new branch
7. Create a pull request with:
   - Clear title describing the feature/fix
   - Summary of changes
   - Test plan
   - Reference to any related issues

## Multi-Agent Safety

- Work ONLY in the temporary directory: /tmp/claude-pr-[timestamp]
- Do NOT commit any files not listed above
- Do NOT modify or delete code from other sessions
- Verify each file before staging
- After creating PR, return to the original workspace directory

## Cleanup After PR

After successfully creating the PR:
1. Return to original workspace directory
2. Remove temporary directory: rm -rf /tmp/claude-pr-[timestamp]
3. Confirm original workspace is untouched
```

### Step 4: Verification Checklist

Before the gitops agent executes, ensure:

- [ ] Temporary workspace created successfully
- [ ] Session changes copied to temp workspace
- [ ] Original workspace remains untouched
- [ ] You've identified ALL and ONLY files you modified
- [ ] You haven't included files from previous sessions
- [ ] You're not touching other agents' work
- [ ] The changes are complete and tested
- [ ] You have a clear PR description ready

### Step 5: Post-PR Actions

After the gitops agent creates the PR:

1. ✅ Verify the PR URL is provided
2. ✅ Confirm only your session changes are included
3. ✅ Check the PR description is clear and accurate
4. ✅ **Clean up temporary workspace**
5. ✅ **Verify original workspace is untouched**
6. ✅ Inform the user of the PR URL for review

**Cleanup Commands**:

```bash
# Return to original workspace
cd "$CURRENT_DIR"

# Verify original workspace is untouched
echo "Original workspace status:"
git status

# Remove temporary directory
rm -rf "$TEMP_DIR"
echo "Temporary workspace cleaned up: $TEMP_DIR"

# Confirm we're back in original workspace on original branch
echo "Current directory: $(pwd)"
echo "Current branch: $(git branch --show-current)"
```

## Multi-Agent Best Practices

### DO

- ✅ **ALWAYS use a temporary clone** for PR creation
- ✅ **NEVER change branches in the original workspace**
- ✅ Review conversation history thoroughly
- ✅ List specific files you modified
- ✅ Copy only your session changes to temp workspace
- ✅ Use `git add <specific-file>` for each file in temp workspace
- ✅ Verify git status before committing
- ✅ Create feature branches with unique names
- ✅ Write clear, scoped commit messages
- ✅ Include test changes with code changes
- ✅ Clean up temporary workspace after PR creation
- ✅ Verify original workspace remains untouched

### DO NOT

- ❌ **Change branches in the original workspace** (CRITICAL!)
- ❌ **Work directly in the original workspace for PR** (CRITICAL!)
- ❌ Use `git add .` or `git add -A` (too broad)
- ❌ Commit files you didn't modify
- ❌ Delete or modify code from other agents
- ❌ Include unrelated changes
- ❌ Skip verification steps
- ❌ Assume all unstaged files are yours
- ❌ Force push or rewrite shared history
- ❌ Leave temporary workspaces uncleaned

## Example Multi-Agent Scenario

**Scenario**: Three agents working concurrently in the same workspace:

- Agent 1 (YOU): Added authentication → Your session changes only
- Agent 2: Updated dependencies → Their changes, don't touch
- Agent 3: Fixed a bug → Their changes, don't touch

**Original workspace git status shows:**

```text
M  src/auth/middleware.ts        (YOU)
M  src/index.ts                   (YOU)
A  src/auth/middleware.spec.ts   (YOU)
M  package.json                   (Agent 2 - SKIP)
M  src/utils/helper.ts           (Agent 3 - SKIP)
```

**Your workflow:**

1. **Create temporary clone**:

   ```bash
   TEMP_DIR="/tmp/claude-pr-20251121-153000"
   git clone <repo-url> "$TEMP_DIR"
   cd "$TEMP_DIR"
   ```

2. **Copy ONLY your files** to temp workspace:

   ```bash
   cp /original/workspace/src/auth/middleware.ts "$TEMP_DIR/src/auth/"
   cp /original/workspace/src/auth/middleware.spec.ts "$TEMP_DIR/src/auth/"
   cp /original/workspace/src/index.ts "$TEMP_DIR/src/"
   ```

3. **Stage and commit in temp workspace**:
   - src/auth/middleware.ts
   - src/auth/middleware.spec.ts
   - src/index.ts

4. **Create PR from temp workspace**

5. **Clean up and verify**:

   ```bash
   cd /original/workspace
   rm -rf "$TEMP_DIR"
   # Verify original workspace is untouched - still shows all agents' changes
   git status  # Should still show all 5 modified files
   ```

**Result**:

- ✅ PR created with only YOUR changes
- ✅ Agent 2's changes (package.json) remain in original workspace
- ✅ Agent 3's changes (helper.ts) remain in original workspace
- ✅ Original workspace branch never changed
- ✅ No conflicts or interference between agents

## Error Handling

### If Unsure About a File

**ASK THE USER** before including it:

```text
"I see src/utils/helper.ts is modified but I'm not certain if I changed it in this session.
Should I include it in the PR or skip it?"
```

### If Git Status Shows Unexpected Changes

**STOP and analyze**:

1. Review conversation history again
2. Identify which files are definitely yours
3. Ask user about ambiguous files
4. Proceed only with confirmed session changes

### If Another Agent's PR Conflicts

**Coordinate with user**:

```text
"I see there's another PR open that touches similar files.
Should I:
1. Rebase on top of their changes?
2. Create my PR anyway for parallel review?
3. Wait for their PR to merge first?"
```

## Success Criteria

A successful PR creation includes:

✅ **Temporary workspace created** in /tmp/
✅ **Only your session changes** copied to temp workspace
✅ **Original workspace untouched** throughout the process
✅ **Original workspace branch unchanged**
✅ **Only your session changes** are committed (in temp workspace)
✅ **Clear PR title** describing the work
✅ **Comprehensive PR description** with summary and test plan
✅ **Proper branch naming** (e.g., `claude/feature-auth-middleware-20251121`)
✅ **Conventional commit message** following repo standards
✅ **No conflicts** with other agents' work
✅ **All tests pass** (if applicable)
✅ **PR URL provided** to user
✅ **Temporary workspace cleaned up** after PR creation
✅ **Verification that original workspace remains intact**

## Notes

- **CRITICAL**: Always use a temporary clone, never work directly in the original workspace
- The temporary workspace isolates your PR creation from other agents' concurrent work
- The gitops agent has extensive safety checks and session awareness
- It will verify files before staging and committing
- It follows repository conventions automatically
- It creates properly formatted commit messages and PR descriptions
- Trust the gitops agent but provide clear, specific instructions about the temporary workspace

Remember: **When in doubt, ask the user**. It's better to clarify than to include wrong changes or break other agents' work.

**Multi-Agent Safety**: By using a temporary clone, multiple agents can create PRs simultaneously without interfering with each other or with the shared workspace.
