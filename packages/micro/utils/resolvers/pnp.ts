import { PosixFS, ZipOpenFS } from '@yarnpkg/fslib'
import * as yarnLibZip from '@yarnpkg/libzip'
import { readJSONSync } from 'fs-extra'
import { join } from 'path'
import {
  getDependencyTreeRoots,
  getLocator,
  getPackageInformation,
  PackageInformation,
  PackageLocator
} from 'pnpapi'

import { MANIFEST_FILE } from '../constants'
import { isManifest } from '../manifest'
import { Package } from '../package'

const libzip = yarnLibZip.getLibzipSync()

// This will transparently open zip archives
const zipOpenFs = new ZipOpenFS({ libzip })

// This will convert all paths into a Posix variant, required for cross-platform compatibility
const crossFs = new PosixFS(zipOpenFs)

const getKey = <T>(locator: T) => JSON.stringify(locator)

// TODO: Does it work for packages inside .pnp.js file ?
const requirePlugin = (pkg: PackageInformation) => {
  try {
    return require(join(pkg.packageLocation, 'dist/plugins/index.js')).default
  } catch (err) {
    if (process.env.VERBOSE) {
      console.error(err)
    }
    return {}
  }
}

const packageFromInfo = (pkg: PackageInformation) => {
  const manifest = JSON.parse(crossFs.readFileSync(manifestPath(pkg.packageLocation), 'utf8'))

  if (!isManifest(manifest)) {
    return null
  }

  return new Package({
    path: pkg.packageLocation,
    manifest,
    files: [],
    plugins: requirePlugin(pkg),
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
    const locator = referencish && getLocator(name, referencish)
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

const manifestPath = (locator: string) => `${locator}/${MANIFEST_FILE}`

// TODO: Make it resolve based on major and not only on the package name
export const resolvePackages = (projectRoot: string) => {
  const manifest = readJSONSync(manifestPath(projectRoot))
  console.assert(isManifest(manifest), '💣 Root manifest needs to be a micro project')
  const locators = getDependencyTreeRoots()
  const root = locators.find(l => l.name === manifest.name)
  console.assert(root, '💣 Could not find toplevel package in this workspace')
  return traverseDependencyTree(root!, new Map())
}
