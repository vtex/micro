import { promisify } from 'util'

import chalk from 'chalk'
import webpack, { Configuration, MultiCompiler } from 'webpack'

import { prettyError } from './print'

const printStats = (stats?: any, json?: any) => {
  if (stats?.hasErrors()) {
    console.error('⛔⛔ Webpack build finshed with the following errors\n')
    for (const error of json?.errors as any) {
      // TODO: why do we need this as any in here ?
      console.log(prettyError(error))
    }
  }

  if (stats?.hasWarnings()) {
    console.warn('⛔ Webpack build finshed with the following warnings\n')
    for (const warning of json?.warnings as any) {
      // TODO: why do we need this as any in here ?
      console.log(prettyError(warning))
    }
  }

  if (stats?.hasErrors() || stats?.hasWarnings()) {
    console.warn(
      `❗ Please run ${chalk.blue(
        'micro bundle report'
      )} for a better view of what is going on with your bundle`
    )
  }
}

export const run = async (configs: Configuration[], lifecycle: string) => {
  console.log(`🦄 [${lifecycle}]: Building lifecycle:${lifecycle}`)
  const compiler = webpack(configs)
  const build = promisify(compiler.run.bind(compiler))
  const close = promisify(compiler.close.bind(compiler))

  try {
    const msg = `🦄 [${lifecycle}]: Bundling took`
    console.time(msg)
    const stats = await build()
    console.timeEnd(msg)

    console.time(`🦄 [${lifecycle}]: Webpack Stats file generation took`)
    const json = stats?.toJson({ all: true })
    console.timeEnd(`🦄 [${lifecycle}]: Webpack Stats file generation took`)

    printStats(stats, json)

    return json
  } finally {
    await close()
  }
}

export const watch = async (compiler: MultiCompiler, lifecycle = 'build') => {
  compiler.watch({}, (error, stats) => {
    if (error) {
      console.error(prettyError(error))
      return
    }

    console.time(`🦄 [${lifecycle}]: Webpack Stats file generation took`)
    const json = stats?.toJson({ all: true })
    console.timeEnd(`🦄 [${lifecycle}]: Webpack Stats file generation took`)

    printStats(stats, json)
  })
}
