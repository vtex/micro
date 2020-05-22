import { Mode } from '@vtex/micro'
import { startDevServer } from '@vtex/micro-server'
import chalk from 'chalk'
import chokidar from 'chokidar'

import { error } from '../../common/error'
import { newProject, resolvePlugins } from '../../common/project'
import { HOST, PUBLIC_PATHS, SERVER_PORT } from '../../constants'
import { builder, clean, lifecycle } from '../build/builder'

const waitForReady = (watcher: chokidar.FSWatcher) => new Promise(resolve => watcher.on('ready', resolve))

const main = async () => {
  const mode: Mode = 'development'
  process.env.NODE_ENV = mode

  console.log(`🦄 Starting Micro ${chalk.blue(lifecycle)}:${chalk.blue(mode)}`)

  const project = await newProject()

  const build = await builder(project, mode)

  await clean(project, 'onBuild')

  const watcher = chokidar.watch(
    project.root.getGlobby('lib', 'plugins', 'components', 'pages', 'router', 'index'),
    { cwd: project.rootPath, ignoreInitial: true }
  )

  // TODO: I think we can safetely implement these
  watcher.on('addDir', () => { console.error('💣 not implemented: addDir') })
  watcher.on('unlink', () => { console.error('💣 not implemented: unlink') })
  watcher.on('unlinkDir', () => { console.error('💣 not implemented: unlinkDir') })
  watcher.on('error', e => console.error(e))
  watcher.on('change', build)
  watcher.on('add', build)

  await waitForReady(watcher)

  console.log(`🦄 [${lifecycle}]: Starting the build`)

  const [framework, userland] = await Promise.all([
    project.root.getFiles('lib', 'plugins', 'index'),
    project.root.getFiles('components', 'pages', 'router')
  ])

  const msg = `🦄 [${lifecycle}]: The build of ${framework.length + userland.length} files finished in`
  console.time(msg)
  await Promise.all(framework.map(f => build(f, false)))
  await Promise.all(userland.map(f => build(f, false)))
  console.timeEnd(msg)

  const hasRouter = (await project.root.getFiles('router')).length > 0
  const hasPages = (await project.root.getFiles('pages')).length > 0
  if (hasRouter && hasPages) {
    console.log(`🦄 [${lifecycle}]: Starting DevServer`)

    await startDevServer({
      publicPaths: PUBLIC_PATHS,
      project,
      plugins: await resolvePlugins(project, 'onRequest'),
      host: HOST,
      port: SERVER_PORT
    } as any)
  }
}

export default error(main)
