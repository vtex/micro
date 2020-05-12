import webpack, { Configuration, MultiCompiler } from 'webpack'

import { mergeConfigs } from '../../common/webpack'
import { Plugin } from '../../plugin'
import { Project } from '../../project'
import { Compiler, CompilerOptions } from '../base'

export const ComponentsTargets = {
  nodejs: 'nodejs',
  webnew: 'webnew',
  webold: 'webold'
}

type Mode = 'production' | 'development'

const target = 'components'

export class ComponentsBuilder extends Compiler<ComponentsBuilderPlugin> {
  private _compiler: MultiCompiler | null = null

  constructor ({ project }: Omit<CompilerOptions, 'target'>) {
    super({ project, target })
  }

  public getCompiler (mode: Mode) {
    if (!this._compiler) {
      const config = this.mergePluginsConfigs(mode)
      this._compiler = webpack(config)
    }
    return this._compiler
  }

  protected mergePluginsConfigs = (mode: Mode): Configuration[] => this.plugins.reduce(
    (acc, plugin) => {
      const pluginConfigs = plugin.getConfig({
        mode,
        project: this.project
      })

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

export interface ComponentsConfigOptions {
  mode: Mode
  project: Project
}

export class ComponentsBuilderPlugin extends Plugin {
  constructor () {
    super({ target })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getConfig = (options: ComponentsConfigOptions): Configuration[] => {
    throw new Error('Not Implemented')
  }
}
