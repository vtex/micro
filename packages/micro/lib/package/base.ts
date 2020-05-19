import { parse } from '../../components/semver'
import {
  OnAssemblePlugin,
  OnAssemblePluginOptions
} from '../lifecycles/onAssemble'
import { OnBuildPlugin, OnBuildPluginOptions } from '../lifecycles/onBuild'
import {
  OnRequestPluginOptions,
  OnRequestFrameworkPlugin,
  OnRequestPlugin
} from '../lifecycles/onRequest'
import { Router } from '../router'
import { Manifest } from './manifest'
import { TSConfig } from './tsconfig'

export interface Plugins {
  onRequest?: new (options: OnRequestPluginOptions) => OnRequestPlugin<any> | OnRequestFrameworkPlugin<any>,
  onAssemble?: new (options: OnAssemblePluginOptions) => OnAssemblePlugin,
  onBuild?: new (options: OnBuildPluginOptions) => OnBuildPlugin
}

export const PackageStructure = {
  lib: 'lib',
  pages: 'pages',
  router: 'router',
  index: 'index.ts',
  plugins: 'plugins',
  components: 'components',
  manifest: 'package.json',
  tsconfig: 'tsconfig.json'
}

export type PackageRootEntries = keyof typeof PackageStructure

export interface PackageOptions {
  plugins: Plugins
  tsconfig: TSConfig
  manifest: Manifest
  dependencies: Package[]
}

export abstract class Package {
  public tsconfig: TSConfig = null as any
  public manifest: Manifest = null as any
  public dependencies: Package[] = []
  public structure = PackageStructure

  public abstract resolve = async (projectRoot: string): Promise<void> => {
    throw new Error(`💣 not implemented: ${projectRoot}`)
  }

  public abstract hydrate = async (projectRoot: string): Promise<void> => {
    throw new Error(`💣 not implemented: ${projectRoot}`)
  }

  public abstract persist = async (projectRoot: string): Promise<void> => {
    throw new Error(`💣 not implemented: ${projectRoot}`)
  }

  public abstract getFiles = async (...targets: PackageRootEntries[]): Promise<string[]> => {
    throw new Error(`💣 not implemented: ${targets}`)
  }

  public abstract getPlugins = async (): Promise<Plugins> => {
    throw new Error('💣 not implemented')
  }

  public abstract getRouter = async (): Promise<Router> => {
    throw new Error('💣 not implemented')
  }

  public getGlobby = (...targets: PackageRootEntries[]) => `@(${targets.map(t => PackageStructure[t]).join('|')})/**/*.ts?(x)`

  public toString = () => `${this.manifest.name}@${parse(this.manifest.version).major}.x`
}
