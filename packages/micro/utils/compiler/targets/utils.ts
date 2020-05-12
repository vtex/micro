import webpack, { Configuration, MultiCompiler } from 'webpack'

import { mergeConfigs } from '../../common/webpack'
import { Package } from '../../package'
import { Plugin } from '../../plugin'
import { Compiler, CompilerOptions } from '../base'

const target = 'utils'

export class UtilsBuilder extends Compiler<UtilsBuilderPlugin> {
  private _compiler: MultiCompiler | null = null

  constructor ({ project }: Omit<CompilerOptions, 'target'>) {
    super({ project, target })
  }

  public get compiler () {
    if (!this._compiler) {
      const config = this.mergePluginsConfigs()
      this._compiler = webpack(config)
    }
    return this._compiler
  }

  protected mergePluginsConfigs = (): Configuration[] => this.plugins.reduce(
    (acc, plugin) => {
      const pluginConfigs = plugin.getConfig(this.project.root)

      if (pluginConfigs.length === 0) {
        return acc
      }

      for (const config of pluginConfigs) {
        const { name } = config

        if (!name) {
          throw new Error('Plugin must name config target')
        }

        const index = acc.findIndex(x => x.name === name)
        if (index > -1 && index < acc.length) {
          acc[index] = mergeConfigs(acc[index], config)
        } else {
          acc.push(config)
        }
      }

      return acc
    },
    [] as Configuration[]
  )
}

export class UtilsBuilderPlugin extends Plugin {
  constructor () {
    super({ target })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getConfig = (_: Package): Configuration[] => {
    throw new Error('Not Implemented')
  }
}
