import { join } from 'path'

import chalk from 'chalk'
import { outputJSON } from 'fs-extra'

import { BuildCompiler, Mode } from '@vtex/micro-core'

import { newProject, resolvePlugins } from '../../common/project'
import { run } from '../../common/webpack'
import { BUILD } from '../../constants'
import { clean, tscCompiler } from './builder'

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

  // Sometimes the package only contains `plugins` or `lib`.
  // In this case, there is nothing to bundle and the build is complete
  const [hasComponents, hasPages] = await Promise.all([
    project.root.hasEntry('components'),
    project.root.hasEntry('pages'),
  ])

  if (!hasPages && !hasComponents) {
    return
  }

  const pluginsResolutionsMsg = '🦄 Plugins resolution took'
  console.time(pluginsResolutionsMsg)
  const plugins = await resolvePlugins(project, lifecycle)
  const compiler = new BuildCompiler({ project, plugins, mode })
  const configs = await Promise.all([
    compiler.getWepbackConfig('node-federation'),
    compiler.getWepbackConfig('web-federation'),
    // compiler.getWepbackConfig('web'),
  ])
  console.timeEnd(pluginsResolutionsMsg)

  const statsJSON = await run(configs, lifecycle)

  const dist = join(compiler.dist, BUILD)
  console.log(
    `🦄 [${lifecycle}]: Persisting Build on ${dist.replace(process.cwd(), '')}`
  )
  await outputJSON(dist, statsJSON, { spaces: 2 })
}

export default main
