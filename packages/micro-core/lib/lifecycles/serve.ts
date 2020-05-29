import { join } from 'path'
import { Stats } from 'webpack'

import { PublicPaths } from '../common/publicPaths'
import { Compiler, CompilerOptions } from '../compiler'
import { Plugin } from '../plugin'
import { LifeCycle } from '../project'
import { ResolvedPage } from '../router'

const lifecycle = 'serve'

export type ServeCompilerOptions<T> = Omit<CompilerOptions<ServePlugin<T>>, 'target' | 'plugins'> & {
  plugins: Array<new (options: ServePluginOptions) => (ServePlugin<T> | ServeFrameworkPlugin<T>)>
  options: Omit<ServePluginOptions, 'assetsDist'>
}

const assetsDistForLifecycle = (root: string, lifecycle: LifeCycle) => {
  if (lifecycle === 'build') {
    return {
      webnew: join(root, 'build/es6'),
      nodejs: join(root, 'build/cjs')
    }
  }
  if (lifecycle === 'bundle') {
    return {
      webnew: join(root, 'bundle/webnew'),
      webold: join(root, 'bundle/webold'),
      nodejs: join(root, 'build/cjs')
    }
  }
  throw new Error('💣 Targeting this lifecycle makes no sense')
}

export class ServeCompiler<T> extends Compiler<ServePlugin<T>> {
  protected frameworkPlugin: ServeFrameworkPlugin<T>

  constructor ({ project, plugins, options }: ServeCompilerOptions<T>) {
    super({ project, plugins: [], target: lifecycle })
    const fullOptions = {
      ...options,
      assetsDist: assetsDistForLifecycle(project.dist, options.lifecycleTarget)
    }
    this.plugins = plugins.map(P => new P(fullOptions))
    const frameworkIndex = this.plugins.findIndex(p => p instanceof ServeFrameworkPlugin)
    if (frameworkIndex < 0) {
      throw new Error('💣 At least one framework plugin is required. Take a look at @vtex/micro-react for using the React Framework')
    }
    this.frameworkPlugin = this.plugins[frameworkIndex] as ServeFrameworkPlugin<T>
  }

  public renderToString = (disableSSR: boolean = false) => {
    let App: T | null = null

    if (!disableSSR) {
      // Find a plugin that is able to require an entrypoint
      // Maybe this should be done by the framework itself
      // instead of via plugin
      App = this.frameworkPlugin.requireEntrypoint()

      if (App === null) {
        throw new Error('💣 No entrypoint was required during Server Side Rendering')
      }

      // Compose the App for SSR
      App = this.plugins.reduce(
        (acc, p) => p.render(acc),
        App
      )
    }

    return this.frameworkPlugin.renderToString(App)
  }

  public getScriptTags = () => this.plugins.reduce(
    (acc, plugin) => acc + plugin.getScriptTags(),
    ''
  )

  public getLinkTags = () => this.plugins.reduce(
    (acc, plugin) => acc + plugin.getLinkTags(),
    ''
  )

  public getStyleTags = () => this.plugins.reduce(
    (acc, plugin) => acc + plugin.getStyleTags(),
    ''
  )

  public getMetaTags = () => this.plugins.reduce(
    (acc, plugin) => acc + plugin.getMetaTags(),
    ''
  )
}

interface AssetsDist {
  webnew: string
  nodejs: string
  webold?: string
}

export interface ServePluginOptions {
  mode: 'production' | 'development'
  lifecycleTarget: 'build' | 'bundle'
  stats: Stats.ToJsonOutput
  publicPaths: PublicPaths
  assetsDist: AssetsDist
  page: ResolvedPage<any>
  path: string
}

export abstract class ServePlugin<T> extends Plugin {
  constructor (
    protected options: ServePluginOptions
  ) {
    super({ target: lifecycle })
  }

  public render = (element: T): T => element

  public getScriptTags = () => ''

  public getStyleTags = () => ''

  public getLinkTags = () => ''

  public getMetaTags = () => ''
}

export abstract class ServeFrameworkPlugin<T> extends ServePlugin<T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public renderToString = (_element: T | null): string => ''

  public requireEntrypoint = (): T | null => null
}
