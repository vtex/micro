import { Mode } from '@vtex/micro-core'
import { startDevServer, startProdServer } from '@vtex/micro-server'
import chalk from 'chalk'
import { readJSON } from 'fs-extra'
import { join } from 'path'

import { newProject, resolvePlugins } from '../../common/project'
import { BUILD, HOST, PUBLIC_PATHS, SERVER_PORT } from '../../constants'
import { resolveSelfPlugin } from './../../common/project'

const lifecycle = 'serve'

interface Options {
  dev: boolean
  p?: number
}

const main = async (options: Options) => {
  const port = options.p || SERVER_PORT
  const mode: Mode = options.dev ? 'development' : 'production'
  process.env.NODE_ENV = mode

  const project = await newProject()

  console.log(`🦄 Starting Micro for ${chalk.magenta(project)} at ${chalk.blue(lifecycle)}:${chalk.blue(mode)}`)

  const partial = await resolvePlugins(project, lifecycle)
  const self = await resolveSelfPlugin(project, lifecycle)
  const plugins = self ? [...partial, self] : partial

  console.log(`🦄 Serving ${project.root.toString()}`)

  if (mode === 'production') {
    console.log(`🦄 Reading build state on ${project.dist.replace(project.rootPath, '.')}`)
    const statsJson = await readJSON(join(project.dist, 'bundle', BUILD))

    console.log(`🦄 [${lifecycle}]: Starting ProdServer`)
    await startProdServer({
      publicPaths: PUBLIC_PATHS,
      statsJson,
      project,
      plugins,
      host: HOST,
      port
    })
  } else if (mode === 'development') {
    console.log(`🦄 [${lifecycle}]: Starting DevServer`)

    await startDevServer({
      publicPaths: PUBLIC_PATHS,
      project,
      plugins,
      port,
      host: HOST
    } as any)
  }
}

export default main
