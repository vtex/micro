import assert from 'assert'
import { join } from 'path'

import { parse } from './common/semver'
import { MICRO_BUILD_DIR } from './constants'
import { resolveProjectAliases } from './importMap'
import { Package, PackageRootEntries, Plugins } from './package/base'
import { PnpPackage } from './package/pnp'

export type LifeCycle = 'serve' | 'bundle' | 'build'

export interface ProjectOptions {
  rootPath: string
}

/**
 * Resolution of the packages project wise
 * For responding, this class usually perform a DFS in the dependency graph of the project
 */
export class Project {
  public root: Package = null as any
  public rootPath: string
  public dist: string

  constructor ({ rootPath }: ProjectOptions) {
    this.dist = join(rootPath, MICRO_BUILD_DIR)
    this.rootPath = rootPath
  }

  public resolveFiles = async (...targets: PackageRootEntries[]): Promise<string[]> => {
    assert(this.root, '💣 Could not find a package. Did you forget to resolve/restore packages ?')
    let promises: Array<Promise<string[]>> = []
    walk(this.root, curr => {
      const filtered = curr.getFiles(...targets)
      promises = promises.concat(filtered)
    })
    const files = await Promise.all(promises)
    return files.flat()
  }

  public resolvePlugins = async <T extends LifeCycle>(target: T): Promise<NonNullable<Plugins[T]>[]> => {
    assert(this.root, '💣 Could not find a package. Did you forget to resolve/restore packages ?')
    const dependencies = this.root.manifest.dependencies || {}
    const locators: string[] | undefined = this.root!.manifest.micro.plugins
    if (!locators) {
      return []
    }
    const packages: Package[] = []
    walk(this.root, async curr => {
      const index = locators.findIndex(x => curr.manifest.name === x)
      if (index < 0) {
        return
      }
      const maybeVersion = dependencies[curr.manifest.name]
      if (maybeVersion && parse(maybeVersion).major === parse(curr.manifest.version).major) {
        const index = locators.findIndex(x => curr.manifest.name === x)
        packages.splice(index, 0, curr)
      }
    })
    const plugins = await Promise.all(packages.map(p => p.getPlugin(target)))
    return plugins.filter((p): p is NonNullable<Plugins[T]> => !!p)
  }

  public getSelfPlugin = async <T extends LifeCycle>(target: T): Promise<NonNullable<Plugins[T]> | null> => {
    const plugins = this.root!.manifest.micro.plugins
    const index = plugins?.findIndex(p => p === this.root.manifest.name)
    if (index !== undefined && index > -1) {
      const targetPlugin = await this.root.getPlugin(target)
      if (targetPlugin) {
        return targetPlugin as NonNullable<Plugins[T]>
      }
    }
    return null
  }

  public getRouter = () => {
    assert(this.root, '💣 Could not find a package. Did you forget to resolve/restore packages ?')
    return this.root.getRouter()
  }

  public resolvePackages = async (linker: 'pnp' | 'node-modules' = 'pnp') => {
    assert(linker === 'pnp', '💣 Only PnP linker is implemented yet') // TODO: implement other linkers
    this.root = new PnpPackage()
    await this.root.resolve(this.rootPath)
  }

  public toString = () => {
    assert(this.root, '💣 Could not find a package. Did you forget to resolve/restore packages ?')
    return `${this.root.manifest.name}@${parse(this.root.manifest.version).major}.x`
  }

  public resolveAliases = () => resolveProjectAliases(this)
}

export type WalkFn = (r: Package, p: Package | null) => void

export const walk = (root: Package, fn: WalkFn) => {
  const seen = new Set<string>()
  walkRec(root, null, fn, seen)
  return root
}

const walkRec = (root: Package, parent: Package | null, fn: WalkFn, seen: Set<string>) => {
  const node = root.toString()

  if (seen.has(node)) {
    return
  }

  seen.add(node)
  fn(root, parent)

  for (const dependency of root.dependencies) {
    walkRec(dependency, root, fn, seen)
  }
}
