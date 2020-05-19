import { LifeCycle, MICRO_BUILD_DIR, Plugins, Project, walk } from '@vtex/micro'
import assert from 'assert'
import chalk from 'chalk'
import { emptyDir } from 'fs-extra'
import { join } from 'path'

export const newProject = async () => {
  const projectPath = process.cwd()

  const project = new Project({ rootPath: projectPath })

  console.log('🦄 Resolving dependencies')
  await project.resolvePackages()
  walk(project.root, curr => {
    console.info(`📦 Micro package found: ${curr.toString()}`)
  })

  return project
}

export const cleanDist = async (path: string) => {
  console.log(`☂ Creating dist folder in ${chalk.cyanBright(join(MICRO_BUILD_DIR, path.split(MICRO_BUILD_DIR)[1]))}`)
  await emptyDir(path)
}

export const resolvePlugins = async <T extends LifeCycle>(project: Project, lifecycle: T): Promise<NonNullable<Plugins[T]>[]> => {
  const {
    root: { manifest: { micro: { plugins: pls } } }
  } = project
  const names = (pls[lifecycle] || []) as string[]

  console.log(`🦄 [${lifecycle}]: Resolving plugins`)
  const plugins = await project.resolvePlugins(lifecycle)

  assert(
    plugins.length === names.length ||
    plugins.length === names.length - 1, // in case this is a self referenced project
    '💣 Something went wrong when resolving the project\'s plugins'
  )

  for (const pkg of names) {
    console.log(`🔌 [${lifecycle}]: Plugin found ${pkg}`)
  }

  return plugins
}

export const loadProject = () => {

}
