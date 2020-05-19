import { Mode, PackageRootEntries } from '@vtex/micro'
import { startDevServer } from '@vtex/micro-server'
import chalk from 'chalk'
import chokidar from 'chokidar'

import { newProject, resolvePlugins } from '../../common/project'
import { HOST, PUBLIC_PATHS, SERVER_PORT } from '../../constants'
import { builder, clean, lifecycle } from './builder'

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

interface Options {
  watch?: boolean
  dev?: boolean
}

const waitForReady = (watcher: chokidar.FSWatcher) => new Promise(resolve => watcher.on('ready', resolve))

const main = async (options: Options) => {
  const mode: Mode = process.env.NODE_ENV as any
  const watch = !!options.watch
  const dev = !!options.dev

  console.log(`🦄 Starting ${mode} Build`)

  const project = await newProject()
  const plugins = await resolvePlugins(project, lifecycle)

  try {
    const build = builder(project, plugins, mode)

    await clean(project, 'onBuild')

    const entries: PackageRootEntries[] = ['lib', 'plugins', 'components', 'pages', 'router', 'index']

    if (watch) {
      const watcher = chokidar.watch(
        project.root.getGlobby(...entries),
        { cwd: project.rootPath, ignoreInitial: true }
      )

      watcher.on('addDir', () => { console.error('💣 not implemented: addDir') })
      watcher.on('unlink', () => { console.error('💣 not implemented: unlink') })
      watcher.on('unlinkDir', () => { console.error('💣 not implemented: unlinkDir') })
      watcher.on('error', e => console.error(e))
      watcher.on('change', build)
      watcher.on('add', build)

      await waitForReady(watcher)
    }

    console.log(`🦄 [${lifecycle}]: Starting the build`)
    const files = await project.root.getFiles(...entries)

    const msg = `🦄 [${lifecycle}]: Build finished in`
    console.time(msg)
    await Promise.all(files.map(f => build(f, false)))
    console.timeEnd(msg)

    const hasRouter = (await project.root.getFiles('router')).length > 0

    if (hasRouter && !dev) {
      console.log(`🦄 [${lifecycle}]: Starting DevServer`)
      await startDevServer({
        publicPaths: PUBLIC_PATHS,
        project,
        host: HOST,
        port: SERVER_PORT
      })
    } else {
      console.log(`🦄 [${lifecycle}]: No Router found, can't start Dev Server`)
    }
  } catch (error) {
    console.log(chalk.red('💣 Something went wrong'), error)
  }
}

export default main
