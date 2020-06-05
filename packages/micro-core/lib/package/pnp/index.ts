import assert from 'assert'
import { join } from 'path'

import { readJSON } from 'fs-extra'

import { LifeCycle } from '../../project'
import { Package, PackageRootEntries, Plugins } from '../base'
import { isManifest } from '../manifest'
import { getLocatorFromPackageInWorkspace } from './common'
import { createDepTree, globPnp, requirePnp } from './dfs'

export class PnpPackage extends Package {
  public issuer = ''

  // TODO: Make it resolve based on major and not only on the package name
  public resolve = async (projectRoot: string) => {
    const manifestPath = join(projectRoot, this.structure.manifest)
    const manifest = await readJSON(manifestPath)
    assert(
      isManifest(manifest),
      '💣 Root manifest needs to be a valid Micro Project'
    )
    const root = getLocatorFromPackageInWorkspace(manifest.name)
    assert(root, '💣 Could not find this package in this workspace')
    const resolved = await createDepTree({
      pkgLocator: root,
      manifest,
      parentLocator: root,
      seen: new Map(),
    })
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
    try {
      const { default: plugins } = requirePnp<{ default: Plugins }>(
        target,
        `${this.manifest.name}/plugins`,
        this.issuer
      )
      return plugins
    } catch (err) {
      return null
    }
  }

  public getFiles = async (...targets: PackageRootEntries[]) =>
    globPnp(this.manifest.name, this.issuer, this.getGlobby(...targets))
}
