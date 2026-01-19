export type HapticEvent = 'stop' | 'prompt'

export interface PatternConfig {
  beat: string
  intensity?: number
}

export interface HapticConfig {
  patterns?: Record<string, string | PatternConfig>
  events?: Partial<Record<HapticEvent, string>>
}

export interface ResolvedPattern {
  beat: string
  intensity?: number
}
