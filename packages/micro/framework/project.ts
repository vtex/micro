import { join } from 'path'

import { MICRO_BUILD_DIR } from './constants'
import { Package, Plugins } from './package'
import { resolvePackages } from './resolvers/pnp'

export interface ProjectOptions {
  rootPath: string
}

/**
 * Resolution of the packages project wise
 * For responding, this class usually perform a DFS in the dependency graph of the project
 */
export class Project {
  public root: Package
  public dist: string

  constructor ({ rootPath }: ProjectOptions) {
    this.dist = join(rootPath, MICRO_BUILD_DIR)
    this.root = this.resolvePackages(rootPath)
  }

  public resolveFiles = (target: string): string[] => {
    let files: string[] = []
    walk(this.root, curr => {
      const filtered = curr.getFiles(target)
      files = files.concat(filtered)
    })
    return files
  }

  public resolvePlugins = <T extends keyof Plugins>(target: T): NonNullable<Plugins[T]>[] => {
    console.log(`🦄 [${target}]: Resolving plugins`)
    const plugins: NonNullable<Plugins[T]>[] = []
    walk(this.root, curr => {
      const plugin = curr.getPlugins(target)
      if (plugin) {
        console.log(`🔌 [${target}]: Plugin found ${curr.toString()}`)
        plugins.push(plugin as NonNullable<Plugins[T]>)
      }
    })
    return plugins
  }

  protected resolvePackages = (rootPath: string): Package => {
    console.log('🦄 Resolving dependencies')
    const root = resolvePackages(rootPath)!
    walk(root, curr => {
      console.info(`📦 Micro package found: ${curr.toString()}`)
    })
    return root
  }
}

type WalkFn = (r: Package, p: Package | null) => void

const walk = (root: Package, fn: WalkFn) => {
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
