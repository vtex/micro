/* eslint-disable no-await-in-loop */
import pnp, { getPackageInformation, PackageLocator } from 'pnpapi'

import { PnpPackage } from '.'
import { isManifest, Manifest } from '../manifest'
import { readJsonPnp } from './common'

const getKey = <T>(locator: T) => JSON.stringify(locator)

// DFS
export const createDepTree = async ({
  pkgLocator,
  manifest,
  parentLocator,
  seen,
}: {
  pkgLocator: PackageLocator
  manifest: Manifest
  parentLocator: PackageLocator
  seen: Map<string, PnpPackage>
}): Promise<PnpPackage | null> => {
  const node = getKey(pkgLocator)

  // only go forward if it is a Micro package
  if (seen.has(node) || !isManifest(manifest)) {
    return seen.get(node) ?? null
  }

  // Set Package as seen
  const pkg = new PnpPackage()
  seen.set(node, pkg)

  // Finish instantiating the package
  const info = getPackageInformation(pkgLocator)
  pkg.issuer = parentLocator.name!
  pkg.manifest = manifest
  pkg.tsconfig = await readJsonPnp(pkgLocator, parentLocator, 'tsconfig')

  for (const [name, referencish] of info.packageDependencies) {
    const locator =
      referencish &&
      ((pnp as any).getLocator(name, referencish) as PackageLocator | null)
    const childInfo = locator && getPackageInformation(locator)
    if (!childInfo || !locator || getKey(locator) === node) {
      continue
    }
    const childManifest = await readJsonPnp(locator, pkgLocator, 'manifest')
    const child = await createDepTree({
      pkgLocator: locator,
      manifest: childManifest,
      parentLocator: pkgLocator,
      seen,
    })
    if (child) {
      pkg.dependencies.push(child)
    }
  }

  return pkg
}

export type VisitFn = (
  node: PackageLocator,
  parent: PackageLocator | null
) => Promise<void>

const walkRec = async ({
  node,
  parent,
  visit,
  seen,
}: {
  node: PackageLocator
  parent: PackageLocator | null
  visit: VisitFn
  seen: Set<string>
}) => {
  const nodeStr = getKey(node)

  if (seen.has(nodeStr)) {
    return
  }

  const info = getPackageInformation(node)
  if (!info) {
    return
  }

  seen.add(nodeStr)
  await visit(node, parent)

  for (const [name, referencish] of info.packageDependencies) {
    const locator =
      referencish &&
      ((pnp as any).getLocator(name, referencish) as PackageLocator | null)
    if (!locator) {
      continue
    }
    await walkRec({ node: locator, parent: node, visit, seen })
  }
}

export const walk = (root: PackageLocator, visit: VisitFn) =>
  walkRec({ node: root, parent: null, visit, seen: new Set() })
