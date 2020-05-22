import { Mode } from '@vtex/micro'
import { startProdServer } from '@vtex/micro-server'
import chalk from 'chalk'
import { readJSON } from 'fs-extra'
import { join } from 'path'

import { error } from '../../common/error'
import { newProject, resolvePlugins } from '../../common/project'
import { BUILD, HOST, PUBLIC_PATHS, SERVER_PORT } from '../../constants'

process.env.NODE_ENV = 'production'

const lifecycle = 'onRequest'

const main = async () => {
  const mode: Mode = 'production'
  process.env.NODE_ENV = mode

  const project = await newProject()

  console.log(`🦄 Starting Micro for ${chalk.magenta(project)} at ${chalk.blue(lifecycle)}:${chalk.blue(mode)}`)

  const plugins = await resolvePlugins(project, lifecycle)

  console.log(`🦄 Starting server for ${project.root.toString()}`)

  console.log(`🦄 Reading build state on ${project.dist.replace(project.rootPath, '.')}`)
  const statsJson = await readJSON(join(project.dist, 'onAssemble', BUILD))

  console.log('🦄 Starting production server')
  await startProdServer({
    publicPaths: PUBLIC_PATHS,
    statsJson,
    project,
    plugins,
    host: HOST,
    port: SERVER_PORT
  })
}

export default error(main)
