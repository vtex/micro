import { join } from 'path'

import { parse } from '../components/semver'
import { OnAssemblePlugin } from './lifecycle/onAssemble'
import { OnBuildPlugin } from './lifecycle/onBuild'
import {
  OnRequestConfigOptions,
  OnRequestFrameworkPlugin,
  OnRequestPlugin
} from './lifecycle/onRequest'
import { Manifest } from './manifest'
import { Router } from './router'

interface PackageOptions {
  path: string
  files: string[]
  router: Router
  plugins: Plugins
  manifest: Manifest
  dependencies: Package[]
}

export const PackageStructure = {
  pages: 'pages',
  utils: 'utils',
  router: 'router',
  plugins: 'plugins',
  components: 'components',
  manifest: 'package.json'
}

export interface Plugins {
  onRequest?: new (options: OnRequestConfigOptions) => OnRequestPlugin<any> | OnRequestFrameworkPlugin<any>,
  onAssemble?: new () => OnAssemblePlugin,
  onBuild?: new () => OnBuildPlugin
}

/**
 * This class represents a single node in the project's dependency graph
 */
export class Package {
  public path: string
  public router: Router
  public files: string[]
  public plugins: Plugins
  public manifest: Manifest
  public dependencies: Package[]

  constructor ({
    path,
    files,
    router,
    plugins,
    manifest,
    dependencies
  }: PackageOptions) {
    this.path = path
    this.files = files
    this.router = router
    this.plugins = plugins
    this.manifest = manifest
    this.dependencies = dependencies
  }

  public getPlugins = <T extends keyof Plugins>(target: T) => this.plugins[target]

  public getFiles = (target: string) => {
    const regExp = this.targetToRegExp(join(this.path, target))
    return this.files.filter(f => regExp.test(f))
  }

  public toString = () => `${this.manifest.name}@${parse(this.manifest.version).major}.x`

  protected targetToRegExp = (target: string) => new RegExp(`${target}/.*tsx?`)
}
