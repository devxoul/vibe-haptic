# Vibe Haptic 🫨

Haptic feedback from your coding agents.

![Vibe Haptic](https://github.com/user-attachments/assets/4e80abbf-e61a-43b1-ad17-14ea8f480cdd)

Get tactile feedback when your AI agent completes tasks, encounters errors, or requests input — feel the rhythm of your coding session through your MacBook's trackpad.

## How It Works

Modern MacBooks have a Force Touch trackpad that doesn't physically click. Instead, it uses a linear actuator (Taptic Engine) to simulate the sensation of a click through precise vibrations.

Vibe Haptic taps into macOS's private `MultitouchSupport.framework` to trigger these haptic actuations programmatically. When your AI agent finishes a task or needs attention, the trackpad vibrates with distinct patterns you can feel under your fingers.

## Installation

### Claude Code

```bash
claude plugin marketplace add devxoul/vibe-haptic
claude plugin install vibe-haptic
```

Or within Claude Code:

```
/plugin marketplace add devxoul/vibe-haptic
/plugin install vibe-haptic
```

### OpenCode

Add to your `opencode.jsonc`:

```jsonc
{
  "plugins": [
    "vibe-haptic@1.0.5"
  ]
}
```

## Configuration

### Configuration File

Create `vibe-haptic.json` in your config directory:

- **Claude Code**: `~/.claude/vibe-haptic.json` or `.claude/vibe-haptic.json`
- **OpenCode**: `~/.config/opencode/vibe-haptic.json` or `.opencode/vibe-haptic.json`

```json
{
  "patterns": {
    "success": { "beat": "6/1.5 6/0.8  4/0.5" },
    "error": { "beat": "6/2.0 6/2.0 6/2.0" }
  },
  "events": {
    "stop": "dopamine",
    "prompt": "alert"
  }
}
```

### Events

Events map agent actions to haptic patterns:

| Event | Trigger | Claude Code | OpenCode |
|-------|---------|-------------|----------|
| `stop` | Agent finishes and becomes idle | ✓ | ✓ |
| `prompt` | Agent asks for input (select option, permission, etc.) | ✓ | ✓ |

#### Trigger Details

**`stop` event** — Fires when the agent completes its work:
- **Claude Code**: Triggered by the `Stop` hook event when the agent finishes responding
- **OpenCode**: Triggered when session status changes to `idle`

**`prompt` event** — Fires when the agent needs your attention:
- **Claude Code**: Triggered by `Notification` hook events (permission requests, tool approvals, etc.)
- **OpenCode**: Triggered by `permission.updated` or `question.asked` events

### Beat Patterns

Haptic feedback is defined using a beat notation:

```
"6/0.8 4/1.0  6/0.5"
```

- **Digits (3-6)**: Actuation strength — `3` minimal, `4` medium, `5` weak, `6` strong
- **`/intensity`**: Optional intensity (0.0-2.0) — `6/0.5` = strong actuation at half intensity
- **Spaces**: Pauses between taps (100ms per space)

Examples:
- `6 6 6` — three strong taps with short pauses
- `6/2.0 6/0.5` — loud tap followed by soft tap
- `66` — rapid double tap (no pause)
- `6  6` — two taps with longer pause

### Built-in Patterns

| Pattern | Beat | Description |
|---------|------|-------------|
| `vibe` | `6/0.8 3/1.0   6/1.0` | Signature rhythm (default for stop event) |
| `alert` | `6/0.5 6/1.0 6/0.5` | Attention pulse (default for prompt event) |
| `dopamine` | `6666666 5/1.0 4/1.0 3/1.0` | Reward cascade |
| `noise` | `6543654365436543` | Rapid texture |

## License

MIT
