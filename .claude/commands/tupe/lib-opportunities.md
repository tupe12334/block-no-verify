---
description: Analyze codebase for custom functions that could be replaced with npm packages to minimize custom logic
---

# Library Replacement Opportunity Analyzer

You are an expert code analyst focused on identifying custom implementations that could be replaced with well-maintained npm packages to reduce custom code and leverage battle-tested libraries.

## Your Mission

Perform a comprehensive analysis of the codebase to identify:

1. Custom utility functions that duplicate npm package functionality
2. Complex implementations that could use existing libraries
3. Opportunities to reduce maintenance burden and improve code quality
4. Generate a detailed report with actionable recommendations

## Phase 1: Codebase Discovery and Analysis

### Step 1: Map the Codebase Structure

1. **Identify all source directories**:

   ```bash
   # Find all TypeScript/JavaScript files
   find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.tsx" -o -name "*.jsx" \) \
     -not -path "*/node_modules/*" \
     -not -path "*/dist/*" \
     -not -path "*/build/*" \
     -not -path "*/.next/*" \
     | head -50
   ```

2. **Read package.json to understand current dependencies**:
   - Check existing dependencies to avoid suggesting already-used packages
   - Understand the project's tech stack and preferences
   - Note package manager (npm/pnpm/yarn)

3. **Create a todo list** to track analysis progress:
   - Utility functions analysis
   - Data manipulation functions
   - String/array operations
   - Date/time handling
   - File system operations
   - HTTP/API utilities
   - Validation functions
   - Cryptography/security
   - Other custom implementations

### Step 2: Systematic Code Analysis

Use the **Explore agent** to analyze different code categories:

#### Category 1: Utility Functions

Look for custom implementations of:

- Array manipulation (map, reduce, filter extensions)
- Object operations (deep clone, merge, pick, omit)
- Type checking utilities
- Debounce/throttle functions
- Memoization helpers
- Retry logic
- Sleep/delay functions

**Common replacements**: lodash, ramda, radash, remeda

#### Category 2: String Operations

Look for:

- String formatting/templating
- Slug generation
- String validation
- Case conversion utilities
- String sanitization
- Pluralization logic

**Common replacements**: string-lib, slugify, pluralize, camelcase, change-case

#### Category 3: Date/Time Handling

Look for:

- Date parsing/formatting
- Date arithmetic
- Timezone handling
- Relative time calculations
- Date validation

**Common replacements**: date-fns, dayjs, luxon, ms

#### Category 4: Validation

Look for:

- Schema validation
- Email/URL validation
- Input sanitization
- Type validation

**Common replacements**: zod, yup, joi, validator

#### Category 5: Data Structures

Look for:

- Custom queue/stack implementations
- LRU cache implementations
- Event emitters
- State machines
- Graph/tree structures

**Common replacements**: eventemitter3, lru-cache, xstate, graphology

#### Category 6: Async/Promise Utilities

Look for:

- Promise wrappers
- Async queue/pool implementations
- Retry with backoff
- Timeout wrappers
- Parallel execution helpers

**Common replacements**: p-queue, p-retry, p-timeout, p-limit, promise-pool

#### Category 7: File/Path Operations

Look for:

- Path manipulation
- File reading/writing wrappers
- Directory traversal
- Glob pattern matching
- File watching

**Common replacements**: globby, fast-glob, chokidar, fs-extra

#### Category 8: HTTP/API Utilities

Look for:

- HTTP client wrappers
- Request retry logic
- URL building/parsing
- API response handling
- Query string manipulation

**Common replacements**: ky, axios, ofetch, query-string

#### Category 9: Parsing/Serialization

Look for:

- JSON parsing with error handling
- CSV parsing
- XML parsing
- YAML parsing
- Query string parsing

**Common replacements**: superjson, papaparse, fast-xml-parser, yaml

#### Category 10: Cryptography/Hashing

Look for:

- UUID generation
- Hash generation
- Random string generation
- Encryption/decryption
- Password hashing

**Common replacements**: uuid, nanoid, crypto-js, bcrypt

#### Category 11: Testing Utilities

Look for:

- Test data generators
- Mock factories
- Assertion helpers
- Test utilities

