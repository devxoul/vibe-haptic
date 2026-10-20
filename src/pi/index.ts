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

  pi.on('agent_end', (_event, ctx) => {
    // Skip non-interactive runs (print/JSON mode), e.g. pi spawned as a subprocess
    if (!ctx.hasUI) return
    engine.triggerForEvent('stop')
  })
}
