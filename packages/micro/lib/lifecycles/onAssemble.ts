import { join } from 'path'
import { Configuration } from 'webpack'
import { Block, Context, createConfig, setOutput } from 'webpack-blocks'

import { Mode } from '../common/mode'
import { Compiler, CompilerOptions } from '../compiler'
import { Plugin } from '../plugin'
import { Project } from '../project'

const lifecycle = 'onAssemble'

export const pagesRuntimeName = 'micro-runtime'
export const webpackRuntimeName = 'webpack-runtime'
export const pagesFrameworkName = 'micro-framework'

export type AssembleTarget = 'webnew' | 'webold'

export type OnAssembleCompilerOptions = Omit<CompilerOptions<OnAssemblePlugin>, 'target' | 'plugins'> & {
  plugins: Array<new (options: OnAssemblePluginOptions) => OnAssemblePlugin>
  mode: Mode
}

export class OnAssembleCompiler extends Compiler<OnAssemblePlugin> {
  constructor ({ project, plugins, mode }: OnAssembleCompilerOptions) {
    super({ project, plugins: [], target: lifecycle })
    this.plugins = plugins.map(P => new P({ project, mode }))
  }

  public getConfig = async (target: AssembleTarget): Promise<Configuration> => {
    const initialConfig = setOutput({
      path: join(this.dist, target),
      publicPath: '/assets'
    })
    const merged = await this.plugins.reduce(
      async (acc, plugin) => plugin.getConfig(await acc, target),
      Promise.resolve(initialConfig)
    )
    return createConfig(merged)
  }
}

export interface OnAssemblePluginOptions {
  project: Project
  mode: Mode
}

export abstract class OnAssemblePlugin extends Plugin {
  public project: Project
  public mode: Mode

  constructor (
    options: OnAssemblePluginOptions
  ) {
    super({ target: lifecycle })
    this.project = options.project
    this.mode = options.mode
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public abstract getConfig = async (config: Block<Context>, target: AssembleTarget): Promise<Block<Context>> => {
    throw new Error(`💣 not implemented: ${target}, ${config}`)
  }
}
