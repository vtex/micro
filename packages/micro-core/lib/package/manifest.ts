import { pick } from '../common/pick'
import { isSemver } from '../common/semver'
import { MICRO_BUILD_DIR } from '../constants'

type MicroOptions = {
  plugins: string[]
}

export const BaseManifest = {
  sideEffects: false,
  micro: {
    plugins: [],
  } as MicroOptions,
  scripts: {
    build: 'yarn run micro build',
    watch: 'yarn run micro dev',
    test: 'yarn run micro test',
    clean: `rm -r ${MICRO_BUILD_DIR}`,
    prepublish: 'yarn build',
  },
  eslintConfig: {
    extends: 'vtex',
  },
}

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
    typeof obj?.name === 'string' && isSemver(obj.version) && isMicro(obj.micro)
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
    type,
    scripts,
    dependencies,
    devDependencies,
    peerDependencies,
    ...rest
  } = {
    ...required,
    ...partial,
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
      ...scripts,
      ...BaseManifest.scripts,
    },
    sideEffects,
    module,
    dependencies,
    devDependencies,
    peerDependencies,
    ...rest,
  }
}
