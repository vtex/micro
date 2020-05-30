import { Mode, BundleCompiler } from '@vtex/micro-core'
import chalk from 'chalk'
import { outputJSON } from 'fs-extra'
import { join } from 'path'
import webpack, { Compiler, Stats } from 'webpack'

import { ensureDist, newProject, resolvePlugins } from '../../common/project'
import { BUILD } from '../../constants'

const lifecycle = 'bundle'

const runWebpack = (compiler: Compiler) => new Promise<Stats>((resolve, reject) => {
  compiler.run((err, stats) => {
    if (err) {
      reject(err)
    }
    return resolve(stats)
  })
})

interface Options {
  dev?: boolean
}

const main = async (options: Options) => {
  const dev = !!options.dev
  const mode: Mode = dev ? 'development' : 'production'
  process.env.NODE_ENV = mode

  const project = await newProject()

  console.log(`🦄 Starting Micro for ${chalk.magenta(project)} at ${chalk.blue(lifecycle)}:${chalk.blue(mode)}`)

  const partial = await resolvePlugins(project, lifecycle)
  const self = await project.getSelfPlugin(lifecycle)
  const plugins = self ? [self, ...partial] : partial

  console.log(`🦄 [${lifecycle}]: Creating Compiler`)
  const compiler = new BundleCompiler({ project, plugins, mode })
  const configs = await compiler.getConfig('webnew')

  await ensureDist(lifecycle, compiler.dist)

  for (const page of Object.keys(configs.entry || {})) {
    console.log(`📄 [${lifecycle}]: Page found: ${page}`)
  }

  console.log(`🦄 [${lifecycle}]: Running Build`)
  console.time(`🦄 [${lifecycle}]: Build took`)
  const stats = await runWebpack(webpack(configs))
  console.timeEnd(`🦄 [${lifecycle}]: Build took`)

  console.time(`🦄 [${lifecycle}]: Webpack Stats file generation took`)
  const statsJSON = stats.toJson({ all: true })
  console.timeEnd(`🦄 [${lifecycle}]: Webpack Stats file generation took`)

  if (stats.hasErrors()) {
    console.error('⛔⛔ Webpack build finshed with the following errors\n')
    for (const err of statsJSON.errors) {
      console.log(err)
    }
  }

  if (stats.hasWarnings()) {
    console.warn('⛔ Webpack build finshed with the following warnings\n')
    for (const warning of statsJSON.warnings) {
      console.log(warning)
    }
    console.warn(`❗ Please run ${chalk.blue('micro bundle report')} for a better view of what is going on with your bundle`)
  }

  const dist = join(compiler.dist, BUILD)
  console.log(`🦄 [${lifecycle}]: Persisting Build on ${dist.replace(project.rootPath, '')}`)
  await outputJSON(dist, statsJSON, { spaces: 2 })
}

export default main
