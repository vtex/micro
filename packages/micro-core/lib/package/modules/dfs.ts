import { join } from 'path'

import globby from 'globby'

import { ModulesPackage } from '.'
import { PackageStructure } from '../base'
import { isManifest, Manifest } from '../manifest'

export const globModule = async (
  pkg: string,
  issuer: string,
  query: string
) => {
  const locator: string = require.resolve(join(pkg, PackageStructure.manifest))
  const path = join(locator, '..')
  const matches = await globby(query, { cwd: path })
  return matches.map((p) => join(path, p))
}

// DFS
export const createDepTree = async (
  manifest: Manifest,
  parent: string,
  seen: Map<string, ModulesPackage>
): Promise<ModulesPackage | null> => {
  const pkgName = manifest.name
  const pkgLocator = require.resolve(pkgName)

  // only go forward if it is a Micro package
  if (seen.has(pkgLocator) || !isManifest(manifest)) {
    return seen.get(pkgLocator) ?? null
  }

  // Set Package as seen
  const pkg = new ModulesPackage()
  seen.set(pkgLocator, pkg)

  // Finish instantiating the package
  pkg.issuer = parent
  pkg.manifest = manifest
  pkg.tsconfig = require(`${pkgName}/${PackageStructure.tsconfig}`)

  const deps = Object.keys(manifest.dependencies ?? {})
  for await (const depName of deps) {
    const childManifest = require(`${depName}/${PackageStructure.manifest}`)
    if (!isManifest(childManifest)) {
      continue
    }
    const child = await createDepTree(childManifest, manifest.name, seen)
    if (child) {
      pkg.dependencies.push(child)
    }
  }

  return pkg
}
