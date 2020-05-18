/* eslint-disable @typescript-eslint/no-unused-vars */
import { getPath } from '@vtex/micro'
import { outputFile } from 'fs-extra'
import { print } from 'q-i'

import { newProject } from '../../common/project'

interface Options {
  dry?: boolean
  d?: boolean
}

const NECESSARY_MANIFEST = {
  main: './.micro/onBuild/cjs/index.js',
  types: './.micro/onBuild/cjs/index.js',
  module: './.micro/onBuild/es6/components/index.js',
  browser: './components/index.ts'
}

const REQUIRED_MANIFEST = {
  micro: {
    plugins: []
  },
  scripts: {
    build: 'rm -rf dist && yarn run tsc',
    watch: 'rm -rf dist && yarn run tsc --watch',
    prepublish: 'yarn build'
  }
}

const TSCONFIG = {
  compilerOptions: {
    typeRoots: [
      'lib/typings',
      'router/typings',
      'plugins/typings',
      'components/typings'
    ],
    target: 'es2019',
    module: 'commonjs',
    moduleResolution: 'node',
    outDir: '.micro/onBuild/cjs',
    jsx: 'preserve',
    strict: true,
    esModuleInterop: true,
    forceConsistentCasingInFileNames: false,
    skipLibCheck: true,
    declaration: true
  },
  include: ['index.ts', 'lib', 'router', 'plugins', 'components'],
  exclude: ['.micro', 'pages']
}

const main = async ({ dry, d }: Options) => {
  const dryRun = dry || d

  const project = newProject()

  const {
    name,
    version,
    license,
    micro,
    main,
    types,
    module,
    browser,
    type,
    scripts,
    dependencies,
    devDependencies,
    ...rest
  } = {
    ...REQUIRED_MANIFEST,
    ...project.root.manifest,
    ...NECESSARY_MANIFEST
  } as any

  const manifest = {
    name,
    version,
    license,
    micro,
    scripts,
    main,
    types,
    module,
    browser,
    dependencies,
    devDependencies,
    ...rest
  }

  if (dryRun) {
    console.log('manifest.json')
    print(manifest)
    console.log('\n\ntsconfig.json')
    print(TSCONFIG)
    return
  }

  console.log('📓 Writting new manifest file for your project')
  await outputFile(getPath(project.root.path, 'manifest'), JSON.stringify(manifest, null, 2))

  console.log('📓 Writting new tsconfig file for your project')
  await outputFile(getPath(project.root.path, 'tsconfig'), JSON.stringify(TSCONFIG, null, 2))
}

export default main
