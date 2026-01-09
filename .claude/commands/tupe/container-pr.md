---
description: Execute work in an isolated Docker container with gh and npm credentials, then automatically create a PR. Enables multiple agents to work concurrently without interference.
---

# Containerized Multi-Agent Workflow with Auto-PR

You are an expert containerized development workflow manager. Your mission is to execute all requested work inside an isolated Docker container and create a pull request when finished.

## 🔒 CRITICAL: Complete Isolation Guarantee

**THE LOCAL REPOSITORY IS NEVER MODIFIED**:

- ✅ Container clones repository from remote (NOT from local)
- ✅ All work happens in container's `/tmp/workspace`
- ✅ NO volume mounts of the local repository
- ✅ All git operations happen inside the container
- ✅ Local repository stays on original branch with NO changes
- ✅ New branch exists ONLY on remote until manually fetched

**Benefits**:

- Multiple agents can work simultaneously without conflicts
- Local environment remains pristine
- Safe experimentation - just delete the remote branch to rollback
- Guaranteed reproducibility

## Primary Use Case: Concurrent Multi-Agent Development

This command enables **multiple Claude agents to work simultaneously** on different tasks by providing complete isolation:

- **Run multiple agents in parallel**: Each agent works in its own isolated container
- **Zero interference**: Agents don't conflict with each other or the host system
- **Clean environments**: Each agent starts with a pristine development environment
- **Independent PRs**: Each agent creates its own pull request for review
- **Efficient workflows**: No waiting for one agent to finish before starting another

### Example Multi-Agent Scenario

```text
Agent 1 (/tupe:container-pr): Adding user authentication
  ├─ Container: node:20-bullseye
  ├─ Branch: claude/auth-implementation-20251111-0001
  └─ PR: https://github.com/user/repo/pull/123

Agent 2 (/tupe:container-pr): Updating dependencies
  ├─ Container: node:20-bullseye
  ├─ Branch: claude/deps-update-20251111-0002
  └─ PR: https://github.com/user/repo/pull/124

Agent 3 (/tupe:container-pr): Optimizing database queries
  ├─ Container: python:3.11-bullseye
  ├─ Branch: claude/db-optimization-20251111-0003
  └─ PR: https://github.com/user/repo/pull/125

All running concurrently without conflicts!
```

## Overview

This command creates a completely isolated development environment where:

1. Repository is cloned INSIDE the container (local repo never touched)
2. All work happens inside the container's `/tmp/workspace`
3. GitHub and npm credentials are securely passed through
4. New branch is created, changes committed, and pushed from inside the container
5. A pull request is automatically created
6. The PR URL is returned to the user
7. Local repository remains pristine on the original branch
8. Multiple instances can run in parallel without any conflicts

## Phase 1: Environment Setup and Validation

### Step 1: Verify Prerequisites

Check that all required tools are available:

```bash
# Check Docker
docker --version

# Check if Docker daemon is running
docker ps

# Check GitHub CLI
gh --version

# Check gh authentication
gh auth status

# Check npm authentication (if needed)
npm whoami 2>/dev/null || echo "npm not authenticated (may not be needed)"

# Get current repository info
git remote -v
git branch --show-current
```

**Validation**:

- ✅ Docker is installed and running
- ✅ GitHub CLI is installed and authenticated
- ✅ Repository has a remote origin
- ⚠️ npm authentication is optional (only needed if publishing)

If any critical prerequisite fails, inform the user and stop.

### Step 2: Capture User Credentials

Securely capture credentials for container use:

```bash
# Get GitHub token
GH_TOKEN=$(gh auth token)

# Get npm token if authenticated
NPM_TOKEN=$(npm token list 2>/dev/null | grep "readonly" | head -1 | awk '{print $1}' || echo "")

# Get current user info
GH_USER=$(gh api user --jq .login)

# Get git config
GIT_USER_NAME=$(git config user.name)
GIT_USER_EMAIL=$(git config user.email)

# Store for container use
echo "✅ Captured credentials for user: $GH_USER"
```

**Security Note**: These tokens will only be passed to the container via environment variables, never written to disk.

### Step 3: Repository Analysis

Understand the current state:

