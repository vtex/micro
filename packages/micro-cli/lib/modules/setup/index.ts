import { join } from 'path'

import { outputFile, readJSON } from 'fs-extra'

import { genManifest, genTSConfig, PackageStructure } from '@vtex/micro-core'

import { prettyLog } from '../../common/print'

interface Options {
  dry?: boolean
  d?: boolean
}

const main = async ({ dry, d }: Options) => {
  const dryRun = dry ?? d

  const projectPath = process.cwd()

  const manifestPath = join(projectPath, PackageStructure.manifest)
  const tsconfigPath = join(projectPath, PackageStructure.tsconfig)

  const originalManifest = await readJSON(manifestPath).catch(() => { })
  const originalTSConfig = await readJSON(tsconfigPath).catch(() => { })

  const manifest = genManifest(originalManifest)
  const tsconfig = genTSConfig(originalTSConfig)

  if (dryRun) {
    console.log(PackageStructure.manifest)
    prettyLog(manifest)
    console.log('')
    console.log(PackageStructure.tsconfig)
    prettyLog(tsconfig)
    return
  }

  console.log('📓 Writting new manifest file for your project')
  await outputFile(manifestPath, JSON.stringify(manifest, null, 2))

  console.log('📓 Writting new tsconfig file for your project')
  await outputFile(tsconfigPath, JSON.stringify(tsconfig, null, 2))

  // Should we support NPM in the future?
  const command = 'yarn'
  let args = ['add', '-D', ...DEFAULT_DEV_DEPENDENCIES]

  console.log(`📓 Installing devDependencies using ${command}`)
  const devDependenciesInstallProcess = spawn.sync(command, args, {
    stdio: 'inherit',
  })

  if (devDependenciesInstallProcess.status !== 0) {
    console.error(`\`${command} ${args.join(' ')}\` failed`)
    return
  }

  // Setup the project to use yarn@2.x
  // https://yarnpkg.com/getting-started/install
  args = ['set', 'version', 'berry']

  console.log(`📓 Setting up the project to use yarn@2.x`)
  const yarnSetupProcess = spawn.sync(command, args, { stdio: 'inherit' })

  if (yarnSetupProcess.status !== 0) {
    console.error(`\`${command} ${args.join(' ')}\` failed`)
  }

  // Setup Editor SDKs for proper TypeScript support
  // since we're using yarn PnP https://yarnpkg.com/advanced/editor-sdks
  args = ['dlx', '@yarnpkg/pnpify', '--sdk']

  console.log(
    `📓 Using ${command} to setup Editor SDKs for proper TypeScript support`
  )
  const editorSetupProcess = spawn.sync(command, args, { stdio: 'inherit' })

  if (editorSetupProcess.status !== 0) {
    console.error(`\`${command} ${args.join(' ')}\` failed`)
  }
}

export default main
