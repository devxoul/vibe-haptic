#!/usr/bin/env bun
import { createHapticEngine } from '../haptic'

const patternOrBeat = process.argv[2] || 'vibe'
const engine = createHapticEngine()

console.log(`🫨 ${patternOrBeat}`)
await engine.trigger(patternOrBeat)
