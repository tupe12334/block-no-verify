---
description: Intelligently revert only changes made in the current chat session while preserving other uncommitted work
---

# Smart Session Revert

You are an expert at surgical git operations focused on safely reverting changes from the current chat session without disrupting other work.

## Your Mission

Identify and revert ONLY the changes that were made during the current Claude Code chat session, while carefully preserving:

- Changes that existed before this session
- Changes made outside this session
- Staged changes that aren't from this session
- Work in progress from other sessions

## Core Principles

**SAFETY FIRST**:

- Never revert changes you didn't make in this session
- Always preserve pre-existing uncommitted work
- Create safety backups before operations
- Verify what you're reverting before doing it

**PRECISION**:

- Track which files were touched in THIS session
- Distinguish session changes from pre-existing changes
- Handle partial file modifications correctly
- Preserve file states accurately

## Phase 1: Session Change Detection

### Step 1: Understand Current Session Context

First, identify what has been modified during THIS chat session. Use the conversation history to understand:

1. **Files explicitly modified by you**:
   - Files you edited using the Edit or Write tool
   - Files you created during this session
   - Files you deleted during this session

2. **Commands that modify files**:
   - Build outputs from running build commands
   - Generated files from code generation
   - Modified files from running scripts

Create a list of files that were touched in this session.

### Step 2: Analyze Current Git State

```bash
# Get complete status
git status --porcelain

# Get detailed diff of all changes
git diff HEAD

# Get list of untracked files
git ls-files --others --exclude-standard

# Get staged changes
git diff --cached
```

### Step 3: Create Safety Backup

Before any revert operations, create a safety backup:

```bash
# Create a temporary backup of working directory
BACKUP_DIR=".claude-revert-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup all modified and untracked files
git ls-files -m -o --exclude-standard | while read file; do
  mkdir -p "$BACKUP_DIR/$(dirname "$file")"
  cp "$file" "$BACKUP_DIR/$file" 2>/dev/null || true
done

echo "✅ Safety backup created at: $BACKUP_DIR"
```

## Phase 2: Change Analysis and Classification

### Step 1: Classify Files by Session Involvement

For each modified file, determine:

1. **Session-only changes**: File was clean before session, modified only in session
2. **Mixed changes**: File had pre-existing changes + session changes
3. **Non-session changes**: File was modified outside this session
4. **New files**: Created in this session vs. created elsewhere

### Step 2: Build Session Change Map

For each file you touched in this session:

```bash
# Get the full diff for the file
git diff HEAD path/to/file

# If file is new and untracked
git status --porcelain path/to/file
```

Create a mental map:

- **Files to fully revert**: Files you created or exclusively modified
- **Files to partially revert**: Files with mixed changes (requires careful handling)
- **Files to skip**: Files not touched in this session

### Step 3: Handle Edge Cases

Identify special situations:

1. **Staged + Unstaged**: File has both staged and unstaged changes

```bash
git diff --cached path/to/file  # Staged changes
git diff path/to/file           # Unstaged changes
```

2. **Renamed/Moved files**:

```bash
git diff --name-status HEAD
```

3. **Deleted files**:

```bash
git status --porcelain | grep "^ D"
```

## Phase 3: Surgical Revert Strategy

### Strategy A: Session-Only Files (Simple Revert)

For files that were ONLY modified in this session and had no pre-existing changes:

```bash
# Fully revert to HEAD
git checkout HEAD -- path/to/file

# Or if file is new and untracked
rm path/to/file
```

### Strategy B: Mixed Change Files (Selective Revert)

For files with both pre-existing and session changes, you need to be surgical.

**Option 1: Manual patch application**

1. Show user the diff and ask which hunks to keep
2. Use git apply with selective hunks

**Option 2: Stash-based approach**

```bash
# Stash current state
git stash push -u -m "temp-stash-session-revert"

# Restore to HEAD
git reset --hard HEAD

# Stash pop to restore pre-session changes
# (This assumes pre-session changes are in a different stash)
```

**Option 3: Interactive reset** (Most precise)

```bash
# For each session file with mixed changes:
# 1. Extract session-specific line ranges from conversation history
# 2. Manually revert only those lines using Edit tool
# 3. Preserve all other changes
```

### Strategy C: New Files Created in Session

```bash
# If file was created in this session
rm path/to/file

# Remove from git if it was added
git rm --cached path/to/file 2>/dev/null || true
```

### Strategy D: Deleted Files in Session

```bash
# Restore file if you deleted it this session
git checkout HEAD -- path/to/file
```

## Phase 4: Execution Plan Presentation

Before making ANY changes, present a clear plan to the user:

```
🔍 Session Revert Analysis
═══════════════════════════

FILES TO FULLY REVERT (N files):
  ✓ path/to/file1.ts - Created in this session
  ✓ path/to/file2.ts - Modified only in this session

FILES WITH MIXED CHANGES (N files):
  ⚠️  path/to/file3.ts
      - Pre-existing changes: lines 10-15
      - Session changes: lines 45-60
      Strategy: Will revert only lines 45-60

FILES TO PRESERVE (N files):
  ✗ path/to/file4.ts - Not modified in this session
  ✗ path/to/file5.ts - Modified outside this session

SAFETY:
  ✓ Backup created at: .claude-revert-backup-20251118-123456
  ✓ Can restore from backup if needed

RISK LEVEL: [LOW/MEDIUM/HIGH]

Proceed with revert? The following actions will be taken:
1. Revert N files completely
2. Selectively revert changes in N files
3. Preserve N files with non-session changes
```

## Phase 5: Execute Revert

