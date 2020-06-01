import { BundleCompiler, Mode } from '@vtex/micro-core'
import chalk from 'chalk'

import { prettyPrint } from '../../../common/print'
import {
  newProject,
  resolvePlugins,
  resolveSelfPlugin,
} from '../../../common/project'

const lifecycle = 'bundle'

interface Options {
  dev?: boolean
}

const main = async (options: Options) => {
  const dev = !!options.dev
  const mode: Mode = dev ? 'development' : 'production'
  process.env.NODE_ENV = mode

  const project = await newProject()

  console.log(
    `🦄 Starting Micro for ${chalk.magenta(project)} at ${chalk.blue(
      lifecycle
    )}:${chalk.blue(mode)}`
  )

  const partial = await resolvePlugins(project, lifecycle)
  const self = await resolveSelfPlugin(project, lifecycle)
  const plugins = self ? [self, ...partial] : partial

  console.log(`🦄 [${lifecycle}]: Creating Compiler`)
  const compiler = new BundleCompiler({ project, plugins, mode })
  const configs = await compiler.getConfig('webnew')

  prettyPrint(configs)
}

export default main
