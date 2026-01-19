# Contributing

Thank you for your interest in contributing to Vibe Haptic!

## Development Setup

### Prerequisites

- **Bun** v1.0+ — JavaScript runtime and package manager
- **Rust** toolchain — for building the native module
- **Xcode Command Line Tools** — required for macOS development

```bash
# Install Rust if needed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Xcode CLI tools if needed
xcode-select --install
```

### Building

```bash
# Install dependencies
bun install

# Build everything (native module + TypeScript)
bun run build

# Build native module only
bun run build:native
```

### Running Locally

```bash
bun run dev:claude
bun run dev:opencode
```

### Running Tests

```bash
bun test
```

### Type Checking

```bash
bun run typecheck
```

### Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for code quality.

```bash
# Check for issues
bun run lint

# Auto-fix issues
bun run lint:fix
```

## Testing with Agents

### Claude Code

Load the plugin directly from your local directory:

```bash
claude --plugin-dir ./
```

### OpenCode

Reference the local build in your `opencode.jsonc`:

```jsonc
{
  "plugins": [
    "file:///absolute/path/to/vibe-haptic/dist/index.js"
  ]
}
```

## Testing Haptic Patterns

Use the built-in CLI to test patterns without running a full agent:

```bash
# Play a named pattern
bun run play dopamine

# Play a custom beat
bun run play "66 44 66"
```

## Native Module

The native module wraps macOS `MultitouchSupport.framework` using [napi-rs](https://napi.rs):

```rust
// Trigger haptic feedback
MTActuatorActuate(actuator, actuation_id, 0, 0.0, intensity);
```

- **actuation_id**: 3 (minimal) to 6 (strong)
- **intensity**: 0.0 to 2.0

The framework is private but stable across macOS versions.

## Pull Request Guidelines

1. Keep changes focused — one feature or fix per PR
2. Add tests for new functionality
3. Ensure all checks pass (`bun test`, `bun run typecheck`, `bun run lint`)
4. Update documentation if needed
