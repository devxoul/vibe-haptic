import type { PatternConfig, ResolvedPattern } from './types'

export const DEFAULT_INTENSITY = 1.0

export const DEFAULT_PATTERNS: Record<string, PatternConfig> = {
  vibe: { beat: '6/0.8 3/1.0   6/1.0' },
  alert: { beat: '6/0.5 6/1.0 6/0.5' },
  dopamine: { beat: '6666666 5/1.0 4/1.0 3/1.0', intensity: 0.1 },
  noise: { beat: '6543654365436543' },
}

export function resolvePattern(
  nameOrBeat: string,
  patterns: Record<string, string | PatternConfig> | undefined,
): ResolvedPattern | null {
  const isInlineBeat = /^[3-6/.\s]+$/.test(nameOrBeat)
  if (isInlineBeat) {
    return { beat: nameOrBeat }
  }

  const userPattern = patterns?.[nameOrBeat]
  if (userPattern) {
    if (typeof userPattern === 'string') {
      return { beat: userPattern }
    }
    return {
      beat: userPattern.beat,
      intensity: userPattern.intensity,
    }
  }

  const defaultPattern = DEFAULT_PATTERNS[nameOrBeat]
  if (defaultPattern) {
    return {
      beat: defaultPattern.beat,
      intensity: defaultPattern.intensity,
    }
  }

  return null
}
