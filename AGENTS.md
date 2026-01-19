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
