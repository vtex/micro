import { Project } from '@vtex/micro'
import { emptyDir, outputJSON, readJSON } from 'fs-extra'
import { join } from 'path'

import {
  BUILD_STATE_FILE,
  DEFAULT_BUILD_CONFIG,
  MICRO_BUILD_DIR,
} from './constants'
import { MicroWebpack } from './webpack'
import { WebpackBuildConfig } from './webpack/utils'

export { target as webNewTarget } from './webpack/web-new'
export { target as nodeJSTarget } from './webpack/nodejs'
export * from './constants'

export class Build {
  // Build root folder
  public root: string
  public buildConfig: WebpackBuildConfig
  public webpack: MicroWebpack

  constructor(
    public production: boolean,
    project: Project,
    buildConfig?: WebpackBuildConfig,
    public buildDir: string = MICRO_BUILD_DIR,
  ) {
    this.root = join(project.root, buildDir)

    this.buildConfig = {
      ...DEFAULT_BUILD_CONFIG,
      root: this.root,
      project,
      ...buildConfig
    }
    this.webpack = new MicroWebpack(
      this.buildConfig,
      production
    )
  }

  public clear = async () => {
    await emptyDir(this.root)
  }

  public serialize = () => {
    const statsJSON = this.webpack.serialize()
    const {
      project,
      ...partialBuildConfig
    } = this.buildConfig
    const production = this.production
    return {
      statsJSON,
      partialBuildConfig,
      production,
    }
  }
}

const buildDirFromProject = (project: Project, buildDir = MICRO_BUILD_DIR) => join(project.root, buildDir)

const pathStateFromBuild = (build: Build): string => join(build.root, BUILD_STATE_FILE)

export const saveBuildState = async (build: Build) => {
  const path = pathStateFromBuild(build)
  const blob = build.serialize()
  await outputJSON(path, blob)
}

export const loadBuild = async (project: Project, buildDir: string = MICRO_BUILD_DIR) => {
  const dir = join(buildDirFromProject(project, buildDir), BUILD_STATE_FILE)
  const { 
    statsJSON, 
    partialBuildConfig, 
    production 
  }: ReturnType<Build['serialize']> = await readJSON(dir)
  
  const buildConfig = {
    project,
    ...partialBuildConfig
  }

  const build = new Build(production, project, buildConfig, buildDir)

  build.webpack.hydrate(statsJSON)

  return build
}

export const newBuild = async (production: boolean, project: Project, buildConfig?: WebpackBuildConfig, buildDir: string = MICRO_BUILD_DIR) => {
  const build = new Build(production, project, buildConfig, buildDir)
  await build.clear()
  return build
}
