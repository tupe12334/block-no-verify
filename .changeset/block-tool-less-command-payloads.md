---
'block-no-verify': patch
---

Block hook payloads that carry a command but no tool name. A payload sent without the caller-identifying envelope (for example `{"tool_input":{"command":"git commit --no-verify -m x"}}`) is normalized by polyhook to a `notification` event with the command extracted but no tool name, and was approved because `isToolCall` required a non-empty tool name. Such an event is now inspected whenever it carries a non-empty `input.command`, so a hook bypass is no longer approved merely because the caller could not be identified.
