import { Plugins, Project } from '@vtex/micro-core/lib'

const reportPlugin = (lifecycle: string, pkg: string) => {
  console.log(`🔌 [${lifecycle}]: Plugin found ${pkg}`)
}

export type HtmlPlugin = NonNullable<Plugins['serve']>['html']
export type RouterPlugin = NonNullable<Plugins['serve']>['router']

export const resolvePlugins = async (project: Project) => {
  console.log('🦄 [serve]: Resolving plugins')
  const pluginsRecord = await project.resolvePlugins('serve')
  const selfPlugin = await project.getSelfPlugin('serve')
  for (const pkg of Object.keys(pluginsRecord)) {
    reportPlugin('serve', pkg)
  }
  const plugins = [
    ...selfPlugin ? [selfPlugin] : [],
    ...Object.values(pluginsRecord)
  ]
  return plugins.filter((p): p is NonNullable<Plugins['serve']> => !!p)
}
