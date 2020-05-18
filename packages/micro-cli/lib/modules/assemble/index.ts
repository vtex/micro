import { Mode, OnAssembleCompiler } from '@vtex/micro'
import { outputJSON } from 'fs-extra'
import { join } from 'path'
import webpack, { MultiCompiler, Stats } from 'webpack'

import { cleanDist, newProject, resolveProject } from '../../common/project'
import { BUILD } from '../../constants'

process.env.NODE_ENV = 'production'

const target = 'onAssemble'

const runWebpack = (compiler: MultiCompiler) => new Promise<Stats>((resolve, reject) => {
  compiler.run((err, stats) => {
    if (err) {
      reject(err)
    }
    return resolve(stats)
  })
})

const main = async () => {
  console.log('🦄 Starting Assembly Build')

  const mode: Mode = process.env.NODE_ENV as any
  const project = newProject()
  const plugins = await resolveProject(project, target)

  console.log(`🦄 [${target}]: Creating Compiler`)
  const compiler = new OnAssembleCompiler({ project, plugins } as any) // TODO: fix this as any
  const configs = compiler.getConfig(mode)

  await cleanDist(compiler.dist)

  for (const page of Object.keys(configs[0].entry || {})) {
    console.log(`📄 [${target}]: Page found: ${page}`)
  }

  console.log(`🦄 [${target}]: Running Build`)
  const stats = await runWebpack(webpack(configs))

  console.log(`🦄 [${target}]: Persisting Build on ${project.dist}`)
  await outputJSON(join(project.dist, BUILD), stats.toJson())

  return stats
}

export default main
