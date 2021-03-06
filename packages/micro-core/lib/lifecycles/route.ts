import {
  ResolvedPage,
  ResolvedRedirect,
  Serializable,
} from '../../components/page'
import { Mode } from '../common/mode'
import { Compiler } from '../compiler'
import { Hook, HookOptions } from '../hook'
import { Project } from '../project'

export interface MicroRequest {
  path: string
  query: Record<string, string>
}

export type Resolved<T extends Serializable> =
  | ResolvedPage<T>
  | ResolvedRedirect

const lifecycle = 'route'

export const isResolvedPage = <T extends Serializable>(
  obj: Resolved<T>
): obj is ResolvedPage<T> => typeof (obj as any).name === 'string'

export const isResolvedRedirect = <T extends Serializable>(
  obj: Resolved<T>
): obj is ResolvedRedirect => typeof (obj as any).location === 'string'

export interface Page {
  name: string
}

export interface RouteHookOptions extends HookOptions {
  pages: Record<string, Page>
  mode: Mode
}

export abstract class RouterHook extends Hook {
  public pages: Record<string, Page>
  public mode: Mode

  constructor(options: RouteHookOptions) {
    super(options)
    this.pages = options.pages
    this.mode = options.mode
  }

  public abstract route = async (
    resolved: Resolved<any>,
    _request: MicroRequest
  ): Promise<Resolved<any>> => {
    return resolved
  }
}

export interface RouteCompilerOptions {
  mode: Mode
  project: Project
  plugins: Array<new (options: RouteHookOptions) => RouterHook>
}

export class RouteCompiler extends Compiler<RouterHook> {
  constructor({ project, plugins, mode }: RouteCompilerOptions) {
    super({ project, plugins: [], target: lifecycle })
    this.plugins = plugins.map(
      (P) =>
        new P({
          mode,
          target: lifecycle,
          pages: {}, // TODO: Find a way to resolve pages in here
        })
    )
  }

  public route = (request: MicroRequest): Promise<Resolved<any>> => {
    const notFound: Resolved<any> = { name: '404', data: null, status: 404 }
    return this.plugins.reduce<Promise<Resolved<any>>>(
      async (acc, plugin) => plugin.route(await acc, request),
      Promise.resolve(notFound)
    )
  }
}
