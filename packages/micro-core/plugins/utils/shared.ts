import { basename, extname } from 'path'

import { Project, walk } from '../../lib/project'

export const sharedDepsFromProject = (project: Project) =>
  project.root.manifest.peerDependencies ?? {}

export const exposesFromProject = async (project: Project) => {
  const allFiles = await project.root.getFiles('components')
  return allFiles
    .map((f) => f.replace(project.rootPath, '.').split('/'))
    .filter((s) => s.length === 3)
    .reduce((acc, curr) => {
      const [, , c] = curr
      const entry = basename(c, extname(c))
      acc[entry] = curr.join('/')
      return acc
    }, {} as Record<string, string>)
}

export const entriesFromProject = async (project: Project) => {
  const [pages, components] = await Promise.all([
    project.root.getFiles('pages'),
    project.root.getFiles('components'),
  ])
  // If building an app, let's get one entrypoint per page.
  // If building a library, let's get one entrypoint per component
  const allFiles = pages.length > 0 ? pages : components
  return allFiles
    .map((f) => f.replace(project.rootPath, '.').split('/'))
    .filter((s) => s.length === 3)
    .reduce((acc, curr) => {
      const [, , c] = curr
      const entry = basename(c, extname(c))
      acc[entry] = curr.join('/')
      return acc
    }, {} as Record<string, string>)
}

export const remotesFromProject = (project: Project) => {
  const remotes: Record<string, string> = {}
  walk(project.root, (c, p) => {
    // Parent null means we are the tree root. Tree root
    // does not need to be on remote, since it has all code
    // in place
    if (!p || c.manifest.name === '@vtex/micro-core') {
      return
    }
    remotes[c.manifest.name] = c.resolve()
  })
  return remotes
}
