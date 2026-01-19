import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import type { HapticConfig, PatternConfig } from './types'

export const DEFAULT_CONFIG: HapticConfig = {
  patterns: {},
  events: {
    stop: 'vibe',
    prompt: 'alert',
  },
}

export function getConfigPath(agent: 'claude' | 'opencode', scope: 'local' | 'global'): string {
  const home = homedir()

  if (scope === 'global') {
    return agent === 'claude' ? `${home}/.claude/vibe-haptic.json` : `${home}/.config/opencode/vibe-haptic.json`
  }
  return agent === 'claude' ? '.claude/vibe-haptic.json' : '.opencode/vibe-haptic.json'
}

function mergeConfig(base: HapticConfig, override: Partial<HapticConfig>): HapticConfig {
  return {
    patterns: { ...base.patterns, ...(override.patterns as Record<string, string | PatternConfig>) },
    events: { ...base.events, ...override.events },
  }
}

export function loadConfig(agent: 'claude' | 'opencode' = 'claude'): HapticConfig {
  let config: HapticConfig = { ...DEFAULT_CONFIG }

  const globalPath = getConfigPath(agent, 'global')
  if (existsSync(globalPath)) {
    try {
      const globalData = JSON.parse(readFileSync(globalPath, 'utf-8'))
      config = mergeConfig(config, globalData)
    } catch {}
  }

  const localPath = getConfigPath(agent, 'local')
  if (existsSync(localPath)) {
    try {
      const localData = JSON.parse(readFileSync(localPath, 'utf-8'))
      config = mergeConfig(config, localData)
    } catch {}
  }

  return config
}
