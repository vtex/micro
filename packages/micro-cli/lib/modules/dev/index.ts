import chalk from 'chalk'
import { webpack } from 'webpack'

import { BuildCompiler, Mode, RouterHook } from '@vtex/micro-core'
import { startDevServer } from '@vtex/micro-server'

import { newProject, resolvePlugins } from '../../common/project'
import { watch } from '../../common/webpack'
import { BUILD, HOST, PUBLIC_PATHS, SERVER_PORT } from '../../constants'
import { clean, lifecycle, tscCompiler, tscWatcher } from '../build/builder'

const main = async () => {
  const dev = true
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

  const tscWatcherMsg = '🦄 Watching for tsc file changes'
  console.time(tscWatcherMsg)
  tscWatcher(project)
  console.timeEnd(tscWatcherMsg)

  // Sometimes the package only contains `plugins` or `lib`.
  // In this case, there is nothing to bundle and the build is complete
  const [allComponents, allPages] = await Promise.all([
    project.root.pathExists('components'),
    project.root.pathExists('pages'),
  ])
  if (!allPages && !allComponents) {
    return
  }

  const pluginsResolutionsMsg = '🦄 Plugins resolution took'
  console.time(pluginsResolutionsMsg)
  const plugins = await resolvePlugins(project, lifecycle)
  const compiler = new BuildCompiler({ project, plugins, mode })
  const configs = await Promise.all([
    compiler.getWepbackConfig('node'),
    // compiler.getWepbackConfig('web-federation'),
    compiler.getWepbackConfig('web'),
  ])
  console.timeEnd(pluginsResolutionsMsg)

  const wp = webpack(configs)

  const hasPages = (await project.root.getFiles('pages')).length > 0
  const hasRouter = typeof (await project.root.getHook('route')) === 'function'

  if (hasRouter && hasPages) {
    console.log(`🦄 [${lifecycle}]: Starting DevServer`)

    await startDevServer({
      publicPaths: PUBLIC_PATHS,
      project,
      compiler: wp,
      host: HOST,
      port: SERVER_PORT,
    } as any)
  } else {
    watch(wp, BUILD)
  }
}

export default main
