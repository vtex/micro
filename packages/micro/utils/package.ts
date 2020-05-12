import { parse } from './common/semver'
import { ComponentsBuilderPlugin } from './compiler/targets/components'
import { PagesBuilderPlugin } from './compiler/targets/pages'
import { PluginsBuilderPlugin } from './compiler/targets/plugins'
import { UtilsBuilderPlugin } from './compiler/targets/utils'
import { Manifest } from './manifest'

interface PackageOptions {
  dependencies: Package[]
  manifest: Manifest
  plugins: Plugins
  files: string[]
  path: string
}

export interface Structure {
  components: 'components'
  plugins: 'plugins'
  pages: 'pages'
  utils: 'utils'
}

export interface Plugins {
  assemble?: {
    pages?: PagesBuilderPlugin
  },
  build?: {
    components?: ComponentsBuilderPlugin
    plugins?: PluginsBuilderPlugin
    utils?: UtilsBuilderPlugin
  }
}

export type Folder = keyof Structure

/**
 * This class represents a single node in the project's dependency graph
 */
export class Package {
  public path: string
  public files: string[]
  public plugins: Plugins
  public manifest: Manifest
  public dependencies: Package[]

  constructor ({
    path,
    files,
    plugins,
    manifest,
    dependencies
  }: PackageOptions) {
    this.path = path
    this.files = files
    this.plugins = plugins
    this.manifest = manifest
    this.dependencies = dependencies
  }

  public getPlugins = (target: Folder) => {
    if (target === 'pages') {
      return this.plugins.assemble?.pages
    }
    return this.plugins.build?.[target]
  }

  public getFiles = (target: string) => {
    const regExp = this.targetToRegExp(target)
    return this.files.filter(f => regExp.test(f))
  }

  public toString = () => `${this.manifest.name}@${parse(this.manifest.version).major}.x`

  protected targetToRegExp = (target: string) => new RegExp(`/${target}/.*tsx?`)

  // protected readFiles = () =>
  //   syncGlob('@(pages|components|utils|plugins)/**/*.ts?(x)', { cwd: this.path, nodir: true })
  //     .map(p => join(this.path, p))
}
