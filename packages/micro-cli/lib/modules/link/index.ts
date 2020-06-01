import { importMapFromAliases, Mode } from '@vtex/micro-core'
import { startDevServer } from '@vtex/micro-server'
import chalk from 'chalk'
import chokidar from 'chokidar'

import { newProject, resolvePlugins } from '../../common/project'
import { HOST, PUBLIC_PATHS, SERVER_PORT } from '../../constants'
import {
  clean,
  createGetFolderFromFile,
  getBuilders,
  lifecycle,
  rejectDeclarationFiles,
} from '../build/builder'

const waitForReady = (watcher: chokidar.FSWatcher) =>
  new Promise((resolve) => watcher.on('ready', resolve))

const main = async () => {
  const mode: Mode = 'development'
  process.env.NODE_ENV = mode

  const project = await newProject()

  console.log(
    `🦄 Starting Micro for ${chalk.magenta(project)} at ${chalk.blue(
      lifecycle
    )}:${chalk.blue(mode)}`
  )

  const { createBuild, createPreBuild } = await getBuilders(project, mode)

  await clean(project, 'build')

  console.log(`🦄 [${lifecycle}]: Starting the build`)

  const [framework, userland] = await Promise.all([
    project.root
      .getFiles('lib', 'plugins', 'index')
      .then(rejectDeclarationFiles),
    project.root
      .getFiles('components', 'pages', 'router')
      .then(rejectDeclarationFiles),
  ])

  const msg = `🦄 [${lifecycle}]: The build of ${
    framework.length + userland.length
  } files finished in`
  console.time(msg)
  const { prebuild } = await createPreBuild()
  await Promise.all(framework.map((f) => prebuild(f, false)))

  const { build, compiler: buildCompiler } = await createBuild()
  await Promise.all(userland.map((f) => build(f, false)))
  console.timeEnd(msg)

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
  const hasRouter = (await project.root.getFiles('router')).length > 0
  if (hasRouter && hasPages) {
    console.log('🦄 Resolving aliases')
    const [pluginAliases, projectAliases] = await Promise.all([
      buildCompiler.getAliases('warn'),
      project.resolveAliases(),
    ])

    console.log('🦄 Building import map')
    const importMap = importMapFromAliases(
      projectAliases,
      pluginAliases,
      PUBLIC_PATHS
    )

    console.log(`🦄 [${lifecycle}]: Starting DevServer`)

    await startDevServer({
      publicPaths: PUBLIC_PATHS,
      importMap,
      project,
      plugins: await resolvePlugins(project, 'serve'),
      host: HOST,
      port: SERVER_PORT,
    } as any)
  }
}

export default main
