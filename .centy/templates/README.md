# Templates

This folder contains templates for creating issues and docs using [Handlebars](https://handlebarsjs.com/) syntax.

## Usage

To use a template, specify the `template` parameter when creating an issue or doc:
- Issues: Place templates in `templates/issues/` (e.g., `bug-report.md`)
- Docs: Place templates in `templates/docs/` (e.g., `api.md`)

## Available Placeholders

### Issue Templates
| Placeholder | Description |
|-------------|-------------|
| `{{title}}` | Issue title |
| `{{description}}` | Issue description |
| `{{priority}}` | Priority number (1 = highest) |
| `{{priority_label}}` | Priority label (e.g., "high", "medium", "low") |
| `{{status}}` | Issue status |
| `{{created_at}}` | Creation timestamp |
| `{{custom_fields}}` | Map of custom field key-value pairs |

### Doc Templates
| Placeholder | Description |
|-------------|-------------|
| `{{title}}` | Document title |
| `{{content}}` | Document content |
| `{{slug}}` | URL-friendly slug |
| `{{created_at}}` | Creation timestamp |
| `{{updated_at}}` | Last update timestamp |

## Handlebars Features

Templates support full Handlebars syntax:

### Conditionals
```handlebars
{{#if description}}
## Description
{{description}}
{{/if}}
```

### Loops
```handlebars
{{#each custom_fields}}
- **{{@key}}:** {{this}}
{{/each}}
```

## Example Templates

### Issue Template (`templates/issues/bug-report.md`)
```handlebars
# Bug: {{title}}

**Priority:** {{priority_label}} | **Status:** {{status}}

## Description
{{description}}

{{#if custom_fields}}
## Additional Info
{{#each custom_fields}}
- {{@key}}: {{this}}
{{/each}}
{{/if}}
```

### Doc Template (`templates/docs/api.md`)
```handlebars
---
title: "{{title}}"
slug: "{{slug}}"
---

# API: {{title}}

{{content}}
```
