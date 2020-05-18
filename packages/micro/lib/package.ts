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

interface PackageOptions {
  path: string
  files: string[]
  manifest: Manifest
  dependencies: Package[]
  tsconfig: any // TODO: Better typings this
}

export const PackageStructure = {
  pages: 'pages',
  plugins: 'plugins',
  components: 'components',
  manifest: 'package.json',
  tsconfig: 'tsconfig.json'
}

export const getPath = (rootPath: string, target: keyof typeof PackageStructure) =>
  join(rootPath, PackageStructure[target])

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
  public files: string[]
  public manifest: Manifest
  public tsconfig: any
  public dependencies: Package[]

  constructor ({
    path,
    files,
    manifest,
    tsconfig,
    dependencies
  }: PackageOptions) {
    this.path = path
    this.files = files
    this.manifest = manifest
    this.tsconfig = tsconfig
    this.dependencies = dependencies
  }

  public getFiles = (target: string) => {
    const regExp = this.targetToRegExp(join(this.path, target))
    return this.files.filter(f => regExp.test(f))
  }

  public toString = () => `${this.manifest.name}@${parse(this.manifest.version).major}.x`

  protected targetToRegExp = (target: string) => new RegExp(`${target}/.*tsx?`)
}
