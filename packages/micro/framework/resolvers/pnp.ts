import { PosixFS, ZipOpenFS } from '@yarnpkg/fslib'
import * as yarnLibZip from '@yarnpkg/libzip'
import { readJSONSync } from 'fs-extra'
import { sync as syncGlob } from 'glob'
import { join } from 'path'
import pnp, {
  getPackageInformation,
  PackageInformation,
  PackageLocator
} from 'pnpapi'

import { isManifest } from '../manifest'
import { Package, PackageStructure, Plugins } from '../package'

const libzip = yarnLibZip.getLibzipSync()

// This will transparently open zip archives
const zipOpenFs = new ZipOpenFS({ libzip })

// This will convert all paths into a Posix variant, required for cross-platform compatibility
const crossFs = new PosixFS(zipOpenFs)

const getKey = <T>(locator: T) => JSON.stringify(locator)

// TODO: Does it work for packages inside .pnp.js file ?
export const requirePlugin = (pkg: string, issuer: string) => {
  const locator = (pnp as any).resolveRequest(`${pkg}/plugins`, issuer)
  return require(locator).default as Plugins
}

export const requireRouter = (pkg: string, issuer: string) => {
  const locator = (pnp as any).resolveRequest(`${pkg}/router`, issuer)
  return require(locator).default
}

const globFiles = (path: string) =>
  syncGlob('@(pages|components|plugins)/**/*.ts?(x)', { cwd: path, nodir: true })
    .map(p => join(path, p))

const packageFromInfo = (pkg: PackageInformation) => {
  const manifest = JSON.parse(crossFs.readFileSync(manifestPath(pkg.packageLocation), 'utf8'))

  if (!isManifest(manifest)) {
    return null
  }

  return new Package({
    path: pkg.packageLocation,
    manifest,
    files: globFiles(pkg.packageLocation),
    dependencies: []
  })
}

const traverseDependencyTree = (pkgLocator: PackageLocator, seen: Map<string, Package | null>): Package | null => {
  const node = getKey(pkgLocator)

  if (seen.has(node)) {
    return seen.get(node) || null
  }

  const info = getPackageInformation(pkgLocator)
  const pkg = packageFromInfo(info)
  seen.set(node, pkg)

  if (!pkg) {
    return null
  }

  for (const [name, referencish] of info.packageDependencies) {
    const locator = referencish && (pnp as any).getLocator(name, referencish)
    if (!locator || getKey(locator) === node) {
      continue
    }
    const child = traverseDependencyTree(locator, seen)
    if (child) {
      pkg.dependencies.push(child)
    }
  }

  return pkg
}

const manifestPath = (locator: string) => `${locator}/${PackageStructure.manifest}`

// TODO: Make it resolve based on major and not only on the package name
export const resolvePackages = (projectRoot: string) => {
  const manifest = readJSONSync(manifestPath(projectRoot))
  console.assert(isManifest(manifest), '💣 Root manifest needs to be a micro project')
  const locators = (pnp as any).getDependencyTreeRoots()
  const root = locators.find((l: any) => l.name === manifest.name)
  console.assert(root, '💣 Could not find toplevel package in this workspace')
  return traverseDependencyTree(root!, new Map())
}
