import { pick } from '../common/pick'
import { isSemver } from '../common/semver'
import { MICRO_BUILD_DIR } from '../constants'
import { BUILD_LIFECYCLE } from '../lifecycles/build'

type MicroOptions = {
  plugins: string[]
}

export const BaseManifest = {
  sideEffects: false,
  main: `./${MICRO_BUILD_DIR}/${BUILD_LIFECYCLE}/cjs/index.js`,
  types: `./${MICRO_BUILD_DIR}/${BUILD_LIFECYCLE}/cjs/index.d.ts`,
  // module: `./${MICRO_BUILD_DIR}/${buildLifecycle}/es6/index.js`,
  browser: './components/index.ts',
  micro: {
    plugins: [],
  } as MicroOptions,
  scripts: {
    build: 'yarn run micro build',
    watch: 'yarn run micro dev',
    clean: `rm -r ${MICRO_BUILD_DIR}`,
    prepublish: 'yarn build',
  },
}

const necessary = pick(BaseManifest, ['main'])
const required = pick(BaseManifest, ['micro'])

type Base = typeof BaseManifest

export interface Manifest extends Base {
  name: string
  version: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

// TODO: improve this condition
const isMicro = (x: any): x is MicroOptions => Array.isArray(x?.plugins)

export const isManifest = (obj: any): obj is Manifest => {
  return (
    typeof obj?.name === 'string' &&
    isSemver(obj.version) &&
    obj.main === BaseManifest.main &&
    isMicro(obj.micro)
  )
}

export const genManifest = (
  partial: Pick<Manifest, 'name' | 'version'>
): Manifest => {
  const {
    name,
    vendor,
    version,
    description,
    title,
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
    peerDependencies,
    ...rest
  } = {
    ...required,
    ...partial,
    ...necessary,
  } as any

  return {
    name,
    vendor,
    version,
    description,
    title,
    license,
    micro,
    scripts: {
      ...BaseManifest.scripts,
      ...scripts,
    },
    main,
    types,
    module,
    browser,
    dependencies,
    devDependencies,
    peerDependencies,
    ...rest,
  }
}
