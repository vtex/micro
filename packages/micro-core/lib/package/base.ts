import { parse } from '../common/semver'
import { BuildPlugin, BuildPluginOptions } from '../lifecycles/build'
import { BundlePlugin, BundlePluginOptions } from '../lifecycles/bundle'
import {
  HtmlFrameworkPlugin,
  HtmlPlugin,
  HtmlPluginOptions,
} from '../lifecycles/serve/html'
import { RoutePlugin, RoutePluginOptions } from '../lifecycles/serve/router'
import { Manifest } from './manifest'
import { TSConfig } from './tsconfig'
import { LifeCycle } from '../project'

export interface Plugins {
  serve?: {
    html?: new (options: HtmlPluginOptions) =>
      | HtmlPlugin<any>
      | HtmlFrameworkPlugin<any>
    router?: new (options: RoutePluginOptions) => RoutePlugin
    assets?: (x: string) => string
  }
  bundle?: new (options: BundlePluginOptions) => BundlePlugin
  build?: new (options: BuildPluginOptions) => BuildPlugin
}

export const PackageStructure = {
  lib: 'lib',
  pages: 'pages',
  router: 'router',
  index: 'index.ts',
  plugins: 'plugins',
  components: 'components',
  manifest: 'package.json',
  tsconfig: 'tsconfig.json',
}

export type PackageRootEntries = keyof typeof PackageStructure

export abstract class Package {
  public tsconfig: TSConfig = null as any
  public manifest: Manifest = null as any
  public dependencies: Package[] = []
  public structure = PackageStructure

  public abstract resolveDepTree = async (
    projectRoot: string
  ): Promise<void> => {
    throw new Error(`💣 not implemented: ${projectRoot}`)
  }

  public abstract resolve = (): string => {
    throw new Error(`💣 not implemented`)
  }

  public abstract hydrate = async (projectRoot: string): Promise<void> => {
    throw new Error(`💣 not implemented: ${projectRoot}`)
  }

  public abstract persist = async (projectRoot: string): Promise<void> => {
    throw new Error(`💣 not implemented: ${projectRoot}`)
  }

  public abstract getFiles = async (
    ...targets: PackageRootEntries[]
  ): Promise<string[]> => {
    throw new Error(`💣 not implemented: ${targets}`)
  }

  public abstract hasEntry = async (
    target: PackageRootEntries
  ): Promise<boolean> => {
    throw new Error(`💣 not implemented: ${target}`)
  }

  public abstract getPlugin = async <T extends LifeCycle>(
    _target: T
  ): Promise<Plugins[T]> => {
    throw new Error('💣 not implemented')
  }

  public getGlobby = (...targets: PackageRootEntries[]) =>
    `@(${targets.map((t) => PackageStructure[t]).join('|')})?(/**/*.ts?(x))`

  public toString = () =>
    `${this.manifest.name}@${parse(this.manifest.version).major}.x`
}
