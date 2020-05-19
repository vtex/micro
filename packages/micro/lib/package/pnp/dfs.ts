import { PosixFS, ZipOpenFS } from '@yarnpkg/fslib'
import * as yarnLibZip from '@yarnpkg/libzip'
import globby from 'globby'
import { join } from 'path'
import pnp, {
  getPackageInformation,
  PackageInformation,
  PackageLocator
} from 'pnpapi'

import { PnpPackage } from '.'
import { PackageStructure } from '../base'
import { isManifest, Manifest } from '../manifest'

const libzip = yarnLibZip.getLibzipSync()

// This will transparently open zip archives
const zipOpenFs = new ZipOpenFS({ libzip })

// This will convert all paths into a Posix variant, required for cross-platform compatibility
const crossFs = new PosixFS(zipOpenFs)

// TODO: Does it work for packages inside .pnp.js file ?
export const requirePnp = <T>(target: string, pkg: string, issuer: string) => {
  try {
    const locator = (pnp as any).resolveRequest(pkg, issuer)
    const path = locator.replace('/index.js', `/${target}/index.js`)
    return require(path)
  } catch (err) {
    console.error(target, pkg, issuer, err)
    throw err
  }
}

export const globPnp = async (pkg: string, issuer: string, query: string) => {
  const locator: string = (pnp as any).resolveRequest(`${pkg}/${PackageStructure.manifest}`, issuer)
  const path = locator.replace(`/${PackageStructure.manifest}`, '')
  const matches = await globby(query, { cwd: path })
  return matches.map(p => join(path, p))
}

export const readJsonPnp = async (
  { packageLocation }: PackageInformation,
  target: keyof typeof PackageStructure
) => {
  try {
    return await crossFs.readJsonPromise(
      join(packageLocation, PackageStructure[target])
    )
  } catch (err) {
    console.log(packageLocation, target)
    throw err
  }
}

const getKey = <T>(locator: T) => JSON.stringify(locator)

// DFS
export const traverseDependencyTree = async (
  pkgLocator: PackageLocator,
  manifest: Manifest,
  parentLocator: PackageLocator,
  seen: Map<string, PnpPackage>
): Promise<PnpPackage | null> => {
  const node = getKey(pkgLocator)

  // only go forward if it is a Micro package
  if (seen.has(node) || !isManifest(manifest)) {
    return seen.get(node) || null
  }

  // Set Package as seen
  const pkg = new PnpPackage()
  seen.set(node, pkg)

  // Finish instantiating the package
  const info = getPackageInformation(pkgLocator)
  pkg.issuer = parentLocator.name!
  pkg.manifest = manifest
  pkg.tsconfig = await readJsonPnp(info, 'tsconfig')

  for (const [name, referencish] of info.packageDependencies) {
    const locator = referencish && (pnp as any).getLocator(name, referencish) as PackageLocator | null
    const childInfo = locator && getPackageInformation(locator)
    if (!childInfo || !locator || getKey(locator) === node) {
      continue
    }
    const childManifest = await readJsonPnp(childInfo, 'manifest')
    const child = await traverseDependencyTree(locator, childManifest, pkgLocator, seen)
    if (child) {
      pkg.dependencies.push(child)
    }
  }

  return pkg
}
