import { promisify } from 'util'

import chalk from 'chalk'
import { webpack } from 'webpack'

import { Mode } from '@vtex/micro-core'
import { startDevServer } from '@vtex/micro-server'

import { newProject } from '../../common/project'
import { watch } from '../../common/webpack'
import { BUILD, HOST, PUBLIC_PATHS, SERVER_PORT } from '../../constants'
import {
  clean,
  getConfigs,
  lifecycle,
  tscCompiler,
  tscWatcher,
} from '../build/builder'

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

  const maybeConfigs = await getConfigs(project, mode)

  if (!maybeConfigs) {
    return
  }

  const { configs } = maybeConfigs

  const wp = webpack(configs)

  const run = promisify(wp.run.bind(wp))

  await run()

  const hasPages = await project.root.pathExists('pages/index.ts')

  if (hasPages) {
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
