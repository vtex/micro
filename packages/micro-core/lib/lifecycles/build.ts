import { join } from 'path'

import { TransformOptions } from '@babel/core'
import { readJSON } from 'fs-extra'

import { Mode } from '../common/mode'
import { Compiler, CompilerOptions } from '../compiler'
import { Plugin } from '../plugin'
import { Project } from '../project'

export const lifecycle = 'build'

export type BuildTarget = 'es6' | 'cjs'

export interface Alias {
  name: string
  version: string
  resolve?: string
}

export type BuildCompilerOptions = Omit<
  CompilerOptions<BuildPlugin>,
  'target' | 'plugins'
> & {
  plugins: Array<new (opts: BuildPluginOptions) => BuildPlugin>
  mode: Mode
}

export class BuildCompiler extends Compiler<BuildPlugin> {
  private mode: Mode

  constructor({ project, plugins, mode }: BuildCompilerOptions) {
    super({ project, plugins: [], target: lifecycle })
    this.plugins = plugins.map((P) => new P({ project, mode }))
    this.mode = mode
  }

  public getDist = (target: BuildTarget) => join(this.dist, target)

  public getBabelConfig = async (target: BuildTarget) => {
    const initialConfig: TransformOptions = {}
    return this.plugins.reduce(
      async (acc, plugin) => plugin.getBabelConfig(await acc, target),
      Promise.resolve(initialConfig)
    )
  }
}

export interface BuildPluginOptions {
  mode: Mode
  project: Project
}

export class BuildPlugin extends Plugin {
  public mode: Mode
  public project: Project

  constructor(options: BuildPluginOptions) {
    super({ target: lifecycle })
    this.mode = options.mode
    this.project = options.project
  }

  public getBabelConfig = async (
    previous: TransformOptions,
    _target: BuildTarget
  ): Promise<TransformOptions> => previous
}

export const packageToAlias = async (
  name: string,
  resolve: (x: string) => string
): Promise<Alias> => {
  const packageJSONPath = resolve(`${name}/package.json`)
  const { version } = await readJSON(packageJSONPath)
  return { name, version: `^${version}` }
}
