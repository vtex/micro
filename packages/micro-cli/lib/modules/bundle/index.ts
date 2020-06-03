import { join } from 'path'

import chalk from 'chalk'
import { outputJSON } from 'fs-extra'
import { join } from 'path'
import webpack from 'webpack'
import { promisify } from 'util'
import PrettyError from 'pretty-error'

import { ensureDist } from '../../common/project'
import { BUILD } from '../../constants'
import { getBundleCompiler } from './common'

const pe = new PrettyError()

const lifecycle = 'bundle'

interface Options {
  dev?: boolean
}

const main = async (options: Options) => {
  const compiler = await getBundleCompiler(options)
  const configs = await compiler.getWebpackConfig('webnew')

  await ensureDist(lifecycle, compiler.dist)

  for (const page of Object.keys(configs.entry || {})) {
    console.log(`📄 [${lifecycle}]: Page found: ${page}`)
  }

  console.log(`🦄 [${lifecycle}]: Running Build`)
  const webpackCompiler = webpack(configs)
  const build = promisify(webpackCompiler.run.bind(webpackCompiler))
  const close = promisify(webpackCompiler.close.bind(webpackCompiler))

  try {
    const msg = `🦄 [${lifecycle}]: Bundling took`
    console.time(msg)
    const stats = await build()
    console.timeEnd(msg)

    console.time(`🦄 [${lifecycle}]: Webpack Stats file generation took`)
    const statsJSON = stats?.toJson({ all: true })
    console.timeEnd(`🦄 [${lifecycle}]: Webpack Stats file generation took`)

    if (stats?.hasErrors()) {
      console.error('⛔⛔ Webpack build finshed with the following errors\n')
      for (const error of statsJSON.errors as any) { // TODO: why do we need this as any in here ?
        console.log(pe.render(error))
      }
    }

    if (stats?.hasWarnings()) {
      console.warn('⛔ Webpack build finshed with the following warnings\n')
      for (const warning of statsJSON.warnings as any) { // TODO: why do we need this as any in here ?
        console.log(pe.render(warning))
      }
      console.warn(`❗ Please run ${chalk.blue('micro bundle report')} for a better view of what is going on with your bundle`)
    }

    const dist = join(compiler.dist, BUILD)
    console.log(`🦄 [${lifecycle}]: Persisting Build on ${dist.replace(process.cwd(), '')}`)
    await outputJSON(dist, statsJSON, { spaces: 2 })
  } catch (err) {
    console.error(pe.render(err))
  } finally {
    await close()
  }
}

export default main
