# Agent Guidelines

This document provides guidance for AI coding agents working on this codebase.

## Build, Test, and Run

See [CONTRIBUTING.md](./CONTRIBUTING.md) for complete development setup instructions.

### Quick Reference

```bash
# Install dependencies
bun install

# Build everything
bun run build

# Run tests
bun test

# Type check
bun run typecheck

# Lint
bun run lint
```

## Release

Use the **Release** GitHub Actions workflow (`workflow_dispatch`, see `.github/workflows/release.yml`). It typechecks, lints, tests, bumps the version in `package.json` / `.claude-plugin/plugin.json` / `README.md`, rebuilds the native module and hook bundle, commits, tags, publishes to npm with provenance, and creates a GitHub Release. Tags have no `v` prefix.

### Version Decision

- If the user specifies an exact version (e.g., `1.5.0`), use it as-is.
  Otherwise, decide the bump level from the changes since the last release (never bump major unless the user explicitly asks):
  - **minor** — New features, new agent support, new events or config options, breaking changes
  - **patch** — Bug fixes, refactors, docs, dependency updates, minor improvements
- Never ask the user which version to bump. Decide and proceed.

## Testing with AI Agents

This project is a plugin for AI coding agents. To test changes interactively:

### Using tmux Interactive Sessions

Use tmux to run Claude Code or OpenCode in an interactive session for real-time testing:

```bash
# Start a new tmux session for testing
tmux new-session -s vibe-test

# Inside tmux, run with local plugin presets
bun run dev:claude
# or
bun run dev:opencode
```

**Why tmux?** It allows you to:
- Keep the agent session running while making code changes
- Observe haptic feedback behavior in real-time
- Test multiple patterns and configurations interactively
- Detach/reattach without losing session state

### Testing Workflow

1. **Build first**: `bun run build`
2. **Start tmux session**: `tmux new-session -s vibe-test`
3. **Run the agent** with local plugin loaded
4. **Test haptic patterns** by triggering events (task completion, prompts, etc.)
5. **Make changes**, rebuild, and restart the agent to test
