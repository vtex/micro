import { join } from 'path'

import { MICRO_BUILD_DIR } from './constants'
import { Package, Plugins } from './package'
import { requirePlugin, requireRouter, resolvePackages } from './resolvers/pnp'

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

  public resolveFiles = (target: string): string[] => {
    this.ensurePackage()
    let files: string[] = []
    walk(this.root!, curr => {
      const filtered = curr.getFiles(target)
      files = files.concat(filtered)
    })
    return files
  }

  public resolvePlugins = <T extends keyof Plugins>(target: T): NonNullable<Plugins[T]>[] => {
    this.ensurePackage()
    const issuer = this.root!.manifest.name
    const plugins: NonNullable<Plugins[T]>[] = []

    const pluginNames = this.root!.manifest.micro.plugins?.[target]
    if (pluginNames) {
      for (const pkg of pluginNames) {
        plugins.push(requirePlugin(pkg, issuer)[target] as NonNullable<Plugins[T]>)
        console.log(`🔌 [${target}]: Plugin found ${pkg}`)
      }
    }
    return plugins
  }

  public getRouter = () => {
    this.ensurePackage()
    return requireRouter(this.root!.manifest.name, this.root!.manifest.name)
  }

  public resolvePackages = () => {
    this.root = resolvePackages(this.rootPath)!
  }

  protected ensurePackage = () => {
    if (!this.root) {
      throw new Error('💣 Could not find a package. Did you forget to resolve/restore packages ?')
    }
  }
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
