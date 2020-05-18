// import { startDevServer } from '@vtex/micro-server/framework'
// import { OnAssembleCompiler, Project } from '@vtex/micro/framework'
// import { emptyDir } from 'fs-extra'

// import { HOST, SERVER_PORT } from './constants'

// const main = async () => {
//   const mode = 'development'
//   process.env.NODE_ENV = mode

//   const project = new Project({ rootPath: projectPath })

//   console.log(`🦄 Starting Dev Environment for ${project.root.toString()}`)

//   const plugins = project.resolvePlugins('onAssemble')

//   await emptyDir(project.dist)

//   const assembler = new OnAssembleCompiler({ project, plugins })
//   const webpack = assembler.getCompiler(mode)

//   await startDevServer({
//     project,
//     publicPaths,
//     webpack,
//     host: HOST,
//     port: SERVER_PORT
//   })
// }

// main().catch(console.error)
