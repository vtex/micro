import assert from 'assert'
import { readJSON, readJson } from 'fs-extra'
import globby from 'globby'
import { join } from 'path'

import { Serializable } from '../../../components/page'
import { LifeCycle } from '../../project'
import { Package, PackageRootEntries, PackageStructure } from '../base'
import { isManifest } from '../manifest'
import { createDepTree } from './dfs'

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'

const ROOT = 'root'

export class ModulesPackage extends Package {
  public issuer: string = ''
  public projectRootPath: string = ''

  // TODO: Make it resolve based on major and not only on the package name
  public resolve = async (projectRoot: string) => {
    this.issuer = ROOT
    this.projectRootPath = projectRoot

    const seen = new Map()

    this.manifest = await readJSON(join(projectRoot, this.structure.manifest))
    this.tsconfig = await readJson(join(projectRoot, this.structure.tsconfig))
    this.dependencies = []

    seen.set(this.manifest.name, this)

    assert(isManifest(this.manifest), '💣 Root manifest needs to be a valid Micro Project')

    const deps = Object.keys(this.manifest.dependencies || {})
    for (const depName of deps) {
      const childManifest = require(`${depName}/${PackageStructure.manifest}`)
      if (!isManifest(childManifest)) {
        continue
      }
      const child = await createDepTree(childManifest, this.manifest.name, seen)
      if (child) {
        this.dependencies.push(child)
      }
    }
  }

  public hydrate = (projectRoot: string) => {
    throw new Error(`💣 not implemented: ${projectRoot}`)
  }

  public persist = (projectRoot: string) => {
    throw new Error(`💣 not implemented: ${projectRoot}`)
  }

  public getPlugin = async (target: LifeCycle) => {
    try {
      const resolved = require.resolve(join(this.manifest.name, 'plugins'))

      // Do not cache modules in development
      if (mode === 'development') {
        delete require.cache[resolved]
      }

      const { default: plugins } = require(join(resolved, '..', target, 'index.js'))
      return plugins
    } catch (err) {
      return null
    }
  }

  public getRouter = async <T extends Serializable>() => {
    const resolved = require.resolve(join(this.manifest.name, 'router'))

    // Do not cache modules in development
    if (mode === 'development') {
      delete require.cache[resolved]
    }

    const { default: router } = require(join(resolved, '..', 'index.js'))
    return router
  }

  public getFiles = async (...targets: PackageRootEntries[]) => {
    let path = ''
    // We can't require.resolve since we are the root. We need to use the raw Filesystem instead
    if (this.issuer === ROOT) {
      path = this.projectRootPath
    } else {
      const locator: string = require.resolve(join(this.manifest.name, PackageStructure.manifest))
      path = join(locator, '..')
    }
    const query = this.getGlobby(...targets)
    const matches = await globby(query, { cwd: path })
    return matches.map(p => join(path, p))
  }
}
