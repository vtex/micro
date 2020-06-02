import { transformFileAsync, TransformOptions } from '@babel/core'
import {
  BuildCompiler,
  BuildTarget,
  Mode,
  Project
} from '@vtex/micro-core/lib'
import chalk from 'chalk'
import { outputFile } from 'fs-extra'
import { join } from 'path'

import { ensureDist, resolvePlugins } from '../../common/project'
import { resolveSelfPlugin } from './../../common/project'

export const lifecycle = 'build'

export const createGetFolderFromFile = (project: Project) => (file: string) => {
  const [folder] = file.replace(project.rootPath + '/', '').split('/')
  return folder
}

const hrtimeToMilis = ([s, ns]: [number, number]) => s * 1e3 + ns / 1e6

export const rejectDeclarationFiles = (files: string[]) => files.filter(
  f => !f.endsWith('.d.ts')
)

export const getBuilders = async (
  project: Project,
  mode: Mode
) => {
  const plugins = await resolvePlugins(project, lifecycle)

  // File Watcher does not starts with Project Path. We need to fix it to get absolute paths
  const fixWatcherPath = (f: string) => f.startsWith(project.rootPath) ? f : join(project.rootPath, f)

  const createPreBuild = async () => {
    const target: BuildTarget = 'cjs'
    const compiler = new BuildCompiler({ project, plugins, mode })
    const config = await compiler.getBabelConfig(target) // TODO: It may take a while to get all configs every time
    const dist = compiler.getDist(target)

    const prebuild = async (f: string, printFile: boolean = true) => {
      const start = process.hrtime()
      const file = fixWatcherPath(f)
      const transformed = await transformFileAsync(file, config)
      const targetFile = file.replace(project.rootPath, dist).replace(/.tsx?$/, '.js')
      if (printFile) {
        console.log(`📃 [${chalk.blue(lifecycle)}:${chalk.magenta(target)}] ${chalk.green('Compiling')} ${f.replace(project.rootPath, '')} ${chalk.green('->')} ${targetFile.replace(project.rootPath, '.')} took ${chalk.yellow(hrtimeToMilis(process.hrtime(start)))}ms`)
      }
      await outputFile(targetFile, transformed?.code)
    }

    return {
      prebuild,
      compiler
    }
  }

  const createBuild = async () => {
    const selfPlugin = await resolveSelfPlugin(project, lifecycle)
    const allPlugins = selfPlugin ? [selfPlugin, ...plugins] : plugins
    const compiler = new BuildCompiler({ project, plugins: allPlugins, mode })
    const targetConfigs: [BuildTarget, string, TransformOptions][] = [
      ['cjs', compiler.getDist('cjs'), await compiler.getBabelConfig('cjs')],
      ['es6', compiler.getDist('es6'), await compiler.getBabelConfig('es6')]
    ]

    const build = async (f: string, printFile: boolean = true) => {
      const start = process.hrtime()
      const file = fixWatcherPath(f)
      for (const [target, dist, config] of targetConfigs) {
        const transformed = await transformFileAsync(file, config)
        const targetFile = file.replace(project.rootPath, dist).replace(/.tsx?$/, '.js')
        if (printFile) {
          console.log(`📃 [${chalk.blue(lifecycle)}:${target === 'cjs' ? chalk.magenta(target) : chalk.red(target)}] ${chalk.green('Compiling')} ${f.replace(project.rootPath, '')} ${chalk.green('->')} ${targetFile.replace(project.rootPath, '.')} took ${chalk.yellow(hrtimeToMilis(process.hrtime(start)))}ms`)
        }
        await outputFile(targetFile, transformed?.code)
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
