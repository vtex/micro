import { Mode } from '@vtex/micro'
import { startDevServer, startProdServer } from '@vtex/micro-server'
import chalk from 'chalk'
import { readJSON } from 'fs-extra'
import { join } from 'path'

import { error } from '../../common/error'
import { newProject, resolvePlugins } from '../../common/project'
import { BUILD, HOST, PUBLIC_PATHS, SERVER_PORT } from '../../constants'

const lifecycle = 'onRequest'

interface Options {
  dev: boolean
}

const main = async (options: Options) => {
  const mode: Mode = options.dev ? 'development' : 'production'
  process.env.NODE_ENV = mode

  const project = await newProject()

  console.log(`🦄 Starting Micro for ${chalk.magenta(project)} at ${chalk.blue(lifecycle)}:${chalk.blue(mode)}`)

  const plugins = await resolvePlugins(project, lifecycle)

  console.log(`🦄 Serving ${project.root.toString()}`)

  if (mode === 'production') {
    console.log(`🦄 Reading build state on ${project.dist.replace(project.rootPath, '.')}`)
    const statsJson = await readJSON(join(project.dist, 'onAssemble', BUILD))

    console.log(`🦄 [${lifecycle}]: Starting ProdServer`)
    await startProdServer({
      publicPaths: PUBLIC_PATHS,
      statsJson,
      project,
      plugins,
      host: HOST,
      port: SERVER_PORT
    })
  } else if (mode === 'development') {
    console.log(`🦄 [${lifecycle}]: Starting DevServer`)

    await startDevServer({
      publicPaths: PUBLIC_PATHS,
      project,
      plugins,
      host: HOST,
      port: SERVER_PORT
    } as any)
  }
}

export default error(main)
