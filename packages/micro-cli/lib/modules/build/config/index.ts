import chalk from 'chalk'

import { Mode } from '@vtex/micro-core'

import { prettyLog } from '../../../common/print'
import { newProject } from '../../../common/project'
import { clean, tscCompiler, getConfigs } from '../builder'

interface Options {
  dev?: boolean
}

const lifecycle = 'build'

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

  await clean(project, lifecycle)

  console.log(`🦄 [${lifecycle}]: Starting the build`)

  const tscCompilerMsg = '🦄 Initial build of the project took'
  console.time(tscCompilerMsg)
  await tscCompiler(project)
  console.timeEnd(tscCompilerMsg)

  const maybeConfigs = await getConfigs(project, mode)

  if (!maybeConfigs) {
    return
  }

  const { configs } = maybeConfigs

  prettyLog(configs)
}

export default main
