import { join } from 'path'

import { Configuration } from 'webpack'
import { Block, createConfig, setOutput } from 'webpack-blocks'

import { Mode } from '../common/mode'
import { Compiler, CompilerOptions } from '../compiler'
import { Plugin } from '../plugin'
import { Project } from '../project'

export const BUNDLE_LIFECYCLE = 'bundle'

export type BundleTarget = 'web' | 'web-legacy'

export interface BundlePluginOptions {
  mode: Mode
  project: Project
}

export abstract class BundlePlugin extends Plugin {
  public mode: Mode
  public project: Project

  constructor(options: BundlePluginOptions) {
    super({ target: BUNDLE_LIFECYCLE })
    this.project = options.project
    this.mode = options.mode
  }

  public abstract getWebpackConfig = async (
    config: Block,
    target: BundleTarget
  ): Promise<Block> => {
    throw new Error(`💣 not implemented: ${target}, ${config}`)
  }
}

export type BundleCompilerOptions = Omit<
  CompilerOptions<BundlePlugin>,
  'target' | 'plugins'
> & {
  plugins: Array<new (options: BundlePluginOptions) => BundlePlugin>
  mode: Mode
}

export class BundleCompiler extends Compiler<BundlePlugin> {
  constructor({ project, plugins, mode }: BundleCompilerOptions) {
    super({ project, plugins: [], target: BUNDLE_LIFECYCLE })
    this.plugins = plugins.map((P) => new P({ project, mode }))
  }

  public getWebpackConfig = async (
    target: BundleTarget
  ): Promise<Configuration> => {
    const initialConfig = setOutput({
      path: join(this.dist, target),
      publicPath: '/assets/',
    })
    const merged = await this.plugins.reduce(
      async (acc, plugin) => plugin.getWebpackConfig(await acc, target),
      Promise.resolve(initialConfig)
    )
    return createConfig(merged)
  }
}
