---
'block-no-verify': patch
---

Stop blocking a command that writes a file through a quoted heredoc (`cat > run.mjs <<'EOF'`) when the body holds `${…}` text such as a JavaScript template literal. A quoted delimiter stops every expansion, so those characters are escaped before the body reaches the shell parser instead of failing the parse.
