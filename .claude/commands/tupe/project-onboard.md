---
description: Comprehensive project onboarding - learn everything about the codebase
allowed-tools: *
---

# Project Onboarding

Conduct a comprehensive exploration and learning session about the current project. This command helps you understand the project architecture, structure, technologies, conventions, and current state.

## Current State

### Repository Information

- Current directory: !`pwd`
- Current branch: !`git branch --show-current 2>/dev/null || echo "N/A"`
- Repository status: !`git status --short 2>/dev/null | head -10 || echo "N/A"`
- Last commit: !`git log -1 --oneline 2>/dev/null || echo "N/A"`

### Project Structure Overview

- Root contents: !`ls -la | head -20`
- Source directories: !`find . -maxdepth 2 -type d ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/build/*" 2>/dev/null | head -30 || echo "Unable to list directories"`
- Configuration files: !`find . -maxdepth 2 -type f \( -name "package.json" -o -name "tsconfig.json" -o -name "*.config.*" -o -name ".*rc*" \) ! -path "*/node_modules/*" 2>/dev/null || echo "No config files found"`

### Documentation

- README files: !`find . -maxdepth 3 -name "README*" ! -path "*/node_modules/*" 2>/dev/null || echo "No README found"`
- Documentation files: !`find . -maxdepth 3 -name "*.md" ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null | head -20 || echo "No docs found"`
- CLAUDE.md (project instructions): @CLAUDE.md
- Main README: @README.md

## Instructions

**IMPORTANT**: This command initiates a comprehensive learning session. Your goal is to become deeply familiar with the project.

### Phase 1: Documentation Review

1. **Read Core Documentation**:
   - Start with README.md to understand project purpose and setup
   - Read CLAUDE.md for project-specific AI instructions
   - Review any CONTRIBUTING.md or DEVELOPMENT.md files
   - Check CHANGELOG.md or release notes for recent changes

### Phase 2: Project Configuration Analysis

1. **Package Management**:
   - Read package.json (Node.js projects)
   - Check requirements.txt, pyproject.toml (Python projects)
   - Review Cargo.toml (Rust), go.mod (Go), pom.xml (Java)
   - Understand dependencies and scripts

2. **Build & Development Configuration**:
   - TypeScript: tsconfig.json
   - Bundlers: webpack.config.js, vite.config.js, rollup.config.js
   - Linting: .eslintrc, eslint.config.mjs
   - Testing: jest.config.js, vitest.config.js
   - Formatting: .prettierrc

3. **Environment & Deployment**:
   - Check for .env.example or environment documentation
   - Review Docker files if present
   - Check CI/CD configurations (.github/workflows/, .gitlab-ci.yml)

### Phase 3: Codebase Exploration

1. **Identify Entry Points**:
   - Main application entry: index.ts, main.ts, app.ts, server.ts, cli.ts
   - Package entry: Check "main" and "exports" in package.json
   - Script commands: Review npm/pnpm scripts

2. **Explore Directory Structure**:
   - Identify main source directories (src/, lib/, app/)
   - Understand organization patterns (feature-based, layer-based)
   - Locate tests (\*.spec.ts files next to logic, or test/ directories)
   - Find documentation (docs/, documentation/)

3. **Analyze Code Patterns**:
   - Identify architectural patterns (MVC, microservices, modular)
   - Check coding conventions (naming, file organization)
   - Review common utilities and shared code
   - Understand import/export patterns

### Phase 4: Technology Stack Understanding

1. **Core Technologies**:
   - Programming language(s) and version
   - Primary framework(s)
   - Database(s) if applicable
   - Key libraries and their purposes

2. **Development Tools**:
   - Package manager (npm, pnpm, yarn, pip, cargo)
   - Build tools and bundlers
   - Testing frameworks
   - Linting and formatting tools

3. **Architecture & Patterns**:
   - Application architecture (monolith, microservices, serverless)
   - Design patterns in use
   - State management approach (if frontend)
   - API patterns (REST, GraphQL, gRPC)

