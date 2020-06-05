import { join } from 'path'

import { outputFile, readJSON } from 'fs-extra'

import {
  genManifest,
  genTSConfig,
  PackageStructure,
} from '@vtex/micro-core/lib'

import { prettyPrint } from '../../common/print'

interface Options {
  dry?: boolean
  d?: boolean
}

// TODO: we should also:
//  - yarn add typescript --dev
//  - yarn add eslint --dev
//  - yarn dlx @yarnpkg/pnpify --sdk # to setup vscode
const main = async ({ dry, d }: Options) => {
  const dryRun = dry ?? d

  const projectPath = process.cwd()

  const manifestPath = join(projectPath, PackageStructure.manifest)
  const tsconfigPath = join(projectPath, PackageStructure.tsconfig)

  const originalManifest = await readJSON(manifestPath).catch(() => {})
  const originalTSConfig = await readJSON(tsconfigPath).catch(() => {})

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

export default main
