import { MicroRequest, Resolved, RoutePlugin } from '@vtex/micro-core/lib'

const removeSlash = (x: string) => x.startsWith('/') ? x.slice(1) : x

const menu = {
  '/': 'Home',
  '/about': 'About',
  '/500': '500',
  '/404': '404'
}

const locales = new Set(['en', 'pt'])

export class Router extends RoutePlugin {
  public route = async (_: Resolved<any>, request: MicroRequest) => {
    const { path, query } = request
    const name = path === '/' ? 'home' : removeSlash(path)
    let locale = locales.has(query.locale) ? query.locale : undefined

    if (name === 'home' && !locale) {
      locale = 'en'
    }

    return {
      name: locale ? `${name}.${locale}` : name,
      data: { menu },
      status: 200
    }
  }
}
