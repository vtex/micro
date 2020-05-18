import { join } from 'path'
import { difference } from 'ramda'
import { Configuration } from 'webpack'
import { Block, Context, createConfig, setOutput } from 'webpack-blocks'

import { Compiler, CompilerOptions } from '../compiler'
import { Plugin } from '../plugin'
import { Project } from '../project'

export const pagesRuntimeName = 'micro-runtime'
export const pagesFrameworkName = 'micro-framework'

export const externalPublicPathVariable = 'window.__MICRO_PUBLIC_PATH__'

export const Platforms = {
  nodejs: 'nodejs',
  webnew: 'webnew',
  webold: 'webold'
}

export type Platform = keyof typeof Platforms

export type Mode = 'production' | 'development'

const target = 'onAssemble'

export type OnAssembleCompilerOptions = Omit<CompilerOptions<OnAssemblePlugin>, 'target' | 'plugins'> & {
  plugins: Array<new () => OnAssemblePlugin>
}

export class OnAssembleCompiler extends Compiler<OnAssemblePlugin> {
  constructor ({ project, plugins }: OnAssembleCompilerOptions) {
    super({ project, plugins: [], target })
    this.plugins = plugins.map(P => new P())
  }

  public getConfig = (mode: Mode) => {
    const pluginsConfigs = this.mergePluginsConfigs(mode)
    const configs = pluginsConfigs.map(createConfig)

    this.ensureEntrypoints(configs)

    const filteredConfigs = mode === 'development'
      ? configs.filter(c => c.name !== Platforms.webold)
      // TODO: change to `configs` before shipping 🚢
      : configs.filter(c => c.name !== Platforms.webold)

    return filteredConfigs
  }

  protected mergePluginsConfigs = (mode: Mode): Block<Context>[] => Object.values(
    this.plugins.reduce(
      (acc, plugin) => plugin.getConfig({
        mode,
        configs: acc,
        project: this.project
      }),
      this.getInitialConfig()
    )
  )

  protected getInitialConfig = (): Record<Platform, Block<Context>> => ({
    nodejs: setOutput({
      path: join(this.dist, 'nodejs'),
      libraryTarget: 'commonjs2'
    }),
    webnew: setOutput({
      path: join(this.dist, 'webnew'),
      publicPath: '/assets'
    }),
    webold: setOutput({
      path: join(this.dist, 'webold'),
      publicPath: '/assets'
    })
  })

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
export interface OnAssembleConfigOptions {
  configs: Record<Platform, Block<Context>>
  project: Project
  mode: Mode
}

export abstract class OnAssemblePlugin extends Plugin {
  constructor () {
    super({ target })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public abstract getConfig = (options: OnAssembleConfigOptions): Record<Platform, Block<Context>> => {
    throw new Error('Not Implemented')
  }
}
