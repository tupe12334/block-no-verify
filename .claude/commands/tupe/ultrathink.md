---
description: Deep thinking mode - continue current task with enhanced analysis
allowed-tools: *
---

# Ultra Think Mode

Continue with the current task at hand using deep, methodical thinking and analysis.

## Context Awareness

### Current State

- Current working directory: !`pwd`
- Git branch: !`git branch --show-current 2>/dev/null || echo "N/A"`
- Git status summary: !`git status --short 2>/dev/null | head -10 || echo "N/A"`
- Recent files modified: !`git diff --name-only HEAD 2>/dev/null | head -10 || echo "N/A"`

### Recent Activity

- Last commit: !`git log -1 --oneline 2>/dev/null || echo "N/A"`
- Last 5 commits: !`git log -5 --pretty=format:"%h - %s (%ar)" 2>/dev/null || echo "N/A"`

## Instructions

**IMPORTANT**: This command activates "ultrathink mode" - a state of deep, methodical analysis and continuation.

### Your Task

1. **Analyze the current context thoroughly**:
   - Review git status and recent changes
   - Identify what task is currently in progress
   - Examine recent commit history for context

2. **Continue with the current task**:
   - If there are uncommitted changes, analyze what's being worked on and continue
   - If unclear what the current task is, ask the user for clarification
   - Use all available context to understand the state and continue purposefully

3. **Apply enhanced thinking**:
   - Think deeply about the problem at hand
   - Consider edge cases and potential issues
   - Analyze the broader context and implications
   - Make thoughtful, well-reasoned decisions
   - Document your reasoning as you work

4. **Be proactive**:
   - Identify and address potential issues before they become problems
   - Look for opportunities to improve code quality
   - Consider testing and validation needs
   - Think about future maintainability

### Approach

- Take your time to think through each step carefully
- Consider multiple approaches before choosing the best one
- Validate your work as you go
- Keep the user informed of your progress and reasoning
- Use the TodoWrite tool to track your progress if the task is complex

### Output

Provide clear, detailed explanations of:

- What you understand the current task to be
- Your approach and reasoning
- Each step you're taking
- Any decisions you're making and why
- Progress updates throughout

Continue working on the current task with deep thinking and analysis until completion or until you need user input.
