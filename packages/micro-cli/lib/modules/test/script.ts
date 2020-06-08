import path from 'path'

import { run } from 'jest'

import { resolveAppPath } from './pathsResolver'
import createJestConfig from './createJestConfig'

process.env.BABEL_ENV = 'test'
process.env.NODE_ENV = 'test'

process.on('unhandledRejection', (err) => {
  throw err
})

export function startTests(...processArgs: string[]) {
  const args = processArgs ? processArgs.slice(0) : []

  const shouldGenerateJestConfig = !args.some((arg) => {
    const isConfigArg = arg.includes('--config')

    return isConfigArg
  })

  if (shouldGenerateJestConfig) {
    console.log(
      '🧪 No --config argument provided, using default jest config from micro'
    )
    const config = createJestConfig(
      (relativePath) => path.resolve(__dirname, relativePath),
      resolveAppPath
    )

    args.push('--config', JSON.stringify(config))
  }

  run(args)
}
