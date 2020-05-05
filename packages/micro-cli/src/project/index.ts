import { loadManifest, Manifest } from './manifest'
import { resolveMicroPackages } from './packages'
import { loadUserConfig, UserConfig } from './userConfig'

interface Options {
  projectPath: string
}

export class Project {
  public loaded: boolean = false
  public root: string
  public _manifest: Manifest = {} as Manifest
  public _userConfig: UserConfig | null | undefined = undefined
  public _files: string[] = [] // Paths to all tsx files, including micro dependencies
  public _microPackages: Record<string, string[]> = {}

  constructor({ projectPath }: Options) {
    this.root = projectPath
  }

  get userConfig () {
    if (this._userConfig === undefined) {
      this._userConfig = loadUserConfig(this.root)
    }
    return this._userConfig
  }

  get microPackages () {
    if (Object.keys(this._microPackages).length === 0) {
      this._microPackages = resolveMicroPackages(this.root, this.manifest)
    }
    return this._microPackages
  }

  get manifest () {
    if (Object.keys(this._manifest).length === 0) {
      this._manifest = loadManifest(this.root)
    }
    return this._manifest
  }

  get files () {
    if (this._files.length == 0) {
      this._files = Object.values(this.microPackages).flat()
    }
    return this._files
  }
}
