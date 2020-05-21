import { Mode } from '@vtex/micro'
import chalk from 'chalk'

import { error } from '../../common/error'
import { newProject } from '../../common/project'
import { builder, clean } from './builder'

interface Options {
  dev?: boolean
}

const lifecycle = 'onBuild'

const main = async (options: Options) => {
  const dev = !!options.dev
  const mode: Mode = dev ? 'development' : 'production'
  process.env.NODE_ENV = mode

  console.log(`🦄 Starting Micro ${chalk.blue(lifecycle)}:${chalk.blue(mode)}`)

  const project = await newProject()

  const build = await builder(project, mode)

  await clean(project, lifecycle)

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
}

export default error(main)
