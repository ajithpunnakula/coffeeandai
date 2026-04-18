---
title: "Source - Claude Code Permission Modes"
type: source
date: 2026-04-13
source_file: "raw/choose-a-permission-mode.md"
tags: [claude-code, security, configuration]
---

# Source - Claude Code Permission Modes

[[Claude Code]] offers six permission modes that control the baseline level of autonomy during a session. **`default`**: only reads run without asking; every edit and command requires approval. **`acceptEdits`**: file edits and common filesystem Bash commands (`mkdir`, `touch`, `rm`, `rmdir`, `mv`, `cp`, `sed`, and process wrappers like `timeout`/`nice`/`nohup`) auto-approve for paths inside the working directory or `additionalDirectories`—all other Bash and out-of-scope paths still prompt. **`plan`**: same read access as default but Claude cannot make file edits or run commands; produces a plan for review before optionally switching to another mode. **`auto`**: a classifier model reviews every action before execution and blocks anything that escalates beyond the request, targets unrecognized infrastructure, or appears driven by hostile content—requires v2.1.83+, Team/Enterprise/API plan, Sonnet 4.6 or Opus 4.6, and Anthropic API (not Bedrock/Vertex/Foundry). **`dontAsk`**: auto-denies every tool not explicitly allowed via permission rules; designed for locked-down CI. **`bypassPermissions`**: skips all permission prompts except for protected paths; only for isolated containers/VMs.

Regardless of mode, a fixed set of **protected paths** are never auto-approved: `.git`, `.vscode`, `.idea`, `.husky`, and `.claude` (with exceptions for `.claude/commands`, `.claude/agents`, `.claude/skills`, `.claude/worktrees` where Claude routinely writes). Protected files include `.gitconfig`, `.gitmodules`, shell rc files (`.bashrc`, `.zshrc`, `.profile`, etc.), `.ripgreprc`, `.mcp.json`, and `.claude.json`. In `default`/`acceptEdits`/`plan`/`bypassPermissions`, these prompt; in `auto` they route to the classifier; in `dontAsk` they are denied.

Mode switching varies by interface. In the **CLI**, `Shift+Tab` cycles `default` → `acceptEdits` → `plan` (and optionally `bypassPermissions` then `auto` if enabled via flags). `--permission-mode <mode>` sets the mode at startup; `defaultMode` in settings persists it. In **VS Code**, a mode indicator at the bottom of the prompt box allows switching; the UI labels differ from mode names (e.g., "Edit automatically" = `acceptEdits`). **JetBrains** uses the same CLI cycling via `Shift+Tab`. **Desktop** has a mode selector near the send button. **Web/mobile** cloud sessions support only `acceptEdits` and `plan`; Remote Control sessions also exclude `auto` and `bypassPermissions`.

Auto mode uses a background classifier model (Sonnet 4.6) that evaluates actions against built-in block/allow rules plus organization-configured trusted infrastructure. It blocks `curl | bash`, mass cloud storage deletions, IAM permission grants, force pushes to main, and production deploys by default. It falls back to prompting if the classifier blocks 3 consecutive actions or 20 total in a session. Administrators can disable auto mode with `permissions.disableAutoMode: "disable"` in managed settings.

## Key Topics

- Six modes and their tradeoffs: `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`
- `acceptEdits` auto-approved Bash commands: `mkdir`, `touch`, `rm`, `rmdir`, `mv`, `cp`, `sed`, process wrappers
- Protected paths: `.git`, `.vscode`, `.idea`, `.husky`, `.claude`, shell rc files, `.mcp.json`
- Auto mode requirements: v2.1.83+, Team/Enterprise/API plan, Sonnet/Opus 4.6, Anthropic API only
- Auto mode classifier: blocks `curl|bash`, mass deletions, IAM grants, force-push to main
- Auto mode fallback: 3 consecutive blocks or 20 total → reverts to prompting
- CLI cycling via `Shift+Tab`; optional modes added with `--enable-auto-mode` / `--permission-mode`
- VS Code mode indicator UI labels vs. actual mode names
- Web/mobile session restrictions (no `auto` or `bypassPermissions` in cloud sessions)
- `bypassPermissions` warning: no prompt injection protection, only for isolated environments
- `dontAsk` for CI: auto-denies everything not in the allow list
- `disableBypassPermissionsMode` and `disableAutoMode` managed settings for enterprise lockdown
