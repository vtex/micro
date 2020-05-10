import { sync as syncGlob } from 'glob'
import { join } from 'path'

export const resolveFiles = (packagePath: string) => syncGlob(
  '@(pages|components|utils)/**/*.ts?(x)',
  {
    cwd: packagePath,
    nodir: true
  }
).map(path => join(packagePath, path))

export const resolvePages = (projectPath: string) => syncGlob(
  '@(pages)/**/*.ts?(x)',
  {
    cwd: projectPath,
    nodir: true
  }
).map(p => `./${p}`)
