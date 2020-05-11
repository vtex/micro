import webpack, { Configuration, MultiCompiler, Stats } from 'webpack'

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

  public compiler = (configs: Configuration[]) => webpack(configs)

  public run = (compiler: MultiCompiler) => new Promise<MultiCompiler>(
    (resolve, reject) => compiler.run(
      (err, stats) => {
        if (err) {
          return reject(err)
        }
        this.stats = this.toJson(stats)
        return resolve(compiler)
      }
    )
  )

  public watch = (compiler: MultiCompiler) =>
    compiler.watch({}, (err, stats) => {
      if (err) {
        console.error(err)
      }
      const statsJSON = this.toJson(stats)
      this.stats = this.stats || statsJSON
      if (statsJSON?.children && this.stats && this.stats.children) {
        for (const child of statsJSON?.children) {
          const index = this.stats?.children?.findIndex(c => c.name === child.name)
          this.stats.children[index] = child
        }
      }
    })

  public serialize = () => this.stats

  public toJson = (stats: Stats | null) => stats?.toJson({
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
