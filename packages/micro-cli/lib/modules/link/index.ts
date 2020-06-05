import chokidar from 'chokidar'

import { startDevServer } from '@vtex/micro-server'

import { HOST, PUBLIC_PATHS, SERVER_PORT } from '../../constants'
import buildCommand from '../build'
import { createGetFolderFromFile, lifecycle } from '../build/builder'

const waitForReady = (watcher: chokidar.FSWatcher) =>
  new Promise((resolve) => watcher.on('ready', resolve))

const main = async () => {
  const { project, prebuild, build } = await buildCommand({
    dev: true,
  })

  // This function will select if we should apply Build or Prebuild
  // once a watched file changes
  const entryFromFile = createGetFolderFromFile(project)
  const compile = (f: string) => {
    const entry = entryFromFile(f)
    if (['lib', 'plugins', 'index.ts'].includes(entry)) {
      return prebuild(f)
    }
    return build(f)
  }

  const watcher = chokidar.watch(
    project.root.getGlobby(
      'lib',
      'plugins',
      'components',
      'pages',
      'router',
      'index'
    ),
    { cwd: project.rootPath, ignoreInitial: true }
  )

  // TODO: I think we can safetely implement these
  watcher.on('addDir', () => {
    console.error('💣 not implemented: addDir')
  })
  watcher.on('unlink', () => {
    console.error('💣 not implemented: unlink')
  })
  watcher.on('unlinkDir', () => {
    console.error('💣 not implemented: unlinkDir')
  })
  watcher.on('error', console.error)
  watcher.on('change', compile)
  watcher.on('add', compile)

  await waitForReady(watcher)

  const hasPages = (await project.root.getFiles('pages')).length > 0
  const hasRouter =
    typeof (await project.getSelfPlugin('serve'))?.router === 'function'

  // eslint-disable-next-line vtex/prefer-early-return
  if (hasRouter && hasPages) {
    console.log(`🦄 [${lifecycle}]: Starting DevServer`)

    await startDevServer({
      publicPaths: PUBLIC_PATHS,
      project,
      host: HOST,
      port: SERVER_PORT,
    } as any)
  }
}

export default main
