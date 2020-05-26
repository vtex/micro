import { TransformOptions } from '@babel/core'
import { readJSON } from 'fs-extra'
import { join } from 'path'

import { parse } from '../../components/semver'
import { Mode } from '../common/mode'
import { Compiler, CompilerOptions } from '../compiler'
import { Plugin } from '../plugin'
import { Project } from '../project'

const lifecycle = 'onBuild'

export type BuildTarget = 'es6' | 'cjs'

export interface Alias {
  name: string
  version: string
  resolve?: string
}

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

  public getAliases = async (onConflict: 'throw' | 'warn' | 'skip' = 'warn'): Promise<Alias[]> => {
    const aliases = await this.plugins.reduce(
      async (acc, plugin) => plugin.getAliases(await acc),
      Promise.resolve([] as Alias[])
    )

    // If we don't need to resolve conflicts, let's just return the merged aliases
    if (onConflict === 'skip') {
      return aliases
    }

    // Let's resolve the dependencies based on chosen conflict resolution rule
    const resolvedAliases: Record<string, Alias> = {}
    for (const current of aliases) {
      const { name, version } = current
      const previous = resolvedAliases[name]

      if (!previous) {
        resolvedAliases[name] = current
        continue
      }

      const { major: previousMajor } = parse(previous.version)
      const { major: currentMajor } = parse(version)
      if (previousMajor !== currentMajor) {
        switch (onConflict) {
          case 'throw':
            throw new Error(`💣 Dependency ${name} found duplicated. Need to resolve to ${previousMajor}.x or ${currentMajor}.x`)
          case 'warn':
            console.warn(`💣 Dependency ${name} found duplicated. Resolving to ${Math.max(previousMajor, currentMajor)}.x`)
            resolvedAliases[name] = previousMajor > currentMajor ? previous : current
        }
      }
    }

    return Object.values(resolvedAliases)
  }
}

const getInitialConfig = (target: BuildTarget, mode: Mode, project: Project): TransformOptions => ({
  root: project.rootPath,
  cwd: project.rootPath,
  sourceMaps: mode === 'production' ? false : 'inline',
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
        bugfixes: true,
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

  public getAliases = async (previous: Alias[]): Promise<Alias[]> => previous
}

export const packageToAlias = async (name: string, resolve: (x: string) => string): Promise<Alias> => {
  const packageJSONPath = resolve(`${name}/package.json`)
  const { version } = await readJSON(packageJSONPath)
  return { name, version: `^${version}` }
}
