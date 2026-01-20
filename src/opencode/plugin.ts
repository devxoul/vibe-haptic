import { createHapticEngine } from '../haptic'

type SessionStatusType = 'idle' | 'busy' | 'retry'

type SessionStatusEvent = {
  type: 'session.status'
  properties: { sessionID: string; status: { type: SessionStatusType } }
}

type PermissionUpdatedEvent = {
  type: 'permission.updated'
  properties: Record<string, unknown>
}

type OpenCodeEvent = SessionStatusEvent | PermissionUpdatedEvent | { type: string; properties?: unknown }

type PluginInput = {
  client: unknown
  project: unknown
  directory: string
  worktree: string
  serverUrl: URL
  $: unknown
}

export const vibeHapticPlugin = async (_ctx: PluginInput) => {
  const engine = createHapticEngine('opencode')

  return {
    event: async (input: { event: OpenCodeEvent }): Promise<void> => {
      const { event } = input

      if (event.type === 'session.idle') {
        engine.triggerForEvent('stop')
      } else if (event.type === 'permission.updated' || event.type === 'question.asked') {
        engine.triggerForEvent('prompt')
      }
    },
  }
}