**Common replacements**: faker, factory.ts, test-data-bot

#### Category 12: Error Handling

Look for:

- Custom error classes
- Error formatting
- Error tracking utilities

**Common replacements**: custom-error, http-errors, error-stack-parser

## Phase 2: Research and Validation

For each identified opportunity:

### Step 1: Verify Package Exists and is Maintained

Use web search to:

1. Find the most popular package for the use case
2. Check npm download statistics
3. Verify maintenance status (recent updates, active issues)
4. Check bundle size impact
5. Review security advisories

### Step 2: Analyze Migration Complexity

- **Low**: Simple drop-in replacement, minimal API changes
- **Medium**: Some refactoring needed, moderate API differences
- **High**: Significant refactoring, major architectural changes

### Step 3: Calculate Value Score

Consider:

- **Lines of code saved**: More custom code removed = higher value
- **Maintenance burden reduced**: Complex logic = higher value
- **Bug risk reduced**: Security/crypto/parsing = higher value
- **Feature enhancement**: Package offers more features = higher value
- **Performance impact**: Package is faster = higher value

Score: **High** (>100 LOC or critical functionality) | **Medium** (20-100 LOC) | **Low** (<20 LOC)

## Phase 3: Generate Comprehensive Report

Create a detailed markdown report: `lib-opportunities-report.md`

### Report Structure

````markdown
# Library Replacement Opportunities Report

**Generated**: [Date]
**Codebase**: [Project Name]
**Total Opportunities Found**: [Number]
**Estimated LOC Reduction**: [Number]

## Executive Summary

[2-3 paragraph overview of findings, highlighting highest-value opportunities]

## Quick Wins (High Value, Low Complexity)

For each opportunity in priority order:

### [#1] Replace Custom [Functionality] with [Package Name]

**Value**: High | Medium | Low
**Complexity**: Low | Medium | High
**Priority**: 🔴 Critical | 🟡 High | 🟢 Medium | ⚪ Low

**Current Implementation**:

- File(s): `path/to/file.ts:123-156`
- Lines of Code: ~34 LOC
- What it does: [Brief description]

**Suggested Package**: `[package-name]` v[version]

- NPM: https://npmjs.com/package/[package-name]
- Weekly downloads: [number]
- Bundle size: [size] (minified + gzipped)
- Last updated: [date]
- Maintenance: ✅ Active | ⚠️ Stale | ❌ Abandoned

**Benefits**:

- ✅ Reduces custom code by ~34 LOC
- ✅ Battle-tested with [X] weekly downloads
- ✅ Better performance (if applicable)
- ✅ More features (list specific features)
- ✅ Active maintenance and security updates
- ✅ TypeScript support

**Migration Effort**:

- Estimated time: [hours/days]
- Breaking changes: Yes/No
- Test coverage needed: Yes/No
- API comparison:

  ```typescript
  // Current
  const result = ourCustomFunction(input)

  // With package
  import { packageFunction } from 'package-name'
  const result = packageFunction(input)
  ```
````

**Risks/Considerations**:

- 📦 Adds dependency ([size])
- ⚠️ [Any specific concerns]

**Recommendation**: ✅ Implement | ⏸️ Consider | ❌ Skip
**Reasoning**: [Why or why not to implement]

---

[Repeat for each opportunity]

## Medium Complexity Opportunities

[Same format as above for medium complexity items]

## High Complexity Opportunities

[Same format as above for high complexity items]

## Rejected/Not Recommended

[List analyzed code that should NOT be replaced and why]

### [Functionality Name]

**Reason**: [Why custom implementation is better]

- Custom logic is simpler
- No suitable package exists
- Package is too heavy/unmaintained
- Performance requirements
- Security concerns

## Summary Statistics

| Category   | Opportunities | Total LOC Saved | New Dependencies | Net Benefit  |
| ---------- | ------------- | --------------- | ---------------- | ------------ |
| Utilities  | X             | XXX             | X                | High/Med/Low |
| Date/Time  | X             | XXX             | X                | High/Med/Low |
| Validation | X             | XXX             | X                | High/Med/Low |
| ...        | ...           | ...             | ...              | ...          |
| **Total**  | **XX**        | **XXXX**        | **XX**           | **High**     |

