import { TransformOptions } from '@babel/core'
import { join } from 'path'

import { Mode } from '../common/mode'
import { Compiler, CompilerOptions } from '../compiler'
import { Plugin } from '../plugin'
import { Project } from '../project'

const lifecycle = 'onBuild'

export type BuildTarget = 'es6' | 'cjs'

export type OnBuildCompilerOptions = Omit<CompilerOptions<OnBuildPlugin>, 'target' | 'plugins'> & {
  plugins: Array<new (opts: OnBuildPluginOptions) => OnBuildPlugin>
  mode: Mode
}

export class OnBuildCompiler extends Compiler<OnBuildPlugin> {
  private mode: Mode

  constructor ({ project, plugins, mode }: OnBuildCompilerOptions) {
    super({ project, plugins: [], target: lifecycle })
    this.plugins = plugins.map(P => new P({ mode }))
    this.mode = mode
  }

  public getDist = (target: BuildTarget) => join(this.dist, target)

  public getConfig = async (target: BuildTarget) => {
    const initialConfig: TransformOptions = getInitialConfig(target, this.mode, this.project)
    const merged = await this.plugins.reduce(
      async (acc, plugin) => plugin.getConfig(await acc, target),
      Promise.resolve(initialConfig)
    )
    return merged
  }
}

const getInitialConfig = (target: BuildTarget, mode: Mode, project: Project): TransformOptions => ({
  root: project.rootPath,
  cwd: project.rootPath,
  rootMode: 'root',
  minified: mode === 'production',
  retainLines: mode === 'production',
  shouldPrintComment: () => true,
  babelrc: false,
  envName: 'NODE_ENV',
  comments: mode === 'production',
  caller: { name: target },
  presets: [
    [
      require.resolve('@babel/preset-env'), {
        targets: target === 'es6'
          ? { esmodules: true }
          : { node: 'current' },
        modules: target === 'es6' ? false : 'commonjs',
        exclude: [
          '@babel/plugin-proposal-object-rest-spread',
          '@babel/plugin-proposal-async-generator-functions',
          '@babel/plugin-transform-async-to-generator',
          '@babel/plugin-transform-regenerator',
          '@babel/plugin-transform-arrow-functions',
          '@babel/plugin-transform-destructuring',
          '@babel/plugin-transform-for-of',
          '@babel/plugin-transform-spread',
          '@babel/plugin-transform-typeof-symbol'
        ]
      }
    ],
    [
      require.resolve('@babel/preset-typescript'), {
        isTSX: true,
        allExtensions: true
      }
    ]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining'
  ].map(require.resolve as (x: string) => string)
})

export interface OnBuildPluginOptions {
  mode: Mode
}

export class OnBuildPlugin extends Plugin {
  public mode: Mode

  constructor (options: OnBuildPluginOptions) {
    super({ target: lifecycle })
    this.mode = options.mode
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getConfig = async (previous: TransformOptions, target: BuildTarget): Promise<TransformOptions> => previous
}
