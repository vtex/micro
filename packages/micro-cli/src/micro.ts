#!/usr/bin/env node
import { PagesBuilder, Project } from '@vtex/micro'

import { parseOptions } from './parse'

// import { Build, loadBuild, saveBuildState } from '@vtex/micro-builder'
// import { startServer } from '@vtex/micro-server'

// import { HOST, SERVER_PORT } from './constants'
const main = async () => {
  console.log('🦄 Welcome to Micro')

  const { projectPath, production } = await parseOptions()

  const mode = production ? 'production' : 'development'
  process.env.NODE_ENV = mode

  const project = new Project({ rootPath: projectPath })

  const pagesBuilder = new PagesBuilder({ project })

  const compiler = pagesBuilder.getCompiler(mode)

  console.log(compiler)

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
