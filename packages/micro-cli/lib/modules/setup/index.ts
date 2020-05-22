import { genManifest, genTSConfig, PackageStructure } from '@vtex/micro'
import { outputFile, readJSON } from 'fs-extra'
import { join } from 'path'

import { error } from '../../common/error'
import { prettyPrint } from './../../common/print'

interface Options {
  dry?: boolean
  d?: boolean
}

const main = async ({ dry, d }: Options) => {
  const dryRun = dry || d

  const projectPath = process.cwd()

  const manifestPath = join(projectPath, PackageStructure.manifest)
  const tsconfigPath = join(projectPath, PackageStructure.tsconfig)

  const originalManifest = await readJSON(manifestPath)
  const originalTSConfig = await readJSON(tsconfigPath)

  const manifest = genManifest(originalManifest)
  const tsconfig = genTSConfig(originalTSConfig)

  if (dryRun) {
    console.log(PackageStructure.manifest)
    prettyPrint(manifest)
    console.log('')
    console.log(PackageStructure.tsconfig)
    prettyPrint(tsconfig)
    return
  }

  console.log('📓 Writting new manifest file for your project')
  await outputFile(manifestPath, JSON.stringify(manifest, null, 2))

  console.log('📓 Writting new tsconfig file for your project')
  await outputFile(tsconfigPath, JSON.stringify(tsconfig, null, 2))
}

export default error(main)
