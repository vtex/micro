import assert from 'assert'
import { join } from 'path'

import pnp from 'pnpapi'

import { PublicPaths } from './common/publicPaths'
import { Alias } from './lifecycles/build'
import { getLocatorFromPackageInWorkspace } from './package/pnp/common'
import { readManifest, walk as walkPnp } from './package/pnp/dfs'
import { Project } from './project'

const SEPARATOR = '__imports__'

export const parseImportPath = (x: string) => {
  const [issuer, rest] = x.split('__imports__')
  const splitted = rest.slice(1).split('/')
  const module = splitted[0].startsWith('@')
    ? splitted.slice(0, 2).join('/')
    : splitted[0]
  const filepath = rest.replace(module, '')
  return {
    issuer,
    module,
    filepath,
  }
}

type ImportMapPath = ReturnType<typeof parseImportPath>

export const formatImportPath = ({ issuer, module, filepath }: ImportMapPath) =>
  join(issuer, SEPARATOR, module, filepath)

// TODO: Make it work for pure linked dependencies with `yarn link`
export const resolveProjectAliases = async (
  project: Project,
  linker: 'pnp' | 'node-modules' = 'pnp'
) => {
  assert(linker === 'pnp', '💣 Only PnP linker is implemented yet') // TODO: implement other linkers
  const root = getLocatorFromPackageInWorkspace(project.root.manifest.name)
  let aliases: Alias[] = []

  await walkPnp(root, async (node, parent) => {
    if (parent === null) {
      return
    }

    const nodeInfo = pnp.getPackageInformation(node)
    const parentInfo = pnp.getPackageInformation(parent)

    const manifest = await readManifest(node, parent)

    const isModule = (manifest as any).module
    const isDirectDependency = parent.name === project.root.manifest.name
    const isParentLinked = (parentInfo as any).linkType === 'SOFT'
    const isLinked = (nodeInfo as any).linkType === 'SOFT'

    // The current package is linked, we need to serve it from the local filesystem
    if (isLinked || !isModule) {
      const absoluteImport = {
        name: manifest.name,
        version: `^${manifest.version}`,
        resolve: formatImportPath({
          issuer: parent!.name!,
          module: manifest.name,
          filepath: 'index.js',
        }),
      }
      const relativeImport = {
        name: `${manifest.name}/`,
        version: `^${manifest.version}`,
        resolve: formatImportPath({
          issuer: parent!.name!,
          module: manifest.name,
          filepath: '/',
        }),
      }
      aliases = aliases.concat(absoluteImport, relativeImport)
    } else if (isParentLinked || isDirectDependency) {
      aliases.push({ name: manifest.name, version: `^${manifest.version}` })
    }
  })

  return aliases
}

export interface ImportMap {
  imports: Record<string, string>
  scopes?: Record<string, Record<string, string>>
}

export const importMapFromAliases = (
  projectAliases: Alias[],
  pluginAliases: Alias[],
  publicPaths: PublicPaths
): ImportMap => {
  const aliases = [...projectAliases, ...pluginAliases]
  const imports = aliases.reduce((acc, { name, version, resolve }) => {
    acc[name] = resolve
      ? join(publicPaths.assets, resolve)
      : `https://cdn.pika.dev/${name}@${version}`
    return acc
  }, {} as Record<string, string>)
  return { imports }
}
