import { Mode, OnAssembleCompiler } from '@vtex/micro'
import chalk from 'chalk'

import { newProject, resolvePlugins } from '../../../common/project'
import { prettyPrint } from './../../../common/print'

const lifecycle = 'onAssemble'

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
  const compiler = new OnAssembleCompiler({ project, plugins, mode })
  const configs = await compiler.getConfig('webnew')

  prettyPrint(configs)
}

export default main
