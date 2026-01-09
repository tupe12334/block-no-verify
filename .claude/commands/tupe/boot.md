---
description: Onboard to project and boot all services with verification
allowed-tools: *
---

# Project Boot & Verification

Complete project onboarding and then boot/start all project services with comprehensive verification to ensure everything is working correctly.

## Current State

### System Information

- Current directory: !`pwd`
- Current branch: !`git branch --show-current 2>/dev/null || echo "N/A"`
- Node version: !`node --version 2>/dev/null || echo "Node.js not found"`
- npm version: !`npm --version 2>/dev/null || echo "npm not found"`
- pnpm version: !`pnpm --version 2>/dev/null || echo "pnpm not found"`
- Python version: !`python --version 2>/dev/null || python3 --version 2>/dev/null || echo "Python not found"`

### Project Configuration

- Package file: @package.json
- Dependencies status: !`git status package-lock.json pnpm-lock.yaml yarn.lock 2>/dev/null | head -5 || echo "No lock files found"`
- Node modules: !`[ -d "node_modules" ] && echo "✓ node_modules exists" || echo "✗ node_modules missing - needs installation"`

### Environment

- Environment example: @.env.example
- Environment file: !`[ -f ".env" ] && echo "✓ .env exists" || echo "⚠ .env missing - may need to be created from .env.example"`
- Docker: !`docker --version 2>/dev/null || echo "Docker not installed"`
- Docker Compose: !`docker-compose --version 2>/dev/null || echo "Docker Compose not installed"`

## Instructions

**IMPORTANT**: This command performs a complete project onboarding followed by booting all services and verifying they work correctly.

### Phase 1: Project Onboarding

First, run the comprehensive project onboarding to learn everything about the project:

```
/tupe:project-onboard
```

**Wait for the onboarding to complete** before proceeding to the next phase. You should understand:

- Project purpose and architecture
- Technology stack and dependencies
- How to install, run, test, and build
- Current project state
- Key conventions and patterns

### Phase 2: Environment Setup

1. **Check Dependencies**:
   - Verify package manager is installed (npm, pnpm, yarn, pip, cargo)
   - Check if node_modules/ (or equivalent) exists
   - Review lock files to understand dependency state

2. **Install Dependencies** (if needed):
   - Analyze the project from Phase 1 onboarding to understand:
     - What package manager is used (check lock files, package.json scripts, documentation)
     - What dependency files exist (package.json, requirements.txt, Cargo.toml, go.mod, etc.)
     - Whether dependencies are already installed (node_modules/, venv/, target/, etc.)
   - Determine the correct installation command based on your analysis
   - Execute the appropriate command to install dependencies
   - Verify installation was successful

3. **Environment Configuration**:
   - Check if .env file exists
   - If not, check for .env.example and guide user to create .env
   - Verify required environment variables are documented
   - Note any missing configurations

### Phase 3: Pre-Boot Verification

Before booting, verify the project is ready:

1. **Type Checking** (for TypeScript):

   ```bash
   # Check for type errors
   npx tsc --noEmit
   # or
   npm run type-check
   # or
   pnpm type-check
   ```

2. **Linting** (if configured):

   ```bash
   npm run lint
   # or
   pnpm lint
   ```

3. **Build** (if required before running):
   ```bash
   npm run build
   # or
   pnpm build
   ```

### Phase 4: Boot Services

Identify and start all necessary services:

1. **Identify Start Commands**:
   - Check package.json scripts for: "start", "dev", "serve", "watch"
   - Check for docker-compose.yml for containerized services
   - Look for Procfile, Makefile, or custom start scripts
   - Review README for startup instructions

