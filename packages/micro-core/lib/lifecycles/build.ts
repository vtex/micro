import { TransformOptions } from '@babel/core';
import { readJSON } from 'fs-extra';
import { join } from 'path';

import { Mode } from '../common/mode';
import { parse } from '../common/semver';
import { Compiler, CompilerOptions } from '../compiler';
import { Plugin } from '../plugin';
import { Project } from '../project';

export const lifecycle = 'build';

export type BuildTarget = 'es6' | 'cjs'

export interface Alias {
  name: string
  version: string
  resolve?: string
}

export type BuildCompilerOptions = Omit<CompilerOptions<BuildPlugin>, 'target' | 'plugins'> & {
  plugins: Array<new (opts: BuildPluginOptions) => BuildPlugin>
  mode: Mode
}

export class BuildCompiler extends Compiler<BuildPlugin> {
  private mode: Mode

  constructor ({ project, plugins, mode }: BuildCompilerOptions) {
    super({ project, plugins: [], target: lifecycle });
    this.plugins = plugins.map(P => new P({ project, mode }));
    this.mode = mode;
  }

  public getDist = (target: BuildTarget) => join(this.dist, target)

  public getBabelConfig = async (target: BuildTarget) => {
    const initialConfig: TransformOptions = {};
    return this.plugins.reduce(
      async (acc, plugin) => plugin.getBabelConfig(await acc, target),
      Promise.resolve(initialConfig)
    );
  }

  public getSnowpackConfig = async () => {
    const initialConfig: SnowpackConfig = {};
    return this.plugins.reduce(
      async (acc, plugin) => plugin.getSnowpackConfig(await acc),
      Promise.resolve(initialConfig)
    );
  }

  public getAliases = async (onConflict: 'throw' | 'warn' | 'skip' = 'warn'): Promise<Alias[]> => {
    const aliases = await this.plugins.reduce(
      async (acc, plugin) => plugin.getAliases(await acc),
      Promise.resolve([] as Alias[])
    );

    // If we don't need to resolve conflicts, let's just return the merged aliases
    if (onConflict === 'skip') {
      return aliases;
    }

    // Let's resolve the dependencies based on chosen conflict resolution rule
    const resolvedAliases: Record<string, Alias> = {};
    for (const current of aliases) {
      const { name, version } = current;
      const previous = resolvedAliases[name];

      if (!previous) {
        resolvedAliases[name] = current;
        continue;
      }

      const { major: previousMajor } = parse(previous.version);
      const { major: currentMajor } = parse(version);
      if (previousMajor !== currentMajor) {
        switch (onConflict) {
          case 'throw':
            throw new Error(`💣 Dependency ${name} found duplicated. Need to resolve to ${previousMajor}.x or ${currentMajor}.x`);
          case 'warn':
            console.warn(`💣 Dependency ${name} found duplicated. Resolving to ${Math.max(previousMajor, currentMajor)}.x`);
            resolvedAliases[name] = previousMajor > currentMajor ? previous : current;
        }
      }
    }

    return Object.values(resolvedAliases);
  }
}

export interface BuildPluginOptions {
  mode: Mode
  project: Project
}

export class BuildPlugin extends Plugin {
  public mode: Mode
  public project: Project

  constructor (options: BuildPluginOptions) {
    super({ target: lifecycle });
    this.mode = options.mode;
    this.project = options.project;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getBabelConfig = async (previous: TransformOptions, target: BuildTarget): Promise<TransformOptions> => previous

  public getSnowpackConfig = async (previous: SnowpackConfig): Promise<SnowpackConfig> => previous

  public getAliases = async (previous: Alias[]): Promise<Alias[]> => previous
}

export const packageToAlias = async (name: string, resolve: (x: string) => string): Promise<Alias> => {
  const packageJSONPath = resolve(`${name}/package.json`);
  const { version } = await readJSON(packageJSONPath);
  return { name, version: `^${version}` };
};

type EnvVarReplacements = Record<string, string | number | true>;

type RollupPlugin = (...args: any) => any

// Copied from
// https://github.com/pikapkg/snowpack/blob/ad9b6d87776c92e27a6316e6e0b5b38b07dac32f/src/config.ts#L85
export interface SnowpackConfig {
  extends?: string;
  exclude?: string[];
  knownEntrypoints?: string[];
  webDependencies?: {[packageName: string]: string};
  installOptions?: {
    dest?: string;
    env?: EnvVarReplacements;
    installTypes: boolean;
    sourceMap?: boolean | 'inline';
    externalPackage?: string[];
    alias?: {[key: string]: string};
    rollup?: {
      plugins?: RollupPlugin[];
      dedupe?: string[];
      namedExports?: {[filepath: string]: string[]};
    };
  };
}
