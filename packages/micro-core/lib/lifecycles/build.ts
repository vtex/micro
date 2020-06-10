import { join } from 'path'

import { Configuration } from 'webpack'
import { Block, createConfig, setOutput } from 'webpack-blocks'

import { Mode } from '../common/mode'
import { Compiler, CompilerOptions } from '../compiler'
import { Plugin } from '../plugin'
import { Project } from '../project'

export const BUILD_LIFECYCLE = 'build'

export type WebpackBuildTarget = 'node' | 'web'

export type BuildTarget = 'cjs' | WebpackBuildTarget

export interface BuildPluginOptions {
  mode: Mode
  project: Project
}

export abstract class BuildPlugin extends Plugin {
  public mode: Mode
  public project: Project

  constructor(options: BuildPluginOptions) {
    super({ target: BUILD_LIFECYCLE })
    this.mode = options.mode
    this.project = options.project
  }

  public abstract getWebpackConfig = async (
    config: Block,
    target: WebpackBuildTarget
  ): Promise<Block> => {
    throw new Error(`💣 not implemented: ${target}, ${config}`)
  }
}

export type BuildCompilerOptions = Omit<
  CompilerOptions<BuildPlugin>,
  'target' | 'plugins'
> & {
  plugins: Array<new (opts: BuildPluginOptions) => BuildPlugin>
  mode: Mode
}

export class BuildCompiler extends Compiler<BuildPlugin> {
  constructor({ project, plugins, mode }: BuildCompilerOptions) {
    super({ project, plugins: [], target: BUILD_LIFECYCLE })
    this.plugins = plugins.map((P) => new P({ project, mode }))
  }

  public getWepbackConfig = async (
    target: WebpackBuildTarget
  ): Promise<Configuration> => {
    const initialConfig = setOutput({
      path: join(this.dist, target),
    })
    const merged = await this.plugins.reduce(
      async (acc, plugin) => plugin.getWebpackConfig(await acc, target),
      Promise.resolve(initialConfig)
    )
    return createConfig(merged)
  }
}