```bash
# Get current branch (will be used as base for new branch in container)
CURRENT_BRANCH=$(git branch --show-current)

# Get repository URL
REPO_URL=$(git remote get-url origin)

# Get repository name
REPO_NAME=$(gh repo view --json nameWithOwner --jq .nameWithOwner)

echo "Repository: $REPO_NAME"
echo "Repository URL: $REPO_URL"
echo "Base branch: $CURRENT_BRANCH"
```

**Important**: Local uncommitted changes don't matter since the container will clone a fresh copy from the remote. However, if the user wants their local uncommitted changes included, they should commit and push them first, or this command isn't the right choice.

## Phase 2: Container Preparation

### Step 1: Determine Base Image

Choose the appropriate base image based on the project:

```bash
# Check project type
if [ -f "package.json" ]; then
  NODE_VERSION=$(cat package.json | grep '"node"' | grep -o '[0-9]*' | head -1)
  if [ -z "$NODE_VERSION" ]; then
    NODE_VERSION=20
  fi
  BASE_IMAGE="node:${NODE_VERSION}-bullseye"
  echo "📦 Using Node.js base image: $BASE_IMAGE"
elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
  BASE_IMAGE="python:3.11-bullseye"
  echo "🐍 Using Python base image: $BASE_IMAGE"
elif [ -f "go.mod" ]; then
  BASE_IMAGE="golang:1.21-bullseye"
  echo "🐹 Using Go base image: $BASE_IMAGE"
else
  BASE_IMAGE="ubuntu:22.04"
  echo "🐧 Using Ubuntu base image: $BASE_IMAGE"
fi
```

### Step 2: Create Dockerfile

Generate a Dockerfile for the containerized environment:

```dockerfile
# Write to .claude-container/Dockerfile
FROM ${BASE_IMAGE}

# Install essential tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*

# Set up git config (will be overridden by env vars)
RUN git config --global --add safe.directory /workspace

# Set working directory
WORKDIR /workspace

# Default command
CMD ["/bin/bash"]
```

```bash
# Create directory for container artifacts
mkdir -p .claude-container

# Write Dockerfile
cat > .claude-container/Dockerfile << 'EOF'
[Dockerfile content from above]
EOF

echo "✅ Dockerfile created at .claude-container/Dockerfile"
```

### Step 3: Build Container Image

```bash
# Build the image
docker build -t claude-workspace:latest .claude-container/

echo "✅ Container image built: claude-workspace:latest"
```

## Phase 3: Execute Work in Container

**CRITICAL**: All work happens INSIDE the container. The local repository remains completely untouched.

### Step 1: Prepare Container Environment Script

Create a script that will run inside the container to do ALL the work:

```bash
# Generate branch name based on task
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TASK_SLUG=$(echo "$TASK_DESCRIPTION" | tr '[:upper:]' '[:lower:]' | tr -c '[:alnum:]' '-' | cut -c1-40)
NEW_BRANCH="claude/containerized-work-${TIMESTAMP}"

# Get repository URL
REPO_URL=$(git remote get-url origin)

# Get current branch to base work on
BASE_BRANCH=$(git branch --show-current)

echo "Repository: $REPO_URL"
echo "Base branch: $BASE_BRANCH"
echo "New branch: $NEW_BRANCH"
```

### Step 2: Create Container Execution Script

**IMPORTANT**: This script will clone the repository INSIDE the container, make changes, commit, and push. The local repository is NEVER modified.

```bash
# Create script that runs inside container
cat > .claude-container/work-script.sh << 'SCRIPT_EOF'
#!/bin/bash
set -e

echo "🔧 Setting up container environment..."

# Configure git
git config --global user.name "$GIT_USER_NAME"
git config --global user.email "$GIT_USER_EMAIL"
git config --global init.defaultBranch main

# Authenticate GitHub CLI
echo "$GH_TOKEN" | gh auth login --with-token

# Configure npm if token exists
if [ -n "$NPM_TOKEN" ]; then
  echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
fi

echo "📦 Cloning repository inside container..."
cd /tmp
git clone "$REPO_URL" workspace
cd workspace

echo "🌿 Creating new branch: $NEW_BRANCH"
git checkout -b "$NEW_BRANCH"

echo "⚙️  Executing work inside container..."
# WORK COMMANDS WILL BE INSERTED HERE
# This section will be dynamically populated with the actual work

echo "✅ Work completed inside container"
SCRIPT_EOF

chmod +x .claude-container/work-script.sh
```

