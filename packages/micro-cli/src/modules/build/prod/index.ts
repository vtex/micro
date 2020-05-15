import { transformFileAsync } from '@babel/core'
import { OnBuildCompiler } from '@vtex/micro/framework'
import chalk from 'chalk'
import { outputFile } from 'fs-extra'

import { newProject } from '../../../common/project'

process.env.NODE_ENV = 'production'

const target = 'onBuild'

const main = async () => {
  console.log('🦄 Starting Production Build')

  const { project, plugins } = await newProject(target)

  console.log(`🦄 [${target}]: Retrieving files`)
  const files = project.root.getFiles('components')

  console.log(`🦄 [${target}]: Creating Compiler`)
  const builder = new OnBuildCompiler({ project, plugins } as any) // TODO: fix this as any
  const config = builder.getConfig()

  console.log(`🦄 [${target}]: Running Build`)
  let error = null
  for (const file of files) {
    try {
      const transformed = await transformFileAsync(file, config)
      const targetFile = file.replace(project.root.path, builder.dist).replace(/.tsx?$/, '.js')
      console.log('writting', targetFile)
      await outputFile(targetFile, transformed?.code)
    } catch (err) {
      error = err
      break
    }
  }

  if (error) {
    console.log(chalk.red('💣 Something went wrong'), error)
  }

  console.log(`🦄 [${target}]: Persisting Build on ${builder.dist}`)
  // await outputJSON(join(project.dist, BUILD), stats.toJson())

  // return stats
}

export default main
