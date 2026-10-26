import { basename, dirname, join } from 'node:path'
import { type ExtensionAPI, getAgentDir } from '@mariozechner/pi-coding-agent'
import { loadConfigFromPaths } from '../config'
import { HapticEngine } from '../haptic'

export default function vibeHapticExtension(pi: ExtensionAPI): void {
  // Resolved from the host so forks like omo (~/.omo/agent) read their own config dir
  const agentDir = getAgentDir()
  const configDirName = basename(dirname(agentDir))
  const config = loadConfigFromPaths(join(agentDir, 'vibe-haptic.json'), join(configDirName, 'vibe-haptic.json'))
  const engine = new HapticEngine(config)
  // sessionKind is a senpi addition absent from upstream pi's types
  const isSubagent = isSubagentSession('sessionKind' in pi ? pi.sessionKind : undefined)

  pi.on('agent_end', (_event, ctx) => {
    // Skip non-interactive runs (print/JSON mode), e.g. pi spawned as a subprocess
    if (!ctx.hasUI) return
    if (isSubagent) return
    engine.triggerForEvent('stop')
  })
}

// omo (senpi) runs subagents as RPC sessions that report a UI, so `hasUI` alone lets them through.
// Shared-host children are opened as `worker` sessions; standalone RPC children and team members are marked by env.
export function isSubagentSession(
  sessionKind: unknown,
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (sessionKind === 'worker') return true
  if (env.OMO_SENPI_TASK_RPC_CHILD === '1') return true
  return !!env.SENPI_TASK_MEMBER
}