2. **Start Primary Service**:
   Based on project type, run the appropriate command:

   **Web Applications**:

   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   npm start
   ```

   **API Servers**:

   ```bash
   npm run start:dev
   # or
   pnpm start:dev
   ```

   **CLI Tools**:

   ```bash
   npm run build && npm link
   # or test locally
   node dist/cli.js
   ```

   **Docker Services**:

   ```bash
   docker-compose up -d
   ```

3. **Start Additional Services** (if needed):
   - Database containers
   - Redis/cache services
   - Background workers
   - Development proxies

### Phase 5: Verification & Testing

After booting, verify everything is working:

1. **Service Health Checks**:
   - Check if processes are running
   - Verify no error messages in console output
   - Check logs for any warnings or errors
   - For web apps: Try to access the local URL (usually http://localhost:3000 or similar)
   - For APIs: Test a health check endpoint if available

2. **Run Tests**:

   ```bash
   # Unit tests
   npm test
   # or
   pnpm test

   # E2E tests (if quick enough)
   npm run test:e2e
   # or
   pnpm test:e2e
   ```

3. **Build Verification**:

   ```bash
   # Verify production build works
   npm run build
   # or
   pnpm build
   ```

4. **Diagnostics** (check for issues):
   ```bash
   # Get IDE diagnostics if available
   # Use the mcp__ide__getDiagnostics tool
   ```

### Phase 6: Tool Preparation

Ensure your tools are ready for development:

1. **Git Status Check**:

   ```bash
   git status
   git log -5 --oneline
   ```

2. **Available Commands**:
   - List all custom Claude commands: `ls .claude/commands/`
   - List custom agents: `ls .claude/agents/`
   - Show npm/pnpm scripts: Read package.json scripts section

3. **Development Tools**:
   - Verify linting works: Try `/tupe:lint` if errors exist
   - Review available slash commands

## Output Requirements

Provide a comprehensive boot report including:

### 1. Onboarding Summary

- Brief recap of project understanding
- Key takeaways from onboarding phase

### 2. Environment Status

- ✓/✗ Dependencies installed
- ✓/✗ Environment configured
- ✓/✗ Build successful
- ✓/✗ Type checking passed
- ✓/✗ Linting passed

### 3. Services Status

- **Primary Service**: Running on [URL/port] or process details
- **Additional Services**: Status of each service
- **Logs**: Any important warnings or errors

### 4. Verification Results

- ✓/✗ Tests passed (with summary)
- ✓/✗ Health checks passed
- ✓/✗ Build completed successfully
- ✓/✗ No critical diagnostics

### 5. Ready for Development

- **Project is ready**: Yes/No
- **Access URLs**: Local development URLs if applicable
- **Next steps**: Suggested actions or areas to explore
- **Known issues**: Any problems encountered during boot

### 6. Available Tools & Commands

- Key npm/pnpm scripts you can use
- Custom Claude commands available
- Useful development workflows

## Error Handling

If any step fails:

1. **Diagnose the Issue**:
   - Read error messages carefully
   - Check logs for more details
   - Review configuration files

2. **Attempt Recovery**:
   - For dependency issues: Clear cache and reinstall
   - For build issues: Check for missing environment variables
   - For port conflicts: Identify and stop conflicting processes

3. **Report to User**:
   - Clearly state what failed
   - Provide the error message
   - Suggest potential solutions
   - Ask for user input if needed

## Important Notes

- **Background Processes**: Use `run_in_background: true` for long-running services
- **Port Availability**: Check if required ports are already in use
- **Resource Requirements**: Note if the project needs significant resources
- **First-Time Setup**: May take longer due to downloads and builds
- **Incremental Progress**: Complete each phase before moving to the next
- **Keep User Informed**: Provide regular status updates

## Success Criteria

After completing this command, you should have:

- ✓ Complete understanding of the project
- ✓ All dependencies installed
- ✓ Environment properly configured
- ✓ All services running without errors
- ✓ Tests passing
- ✓ Build working
- ✓ Ready to start development work
- ✓ Know what tools and commands are available

## Quick Reference

Common issues and solutions:

| Issue                        | Solution                                                 |
| ---------------------------- | -------------------------------------------------------- |
| Dependencies fail to install | Clear cache: `npm/pnpm/yarn cache clean` then reinstall  |
| Port already in use          | Find and kill process: `lsof -ti:PORT \| xargs kill -9`  |
| Build fails                  | Check for missing env vars or TypeScript errors          |
| Tests fail                   | May be expected - review test output and fix if critical |
| Service won't start          | Check logs, verify dependencies, ensure ports are free   |

## Follow-Up Actions

After successful boot:

1. **Explore the running app** (if web-based)
2. **Review active specifications** if any exist
3. **Check for high-priority issues** or todos
4. **Familiarize yourself with the codebase** by exploring key files
5. **Ready to accept development tasks** from the user

You're now fully onboarded and ready to contribute to the project!
