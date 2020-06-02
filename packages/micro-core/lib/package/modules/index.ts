import assert from 'assert'
import { readJSON, readJson } from 'fs-extra'
import { join } from 'path'

import { Serializable } from '../../../components/page'
import { LifeCycle } from '../../project'
import { Package, PackageRootEntries, PackageStructure } from '../base'
import { isManifest } from '../manifest'
import { createDepTree, globModule } from './dfs'

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'

export class ModulesPackage extends Package {
  public issuer: string = ''

  // TODO: Make it resolve based on major and not only on the package name
  public resolve = async (projectRoot: string) => {
    this.issuer = 'self'

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
      const child = await createDepTree(childManifest, seen)
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

  public getFiles = async (...targets: PackageRootEntries[]) =>
    globModule(this.manifest.name, this.issuer, this.getGlobby(...targets))
}
