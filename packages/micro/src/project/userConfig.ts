import { pathExistsSync } from 'fs-extra'
import { join } from 'path'
import { Configuration } from 'webpack'

import { USER_CONFIG } from '../constants'

type EntryInfo = any

export interface ResolvedEntry {
  entry: string
  context: any
  status: number
  path: string
}

export interface UserConfig {
  webpack?: (microBaseConfig: Configuration) => Configuration
  router?: (path: string, entries: Record<string, EntryInfo>) => ResolvedEntry | undefined
}

export const loadUserConfig = (projectPath: string) => {
  const scriptPath = join(projectPath, USER_CONFIG)
  const exists = pathExistsSync(scriptPath)
  
  if (!exists) {
    return null  
  }
  
  console.log(`🦄 Loading custom config from ${scriptPath}`)
  const userConfig = require(scriptPath)()

  if (typeof userConfig?.webpack === 'function') {
    console.log(`💃 Custom webpack config found`)
  }

  return userConfig as UserConfig
}