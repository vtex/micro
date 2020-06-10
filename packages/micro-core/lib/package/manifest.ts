import { pick } from '../common/pick'
import { isSemver } from '../common/semver'
import { MICRO_BUILD_DIR } from '../constants'
import { BUILD_LIFECYCLE } from '../lifecycles/build'
import { MICRO_ENTRYPOINT } from '../../plugins/build'

type MicroOptions = {
  plugins: string[]
}

export const BaseManifest = {
  sideEffects: false,
  main: `./${MICRO_BUILD_DIR}/${BUILD_LIFECYCLE}/node/${MICRO_ENTRYPOINT}.js`,
  // module: `./${MICRO_BUILD_DIR}/${BUILD_LIFECYCLE}/web/${MICRO_ENTRYPOINT}.js`,
  'browser-federation': `./${MICRO_BUILD_DIR}/${BUILD_LIFECYCLE}/web-federation/${MICRO_ENTRYPOINT}.js`,
  browser: './components/index.ts',
  // types: `./${MICRO_BUILD_DIR}/${BUILD_LIFECYCLE}/cjs/index.d.ts`,
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

const necessary = pick(BaseManifest, [
  'main',
  // 'types',
  'browser',
  'browser-federation',
])
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
    typeof obj.main === 'string' &&
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
    sideEffects,
    main,
    types,
    module,
    browser,
    'browser-federation': webFederation,
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
    sideEffects,
    main,
    types,
    module,
    browser,
    'browser-federation': webFederation,
    dependencies,
    devDependencies,
    peerDependencies,
    ...rest,
  }
}
