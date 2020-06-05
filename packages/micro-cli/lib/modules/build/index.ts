import chalk from 'chalk'

import { Mode } from '@vtex/micro-core'

import { newProject } from '../../common/project'
import { clean, getBuilders, rejectDeclarationFiles } from './builder'

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

  const { createBuild, createPreBuild } = await getBuilders(project, mode)

  await clean(project, lifecycle)

  console.log(`🦄 [${lifecycle}]: Starting the build`)

  const [framework, userland] = await Promise.all([
    project.root
      .getFiles('lib', 'plugins', 'index')
      .then(rejectDeclarationFiles),
    project.root
      .getFiles('components', 'pages', 'router')
      .then(rejectDeclarationFiles),
  ])

  const msg = `🦄 [${lifecycle}]: Finished build project in`
  console.time(msg)

  const { prebuild } = await createPreBuild()
  if (framework.length > 0) {
    const prebuildMsg = `🦄 [${lifecycle}]: Performing pre-build of cjs modules ${framework.length} files finished in`
    console.time(prebuildMsg)
    await Promise.all(framework.map((f) => prebuild(f, false)))
    console.timeEnd(prebuildMsg)
  }

  const { build } = await createBuild()
  if (userland.length > 0) {
    const buildMsg = `🦄 [${lifecycle}]: Performing build ${userland.length} files finished in`
    console.time(buildMsg)
    await Promise.all(userland.map((f) => build(f, false)))
    console.timeEnd(buildMsg)
  }

  console.timeEnd(msg)

  return {
    project,
    prebuild,
    build,
  }
}

export default main