## Implementation Roadmap

### Phase 1: Quick Wins (Week 1)

1. [Opportunity #1]
2. [Opportunity #2]
   ...

### Phase 2: Medium Complexity (Week 2-3)

1. [Opportunity #X]
   ...

### Phase 3: High Complexity (Week 4+)

1. [Opportunity #Y]
   ...

## Package Installation Commands

```bash
# All recommended packages
pnpm add [package1] [package2] [package3]

# Dev dependencies
pnpm add -D [dev-package1] [dev-package2]
```

## Next Steps

1. Review this report with the team
2. Prioritize opportunities based on value/complexity
3. Start with Quick Wins to build momentum
4. Create implementation tickets for each opportunity
5. Update this report after each implementation

## Appendix

### Analysis Methodology

- [Describe search patterns used]
- [Tools and commands used]
- [Files analyzed vs skipped]

### Package Evaluation Criteria

- Minimum weekly downloads: 10,000
- Maximum bundle size: 50KB (with exceptions)
- Last update: Within 12 months
- TypeScript support: Preferred
- Zero known critical vulnerabilities

````

## Phase 4: Implementation Assistance (Optional)

After generating the report, offer to help with implementation:

```markdown
## 🚀 Ready to Implement?

I've identified **[X]** opportunities to replace custom code with npm packages.

Would you like me to:
1. **Start with Quick Wins** - Implement the highest value, lowest complexity changes
2. **Implement Specific Item** - Pick any opportunity from the report
3. **Create Implementation Tickets** - Generate detailed tasks for each opportunity
4. **Just Review** - Review the report and decide later

Let me know how you'd like to proceed!
````

## Important Guidelines

### DO:

- ✅ Use the **Explore agent** extensively to find custom implementations
- ✅ Search across all source directories systematically
- ✅ Research packages thoroughly before recommending
- ✅ Consider bundle size impact
- ✅ Verify package maintenance status
- ✅ Calculate realistic migration complexity
- ✅ Provide code comparison examples
- ✅ Check for security vulnerabilities in recommended packages
- ✅ Consider the project's existing tech stack and patterns
- ✅ Include both pros and cons for each recommendation

### DO NOT:

- ❌ Recommend unmaintained or abandoned packages
- ❌ Suggest packages with known security vulnerabilities
- ❌ Ignore bundle size impact
- ❌ Recommend replacing simple helpers with heavy libraries
- ❌ Skip analyzing test files and utilities
- ❌ Assume all custom code should be replaced
- ❌ Forget to check existing dependencies first
- ❌ Recommend packages without verifying they exist and are suitable

## Analysis Process

### Step-by-Step Execution

1. **Initialize**: Read package.json, understand project structure
2. **Create Todo List**: Track all analysis categories
3. **Launch Explore Agents**: One for each major category (parallel if possible)
4. **Collect Findings**: Aggregate all opportunities from agents
5. **Research Packages**: For each finding, research best package option
6. **Score & Prioritize**: Calculate value and complexity for each
7. **Generate Report**: Create comprehensive markdown report
8. **Offer Next Steps**: Ask user how they want to proceed

### Using the Explore Agent

For each category, launch an Explore agent with specific instructions:

```
Analyze the codebase for [category] implementations. Look for:
- [Specific patterns to find]
- [Functions/utilities that match]
- [Code smells indicating duplication]

For each finding, provide:
- File path and line numbers
- What the code does
- Approximate LOC
- Complexity assessment

Focus on finding substantial implementations that would benefit from using a library.
```

## Success Criteria

You are done when:

1. ✅ All source code has been systematically analyzed
2. ✅ All opportunities have been researched and validated
3. ✅ Comprehensive report is generated with all sections complete
4. ✅ Each opportunity has clear value/complexity/priority scores
5. ✅ Implementation roadmap is provided
6. ✅ User is offered clear next steps

## Output Files

Generate these files:

- `lib-opportunities-report.md` - Main comprehensive report
- Keep all analysis notes in your working memory for reference

---

Now begin the comprehensive library replacement opportunity analysis!
