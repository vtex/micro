import { Mode, OnAssembleCompiler } from '@vtex/micro'

import { error } from '../../../common/error'
import { newProject, resolvePlugins } from '../../../common/project'
import { prettyPrint } from './../../../common/print'

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

  prettyPrint(configs)
}

export default error(main)
