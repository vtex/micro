import { pathExists } from 'fs-extra'
import { join } from 'path'
import { Configuration } from 'webpack'

import { USER_CONFIG } from '../constants'

export interface UserConfig {
  webpack: (microBaseConfig: Configuration) => Configuration
}

export const loadUserConfig = async (projectPath: string) => {
  const scriptPath = join(projectPath, USER_CONFIG)
  const exists = await pathExists(scriptPath)
  
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