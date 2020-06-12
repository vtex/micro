import path from 'path'

import { run } from 'jest'

import { resolveAppPath } from './pathsResolver'
import createJestConfig from './createJestConfig'

const lifecycle = 'test'

const main = () => {
  process.env.BABEL_ENV = lifecycle
  process.env.NODE_ENV = lifecycle

  /**
   * Using process.argv here instead of the object used when
   * main() is called because it enables us to pass these args
   * as they are to Jest. That way we don't need to replicate
   * Jest's API.
   */
  const args = process.argv.slice(3)

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

  console.log('🧪 Running tests using jest')
  run(args)
}

export default main
