import { Project, walk } from '@vtex/micro/framework'
import { emptyDir } from 'fs-extra'

export const newProject = async (target: 'onRequest' | 'onAssemble' | 'onBuild') => {
  const projectPath = process.cwd()

  const project = new Project({ rootPath: projectPath })

  console.log('🦄 Resolving dependencies')
  project.resolvePackages()
  walk(project.root, curr => {
    console.info(`📦 Micro package found: ${curr.toString()}`)
  })

  const dist = project.dist.replace(`${project.root.path}/`, '')
  console.log(`☂ Creating dist folder in ${dist}`)
  await emptyDir(project.dist)

  console.log(`🦄 [${target}]: Resolving plugins`)
  const plugins = project.resolvePlugins(target)

  return {
    project,
    plugins
  }
}

export const loadProject = () => {

}
