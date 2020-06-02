import { BuildPlugin, SnowpackConfig } from '@vtex/micro-core/lib'

export default class Build extends BuildPlugin {
  public getSnowpackConfig = async (previous: SnowpackConfig) => {
    return previous
  }
}
