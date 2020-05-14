import { Compiler, CompilerOptions } from '../compiler'
import { Plugin } from '../plugin'

const target = 'onBuild'

export type OnBuildCompilerOptions = Omit<CompilerOptions<OnBuildPlugin>, 'target' | 'plugins'> & {
  plugins: Array<new () => OnBuildPlugin>
}

export class OnBuildCompiler extends Compiler<OnBuildPlugin> {
  constructor ({ project, plugins }: OnBuildCompilerOptions) {
    super({ project, plugins: [], target })
    this.plugins = plugins.map(P => new P())
  }
}

export class OnBuildPlugin extends Plugin {
  constructor () {
    super({ target })
  }
}
