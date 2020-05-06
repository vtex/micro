import { dirname, join } from 'path'

import { MANIFEST_FILE } from './../constants'
import { resolveFiles } from './files'
import { loadManifest, Manifest } from './manifest'

const resolvePackage = (projectPath: string, name: string) => {
  const paths = [
    join(projectPath, 'node_modules'),
    ...module.paths
  ]
  const request = `${name}/${MANIFEST_FILE}`
  const resolved = require.resolve(request, { paths })
  return dirname(resolved)
}

const manifestToNode = (manifest: Manifest) => manifest.name

const resolvePackagesRec = (projectPath: string, packagePath: string, manifest: Manifest, packages: Record<string, string[]>) => {
  const { dependencies, micro } = manifest
  const node = manifestToNode(manifest)

  if (packages[node] || !micro) {
    return packages
  }

  console.info(`📦 Micro package found: ${manifest.name}@${manifest.version}.`)
  packages[node] = resolveFiles(packagePath)

  for (const dep in dependencies) {
    try {
      const packagePath = resolvePackage(projectPath, dep)
      const manifest = loadManifest(packagePath)
      resolvePackagesRec(projectPath, packagePath, manifest, packages)
    } catch (err) {
      continue
    }
  }

  return packages
}

export const resolveMicroPackages = (projectPath: string, manifest: Manifest) => {
  const packages: Record<string, string[]> = {
    [manifest.name]: resolveFiles(projectPath)
  }

  if (manifest.dependencies) {
    for(const dep in manifest.dependencies) {
      try {
        const packagePath = resolvePackage(projectPath, dep)
        const manifest = loadManifest(packagePath)
        resolvePackagesRec(projectPath, packagePath, manifest, packages)
      } catch (err) {
        continue
      }
    }
  }

  return packages
}