import { MicroRequest, Resolved, RouterHook } from '@vtex/micro-core'

const removeSlash = (x: string) => (x.startsWith('/') ? x.slice(1) : x)

const menu = {
  '/': 'Home',
  '/about': 'About',
  '/500': '500',
  '/404': '404',
}

const locales = new Set(['en', 'pt'])

export default class Router extends RouterHook {
  public route = async (_: Resolved<any>, request: MicroRequest) => {
    const { path, query } = request
    const name = path === '/' ? 'home' : removeSlash(path)
    let locale = locales.has(query.locale) ? query.locale : undefined

    if (name === 'home' && !locale) {
      locale = 'en'
    }

    return {
      name: 'customPage', // locale ? `${name}.${locale}` : name,
      data: { menu },
      status: 200,
    }
  }
}
