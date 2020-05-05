import { emptyDir, outputJSON, readJSON } from 'fs-extra'
import { join } from 'path'
import webpack, { Configuration, Stats } from 'webpack'

import { MICRO_BUILD_DIR, ARTIFACTS_FILE } from '../constants'
import { Project } from '../project'
import {
  dev as commonDevConfig,
  prod as commonProdConfig,
} from './webpack/common'
import {
  dev as nodeJSDevConfig,
  prod as nodeJSProdConfig,
  target as nodeJSTarget,
} from './webpack/nodejs'
import { mergeConfigs } from './webpack/utils'
import {
  prod as webNewProdConfig,
  target as webNewtarget,
} from './webpack/web-new'

interface Options {
  project: Project
  production: boolean
}

export class Build {
  // Build root folder
  public root: string
  public production: boolean
  public project: Project

  constructor({ project, production }: Options) {
    this.production = production
    this.project = project
    this.root = join(this.project.root, MICRO_BUILD_DIR)
  }

  public clear = async () => {
    await emptyDir(this.root)
  }

  public config = async (): Promise<Configuration[]> => {
    const build = this
    const { 
      production, 
      project: {
        userConfig
      }
    } = this

    const targetConfigs = production ? {
      // [webOldtarget]: webOldProdConfig({ project, tmpDir, modules }),
      [webNewtarget]: webNewProdConfig({ build }),
      [nodeJSTarget]: nodeJSProdConfig({ build }),
    } : {
      // [webOldtarget]: webOldProdConfig({ tmpDir }),
      [webNewtarget]: webNewProdConfig({ build }),
      [nodeJSTarget]: nodeJSDevConfig({ build }),
    }
    const commonConfig = production 
      ? commonProdConfig({ build }) 
      : commonDevConfig({ build })

    const microConfigs = Object.values(targetConfigs).map(targetConfig => mergeConfigs(commonConfig, targetConfig))
    const configs = typeof userConfig?.webpack === 'function'
      ? microConfigs.map(config => userConfig.webpack(config))
      : microConfigs
    
    return configs
  }

  public run = async (configs: Configuration[]) => {
    const compiler = webpack(configs)

    return new Promise<Stats.ToJsonOutput>(
      (resolve, reject) => compiler.run((err, stats) => err
        ? reject(err)
        : resolve(stats?.toJson({
          hash: true,
          publicPath: true,
          assets: true,
          chunks: false,
          modules: false,
          source: false,
          errorDetails: false,
          timings: false,
        }))
      )
    )
  }

  public saveStats = (statsJSON: Stats.ToJsonOutput) => outputJSON(join(this.root, ARTIFACTS_FILE), statsJSON)

  public loadStats = () => readJSON(join(this.root, ARTIFACTS_FILE)) as Promise<Stats.ToJsonOutput>
}

export const newBuild = async (options: Options) => {
  const build = new Build(options)
  await build.clear()
  return build
}

export const loadBuild = async (options: Options) => {
  const build = new Build(options)
  return build.loadStats()
}