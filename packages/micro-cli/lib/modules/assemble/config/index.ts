import { Mode, OnAssembleCompiler } from '@vtex/micro'
import { inspect } from 'util'

import { error } from '../../../common/error'
import { newProject, resolvePlugins } from '../../../common/project'

const target = 'onAssemble'

interface Options {
  dev?: boolean
}

const main = async (options: Options) => {
  const dev = !!options.dev
  const mode: Mode = dev ? 'development' : 'production'
  process.env.NODE_ENV = mode

  console.log(`🦄 Starting ${target} Build`)

  const project = await newProject()
  const plugins = await resolvePlugins(project, target)

  console.log(`🦄 [${target}]: Creating Compiler`)
  const compiler = new OnAssembleCompiler({ project, plugins, mode })
  const configs = await compiler.getConfig('webnew')

  console.log(inspect(configs, false, 100, true))
}

export default error(main)
