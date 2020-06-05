import chalk from 'chalk'

import { BundleCompiler, Mode } from '@vtex/micro-core'

import { newProject, resolvePlugins } from '../../common/project'

const lifecycle = 'bundle'

interface Options {
  dev?: boolean
}

export const getBundleCompiler = async (options: Options) => {
  const dev = !!options.dev
  const mode: Mode = dev ? 'development' : 'production'
  process.env.NODE_ENV = mode

  const project = await newProject()

  console.log(
    `🦄 Starting Micro for ${chalk.magenta(project)} at ${chalk.blue(
      lifecycle
    )}:${chalk.blue(mode)}`
  )

  const plugins = await resolvePlugins(project, lifecycle)

  console.log(`🦄 [${lifecycle}]: Creating Compiler`)
  return new BundleCompiler({ project, plugins, mode })
}
