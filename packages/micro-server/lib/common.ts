import { Plugins, Project } from '@vtex/micro-core'

const reportPlugin = (lifecycle: string, pkg: string) => {
  console.log(`🔌 [${lifecycle}]: Plugin found ${pkg}`)
}

export type HtmlPlugin = NonNullable<Plugins['serve']>['html']
export type RouterPlugin = NonNullable<Plugins['serve']>['router']

export const resolvePlugins = async (project: Project) => {
  console.log('🦄 [serve]: Resolving plugins')
  const resolvedPlugins = await project.resolvePlugins('serve')
  for (const [name] of resolvedPlugins) {
    reportPlugin('serve', name)
  }
  return resolvedPlugins.map(([, plugin]) => plugin)
}
