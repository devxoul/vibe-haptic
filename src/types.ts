export enum Actuation {
  Minimal = 3,
  Medium = 4,
  Weak = 5,
  Strong = 6,
}

export type HapticEvent = 'stop' | 'prompt'

export interface PatternConfig {
  beat: string
  actuation?: Actuation | number
  intensity?: number
}

export interface HapticConfig {
  actuation?: Actuation | number
  intensity?: number
  patterns?: Record<string, string | PatternConfig>
  events?: Partial<Record<HapticEvent, string>>
}

export interface ResolvedPattern {
  beat: string
  actuation: number
  intensity: number
}
