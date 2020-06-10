import { join } from 'path'

import chalk from 'chalk'
import { ensureDir } from 'fs-extra'

import {
  LifeCycle,
  MICRO_BUILD_DIR,
  Hooks,
  Project,
  walk,
} from '@vtex/micro-core'

export const newProject = async () => {
  const projectPath = process.cwd()

  const project = new Project({ rootPath: projectPath })

  console.log('🦄 Resolving dependencies')
  await project.resolvePackages()
  await walk(project.root, async (curr) => {
    console.info(`📦 Micro package found: ${curr.toString()}`)
  })

  return project
}

export const ensureDist = async (target: string, path: string) => {
  console.log(
    `🎯 [${target}]: Ensuring dist folder in ${chalk.cyanBright(
      join(MICRO_BUILD_DIR, path.split(MICRO_BUILD_DIR)[1])
    )}`
  )
  await ensureDir(path)
}

const reportPlugin = (lifecycle: string, pkg: string) => {
  console.log(`🔌 [${lifecycle}]: Plugin found ${pkg}`)
}

export const resolvePlugins = async <T extends LifeCycle>(
  project: Project,
  lifecycle: T
): Promise<Array<NonNullable<Hooks[T]>>> => {
  console.log(`🦄 [${lifecycle}]: Resolving plugins`)
  const resolvedPlugins = await project.resolvePlugins(lifecycle)

  for (const [pluginName] of resolvedPlugins) {
    reportPlugin(lifecycle, pluginName)
  }

  return resolvedPlugins.map(([, plugin]) => plugin)
}

export const loadProject = () => {}
