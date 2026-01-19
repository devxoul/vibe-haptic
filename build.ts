#!/usr/bin/env bun
import { execSync } from 'node:child_process'

const entrypoints = [
  'src/index.ts',
  'src/claude/index.ts',
  'src/opencode/index.ts',
  'src/bin/haptic.ts',
  'src/bin/haptic-hook.ts',
]

const result = await Bun.build({
  entrypoints,
  outdir: 'dist',
  target: 'node',
  format: 'esm',
  splitting: true,
  sourcemap: 'linked',
  external: ['*.node'],
})

if (!result.success) {
  console.error('Build failed:')
  for (const log of result.logs) {
    console.error(log)
  }
  process.exit(1)
}

const createRequireBanner = `import { createRequire } from 'module'; const require = createRequire(import.meta.url);\n`

for (const output of result.outputs) {
  if (output.path.endsWith('.js')) {
    let content = await output.text()
    const needsRequire = content.includes('require(') && !content.includes('createRequire')
    if (needsRequire) {
      content = createRequireBanner + content
    }
    // Fix Bun's duplicate export bug - remove the second export statement with exports_*
    content = content.replace(/^export \{ [^}]+, exports_\w+ \};$/m, '')
    await Bun.write(output.path, content)
  }
}

execSync('bunx tsc --emitDeclarationOnly --declaration --outDir dist', { stdio: 'inherit' })

// Bundle hook for Claude Code marketplace (committed to git)
const hookResult = await Bun.build({
  entrypoints: ['src/bin/haptic-hook.ts'],
  outdir: 'hooks',
  target: 'node',
  format: 'esm',
  splitting: false,
  minify: false,
  external: [],
})

if (!hookResult.success) {
  console.error('Hook bundle failed:')
  for (const log of hookResult.logs) {
    console.error(log)
  }
  process.exit(1)
}

for (const output of hookResult.outputs) {
  if (output.path.endsWith('.js')) {
    let content = await output.text()
    if (content.includes('require(') && !content.includes('createRequire')) {
      content = createRequireBanner + content
    }
    await Bun.write(output.path, content)
  }
}

console.log('Build completed successfully!')
