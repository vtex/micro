import { pathExistsSync, readJSONSync } from 'fs-extra'
import { join } from 'path'

import { MANIFEST_FILE } from '../constants'

type Semver = string

type MicroProjectOptions = {}

export interface Manifest {
  name: string
  version: Semver
  dependencies?: Record<string, string | Semver>
  devDependencies: Record<string, string | Semver>
  micro?: MicroProjectOptions
}

export const parseAsMicroManifest = (obj: any) => {
  if (
    typeof obj?.name === 'string' && 
    typeof obj?.version === 'string'
  ) {
    return { 
      manifest: obj as Manifest, 
      errors: undefined 
    }
  }
  return {
    manifest: undefined,
    errors: 'Not a Valid Manifest'
  }
}

export const loadManifest = (projectPath: string) => { 
  const manifestPath = join(projectPath, MANIFEST_FILE)
  const exists = pathExistsSync(manifestPath)
  
  if (!exists) {
    throw new Error(`You need to have a ${MANIFEST_FILE} in ${projectPath}`)
  }
  
  const rawManifest = readJSONSync(manifestPath)
  
  const { errors, manifest } = parseAsMicroManifest(rawManifest)
  
  if (errors || !manifest) {
    throw new Error(errors)
  }

  return manifest
}