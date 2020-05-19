import assert from 'assert'
import { readJSON } from 'fs-extra'
import { join } from 'path'
import pnp from 'pnpapi'

import { LifeCycle } from '../../project'
import { Router } from '../../router'
import { Package, PackageRootEntries, Plugins } from '../base'
import { isManifest } from '../manifest'
import { globPnp, requirePnp, traverseDependencyTree } from './dfs'

export class PnpPackage extends Package {
  public issuer: string = ''

  // TODO: Make it resolve based on major and not only on the package name
  public resolve = async (projectRoot: string) => {
    const manifestPath = join(projectRoot, this.structure.manifest)
    const manifest = await readJSON(manifestPath)
    assert(isManifest(manifest), '💣 Root manifest needs to be a valid Micro Project')
    const locators = (pnp as any).getDependencyTreeRoots() // TODO: improve typings
    const root = locators.find((l: any) => l.name === manifest.name)
    assert(root, '💣 Could not find this package in this workspace')
    const resolved = await traverseDependencyTree(root, manifest, root, new Map())
    assert(resolved, '💣 Dependency tree traversal must return a package')
    this.dependencies = resolved.dependencies
    this.manifest = resolved.manifest
    this.issuer = this.manifest.name
    this.tsconfig = resolved.tsconfig
  }

  public hydrate = (projectRoot: string) => {
    throw new Error(`💣 not implemented: ${projectRoot}`)
  }

  public persist = (projectRoot: string) => {
    throw new Error(`💣 not implemented: ${projectRoot}`)
  }

  public getPlugin = async (target: LifeCycle) => {
    const { default: plugins } = requirePnp<{ default: Plugins }>(`plugins/${target}`, this.manifest.name, this.issuer)
    return plugins
  }

  public getRouter = async () => {
    const { default: router } = requirePnp<{ default: Router }>('router', this.manifest.name, this.issuer)
    return router
  }

  public getFiles = async (...targets: PackageRootEntries[]) =>
    globPnp(this.manifest.name, this.issuer, this.getGlobby(...targets))
}
