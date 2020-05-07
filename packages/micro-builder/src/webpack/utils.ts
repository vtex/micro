import { Project } from '@vtex/micro'
import { mergeDeepWith } from 'ramda'
import { Configuration } from 'webpack'

export interface WebpackBuildConfig {
  root: string
  publicPath: {
    variable: string,
    path: string
  }
  project: Project
  runtime: {
    name: string,
    test: RegExp
  }
}

export const excludeFromModules = (files: string[]) => (path: string) => {
  if (!/node_modules/.test(path)) {
    return false
  }
  const include = files.some(
    module => path.startsWith(module)
  )
  return !include
}

export const mergeConfigs = (a: Configuration, b: Configuration) => mergeDeepWith(
  (a, b) => {
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.concat(b)
    } else {
      return b
    }
  }, 
  a, 
  b
) as Configuration