import { Router } from '@vtex/micro'
import { pack } from '@vtex/micro-react-router'

const removeSlash = (x: string) => x.startsWith('/') ? x.slice(1) : x

const menu = {
  '/': 'Home',
  '/about': 'About',
  '/500': '500',
  '/404': '404'
}

const locales = new Set(['en', 'pt'])

const router: Router<any> = async request => {
  const { path, query } = request
  const locale = locales.has(query.locale) ? query.locale : undefined
  const name = path === '/' ? 'home' : removeSlash(path)

  const resolved = {
    name: locale ? `${name}.${locale}` : name,
    data: { menu },
    status: 200
  }

  return pack(resolved, path)
}

export default router
