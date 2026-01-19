# Vibe Haptic - Claude Code Plugin

Haptic feedback for Claude Code using macOS Force Touch trackpad.

## Installation

```bash
# Add the plugin
claude plugin add devxoul/vibe-haptic

# Install the npm package (required for native module)
npm install -g vibe-haptic
```

## What it does

Triggers haptic feedback through your MacBook's Force Touch trackpad when:

- **Task completes** (Stop event) → Success pattern (strong click)
- **User input requested** (UserPromptSubmit event) → Prompt pattern (light tap)

## Requirements

- macOS with Force Touch trackpad (MacBook Pro 2015+, MacBook 2015+)
- Force Click enabled in System Preferences → Trackpad

## Configuration

Create `~/.claude/vibe-haptic.json` to customize patterns:

```json
{
  "events": {
    "taskComplete": {
      "enabled": true,
      "pattern": "success"
    },
    "userInput": {
      "enabled": true,
      "pattern": "prompt"
    }
  }
}
```

## Available Patterns

| Pattern | Feel | Use Case |
|---------|------|----------|
| `success` | Strong click | Task completed |
| `error` | Triple burst | Error occurred |
| `notification` | Medium tap | General notification |
| `prompt` | Light tap | Input requested |
| `complete` | Medium tap | Long operation finished |
