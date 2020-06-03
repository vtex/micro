import { join } from 'path'

import { ResolvedPage } from '../../../components/page'
import { PublicPaths } from '../../../components/publicPaths'
import { Compiler, CompilerOptions } from '../../compiler'
import { Plugin } from '../../plugin'
import { LifeCycle } from '../../project'

const LIFECYCLE = 'serve'

export type HtmlCompilerOptions<T> = Omit<
  CompilerOptions<HtmlPlugin<T>>,
  'target' | 'plugins'
> & {
  plugins: Array<
    new (options: HtmlPluginOptions) => HtmlPlugin<T> | HtmlFrameworkPlugin<T>
  >
  options: Omit<HtmlPluginOptions, 'assetsDist'>
}

const assetsDistForLifecycle = (root: string, lifecycle: LifeCycle) => {
  if (lifecycle === 'build') {
    return {
      webnew: join(root, 'build/es6'),
      nodejs: join(root, 'build/cjs'),
    }
  }
  if (lifecycle === 'bundle') {
    return {
      webnew: join(root, 'bundle/webnew'),
      webold: join(root, 'bundle/webold'),
      nodejs: join(root, 'build/cjs'),
    }
  }
  throw new Error('💣 Targeting this lifecycle makes no sense')
}

export class HtmlCompiler<T> extends Compiler<HtmlPlugin<T>> {
  protected frameworkPlugin: HtmlFrameworkPlugin<T>

  constructor({ project, plugins, options }: HtmlCompilerOptions<T>) {
    super({ project, plugins: [], target: LIFECYCLE })
    const fullOptions = {
      ...options,
      assetsDist: assetsDistForLifecycle(project.dist, options.lifecycleTarget),
    }
    this.plugins = plugins.map((P) => new P(fullOptions))
    const frameworkIndex = this.plugins.findIndex(
      (p) => p instanceof HtmlFrameworkPlugin
    )
    if (frameworkIndex < 0) {
      throw new Error(
        '💣 At least one framework plugin is required. Take a look at @vtex/micro-react for using the React Framework'
      )
    }
    this.frameworkPlugin = this.plugins[frameworkIndex] as HtmlFrameworkPlugin<
      T
    >
  }

  public renderToString = (disableSSR = false) => {
    let App: T | null = null

    if (!disableSSR) {
      // Find a plugin that is able to require an entrypoint
      // Maybe this should be done by the framework itself
      // instead of via plugin
      App = this.frameworkPlugin.requireEntrypoint()

      if (App === null) {
        throw new Error(
          '💣 No entrypoint was required during Server Side Rendering'
        )
      }

      // Compose the App for SSR
      App = this.plugins.reduce((acc, p) => p.render(acc), App)
    }

    return this.frameworkPlugin.renderToString(App)
  }

  public getScriptTags = () =>
    this.plugins.reduce((acc, plugin) => acc + plugin.getScriptTags(), '')

  public getLinkTags = () =>
    this.plugins.reduce((acc, plugin) => acc + plugin.getLinkTags(), '')

  public getStyleTags = () =>
    this.plugins.reduce((acc, plugin) => acc + plugin.getStyleTags(), '')

  public getMetaTags = () =>
    this.plugins.reduce((acc, plugin) => acc + plugin.getMetaTags(), '')
}

interface AssetsDist {
  webnew: string
  nodejs: string
  webold?: string
}

export interface HtmlPluginOptions {
  mode: 'production' | 'development'
  lifecycleTarget: 'build' | 'bundle'
  stats: any
  publicPaths: PublicPaths
  assetsDist: AssetsDist
  page: ResolvedPage<any>
  path: string
}

export abstract class HtmlPlugin<T> extends Plugin {
  constructor(protected options: HtmlPluginOptions) {
    super({ target: LIFECYCLE })
  }

  public render = (element: T): T => element

  public getScriptTags = () => ''

  public getStyleTags = () => ''

  public getLinkTags = () => ''

  public getMetaTags = () => ''
}

export abstract class HtmlFrameworkPlugin<T> extends HtmlPlugin<T> {
  public renderToString = (_element: T | null): string => ''

  public requireEntrypoint = (): T | null => null
}
