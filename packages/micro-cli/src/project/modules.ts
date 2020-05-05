import { pathExists } from 'fs-extra'
import { join } from 'path'

import { loadManifest, Manifest } from './manifest'

const modulesFromExposes = async (depManifestPath: string, exposes: string[]) => {
  const modules: string[] = []
  for (const folder of exposes) {
    const fullPath = join(depManifestPath, folder)
    const exists = await pathExists(fullPath)
    if (exists) {
      modules.push(fullPath)
    }
  }
  return modules
}

const loadDependenciesAsModules = async (nodeModulesPath: string, manifest: Manifest) => {
  const modules: string[] = []
  const { dependencies } = manifest
  for(const dependency of Object.keys(dependencies)) {
    const depManifestPath = join(nodeModulesPath, dependency)
    
    try {
      const manifest = await loadManifest(depManifestPath)
      if (manifest.micro) {
        const modulesForDep = await modulesFromExposes(depManifestPath, manifest.micro.exposes)
        if (modulesForDep.length > 0) {
          console.info(`📦 Micro package found in dependencies: ${manifest.name}@${manifest.version}.`)
          modulesForDep.forEach(module => modules.push(module))
        }
      }
    } catch {
      continue
    }
  }
  return modules
}

export const resolveModules = async (projectPath: string, manifest: Manifest) => {
  const nodeModulesPath = join(projectPath, 'node_modules') 
  const dependenciesAsModules = await loadDependenciesAsModules(nodeModulesPath, manifest)
  return [
    nodeModulesPath,
    ...dependenciesAsModules
  ]
}