### Step 3: Execute Work Commands Inside Container

For each operation the user requests, add it to the work script and execute:

```bash
# Function to add command to work script
add_work_command() {
  local cmd="$1"
  # Insert before the "Work completed" line
  sed -i '' "/# This section will be dynamically populated/a\\
$cmd
" .claude-container/work-script.sh
}

# Example: Install dependencies
add_work_command "echo '📥 Installing dependencies...'"
add_work_command "npm install"

# Example: Make code changes
add_work_command "echo '✏️  Making code changes...'"
add_work_command "# [Your actual code changes here]"

# Example: Run tests
add_work_command "echo '🧪 Running tests...'"
add_work_command "npm test"

# Example: Build project
add_work_command "echo '🔨 Building project...'"
add_work_command "npm run build"
```

**Work Execution Strategy**:

- Use the TodoWrite tool to track each step of the requested work
- For each step, add the corresponding commands to the work script
- Commands execute in sequence inside the container
- All changes happen in the container's /tmp/workspace, NOT the host

### Step 4: Run Container with Isolated Work

**CRITICAL**: No volume mounts to the local repository! Everything happens inside the container.

```bash
# Run the container with the work script
# NOTE: We only mount the work-script.sh, NOT the repository
docker run --rm \
  --name claude-work-${TIMESTAMP} \
  -v "$(pwd)/.claude-container/work-script.sh:/work-script.sh:ro" \
  -e GH_TOKEN="${GH_TOKEN}" \
  -e NPM_TOKEN="${NPM_TOKEN}" \
  -e GIT_USER_NAME="${GIT_USER_NAME}" \
  -e GIT_USER_EMAIL="${GIT_USER_EMAIL}" \
  -e REPO_URL="${REPO_URL}" \
  -e NEW_BRANCH="${NEW_BRANCH}" \
  -e BASE_BRANCH="${BASE_BRANCH}" \
  -e TASK_DESCRIPTION="${TASK_DESCRIPTION}" \
  -e BASE_IMAGE="${BASE_IMAGE}" \
  claude-workspace:latest \
  /bin/bash /work-script.sh

# Check exit code
if [ $? -eq 0 ]; then
  echo "✅ Container work completed successfully"
else
  echo "❌ Container work failed"
  exit 1
fi
```

**Key Points**:

- Repository is cloned INSIDE the container (`/tmp/workspace`)
- No `-v $(pwd):/workspace` mount (local repo not touched!)
- All git operations happen inside the container
- Work script is read-only mount
- Local repository remains pristine

## Phase 4: Commit and Push Changes (Inside Container)

**IMPORTANT**: This phase happens INSIDE the container, not on the host!

The work script (from Phase 3) should include these commands at the end:

```bash
# Add to the work-script.sh template
cat >> .claude-container/work-script.sh << 'COMMIT_EOF'

echo "📝 Reviewing changes made in container..."
git status
git diff --stat

echo "💾 Staging all changes..."
git add -A

echo "📝 Creating commit..."
COMMIT_MSG="feat: containerized work - ${TASK_DESCRIPTION}

All work executed in isolated Docker container:
- Base image: ${BASE_IMAGE}
- Container: claude-workspace:latest
- Branch: ${NEW_BRANCH}

Changes made entirely inside container:
$(git diff --cached --stat)

🤖 Generated with Claude Code - Container Workflow
Co-Authored-By: Claude <noreply@anthropic.com>"

git commit -m "$COMMIT_MSG"

echo "🚀 Pushing branch to remote..."
git push -u origin "$NEW_BRANCH"

echo "✅ Changes committed and pushed from container"
COMMIT_EOF
```

**Verification**:

```bash
# After container completes, verify locally that nothing changed
git status  # Should show "nothing to commit, working tree clean"
git log -1  # Should show the last commit BEFORE container work
git branch  # Should NOT show the new branch

# The new branch exists ONLY on the remote
git fetch origin
git branch -r | grep "$NEW_BRANCH"  # Should show origin/$NEW_BRANCH
```

