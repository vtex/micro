import { spawn } from 'child_process'
import { join } from 'path'

import { outputJSON, pathExists } from 'fs-extra'
import { Configuration } from 'webpack'

import {
  BaseTSConfig,
  BuildCompiler,
  Mode,
  PackageStructure,
  Project,
} from '@vtex/micro-core'

import { ensureDist, resolvePlugins } from '../../common/project'
import { MAX_RESPAWNS } from '../../constants'

export const lifecycle = 'build'

const createTSCSpawner = <T>(watch: boolean, options: T) => {
  let respawns = 0
  return () => {
    respawns += 1
    if (respawns < MAX_RESPAWNS) {
      console.log('📓 Spawning tsc ...')
      const args = watch ? ['--watch'] : []
      return spawn('tsc', args, options)
    }
    return null
  }
}

export const tscCompiler = async (project: Project) => {
  const tsconfigPath = join(project.rootPath, PackageStructure.tsconfig)
  const exists = await pathExists(tsconfigPath)
  if (!exists) {
    await outputJSON(tsconfigPath, BaseTSConfig)
  }
  const spawnTSC = createTSCSpawner(false, {
    cwd: project.rootPath,
    env: process.env,
    shell: true,
    detached: false,
    stdio: 'inherit',
  })
  const tsc = spawnTSC()
  return new Promise((resolve) => {
    tsc?.on('close', (code) => (code !== 0 ? process.exit(code) : resolve()))
  })
}

export const tscWatcher = (project: Project) => {
  const spawnTSC = createTSCSpawner(true, {
    cwd: project.rootPath,
    env: process.env,
    shell: true,
    detached: false,
    stdio: 'pipe',
  })
  const tsc = spawnTSC()
  tsc?.stdout.on('data', (data) => console.log(data.toString()))

  // TODO: Make it possible to receive this kind of feedback
  // tsc?.stderr.on('data', (data) => console.log(data.toString()))

  tsc?.on('close', (code) => {
    if (code !== 0) {
      console.log(`💣 tsc process exited with code ${code}`)
    }
    spawnTSC()
  })
  return tsc
}

export const clean = (project: Project, path: string) =>
  ensureDist(lifecycle, join(project.dist, path))

export const getConfigs = async (project: Project, mode: Mode) => {
  // Sometimes the package only contains `plugins` or `lib`.
  // In this case, there is nothing to bundle and the build is complete
  const [hasPages, hasComponents, hasRender, hasRoute] = await Promise.all([
    project.root.pathExists('./pages/index.ts'),
    project.root.pathExists('./components/index.ts'),
    project.root.pathExists('./hooks/render/index.ts'),
    project.root.pathExists('./hooks/route/index.ts'),
  ])

  if (!hasPages && !hasRender && !hasRoute && !hasComponents) {
    return
  }

  const pluginsResolutionsMsg = '🦄 Plugins resolution took'
  console.time(pluginsResolutionsMsg)
  const plugins = await resolvePlugins(project, lifecycle)
  const compiler = new BuildCompiler({ project, plugins, mode })
  const maybeConfigs = await Promise.all([
    hasPages ? compiler.getWepbackConfig('web') : null,
    hasPages ? compiler.getWepbackConfig('pages') : null,
    hasRender ? compiler.getWepbackConfig('render') : null,
    hasRoute ? compiler.getWepbackConfig('route') : null,
    hasComponents ? compiler.getWepbackConfig('components') : null,
  ])
  const configs = maybeConfigs.filter((c): c is Configuration => !!c)
  console.timeEnd(pluginsResolutionsMsg)

  return { configs, compiler }
}
