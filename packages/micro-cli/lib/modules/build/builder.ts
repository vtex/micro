import { transformFileAsync, TransformOptions } from '@babel/core'
import {
  BuildTarget,
  Mode,
  OnBuildCompiler,
  OnBuildPlugin,
  OnBuildPluginOptions,
  Project
} from '@vtex/micro'
import { outputFile } from 'fs-extra'
import { join } from 'path'

import { ensureDist, resolvePlugins } from '../../common/project'

export const lifecycle = 'onBuild'

export type BuildPlugin = new (options: OnBuildPluginOptions) => OnBuildPlugin

export const createGetFolderFromFile = (project: Project) => (file: string) => {
  const [folder] = file.replace(project.rootPath + '/', '').split('/')
  return folder
}

const hrtimeToMilis = ([s, ns]: [number, number]) => s * 1e3 + ns / 1e6

export const getBuilders = async (
  project: Project,
  mode: Mode
) => {
  const plugins = await resolvePlugins(project, 'onBuild')

  // File Watcher does not starts with Project Path. We need to fix it to get absolute paths
  const fixWatcherPath = (f: string) => f.startsWith(project.rootPath) ? f : join(project.rootPath, f)

  const createPreBuild = async () => {
    const target: BuildTarget = 'cjs'
    const compiler = new OnBuildCompiler({ project, plugins, mode })
    const config = await compiler.getConfig(target) // TODO: It may take a while to get all configs every time
    const dist = compiler.getDist(target)

    const prebuild = async (f: string, printFile: boolean = true) => {
      try {
        const start = process.hrtime()
        const file = fixWatcherPath(f)
        const transformed = await transformFileAsync(file, config)
        const targetFile = file.replace(project.rootPath, dist).replace(/.tsx?$/, '.js')
        if (printFile) {
          console.log('📃 Compiling', f.replace(project.rootPath, ''), '->', targetFile.replace(project.rootPath, '.'), 'took', hrtimeToMilis(process.hrtime(start)), 'ms')
        }
        await outputFile(targetFile, transformed?.code)
      } catch (error) {
        console.error(error)
        throw error
      }
    }

    return {
      prebuild,
      compiler
    }
  }

  const createBuild = async () => {
    const selfPlugin = await project.getSelfPlugin(lifecycle)
    const allPlugins = selfPlugin ? [...plugins, selfPlugin] : plugins
    const compiler = new OnBuildCompiler({ project, plugins: allPlugins, mode })
    const targetConfigs: [string, TransformOptions][] = [
      [compiler.getDist('cjs'), await compiler.getConfig('cjs')],
      [compiler.getDist('es6'), await compiler.getConfig('es6')]
    ]

    const build = async (f: string, printFile: boolean = true) => {
      try {
        const start = process.hrtime()
        const file = fixWatcherPath(f)
        for (const [dist, config] of targetConfigs) {
          const transformed = await transformFileAsync(file, config)
          const targetFile = file.replace(project.rootPath, dist).replace(/.tsx?$/, '.js')
          if (printFile) {
            console.log('📃 Compiling', f.replace(project.rootPath, ''), '->', targetFile.replace(project.rootPath, '.'), 'took', hrtimeToMilis(process.hrtime(start)), 'ms')
          }
          await outputFile(targetFile, transformed?.code)
        }
      } catch (error) {
        console.error(error)
        throw error
      }
    }

    return {
      build,
      compiler
    }
  }

  return { createBuild, createPreBuild }
}

export const clean = (project: Project, path: string) => ensureDist(lifecycle, join(project.dist, path))