## Phase 5: Create Pull Request (On Host)

**Note**: The branch now exists on the remote. We fetch it and create a PR from the host without checking it out.

### Step 1: Fetch the New Branch

```bash
# Fetch the new branch that was pushed from the container
echo "📥 Fetching new branch from remote..."
git fetch origin "$NEW_BRANCH"

# Verify the branch exists on remote
if git branch -r | grep -q "origin/$NEW_BRANCH"; then
  echo "✅ Branch found on remote: origin/$NEW_BRANCH"
else
  echo "❌ Branch not found on remote. Container push may have failed."
  exit 1
fi
```

### Step 2: Generate PR Description

Create a comprehensive PR description:

```markdown
## Summary

[Brief description of what was accomplished]

## Work Environment

All changes were made in an **isolated Docker container** - your local repository was **never modified**:

- **Base Image**: `${BASE_IMAGE}`
- **Container**: `claude-workspace:latest`
- **Isolation**: Complete - repository cloned inside container
- **Local Impact**: Zero - local repository pristine

## Changes Made

[Bullet list of key changes]

## Testing

- [ ] All tests pass in container
- [ ] Build succeeds in container
- [ ] No linting errors
- [ ] Changes verified in isolated environment

## Implementation Details

<details>
<summary>Container Configuration</summary>

\`\`\`bash

# Dockerfile used

[Show Dockerfile content]
\`\`\`

</details>

<details>
<summary>Work Execution</summary>

All work happened inside the container:

1. Repository cloned to `/tmp/workspace` inside container
2. New branch created inside container
3. Changes made inside container
4. Tests run inside container
5. Committed and pushed from inside container
6. **Local repository never touched**

</details>

<details>
<summary>Commands Executed</summary>

\`\`\`bash
[List all commands executed in container]
\`\`\`

</details>

---

🤖 Generated with [Claude Code](https://claude.com/claude-code) - Container Workflow

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Step 3: Create the PR

```bash
# Determine base branch (usually main or master)
if [ -z "$BASE_BRANCH" ]; then
  BASE_BRANCH=$(git remote show origin | grep 'HEAD branch' | cut -d' ' -f5)
fi

# Create PR using gh (targeting the remote branch)
PR_URL=$(gh pr create \
  --base "$BASE_BRANCH" \
  --head "$NEW_BRANCH" \
  --title "Containerized Work: ${TASK_DESCRIPTION}" \
  --body "$(cat <<'EOF'
[Generated PR description from above]
EOF
)")

echo "✅ Pull Request Created: $PR_URL"
```

### Step 4: Add Labels and Metadata

```bash
# Add relevant labels
gh pr edit "$PR_URL" --add-label "automated,containerized,claude-code"

# Add reviewers if specified
if [ -n "$REVIEWERS" ]; then
  gh pr edit "$PR_URL" --add-reviewer "$REVIEWERS"
fi

# Add assignee (the current user)
gh pr edit "$PR_URL" --add-assignee "@me"
```

## Phase 6: Cleanup and Summary

### Step 1: Cleanup Container Artifacts

```bash
# Remove container working directory
rm -rf .claude-container/

# Clean up Docker image if requested
# docker rmi claude-workspace:latest

echo "✅ Cleanup complete"
```

### Step 2: Verify Local Repository Untouched

```bash
# Confirm local repository was never modified
echo "🔍 Verifying local repository state..."

LOCAL_STATUS=$(git status --porcelain)
if [ -z "$LOCAL_STATUS" ]; then
  echo "✅ Local repository pristine (no changes)"
else
  echo "⚠️  Local repository has changes (may be pre-existing)"
  git status
fi

# Verify we're still on the original branch
CURRENT=$(git branch --show-current)
echo "✅ Still on original branch: $CURRENT"

# Show that the new branch only exists on remote
echo "📍 New branch location: remote only"
git branch | grep "$NEW_BRANCH" || echo "  ✅ Not in local branches (as expected)"
git branch -r | grep "$NEW_BRANCH" && echo "  ✅ Found in remote branches"
```

### Step 3: Final Summary

Provide a comprehensive summary to the user:

```
✅ Containerized Workflow Complete!

