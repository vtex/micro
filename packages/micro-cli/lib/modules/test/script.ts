import path from 'path'

import { run } from 'jest'

import { resolveAppPath } from './pathsResolver'
import createJestConfig from './createJestConfig'

process.env.BABEL_ENV = 'test'
process.env.NODE_ENV = 'test'

process.on('unhandledRejection', (err) => {
  throw err
})

export function startTests(...processArgs: any) {
  const args = processArgs ? processArgs.slice(0) : []

  const config = createJestConfig(
    (relativePath) => path.resolve(__dirname, relativePath),
    resolveAppPath
  )

  args.push('--config', JSON.stringify(config))

  run(args)
}
