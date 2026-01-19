import { appendFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { createHapticEngine } from '../haptic'

const DEBUG = process.env.VIBE_HAPTIC_DEBUG === '1'

function debug(message: string, data?: unknown) {
  if (!DEBUG) return
  const logPath = `${homedir()}/.vibe-haptic-debug.log`
  const timestamp = new Date().toISOString()
  const logLine = data ? `[${timestamp}] ${message}: ${JSON.stringify(data, null, 2)}\n` : `[${timestamp}] ${message}\n`
  appendFileSync(logPath, logLine)
}

interface ClaudeHookInput {
  session_id: string
  transcript_path: string
  cwd: string
  hook_event_name: string
  notification_type?: string
}

export async function handleHookEvent(input: ClaudeHookInput): Promise<void> {
  debug('handleHookEvent called', input)

  const engine = createHapticEngine('claude')

  if (input.hook_event_name === 'Stop') {
    debug('Triggering stop event')
    await engine.triggerForEvent('stop')
  } else if (input.hook_event_name === 'Notification') {
    debug('Triggering prompt event for notification', { notification_type: input.notification_type })
    await engine.triggerForEvent('prompt')
  } else {
    debug('Unknown hook event', { hook_event_name: input.hook_event_name })
  }
}

async function readStdin(): Promise<string> {
  if (typeof Bun !== 'undefined') {
    return Bun.stdin.text()
  }

  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    process.stdin.on('data', (chunk: Uint8Array) => chunks.push(chunk))
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    process.stdin.on('error', reject)
  })
}

export async function main() {
  try {
    const input = await readStdin()
    const hookInput = JSON.parse(input) as ClaudeHookInput
    await handleHookEvent(hookInput)
    process.exit(0)
  } catch {
    process.exit(0)
  }
}
