import assert from 'assert'
import { join } from 'path'

import { parse } from './common/semver'
import { MICRO_BUILD_DIR } from './constants'
import { Package, PackageRootEntries, Plugins } from './package/base'
import { PnpPackage } from './package/pnp'

export type LifeCycle = 'serve' | 'bundle' | 'build'

export type WalkFn = (r: Package, p: Package | null) => void

export interface ProjectOptions {
  rootPath: string
}

const walkRec = ({
  root,
  parent,
  fn,
  seen,
}: {
  root: Package
  parent: Package | null
  fn: WalkFn
  seen: Set<string>
}) => {
  const node = root.toString()

  if (seen.has(node)) {
    return
  }

  seen.add(node)
  fn(root, parent)

  for (const dependency of root.dependencies) {
    walkRec({ root: dependency, parent: root, fn, seen })
  }
}

export const walk = (root: Package, fn: WalkFn) => {
  const seen = new Set<string>()
  walkRec({ root, parent: null, fn, seen })
  return root
}

/**
 * Resolution of the packages project wise
 * For responding, this class usually perform a DFS in the dependency graph of the project
 */
export class Project {
  public root: Package = null as any
  public rootPath: string
  public dist: string

  constructor({ rootPath }: ProjectOptions) {
    this.dist = join(rootPath, MICRO_BUILD_DIR)
    this.rootPath = rootPath
  }

  public resolveFiles = async (
    ...targets: PackageRootEntries[]
  ): Promise<string[]> => {
    assert(
      this.root,
      '💣 Could not find a package. Did you forget to resolve/restore packages ?'
    )
    let promises: Array<Promise<string[]>> = []
    walk(this.root, (curr) => {
      const filtered = curr.getFiles(...targets)
      promises = promises.concat(filtered)
    })
    const files = await Promise.all(promises)
    return files.flat()
  }

  public resolvePlugins = async <T extends LifeCycle>(
    target: T
  ): Promise<Record<string, NonNullable<Plugins[T]>>> => {
    assert(
      this.root,
      '💣 Could not find a package. Did you forget to resolve/restore packages ?'
    )
    const { name } = this.root.manifest
    const dependencies = this.root.manifest.dependencies ?? {}
    const locators: string[] | undefined = this.root!.manifest.micro.plugins
    if (!locators) {
      return {}
    }
    const packages: Package[] = []
    walk(this.root, async (curr) => {
      const index = locators.findIndex((x) => curr.manifest.name === x)

      if (index < 0) {
        return
      }

      const maybeVersion = dependencies[curr.manifest.name] || ''
      const versionsMatch =
        parse(maybeVersion).major === parse(curr.manifest.version).major
      const isSelfPlugin = curr.manifest.name === name

      if (!isSelfPlugin && !versionsMatch) {
        return
      }

      packages.splice(index, 0, curr)
    })
    const plugins = await packages.reduce(async (accPromise, pkg) => {
      const [acc, plugin] = await Promise.all([
        accPromise,
        pkg.getPlugin(target),
      ])
      if (plugin) {
        acc[pkg.manifest.name] = plugin as NonNullable<Plugins[T]>
      }
      return acc
    }, Promise.resolve({} as Record<string, NonNullable<Plugins[T]>>))
    return plugins
  }

  public resolvePackages = async (linker: 'pnp' | 'node-modules' = 'pnp') => {
    assert(linker === 'pnp', '💣 Only NodeModules linker is implemented yet') // TODO: implement other linkers
    this.root = new PnpPackage()
    await this.root.resolveDepTree(this.rootPath)
  }

  public toString = () => {
    assert(
      this.root,
      '💣 Could not find a package. Did you forget to resolve/restore packages ?'
    )
    return `${this.root.manifest.name}@${
      parse(this.root.manifest.version).major
    }.x`
  }
}
