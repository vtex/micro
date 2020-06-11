import { parse } from '../common/semver'
import { BuildHook, BuildHookOptions } from '../lifecycles/build'
import { BundleHook, BundleHookOptions } from '../lifecycles/bundle'
import {
  RenderFrameworkHook,
  RenderHook,
  RenderHookOptions,
} from '../lifecycles/render'
import { RouterHook, RouteHookOptions } from '../lifecycles/route'
import { LifeCycle } from '../project'
import { Manifest } from './manifest'
import { TSConfig } from './tsconfig'

export interface Hooks {
  render?: new (options: RenderHookOptions) =>
    | RenderHook<any>
    | RenderFrameworkHook<any>
  route?: new (options: RouteHookOptions) => RouterHook
  bundle?: new (options: BundleHookOptions) => BundleHook
  build?: new (options: BuildHookOptions) => BuildHook
}

export const PackageStructure = {
  index: 'index.ts',
  hooks: 'hooks',
  pages: 'pages',
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

  public abstract resolve = (): string | null => {
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

  public abstract pathExists = async (target: string): Promise<boolean> => {
    throw new Error(`💣 not implemented: ${target}`)
  }

  public abstract getHook = async <T extends LifeCycle>(
    _target: T
  ): Promise<Hooks[T]> => {
    throw new Error('💣 not implemented')
  }

  public getGlobby = (...targets: PackageRootEntries[]) =>
    `@(${targets.map((t) => PackageStructure[t]).join('|')})?(/**/*.ts?(x))`

  public toString = () => `${this.manifest.name}@${this.manifest.version}`
}
