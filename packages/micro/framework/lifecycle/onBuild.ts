import { Compiler, CompilerOptions } from '../compiler'
import { Plugin } from '../plugin'
import { TransformOptions } from '@babel/core'

const target = 'onBuild'

export type OnBuildCompilerOptions = Omit<CompilerOptions<OnBuildPlugin>, 'target' | 'plugins'> & {
  plugins: Array<new () => OnBuildPlugin>
}

export class OnBuildCompiler extends Compiler<OnBuildPlugin> {
  constructor ({ project, plugins }: OnBuildCompilerOptions) {
    super({ project, plugins: [], target })
    this.plugins = plugins.map(P => new P())
  }

  public getConfig = () => this.plugins.reduce(
    (acc, plugin) => plugin.getConfig(acc),
    this.getInitialConfig()
  )

  protected getInitialConfig = (): TransformOptions => ({
    root: this.project.root.path,
    cwd: this.project.root.path
  })
}

export class OnBuildPlugin extends Plugin {
  constructor () {
    super({ target })
  }

  public getConfig = (previous: TransformOptions): TransformOptions => previous
}
