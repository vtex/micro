import assert from 'assert'
import { join } from 'path'

import { readJSON } from 'fs-extra'
import pnp from 'pnpapi'

import { LifeCycle } from '../../project'
import { Package, PackageRootEntries } from '../base'
import { isManifest } from '../manifest'
import {
  getLocatorFromPackageInWorkspace,
  globPnp,
  pathExistsPnp,
} from './common'
import { createDepTree } from './dfs'

export class PnpPackage extends Package {
  public issuer = ''

  // TODO: Make it resolve based on major and not only on the package name
  public resolveDepTree = async (projectRoot: string) => {
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

  public resolve = () => pnp.resolveRequest(this.manifest.name, this.issuer)

  public hydrate = (projectRoot: string) => {
    throw new Error(`💣 not implemented: ${projectRoot}`)
  }

  public persist = (projectRoot: string) => {
    throw new Error(`💣 not implemented: ${projectRoot}`)
  }

  public getHook = async (target: LifeCycle) => {
    try {
      const unqualified = pnp.resolveToUnqualified(
        this.manifest.name,
        this.issuer
      )
      if (!unqualified) {
        return null
      }
      const locator = join(
        unqualified,
        `dist/build/cjs/hooks/${target}/index.js`
      )
      const { default: exports } = require(locator)
      return exports
    } catch (err) {
      return null
    }
  }

  public getFiles = async (...targets: PackageRootEntries[]) =>
    globPnp(this.manifest.name, this.issuer, this.getGlobby(...targets))

  public pathExists = async (path: string) =>
    pathExistsPnp(this.manifest.name, this.issuer, path)
}