📋 Summary:
- Branch: ${NEW_BRANCH} (remote only)
- Base Image: ${BASE_IMAGE}
- Commits: [number of commits]
- Files Changed: [number of files]
- Pull Request: ${PR_URL}

🔒 Isolation Verified:
- Local repository: ✅ Pristine (never modified)
- Local branch: ✅ Still on ${CURRENT_BRANCH}
- Work location: Container only (/tmp/workspace)
- Changes pushed: From container to remote

🔗 Next Steps:
1. Review the PR: ${PR_URL}
2. Request reviews from team members
3. Monitor CI/CD checks
4. Merge when ready

💡 To work with the branch locally (optional):
   git fetch origin
   git checkout ${NEW_BRANCH}

⚠️  Note: The branch exists ONLY on the remote until you check it out.
```

## Usage Examples

### Example 0: Multi-Agent Concurrent Workflow (PRIMARY USE CASE)

This is the **key benefit** of using containers: running multiple agents simultaneously!

```
Developer opens 3 Claude Code sessions and starts 3 agents in parallel:

┌─ Session 1 ─────────────────────────────────────┐
│ User: /tupe:container-pr                        │
│ User: "Add user authentication with JWT"        │
│                                                  │
│ Agent 1:                                         │
│ ✅ Container: node:20-bullseye                  │
│ ✅ Branch: claude/auth-jwt-20251111-0001        │
│ ⚙️  Installing passport, jsonwebtoken...        │
│ ⚙️  Creating auth middleware...                 │
│ ⚙️  Adding login/register routes...             │
│ ✅ Tests passing in container                   │
│ ✅ PR created: https://github.com/.../pull/123  │
└──────────────────────────────────────────────────┘

┌─ Session 2 ─────────────────────────────────────┐
│ User: /tupe:container-pr                        │
│ User: "Update all dependencies to latest"       │
│                                                  │
│ Agent 2:                                         │
│ ✅ Container: node:20-bullseye                  │
│ ✅ Branch: claude/deps-update-20251111-0002     │
│ ⚙️  Running npm update...                       │
│ ⚙️  Checking for breaking changes...            │
│ ⚙️  Running tests...                            │
│ ✅ All tests passing                            │
│ ✅ PR created: https://github.com/.../pull/124  │
└──────────────────────────────────────────────────┘

┌─ Session 3 ─────────────────────────────────────┐
│ User: /tupe:container-pr                        │
│ User: "Optimize database queries with indexes"  │
│                                                  │
│ Agent 3:                                         │
│ ✅ Container: python:3.11-bullseye              │
│ ✅ Branch: claude/db-indexes-20251111-0003      │
│ ⚙️  Analyzing query patterns...                 │
│ ⚙️  Adding database indexes...                  │
│ ⚙️  Running migration tests...                  │
│ ✅ Performance improved 3x                      │
│ ✅ PR created: https://github.com/.../pull/125  │
└──────────────────────────────────────────────────┘

🎉 Result: 3 PRs created in parallel!
   - No conflicts between agents
   - Each in clean, isolated environment
   - All working concurrently
   - Developer reviews 3 PRs simultaneously
```

**Why This Works**:

- Each agent runs in its own isolated Docker container
- Containers don't interfere with each other
- Each creates its own branch (different timestamps)
- Git operations are isolated per branch
- Host system remains clean
- Credentials safely shared across all containers

**Time Savings**:

- Sequential (one agent at a time): ~45 minutes (3 × 15 min)
- Parallel (three agents): ~15 minutes (max of all tasks)
- **3x faster development!**

### Example 1: Simple Feature Implementation

```
User: "Add a health check endpoint"

Agent:
1. Sets up container with Node.js
2. Creates health-check endpoint in src/routes/health.ts
3. Adds tests
4. Runs tests in container
5. Commits and creates PR
6. Returns: https://github.com/user/repo/pull/123
```

### Example 2: Dependency Update

```
User: "Update all dependencies to latest"

Agent:
1. Sets up container
2. Runs npm update in container
3. Runs tests in container
4. Commits updated package.json and lock file
5. Creates PR with dependency changes
6. Returns: https://github.com/user/repo/pull/124
```

## Error Handling

### Docker Not Available

```
❌ Docker is not installed or not running.

