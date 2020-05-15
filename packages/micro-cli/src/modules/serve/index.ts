import { startProdServer } from '@vtex/micro-server/framework'
import { Project, walk } from '@vtex/micro/framework'
import { readJSON } from 'fs-extra'
import { join } from 'path'

import { BUILD, HOST, SERVER_PORT } from '../../constants'
import { PUBLIC_PATHS } from './../../constants'

process.env.NODE_ENV = 'production'

const main = async () => {
  const projectPath = process.cwd()

  const project = new Project({ rootPath: projectPath })

  // TODO: Figure out a way to not resolve dependencies, but persist then instead
  console.log('🦄 Resolving dependencies')
  project.resolvePackages()
  walk(project.root, curr => {
    console.info(`📦 Micro package found: ${curr.toString()}`)
  })

  console.log(`🦄 Starting server for ${project.root.toString()}`)

  const dist = project.dist.replace(projectPath, './')
  console.log(`🦄 Reading build state on ${dist}`)
  const statsJson = await readJSON(join(project.dist, BUILD))

  console.log('🦄 Starting production server')
  await startProdServer({
    publicPaths: PUBLIC_PATHS,
    statsJson,
    project,
    host: HOST,
    port: SERVER_PORT
  })
}

export default main
