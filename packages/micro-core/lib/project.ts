import assert from 'assert'
import { join } from 'path'

import { parse } from './common/semver'
import { MICRO_BUILD_DIR } from './constants'
import { Hooks, Package, PackageRootEntries } from './package/base'
import { PnpPackage } from './package/pnp'

export type LifeCycle = 'render' | 'route' | 'bundle' | 'build'

export type WalkFn = (r: Package, p: Package | null) => Promise<void>
export type WalkFnSync = (r: Package, p: Package | null) => void

export interface ProjectOptions {
  rootPath: string
}

const walkRec = async ({
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

  await fn(root, parent)

  await Promise.all(
    root.dependencies.map((dependency) =>
      walkRec({ root: dependency, parent: root, fn, seen })
    )
  )
}

export const walk = async (root: Package, fn: WalkFn) => {
  const seen = new Set<string>()
  await walkRec({ root, parent: null, fn, seen })
  return root
}

const walkRecSync = ({
  root,
  parent,
  fn,
  seen,
}: {
  root: Package
  parent: Package | null
  fn: WalkFnSync
  seen: Set<string>
}) => {
  const node = root.toString()

  if (seen.has(node)) {
    return
  }
  seen.add(node)

  fn(root, parent)

  for (const dependency of root.dependencies) {
    walkRecSync({ root: dependency, parent: root, fn, seen })
  }
}

export const walkSync = (root: Package, fn: WalkFnSync) => {
  const seen = new Set<string>()
  walkRecSync({ root, parent: null, fn, seen })
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
    let files: string[] = []
    await walk(this.root, async (curr) => {
      const f = await curr.getFiles(...targets)
      files = files.concat(f)
    })
    return files
  }

  public resolvePlugins = async <T extends LifeCycle>(
    target: T
  ): Promise<Array<[string, NonNullable<Hooks[T]>]>> => {
    assert(
      this.root,
      '💣 Could not find a package. Did you forget to resolve/restore packages ?'
    )
    const { name } = this.root.manifest
    const dependencies = this.root.manifest.dependencies ?? {}
    const locators: string[] | undefined = this.root!.manifest.micro.plugins
    if (!locators) {
      return []
    }
    const packages: Package[] = []
    await walk(this.root, async (curr) => {
      const index = locators.findIndex((x) => curr.manifest.name === x)

      if (index < 0) {
        return
      }

      const maybeVersion = dependencies[curr.manifest.name] || ''
      const versionsMatch =
        maybeVersion.startsWith('workspace:') ||
        parse(maybeVersion).major === parse(curr.manifest.version).major
      const isSelfPlugin = curr.manifest.name === name

      if (!isSelfPlugin && !versionsMatch) {
        return
      }

      packages.splice(index, 0, curr)
    })
    const maybePlugins = await Promise.all(
      packages.map(async (pkg) => [
        pkg.manifest.name,
        await pkg.getHook(target),
      ])
    )
    return maybePlugins.filter(
      (x): x is [string, NonNullable<Hooks[T]>] => !!x[1]
    )
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
