import { describe, expect, test } from 'bun:test'
import { HapticEngine, parseBeat } from '../src/haptic'
import type { HapticConfig } from '../src/types'

const mockNativeModule = { actuate: () => {} }

function createTestEngine(config: HapticConfig) {
  return new HapticEngine(config, { nativeModule: mockNativeModule })
}

describe('HapticEngine', () => {
  test('trigger does not throw without native module', () => {
    const config: HapticConfig = {
      events: { stop: 'tap' },
    }
    const engine = createTestEngine(config)

    expect(() => engine.trigger('tap')).not.toThrow()
  })

  test('triggerForEvent maps event to pattern', () => {
    const config: HapticConfig = {
      events: { stop: 'dopamine', prompt: 'tap' },
    }
    const engine = createTestEngine(config)

    expect(() => engine.triggerForEvent('stop')).not.toThrow()
    expect(() => engine.triggerForEvent('prompt')).not.toThrow()
  })

  test('triggerForEvent ignores unmapped events', () => {
    const config: HapticConfig = {
      events: {},
    }
    const engine = createTestEngine(config)

    expect(() => engine.triggerForEvent('stop')).not.toThrow()
  })

  test('handles custom patterns', () => {
    const config: HapticConfig = {
      patterns: {
        custom: { beat: '666 444' },
      },
      events: { stop: 'custom' },
    }
    const engine = createTestEngine(config)

    expect(() => engine.trigger('custom')).not.toThrow()
  })

  test('handles string shorthand patterns', () => {
    const config: HapticConfig = {
      patterns: {
        quick: '66',
      },
      events: { stop: 'quick' },
    }
    const engine = createTestEngine(config)

    expect(() => engine.trigger('quick')).not.toThrow()
  })

  test('uses global actuation and intensity defaults', () => {
    const config: HapticConfig = {
      actuation: 5,
      intensity: 1.5,
      events: { stop: 'vibe' },
    }
    const engine = createTestEngine(config)

    expect(() => engine.trigger('vibe')).not.toThrow()
  })

  test('returns immediately (non-blocking)', () => {
    const config: HapticConfig = {
      events: { stop: 'dopamine' },
    }
    const engine = createTestEngine(config)

    const start = Date.now()
    engine.trigger('dopamine')
    const duration = Date.now() - start

    expect(duration).toBeLessThan(50)
  })
})

describe('Built-in Patterns', () => {
  const builtInPatterns = ['vibe', 'alert', 'dopamine', 'noise']

  for (const pattern of builtInPatterns) {
    test(`${pattern} pattern does not throw`, () => {
      const engine = createTestEngine({})
      expect(() => engine.trigger(pattern)).not.toThrow()
    })
  }
})

describe('Platform Handling', () => {
  test('gracefully handles null native module', () => {
    const engine = new HapticEngine({}, { nativeModule: null })
    expect(() => engine.trigger('tap')).not.toThrow()
  })
})

describe('parseBeat', () => {
  test('parses simple actuation digits', () => {
    const tokens = parseBeat('66', 6, 2)
    expect(tokens).toEqual([
      { type: 'tap', actuation: 6, intensity: 2 },
      { type: 'tap', actuation: 6, intensity: 2 },
    ])
  })

  test('parses spaces as pauses', () => {
    const tokens = parseBeat('6  6', 6, 2)
    expect(tokens).toEqual([
      { type: 'tap', actuation: 6, intensity: 2 },
      { type: 'pause', pauseCount: 2 },
      { type: 'tap', actuation: 6, intensity: 2 },
    ])
  })

  test('parses actuation/intensity notation', () => {
    const tokens = parseBeat('6/0.5', 6, 2)
    expect(tokens).toEqual([{ type: 'tap', actuation: 6, intensity: 0.5 }])
  })

  test('parses mixed notation', () => {
    const tokens = parseBeat('6/1.0 4 3/0.5', 6, 2)
    expect(tokens).toEqual([
      { type: 'tap', actuation: 6, intensity: 1.0 },
      { type: 'pause', pauseCount: 1 },
      { type: 'tap', actuation: 4, intensity: 2 },
      { type: 'pause', pauseCount: 1 },
      { type: 'tap', actuation: 3, intensity: 0.5 },
    ])
  })

  test('clamps intensity to valid range 0-2', () => {
    const tokens = parseBeat('6/5.0 6/-1', 6, 2)
    expect(tokens[0].intensity).toBe(2)
    expect(tokens[2].intensity).toBe(0)
  })

  test('uses default intensity when no slash notation', () => {
    const tokens = parseBeat('5', 6, 1.5)
    expect(tokens).toEqual([{ type: 'tap', actuation: 5, intensity: 1.5 }])
  })

  test('handles complex pattern', () => {
    const tokens = parseBeat('6/2.0 6/0.1  4/1.5 3/0.5', 6, 2)
    expect(tokens).toEqual([
      { type: 'tap', actuation: 6, intensity: 2.0 },
      { type: 'pause', pauseCount: 1 },
      { type: 'tap', actuation: 6, intensity: 0.1 },
      { type: 'pause', pauseCount: 2 },
      { type: 'tap', actuation: 4, intensity: 1.5 },
      { type: 'pause', pauseCount: 1 },
      { type: 'tap', actuation: 3, intensity: 0.5 },
    ])
  })
})
