import assert from 'assert'
import { join } from 'path'

import { PosixFS, ZipOpenFS } from '@yarnpkg/fslib'
import * as yarnLibZip from '@yarnpkg/libzip'
import globby from 'globby'
import pnp, { PackageLocator } from 'pnpapi'

import { PackageStructure } from '../base'
import { Manifest } from '../manifest'

export const getLocatorFromPackageInWorkspace = (name: string) => {
  const locators = (pnp as any).getDependencyTreeRoots() // TODO: improve typings
  return locators.find((l: any) => l.name === name)
}

const libzip = yarnLibZip.getLibzipSync()

// This will transparently open zip archives
const zipOpenFs = new ZipOpenFS({ libzip })

// This will convert all paths into a Posix variant, required for cross-platform compatibility
const crossFs = new PosixFS(zipOpenFs)

// TODO: Does it work for packages inside .pnp.js file ?
export const requirePnp = <T>(
  target: string,
  pkg: string,
  issuer: string
): any => {
  const locator = (pnp as any).resolveRequest(pkg, issuer)
  const path = locator.replace('/index.js', `/${target}/index.js`)
  return require(path)
}

export const globPnp = async (pkg: string, issuer: string, query: string) => {
  const locator: string = (pnp as any).resolveRequest(
    `${pkg}/${PackageStructure.manifest}`,
    issuer
  )
  const path = join(locator, '..')
  const matches = await globby(query, { cwd: path })
  return matches.map((p) => join(path, p))
}

export const pathExistsPnp = (pkg: string, issuer: string, path: string) => {
  const locator: string = (pnp as any).resolveRequest(
    `${pkg}/${PackageStructure.manifest}`,
    issuer
  )
  const fullPath = join(locator, '..', path)
  return crossFs.existsPromise(fullPath)
}

export const readJsonPnp = async (
  pkg: PackageLocator,
  issuer: PackageLocator,
  target: keyof typeof PackageStructure
) => {
  const path = pnp.getPackageInformation(pkg).packageLocation
  // const virtualPath = pnp.resolveToUnqualified(`${pkg.name}/${PackageStructure[target]}`, issuer.name)
  assert(
    path,
    `💣 Package path can not be null: Package: ${pkg.name}, Issuer: ${issuer.name}`
  )
  const fullPath = join(path, PackageStructure[target])
  return crossFs.readJsonPromise(fullPath)
}

export const readManifest = async (
  info: PackageLocator,
  issuer: PackageLocator
) => {
  const manifest = await readJsonPnp(info, issuer, 'manifest')
  return manifest as Pick<
    Manifest,
    'name' | 'version' | 'dependencies' | 'peerDependencies' | 'devDependencies'
  >
}
