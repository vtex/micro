import { startDevServer } from '@vtex/micro-server'
import { OnAssembleCompiler, Project } from '@vtex/micro/framework'
import { emptyDir, outputJSON } from 'fs-extra'
import { Stats, MultiCompiler } from 'webpack'

import { HOST, SERVER_PORT } from './constants'
import { parseOptions } from './parse'
import { join } from 'path'

const runWebpack = (compiler: MultiCompiler) => new Promise<Stats>((resolve, reject) => {
  compiler.run((err, stats) => {
    if (err) {
      reject(err)
    }
    return stats
  })
})

const main = async () => {
  console.log('🦄 Welcome to Micro')

  const { projectPath, production, build } = await parseOptions()

  const mode = production ? 'production' : 'development'
  process.env.NODE_ENV = mode

  const project = new Project({ rootPath: projectPath })

  if (build) {
    console.log(`🦄 Starting Production build for ${project.root.toString()}`)

    const plugins = project.resolvePlugins('onAssemble')

    await emptyDir(project.dist)

    const assembler = new OnAssembleCompiler({ project, plugins })
    const webpack = assembler.getCompiler(mode)

    const stats = await runWebpack(webpack)

    await outputJSON(join(project.dist, 'build.json'), stats.toJson())
  } else {
    console.log(`🦄 Starting Dev Environment for ${project.root.toString()}`)

    const plugins = project.resolvePlugins('onAssemble')

    await emptyDir(project.dist)

    const assembler = new OnAssembleCompiler({ project, plugins })
    const webpack = assembler.getCompiler(mode)

    await startDevServer({
      project,
      publicPaths: {
        assets: '/assets/',
        data: '/api/'
      },
      webpack,
      host: HOST,
      port: SERVER_PORT
    })
  }

  // const stats = await runCompiler(compiler)

  // if (serve) {
  //   console.log(`🦄 Loading build for ${project.manifest.name}@${project.manifest.version}`)

  //   const build = await loadBuild(project)
  //   startServer(project, build, null, SERVER_PORT, HOST)
  // } else if (build) {
  //   console.log(`🦄 Starting Production build for ${project.manifest.name}@${project.manifest.version}`)

  //   const build = new Build(production, project)
  //   await build.clear()
  //   const configs = await build.webpack.getConfig()
  //   const compiler = build.webpack.compiler(configs)
  //   await build.webpack.run(compiler)
  //   await saveBuildState(build)
  // } else if (!production) {
  //   console.log(`🦄 Starting Development build for ${project.manifest.name}@${project.manifest.version}`)

  //   const build = new Build(production, project)
  //   await build.clear()
  //   const configs = await build.webpack.getConfig()

  //   const compiler = build.webpack.compiler(configs)
  //   // build.webpack.watch(compiler)

  //   startServer(project, build, compiler, SERVER_PORT, HOST)
  // } else {
  //   console.log('🙉Could not understand what you mean')
  // }
}

main().catch(console.error)
