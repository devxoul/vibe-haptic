import { loadConfig } from './config'
import { DEFAULT_INTENSITY, resolvePattern } from './patterns'
import type { HapticConfig, HapticEvent, ResolvedPattern } from './types'

const PAUSE_DELAY_MS = 100

export interface BeatToken {
  type: 'tap' | 'pause'
  actuation?: number
  intensity?: number
  pauseCount?: number
}
export function parseBeat(beat: string, defaultIntensity: number): BeatToken[] {
  const tokens: BeatToken[] = []
  let i = 0

  while (i < beat.length) {
    const char = beat[i]

    if (char === ' ') {
      let pauseCount = 0
      while (i < beat.length && beat[i] === ' ') {
        pauseCount++
        i++
      }
      tokens.push({ type: 'pause', pauseCount })
    } else if (char >= '3' && char <= '6') {
      const actuation = Number(char)
      i++

      if (i < beat.length && beat[i] === '/') {
        i++
        let intensityStr = ''
        while (i < beat.length && beat[i] !== ' ') {
          intensityStr += beat[i]
          i++
        }
        const intensity = intensityStr ? Math.min(2, Math.max(0, parseFloat(intensityStr))) : defaultIntensity
        tokens.push({ type: 'tap', actuation, intensity })
      } else {
        tokens.push({ type: 'tap', actuation, intensity: defaultIntensity })
      }
    } else {
      i++
    }
  }

  return tokens
}

export type NativeModule = { actuate: (actuation: number, intensity: number) => void }

export interface HapticEngineOptions {
  nativeModule?: NativeModule | null
}

export class HapticEngine {
  private config: HapticConfig
  private nativeModule: NativeModule | null = null

  constructor(config: HapticConfig, options?: HapticEngineOptions) {
    this.config = config
    if (options?.nativeModule !== undefined) {
      this.nativeModule = options.nativeModule
    } else {
      this.loadNativeModule()
    }
  }

  private loadNativeModule() {
    if (process.platform !== 'darwin') {
      return
    }

    try {
      this.nativeModule = require('../native')
    } catch {}
  }

  playBeat(pattern: ResolvedPattern): Promise<void> {
    return new Promise((resolve) => {
      if (!this.nativeModule) {
        resolve()
        return
      }

      const { beat, intensity } = pattern
      const tokens = parseBeat(beat, intensity ?? DEFAULT_INTENSITY)
      const module = this.nativeModule
      let i = 0

      const playNext = () => {
        if (i >= tokens.length) {
          resolve()
          return
        }

        const token = tokens[i]
        i++

        if (token.type === 'pause') {
          setTimeout(playNext, (token.pauseCount ?? 1) * PAUSE_DELAY_MS)
        } else {
          module.actuate(token.actuation!, token.intensity!)
          playNext()
        }
      }

      playNext()
    })
  }

  trigger(patternName: string): Promise<void> {
    const pattern = resolvePattern(patternName, this.config.patterns)

    if (pattern) {
      return this.playBeat(pattern)
    }
    return Promise.resolve()
  }

  triggerForEvent(event: HapticEvent): Promise<void> {
    const patternName = this.config.events?.[event]
    if (patternName) {
      return this.trigger(patternName)
    }
    return Promise.resolve()
  }
}

export function createHapticEngine(agent?: 'claude' | 'opencode'): HapticEngine {
  return new HapticEngine(loadConfig(agent))
}
