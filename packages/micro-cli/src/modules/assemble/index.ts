import { Mode, OnAssembleCompiler } from '@vtex/micro/framework'
import { outputJSON } from 'fs-extra'
import { join } from 'path'
import webpack, { MultiCompiler, Stats } from 'webpack'

import { BUILD } from '../../constants'
import { newProject } from './../../common/project'

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
  const { project, plugins } = await newProject(target)

  console.log(`🦄 [${target}]: Creating Compiler`)
  const assembler = new OnAssembleCompiler({ project, plugins } as any) // TODO: fix this as any
  const configs = assembler.getConfig(mode)

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
