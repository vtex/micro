import {
  ResolvedPage,
  ResolvedRedirect,
  Serializable
} from '../../../components/page'
import { Compiler } from '../../compiler'
import { Plugin, PluginOptions } from '../../plugin'
import { Project } from '../../project'

export interface MicroRequest {
  path: string
  query: Record<string, string>
}

export type Resolved<T extends Serializable> = ResolvedPage<T> | ResolvedRedirect

const lifecycle = 'serve'

export const isResolvedPage = <T extends Serializable>(obj: Resolved<T>): obj is ResolvedPage<T> =>
  typeof (obj as any).name === 'string'

export const isResolvedRedirect = <T extends Serializable>(obj: Resolved<T>): obj is ResolvedRedirect =>
  typeof (obj as any).location === 'string'

export interface Page {
  name: string
}

export interface RoutePluginOptions extends PluginOptions {
  pages: Record<string, Page>
}

export abstract class RoutePlugin extends Plugin {
  public pages: Record<string, Page>

  constructor (
    options: RoutePluginOptions
  ) {
    super(options)
    this.pages = options.pages
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public abstract route = async (resolved: Resolved<any>, request: MicroRequest): Promise<Resolved<any>> => {
    return resolved
  }
}

export interface RouteCompilerOptions {
  project: Project
  plugins: Array<new (options: RoutePluginOptions) => RoutePlugin>
}

export class RouteCompiler extends Compiler<RoutePlugin> {
  constructor ({ project, plugins }: RouteCompilerOptions) {
    super({ project, plugins: [], target: lifecycle })
    this.plugins = plugins.map(P => new P({
      target: lifecycle,
      pages: {} // TODO: Find a way to resolve pages in here
    }))
  }

  public route = (request: MicroRequest): Promise<Resolved<any>> => {
    const notFound: Resolved<any> = {
      name: '404',
      data: null,
      status: 404
    }
    return this.plugins.reduce<Promise<Resolved<any>>>(
      async (acc, plugin) => plugin.route(await acc, request),
      Promise.resolve(notFound)
    )
  }
}
