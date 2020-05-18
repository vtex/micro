import { Plugins, Project, walk } from '@vtex/micro'
import { emptyDir } from 'fs-extra'

export const newProject = () => {
  const projectPath = process.cwd()

  const project = new Project({ rootPath: projectPath })

  console.log('🦄 Resolving dependencies')
  project.resolvePackages()
  walk(project.root, curr => {
    console.info(`📦 Micro package found: ${curr.toString()}`)
  })

  return project
}

export const cleanDist = async (path: string) => {
  console.log(`☂ Creating dist folder in ${path}`)
  await emptyDir(path)
}

export const resolveProject = async (project: Project, target: keyof Plugins) => {
  console.log(`🦄 [${target}]: Resolving plugins`)
  return project.resolvePlugins(target)
}

export const loadProject = () => {

}