### Step 1: Get User Confirmation

Use the AskUserQuestion tool to confirm:

```
Question: "Ready to revert session changes?"
Options:
  - "Yes, proceed with revert" → Continue
  - "Show me detailed diff first" → Show more details
  - "Cancel, keep all changes" → Exit
```

### Step 2: Perform Revert Operations

Execute the revert plan in this order:

1. **Simple reverts first** (session-only files):

```bash
# Batch revert session-only files
git checkout HEAD -- file1.ts file2.ts file3.ts

# Remove new untracked files
rm new-file1.ts new-file2.ts
```

2. **Selective reverts** (mixed files):
   For each file with mixed changes:

- Use Edit tool to revert only session-specific changes
- Preserve pre-existing modifications
- Verify result matches expected state

3. **Restore deletions** (if applicable):

```bash
git checkout HEAD -- deleted-file.ts
```

### Step 3: Verify Results

After revert operations:

```bash
# Show what remains
git status

# Show remaining diff
git diff HEAD

# Confirm session changes are gone
echo "✅ Session changes reverted"
echo "✅ Pre-existing changes preserved"
```

## Phase 6: Cleanup and Summary

### Step 1: Verify Success

Check that:

- ✅ Session changes are reverted
- ✅ Pre-existing changes are intact
- ✅ Staged changes (if non-session) are preserved
- ✅ Git state is clean and consistent

### Step 2: Provide Summary

```
🎯 Revert Complete
═══════════════════

REVERTED:
  ✓ 5 files fully reverted to HEAD
  ✓ 2 files partially reverted (session changes only)
  ✓ 3 new files removed

PRESERVED:
  ✓ 4 files with non-session changes kept intact
  ✓ 2 staged changes preserved

BACKUP:
  📦 Safety backup: .claude-revert-backup-20251118-123456
  💡 To restore backup if needed:
      cp -r .claude-revert-backup-20251118-123456/* .

CURRENT STATE:
  Modified:   4 files (non-session changes)
  Staged:     2 files
  Untracked:  0 files

Git status:
[show git status output]

You can safely delete the backup directory if everything looks good:
  rm -rf .claude-revert-backup-20251118-123456
```

## Important Edge Cases

### Case 1: Unable to Distinguish Changes

If you cannot reliably distinguish session changes from pre-existing changes:

```
⚠️  WARNING: Cannot reliably separate session changes from pre-existing changes

The following files have unclear change ownership:
  - path/to/file.ts

OPTIONS:
1. Show full diff and let user decide
2. Preserve all changes (safer)
3. Revert all changes (riskier)

Recommendation: Option 1 (show diff for manual decision)
```

### Case 2: Conflicts with Staged Changes

If session changes overlap with staged changes:

```
⚠️  CONFLICT: Session changes overlap with staged changes

File: path/to/file.ts
- Staged changes: lines 10-20
- Session changes: lines 15-25
- Overlap: lines 15-20

Cannot automatically revert without affecting staged changes.

OPTIONS:
1. Unstage file, revert session changes, then re-stage non-session changes
2. Skip this file (preserve all changes)
3. Manual intervention required

Recommendation: Option 2 (safer)
```

### Case 3: Files Modified by Build/Scripts

If files were modified by build processes:

```
🔧 BUILD ARTIFACTS DETECTED

The following files appear to be build outputs:
  - dist/bundle.js
  - coverage/lcov.info

These are typically generated and safe to revert.

Include in revert? [Yes/No]
```

## Verification Checklist

Before completing, verify:

- [ ] Backup created successfully
- [ ] User confirmed revert plan
- [ ] Session changes identified correctly
- [ ] Pre-existing changes preserved
- [ ] Staged changes handled correctly
- [ ] Git state is consistent
- [ ] No unexpected file changes
- [ ] Backup location provided to user

## Error Recovery

If something goes wrong during revert:

```bash
# Restore from backup immediately
echo "⚠️  Error during revert. Restoring from backup..."
cp -r "$BACKUP_DIR"/* .
echo "✅ Backup restored. All changes recovered."
echo "Please review the state and try again."
```

## Usage Examples

### Example 1: Simple Session Revert

```
User: "Actually, I want to undo all the changes I just made"
Assistant: *Analyzes session history*
- Modified: src/api.ts, src/utils.ts
- Created: src/new-feature.ts
- All changes were made only in this session
- Creates backup
- Reverts all 3 files
- Reports success
```

### Example 2: Complex Mixed Changes

```
User: "Revert my changes but keep the work I started before this chat"
Assistant: *Analyzes carefully*
- src/main.ts: Had uncommitted changes before + session changes
- src/test.ts: Session only
- Backs up everything
- Fully reverts src/test.ts
- Selectively reverts only session changes in src/main.ts
- Preserves pre-existing uncommitted work
```

### Example 3: Partial Revert Request

```
User: "Undo just the authentication changes I made"
Assistant: *Filters by topic*
- Identifies auth-related files from session
- Reverts only those files
- Preserves other session changes
- Reports what was reverted vs. kept
```

## Final Notes

**When to use this command**:

- User wants to undo recent work from this session
- User made mistakes and wants to start over
- User wants to abandon a feature attempt
- User wants to clean up before switching tasks

**When NOT to use this command**:

- User wants to undo commits (use git revert or git reset instead)
- User wants to revert changes from multiple sessions (use git)
- Changes are already committed and pushed

**Safety philosophy**:

- Always create backups before reverting
- Always get user confirmation before destructive operations
- Always preserve non-session work
- Always provide clear restoration instructions
- When in doubt, show the user the details and ask
