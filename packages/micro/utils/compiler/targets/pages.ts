import { join } from 'path'
import { difference } from 'ramda'
import webpack, { Configuration, MultiCompiler } from 'webpack'

import { Plugin } from '../../plugin'
import { Project } from '../../project'
import { Compiler, CompilerOptions } from '../base'

export const pagesRuntimeName = 'micro-runtime'
export const pagesFrameworkName = 'micro-framework'

export const Platforms = {
  nodejs: 'nodejs',
  webnew: 'webnew',
  webold: 'webold'
}

export type Platform = keyof typeof Platforms

type Mode = 'production' | 'development'

const target = 'pages'

export class PagesBuilder extends Compiler<PagesBuilderPlugin> {
  private _compiler: MultiCompiler | null = null

  constructor ({ project }: Omit<CompilerOptions, 'target'>) {
    super({ project, target })
  }

  public getCompiler = (mode: Mode) => {
    if (!this._compiler) {
      const configs = this.mergePluginsConfigs(mode)
      this.ensureEntrypoints(configs)

      const filteredConfigs = mode === 'development'
        ? configs.filter(c => c.name !== Platforms.webold)
        // TODO: change to `configs` before shipping 🚢
        : configs.filter(c => c.name !== Platforms.webold)

      for (const page of Object.keys(configs[0].entry || {})) {
        console.log(`📄 [pages] Page found: ${page}`)
      }

      this._compiler = webpack(filteredConfigs)
    }
    return this._compiler
  }

  protected mergePluginsConfigs = (mode: Mode): Configuration[] => Object.values(
    this.plugins.reduce(
      (acc, plugin) => plugin.getConfig({
        mode,
        configs: acc,
        project: this.project
      }),
      this.getInitialConfig()
    )
  )

  protected getInitialConfig = () => ({
    nodejs: {
      output: {
        path: join(this.dist, 'nodejs')
      }
    },
    webnew: {
      output: {
        path: join(this.dist, 'webnew'),
        publicPath: '/assets'
      }
    },
    webold: {
      output: {
        path: join(this.dist, 'webold'),
        publicPath: '/assets'
      }
    }
  }) as Record<Platform, Configuration>

  protected ensureEntrypoints = (configs: Configuration[]) => {
    if (configs.length > 0) {
      const pages = Object.keys(configs[0].entry || {})
      for (const config of configs) {
        const configPages = Object.keys(config.entry || {})
        const diff = difference(pages, configPages)
        if (diff.length > 0) {
          throw new Error(`💣 Pages differ between targets: ${pages} != ${configPages}`)
        }
      }
    }
  }
}
export interface PagesConfigOptions {
  mode: Mode
  project: Project
  configs: Record<Platform, Configuration>
}

export abstract class PagesBuilderPlugin extends Plugin {
  constructor () {
    super({ target })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public abstract getConfig = (options: PagesConfigOptions): Record<Platform, Configuration> => {
    throw new Error('Not Implemented')
  }
}