### Phase 5: Current State Analysis

1. **Recent Activity**:
   - Review last 5-10 commits to understand recent work
   - Check git status for any uncommitted changes
   - Look for work-in-progress features or branches

2. **Project Health**:
   - Check for obvious issues or todos
   - Look for deprecated code markers
   - Review any open issues or tasks
   - Check test coverage if available

3. **Development Workflow**:
   - Understand how to install dependencies
   - Know how to run the development environment
   - Learn how to run tests
   - Understand the build process

### Phase 6: Special Features & Integrations

1. **Custom Commands & Tooling**:
   - Check .claude/commands/ for custom slash commands
   - Review .claude/agents/ for custom agents
   - Check for project-specific scripts

2. **Integrations**:
   - External services
   - APIs consumed or provided
   - Third-party tools and platforms

3. **Notable Features**:
   - Unique or complex functionality
   - Core business logic
   - Performance-critical areas

## Output Requirements

Provide a comprehensive onboarding summary including:

### 1. Project Overview

- **Name**: Project name
- **Purpose**: What the project does in 1-2 sentences
- **Type**: CLI tool, web app, library, API, etc.
- **Status**: Active development, maintenance mode, production-ready

### 2. Technology Stack

- **Language**: Primary language(s) and versions
- **Framework**: Main framework(s)
- **Key Dependencies**: Important libraries (5-10 most critical)
- **Tools**: Build tools, testing frameworks, linters

### 3. Project Structure

- **Organization**: How the codebase is organized
- **Entry Points**: Main files to start exploring
- **Key Directories**: Purpose of each major directory
- **Conventions**: Naming and organizational patterns

### 4. Development Workflow

- **Setup**: How to get started (installation steps)
- **Running**: How to run the project locally
- **Testing**: How to run tests
- **Building**: How to build for production
- **Common Commands**: 5-10 most used commands

### 5. Architecture & Patterns

- **Architecture**: Overall system design
- **Design Patterns**: Key patterns in use
- **Code Style**: Conventions and standards
- **Best Practices**: Project-specific guidelines

### 6. Current State

- **Recent Work**: What's been worked on recently
- **Active Features**: Any in-progress development
- **Known Issues**: Any obvious problems or todos
- **Next Steps**: Potential areas to focus on

### 7. Learning Resources

- **Key Files to Read**: Most important files for understanding the project
- **Documentation**: Where to find more information
- **Examples**: Example code or usage
- **Related Projects**: Dependencies or related repositories

## Exploration Strategy

Use these tools effectively:

1. **Read**: For reading documentation and key files
2. **Glob**: For finding files by pattern (_.ts, _.test.js, etc.)
3. **Grep**: For searching code patterns and keywords
4. **Bash**: For running analysis commands
5. **Task**: For complex exploration that needs an Explore agent

### Recommended Exploration Order

1. Start broad: README, package.json, root-level configs
2. Explore structure: Directory layout and organization
3. Dive into code: Entry points, core modules, utilities
4. Understand workflows: Scripts, tests, build processes
5. Check current state: Git history, active work

## Important Notes

- **Be Thorough**: This is a learning session, take time to explore deeply
- **Ask Questions**: If something is unclear, note it in your summary
- **Take Notes**: Document your findings as you learn
- **Identify Gaps**: Note any missing documentation or unclear areas
- **Be Systematic**: Follow the phases in order for complete coverage
- **Use Context**: Connect the dots between different parts of the project

## Success Criteria

You should be able to answer:

- ✓ What does this project do?
- ✓ How is it architected?
- ✓ What technologies does it use?
- ✓ How do I set it up and run it?
- ✓ Where is the main code logic?
- ✓ How are tests organized?
- ✓ What are the key conventions?
- ✓ What's the current development state?
- ✓ Where would I start to add a new feature?
- ✓ What are the project's priorities and direction?

After completing this onboarding, you should feel confident working on any part of the project.
