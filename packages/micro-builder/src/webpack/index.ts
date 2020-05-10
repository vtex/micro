import webpack, { Configuration, Stats } from 'webpack'

import { dev as commonDevConfig, prod as commonProdConfig } from './common'
import {
  dev as nodeJSDevConfig,
  prod as nodeJSProdConfig,
  target as nodeJSTarget
} from './nodejs'
import { mergeConfigs, WebpackBuildConfig } from './utils'
import {
  dev as webNewDevConfig,
  prod as webNewProdConfig,
  target as webNewtarget
} from './web-new'

export class MicroWebpack {
  public stats: Stats.ToJsonOutput | null | undefined = null

  constructor (
    private buildConfig: WebpackBuildConfig,
    private production: boolean
  ) {}

  public getConfig = async (): Promise<Configuration[]> => {
    const targetConfigs = this.production ? {
      [webNewtarget]: webNewProdConfig(this.buildConfig),
      [nodeJSTarget]: nodeJSProdConfig(this.buildConfig)
    } : {
      [webNewtarget]: webNewDevConfig(this.buildConfig),
      [nodeJSTarget]: nodeJSDevConfig(this.buildConfig)
    }
    const commonConfig = this.production
      ? commonProdConfig(this.buildConfig)
      : commonDevConfig(this.buildConfig)

    const microConfigs = Object.values(targetConfigs).map(
      targetConfig => mergeConfigs(commonConfig, targetConfig)
    )

    const { userConfig } = this.buildConfig.project

    const configs = typeof userConfig?.webpack === 'function'
      ? microConfigs.map(userConfig.webpack)
      : microConfigs

    return configs
  }

  public run = async (configs: Configuration[]) => {
    const compiler = webpack(configs)

    return new Promise<Stats>(
      (resolve, reject) => compiler.run(
        (err, stats) => {
          if (err) {
            return reject(err)
          }
          this.stats = this.toJson(stats)
          return resolve(stats)
        }
      )
    )
  }

  public serialize = () => this.stats

  private toJson = (stats: Stats | null) => stats?.toJson({
    hash: true,
    publicPath: true,
    assets: true,
    chunks: false,
    modules: false,
    source: false,
    errorDetails: false,
    timings: false
  })

  public hydrate = (stats: Stats.ToJsonOutput | null | undefined) => {
    this.stats = stats
  }
}
