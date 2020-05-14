type Semver = string

type MicroOptions = {}

export interface Manifest {
  name: string
  version: Semver
  browser: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  micro: MicroOptions
}

export const isManifest = (obj: any): obj is Manifest => {
  return typeof obj?.name === 'string' &&
    typeof obj.version === 'string' &&
    typeof obj.browser === 'string' &&
    typeof obj.micro === 'object'
}
