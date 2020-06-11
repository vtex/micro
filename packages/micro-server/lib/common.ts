import chalk from 'chalk'

import { Hooks, LifeCycle, Project } from '@vtex/micro-core'

const reportPlugin = (lifecycle: string, pkg: string) => {
  console.log(`🔌 [${lifecycle}]: Plugin found ${chalk.blue(pkg)}`)
}

export type RenderHook = NonNullable<Hooks['render']>
export type RouterHook = NonNullable<Hooks['route']>

export const resolvePlugins = async <T extends LifeCycle>(
  project: Project,
  target: T
): Promise<Array<NonNullable<Hooks[T]>>> => {
  console.log(`🦄 [${target}]: Resolving plugins`)
  const resolvedPlugins = await project.resolvePlugins(target)
  for (const [name] of resolvedPlugins) {
    reportPlugin(target, name)
  }
  return resolvedPlugins.map(([, plugin]) => plugin)
}
