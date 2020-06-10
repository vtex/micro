import { basename, extname } from 'path'

import { Project, walk } from '../../lib/project'
import { MICRO_ENTRYPOINT } from '../build'
import { slugify } from './slugify'

export const exposesFromProject = async (project: Project) => {
  const allFiles = await project.root.getFiles('components')
  return allFiles
    .map((f) => f.replace(project.rootPath, '.').split('/'))
    .filter((s) => s.length === 3)
    .reduce((acc, curr) => {
      const [, , c] = curr
      const ext = extname(c)
      const entry = basename(c, ext)
      acc[entry] = curr.join('/').replace(ext, '')
      return acc
    }, {} as Record<string, string>)
}

export const webEntriesFromProject = async (project: Project) => {
  const hasPages = await project.root.pathExists('pages')
  // If building an app, let's get one entrypoint per page.
  // If building a library, let's get one entrypoint per component
  if (hasPages) {
    const file = (await project.root.pathExists('./index.tsx'))
      ? './index.tsx'
      : './index.ts'
    return {
      [MICRO_ENTRYPOINT]: file,
    }
  }

  const files = await project.root.getFiles('components')
  return files
    .map((f) => f.replace(project.rootPath, '.').split('/'))
    .filter((s) => s.length === 3)
    .reduce((acc, curr) => {
      const [, , c] = curr
      const entry = basename(c, extname(c))
      acc[entry] = curr.join('/')
      return acc
    }, {} as Record<string, string>)
}

export const nodeEntryFromProject = async (project: Project) => {
  const file = (await project.root.pathExists('./index.tsx'))
    ? './index.tsx'
    : './index.ts'
  return {
    [MICRO_ENTRYPOINT]: file,
  }
}

export const nodeExternalsFromProject = async (project: Project) => {
  const remotes: Record<string, string> = {}
  await walk(project.root, async (c, p) => {
    // Parent null means we are the tree root. Tree root
    // does not need to be on remote, since it has all code
    // in place
    const resolved = await c.resolve('main')
    if (typeof resolved === 'string') {
      remotes[c.manifest.name] = resolved
    }
  })
  return remotes
}

export const webFederationRemotesFromProject = async (project: Project) => {
  const remotes: Record<string, string> = {}
  await walk(project.root, async (c, p) => {
    const { name } = c.manifest
    // Parent null means we are the tree root. Tree root
    // does not need to be on remote, since it has all code
    // in place
    if (!p || name === '@vtex/micro-core') {
      return
    }
    remotes[name] = slugify(name)
  })
  return remotes
}
