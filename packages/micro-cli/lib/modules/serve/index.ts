import { join } from 'path'

import chalk from 'chalk'
import { readJSON } from 'fs-extra'

import { Mode } from '@vtex/micro-core'
import { startDevServer, startProdServer } from '@vtex/micro-server'

import { newProject } from '../../common/project'
import { BUILD, HOST, PUBLIC_PATHS, SERVER_PORT } from '../../constants'

const lifecycle = 'serve'

interface Options {
  dev: boolean
  p?: number
}

const main = async (options: Options) => {
  const port = options.p ?? SERVER_PORT
  const mode: Mode = options.dev ? 'development' : 'production'
  process.env.NODE_ENV = mode

  const project = await newProject()

  console.log(
    `🦄 Starting Micro for ${chalk.magenta(project)} at ${chalk.blue(
      lifecycle
    )}:${chalk.blue(mode)}`
  )

  console.log(`🦄 Serving ${project.root.toString()}`)

  if (mode === 'production') {
    console.log(
      `🦄 Reading build state on ${project.dist.replace(project.rootPath, '.')}`
    )
    const bundleStatsJson = await readJSON(join(project.dist, 'bundle', BUILD))
    const buildStatsJson = await readJSON(join(project.dist, 'build', BUILD))

    const pagesStatsJson = buildStatsJson.children.find(
      (x: { name: string }) => x.name === 'pages'
    )

    const statsJson = {
      ...bundleStatsJson,
      children: [...bundleStatsJson.children, pagesStatsJson],
    }

    console.log(`🦄 [${lifecycle}]: Starting ProdServer`)
    await startProdServer({
      publicPaths: PUBLIC_PATHS,
      statsJson,
      project,
      host: HOST,
      port,
    })
  } else if (mode === 'development') {
    console.log(
      `🦄 Reading build state on ${project.dist.replace(project.rootPath, '.')}`
    )
    const statsJson = await readJSON(join(project.dist, 'build', BUILD))

    console.log(`🦄 [${lifecycle}]: Starting ProdServer`)
    await startProdServer({
      publicPaths: PUBLIC_PATHS,
      statsJson,
      project,
      host: HOST,
      port,
    })
  }
}

export default main
