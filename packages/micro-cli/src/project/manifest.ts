import { pathExists, readJSON } from 'fs-extra'
import { join } from 'path'
import { isEmpty } from 'ramda'

import { MANIFEST_FILE } from '../constants'

type Semver = string

export interface Manifest {
  name: string
  version: Semver
  dependencies: Record<string, string | Semver>
  devDependencies: Record<string, string | Semver>
  micro?: {
    exposes: string[]
  }
}

export const parseAsMicroManifest = (obj: any) => {
  if (
    typeof obj?.name === 'string' && 
    typeof obj?.version === 'string' && 
    (obj?.dependencies != null && !isEmpty(obj?.dependencies))
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

export const loadManifest = async (projectPath: string) => { 
  const manifestPath = join(projectPath, MANIFEST_FILE)
  const exists = await pathExists(manifestPath)
  
  if (!exists) {
    throw new Error(`You need to have a ${MANIFEST_FILE} in ${projectPath}`)
  }
  
  const rawManifest = await readJSON(manifestPath)
  
  const { errors, manifest } = parseAsMicroManifest(rawManifest)
  
  if (errors || !manifest) {
    throw new Error(errors)
  }

  return manifest
}