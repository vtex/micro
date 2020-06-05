import { spawn } from 'child_process'
import { join } from 'path'

import { outputJSON, pathExists } from 'fs-extra'

import { BaseTSConfig, PackageStructure, Project } from '@vtex/micro-core'

import { ensureDist } from '../../common/project'
import { MAX_RESPAWNS } from '../../constants'

export const lifecycle = 'build'

export const createGetFolderFromFile = (project: Project) => (file: string) => {
  const [folder] = file.replace(`${project.rootPath}/`, '').split('/')
  return folder
}

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

export const rejectDeclarationFiles = (files: string[]) =>
  files.filter((f) => !f.endsWith('.d.ts'))

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
