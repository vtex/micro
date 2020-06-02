import { Mode } from '@vtex/micro-core/lib'
import chalk from 'chalk'
import { ensureDir } from 'fs-extra'
import { join } from 'path'

import { newProject } from '../../common/project'
import { clean, getBuilders, rejectDeclarationFiles } from './builder'
import { installWebModules } from './installer'

interface Options {
  dev?: boolean
}

const lifecycle = 'build'

const main = async (options: Options) => {
  const dev = !!options.dev
  const mode: Mode = dev ? 'development' : 'production'
  process.env.NODE_ENV = mode

  const project = await newProject()

  console.log(`🦄 Starting Micro for ${chalk.magenta(project)} at ${chalk.blue(lifecycle)}:${chalk.blue(mode)}`)

  const { createBuild, createPreBuild } = await getBuilders(project, mode)

  await clean(project, lifecycle)

  console.log(`🦄 [${lifecycle}]: Starting the build`)

  const [framework, userland] = await Promise.all([
    project.root.getFiles('lib', 'plugins', 'index').then(rejectDeclarationFiles),
    project.root.getFiles('components', 'pages', 'router').then(rejectDeclarationFiles)
  ])

  const msg = `🦄 [${lifecycle}]: Finished build project in`
  console.time(msg)

  const { prebuild } = await createPreBuild()
  if (framework.length > 0) {
    const prebuildMsg = `🦄 [${lifecycle}]: Performing pre-build of cjs modules ${framework.length} files finished in`
    console.time(prebuildMsg)
    await Promise.all(framework.map(f => prebuild(f, false)))
    console.timeEnd(prebuildMsg)
  }

  const { build, compiler: buildCompiler } = await createBuild()
  if (userland.length > 0) {
    const isRenderableProject = userland.some(x => x.includes('/pages/'))
    if (isRenderableProject) {
      // Somehow, Snopack needs a node_modules directory in order to work properly.
      // This is not true in a monorepo, where node_modules is in the parent folder,
      // so let's emulate a node_modules in the project's root folder
      await ensureDir(join(project.rootPath, 'node_modules'))

      const installMsg = `🦄 [${lifecycle}]: web_modules installation took`
      console.time(installMsg)
      await installWebModules(buildCompiler)
      console.timeEnd(installMsg)
    }

    const buildMsg = `🦄 [${lifecycle}]: Performing build ${userland.length} files finished in`
    console.time(buildMsg)
    await Promise.all(userland.map(f => build(f, false)))
    console.timeEnd(buildMsg)
  }

  console.timeEnd(msg)

  return {
    project,
    prebuild,
    build
  }
}

export default main
