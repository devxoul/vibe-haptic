import { describe, expect, test } from 'bun:test'
import { isSubagentSession } from '../src/pi'

describe('isSubagentSession', () => {
  test('treats interactive sessions as the main agent', () => {
    expect(isSubagentSession('interactive', {})).toBe(false)
  })

  test('treats hosts without session kinds as the main agent', () => {
    expect(isSubagentSession(undefined, {})).toBe(false)
  })

  test('detects worker sessions on a shared host', () => {
    expect(isSubagentSession('worker', {})).toBe(true)
  })

  test('detects standalone RPC task children', () => {
    expect(isSubagentSession('interactive', { OMO_SENPI_TASK_RPC_CHILD: '1' })).toBe(true)
  })

  test('detects team members', () => {
    expect(isSubagentSession('interactive', { SENPI_TASK_MEMBER: 'run::alice' })).toBe(true)
  })
})
