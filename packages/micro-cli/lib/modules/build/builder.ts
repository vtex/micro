import { transformFileAsync } from '@babel/core'
import {
  BuildTarget,
  Mode,
  OnBuildCompiler,
  OnBuildPlugin,
  OnBuildPluginOptions,
  Project
} from '@vtex/micro'
import assert from 'assert'
import { outputFile } from 'fs-extra'
import { join } from 'path'

import { cleanDist, resolvePlugins } from '../../common/project'

export const lifecycle = 'onBuild'

export type BuildPlugin = new (options: OnBuildPluginOptions) => OnBuildPlugin

export const createGetFolderFromFile = (project: Project) => (file: string) => {
  const [folder] = file.replace(project.rootPath + '/', '').split('/')
  return folder
}

export const builder = async (
  project: Project,
  mode: Mode
) => {
  const entryFromFile = createGetFolderFromFile(project)
  const plugins = await resolvePlugins(project, 'onBuild')
  const frameworkCompiler = new OnBuildCompiler({ project, plugins, mode })
  let userlandCompiler: Promise<OnBuildCompiler> | null = null

  return async (f: string, printFile: boolean = true) => {
    try {
      const file = f.startsWith(project.rootPath) ? f : join(project.rootPath, f) // this is necessary because of the file watcher
      const entry = entryFromFile(file)
      const isFrameworkLand = entry === 'lib' || entry === 'plugins' || entry === 'index.ts'
      const targets: BuildTarget[] = isFrameworkLand
        ? ['cjs']
        : ['cjs', 'es6']
      const withSelfPlugin = !isFrameworkLand

      if (withSelfPlugin && !userlandCompiler) {
        const once = async () => {
          const selfPlugin = await project.getSelfPlugin(lifecycle)
          const allPlugins = selfPlugin ? [...plugins, selfPlugin] : plugins
          return new OnBuildCompiler({ project, plugins: allPlugins, mode })
        }
        userlandCompiler = once()
      }

      const compiler = isFrameworkLand ? frameworkCompiler : await userlandCompiler
      assert(compiler, '💣 Compiler needs to be available')

      for (const target of targets) {
        const config = await compiler.getConfig(target) // TODO: It may take a while to get all configs every time
        const dist = compiler.getDist(target)
        const transformed = await transformFileAsync(file, config)
        const targetFile = file.replace(project.rootPath, dist).replace(/.tsx?$/, '.js')
        if (printFile) {
          console.log('📃 Writting file to', targetFile.replace(project.rootPath, '.'))
        }
        await outputFile(targetFile, transformed?.code)
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export const clean = (project: Project, path: string) => cleanDist(lifecycle, join(project.dist, path))
