# Issues

This folder contains project issues managed by [Centy](https://github.com/centy-io/centy-cli).

## LLM Instructions

If you are an AI/LLM assistant, read this section carefully.

### Issue Structure

Each issue is stored in its own folder (UUID or display number) with:

- `issue.md` - The issue content (title and description in markdown)
- `metadata.json` - Machine-readable metadata:
  - `displayNumber` - Human-friendly issue number
  - `status` - Current status (e.g., "open", "planning", "in-progress", "closed")
  - `priority` - Priority level (1 = highest)
  - `createdAt` / `updatedAt` - ISO 8601 timestamps

### Working with Issues

1. **Reading Issues**: You can freely read `issue.md` and `metadata.json` files to understand the project's issues.

2. **Modifying Issues**: Check `config.json` in the parent `.centy/` folder for the `llm` configuration section:
   - `llm.autoCloseOnComplete`: If `true`, you should update the issue status to "closed" after completing the work
   - `llm.updateStatusOnStart`: If `true`, you should update status to "in-progress" when starting work
   - `llm.allowDirectEdits`: If `true`, you may directly edit `metadata.json` to change status. If `false`, use the `centy` CLI instead

3. **Status Values**: Valid status values are defined in `config.json` under `allowedStates`. Default: `["open", "planning", "in-progress", "closed"]`

### Auto-Closing Issues

When `llm.autoCloseOnComplete` is `true` in `config.json`, you should close the issue after completing the requested work:

1. **When to close**: Close the issue when you have fully completed the task described in the issue. This includes:
   - All requested changes have been implemented
   - Tests pass (if applicable)
   - The build succeeds (if applicable)
   - No remaining work items from the issue description

2. **How to close**:
   - If `llm.allowDirectEdits` is `true`: Edit `metadata.json` and set `"status": "closed"` and update `"updatedAt"` to the current ISO 8601 timestamp
   - If `llm.allowDirectEdits` is `false`: Run `centy update issue <id> --status closed`

3. **When NOT to close**:
   - The task is only partially complete
   - You encountered errors or blockers
   - The user needs to review or approve before closing
   - The issue requires follow-up work

4. **After closing**: Inform the user that you have closed the issue and summarize what was accomplished.

### Planning Status

When an issue has status `"planning"`, a special blockquote note is embedded at the top of `issue.md`:

> **Planning Mode**: Do not implement code changes. Brainstorm with the user, create an action plan, and update this issue before transitioning to "in-progress".

**Important**: When you see this note:
- DO NOT write or modify code
- Focus on discussing the approach with the user
- Help create an action plan within the issue
- Only transition to "in-progress" when the user is ready to implement

When the status changes from "planning" to another state, this note is automatically removed.

### Best Practices

- Always read the full issue content before starting work
- Check the priority to understand urgency (1 = highest priority)
- Update status according to the project's `llm` configuration
- When closing an issue, update the `updatedAt` timestamp to the current ISO 8601 time
- Respect the planning mode when present - do not implement until transitioning out of planning
