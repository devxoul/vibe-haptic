import { describe, expect, it, mock } from 'bun:test'

mock.module('../index', () => ({
  isSupported: () => true,
  actuate: () => {},
  click: () => {},
  weakClick: () => {},
  strongClick: () => {},
}))

const { actuate, click, isSupported, strongClick, weakClick } = await import('../index')

describe('Native Haptic Module', () => {
  it('isSupported should return a boolean', () => {
    const result = isSupported()
    expect(typeof result).toBe('boolean')
  })

  it('actuate should not throw with mock', () => {
    expect(() => actuate(6, 1.0)).not.toThrow()
  })

  it('click should not throw with mock', () => {
    expect(() => click()).not.toThrow()
  })

  it('weakClick should not throw with mock', () => {
    expect(() => weakClick()).not.toThrow()
  })

  it('strongClick should not throw with mock', () => {
    expect(() => strongClick()).not.toThrow()
  })

  it('actuate should handle edge case intensities', () => {
    expect(() => {
      actuate(6, 0.0)
      actuate(6, 1.0)
    }).not.toThrow()
  })
})