Please install Docker:
- macOS: https://docs.docker.com/desktop/install/mac-install/
- Linux: https://docs.docker.com/engine/install/
- Windows: https://docs.docker.com/desktop/install/windows-install/

Then ensure the Docker daemon is running:
docker ps
```

### GitHub CLI Not Authenticated

```
❌ GitHub CLI is not authenticated.

Please authenticate:
gh auth login

Then try again.
```

### Container Build Fails

```
❌ Failed to build container image.

Error: [show error]

Troubleshooting:
1. Check Docker daemon is running
2. Verify base image is available
3. Check network connectivity
4. Try building manually: docker build -t claude-workspace:latest .claude-container/
```

### Work Command Fails in Container

```
❌ Command failed in container: [command]

Exit code: [code]
Output: [show output]

Options:
1. Fix the error and retry
2. Skip this step (if non-critical)
3. Abort the workflow
```

## Important Notes

### Critical: Complete Isolation

**The local repository is NEVER modified**:

1. Container clones repository from remote (not from local files)
2. All work happens in container's `/tmp/workspace`
3. No volume mounts of the local repository
4. All git operations (branch, commit, push) happen in container
5. Local repository remains pristine on the original branch
6. New branch exists ONLY on remote until manually checked out

**This enables**:

- Multiple agents working simultaneously without conflicts
- Safe experimentation without affecting local state
- Clean rollback (just delete the remote branch)
- Guaranteed reproducibility

### Security Considerations

1. **Credentials**: GitHub and npm tokens are passed as environment variables, never written to files
2. **Complete Isolation**: Container has no access to local file system (except work script)
3. **Cleanup**: Tokens only exist during container runtime
4. **No Local Impact**: Local repository and file system completely protected

### Limitations

1. **Interactive Operations**: Commands requiring user input need special handling
2. **GUI Applications**: Not supported in container
3. **System-Level Changes**: Limited to what Docker allows
4. **Performance**: Slower than native (due to cloning and container overhead)
5. **Local Changes**: Local uncommitted changes are NOT included (container clones from remote)

### Best Practices

1. **Commit First**: If you have local changes you want included, commit and push them first
2. **Small Changes**: Best for focused, well-defined tasks
3. **Testing**: Always run tests in container before committing
4. **Branch Names**: Use descriptive branch names
5. **PR Descriptions**: Include all relevant context
6. **Cleanup**: Always clean up container artifacts
7. **Verify Isolation**: Check `git status` after completion to confirm no local changes

## Advanced Configuration

### Custom Dockerfile

If the user needs specific tools or configuration:

```dockerfile
FROM node:20-bullseye

# Custom tool installations
RUN apt-get update && apt-get install -y \
    postgresql-client \
    redis-tools \
    && rm -rf /var/lib/apt/lists/*

# Custom environment variables
ENV CUSTOM_VAR=value

WORKDIR /workspace
```

### Pre-configured Images

For faster execution, consider using pre-built images:

```bash
# Instead of building each time, use a pre-configured image
docker pull ghcr.io/user/claude-workspace:latest

# Or build once and reuse
docker build -t claude-workspace:local .claude-container/
```

### Multiple Services

If work requires multiple services (database, redis, etc.):

```bash
# Use docker-compose
cat > .claude-container/docker-compose.yml << 'EOF'
version: '3.8'
services:
  workspace:
    build: .
    volumes:
      - .:/workspace
    environment:
      - GH_TOKEN=${GH_TOKEN}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=dev
EOF

# Run work with docker-compose
docker-compose -f .claude-container/docker-compose.yml run workspace [command]
```

## Success Criteria

You have completed the containerized workflow when:

1. ✅ Docker container successfully created
2. ✅ All credentials properly configured
3. ✅ Repository cloned inside container (not mounted from host)
4. ✅ All requested work completed in container
5. ✅ All tests pass in container
6. ✅ Changes committed to new branch inside container
7. ✅ Branch pushed to remote from container
8. ✅ Pull request created successfully
9. ✅ PR URL provided to user
10. ✅ Container artifacts cleaned up
11. ✅ Local repository verified untouched (git status clean)
12. ✅ New branch exists only on remote (not in local branches)

---

**Now begin the containerized development workflow with complete isolation!**
