import { Project, walk } from '../../lib/project'
import { slugify } from './slugify'

export const entries: Record<string, string> = {
  components: './components/index.ts',
  pages: './pages/index.ts',
  route: './hooks/route/index.ts',
  render: './hooks/render/index.ts',
}

// If building an app, let's get one entrypoint per page.
// If building a library, let's get one entrypoint per component
export const webEntriesFromProject = async (
  project: Project
): Promise<Record<string, string>> => {
  // TODO: implement component sharing in build
  const entrypoints: Record<string, string> = (await project.root.pathExists(
    entries.pages
  ))
    ? { index: entries.pages }
    : { components: entries.components }

  return entrypoints
}

export const nodeAliasesFromProject = async (project: Project) => {
  const remotes: Record<string, string> = {}
  await walk(project.root, async (c, p) => {
    // Parent null means we are the tree root. Tree root
    // does not need to be on remote, since it has all code
    // in place
    if (!p || c.manifest.name === '@vtex/micro-core') {
      return
    }
    const { name } = c.manifest
    remotes[`${name}/components`] = `${name}/dist/build/node/components.js`
    remotes[`${name}/render`] = `${name}/dist/build/node/render.js`
    remotes[`${name}/route`] = `${name}/dist/build/node/route.js`
    remotes[`${name}/pages`] = `${name}/dist/build/node/pages.js`
  })
  return remotes
}

export const webAliasesFromProject = async (project: Project) => {
  const remotes: Record<string, string> = {}
  await walk(project.root, async (c, p) => {
    // Parent null means we are the tree root. Tree root
    // does not need to be on remote, since it has all code
    // in place
    if (!p || c.manifest.name === '@vtex/micro-core') {
      return
    }
    const { name } = c.manifest
    remotes[`${name}/components`] = `${name}/components/index.ts`
  })
  return remotes
}

export const nodeExternalsFromProject = async (project: Project) => {
  const remotes: Record<string, string> = {}
  await walk(project.root, async (c, p) => {
    // Parent null means we are the tree root. Tree root
    // does not need to be on remote, since it has all code
    // in place
    if (!p) {
      return
    }
    if (c.manifest.name === '@vtex/micro-core') {
      remotes[c.manifest.name] = `commonjs2 @vtex/micro-core`
      return
    }
    const { name } = c.manifest
    remotes[`${name}/components`] = `global ${c.toString()}/components`
    remotes[`${name}/render`] = `global ${c.toString()}/render`
    remotes[`${name}/route`] = `global ${c.toString()}/route`
    remotes[`${name}/pages`] = `global ${c.toString()}/pages`
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
