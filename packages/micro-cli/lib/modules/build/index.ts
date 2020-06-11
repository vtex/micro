import { join } from 'path'

import chalk from 'chalk'
import { outputJSON } from 'fs-extra'

import { Mode } from '@vtex/micro-core'

import { newProject } from '../../common/project'
import { run } from '../../common/webpack'
import { BUILD } from '../../constants'
import { clean, getConfigs, tscCompiler } from './builder'

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

  const { configs, compiler } = maybeConfigs

  const statsJSON = await run(configs, lifecycle)

  const dist = join(compiler.dist, BUILD)
  console.log(
    `🦄 [${lifecycle}]: Persisting Build on ${dist.replace(process.cwd(), '')}`
  )
  await outputJSON(dist, statsJSON, { spaces: 2 })
}

export default main
