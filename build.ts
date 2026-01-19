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
  external: ['*.node', 'zod', '../native'],
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

console.log('Build completed successfully!')
