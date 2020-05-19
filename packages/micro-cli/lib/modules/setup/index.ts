/* eslint-disable @typescript-eslint/no-unused-vars */
import { genManifest, genTSConfig, PackageStructure } from '@vtex/micro'
import { outputFile } from 'fs-extra'
import { join } from 'path'
import { print } from 'q-i'

import { newProject } from '../../common/project'

interface Options {
  dry?: boolean
  d?: boolean
}

const main = async ({ dry, d }: Options) => {
  const dryRun = dry || d

  const project = await newProject()
  const manifest = genManifest(project.root.manifest)
  const tsconfig = genTSConfig(project.root.tsconfig)

  if (dryRun) {
    console.log(PackageStructure.manifest)
    print(manifest)
    console.log('')
    console.log(PackageStructure.tsconfig)
    print(tsconfig)
    return
  }

  console.log('📓 Writting new manifest file for your project')
  await outputFile(
    join(project.rootPath, PackageStructure.manifest),
    JSON.stringify(manifest, null, 2)
  )

  console.log('📓 Writting new tsconfig file for your project')
  await outputFile(
    join(project.rootPath, PackageStructure.tsconfig),
    JSON.stringify(tsconfig, null, 2)
  )
}

export default main
