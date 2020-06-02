import { Router } from '@vtex/micro-core/lib'
import { pack } from '@vtex/micro-react-router/components'

const removeSlash = (x: string) => x.startsWith('/') ? x.slice(1) : x

const menu = {
  '/': 'Home',
  '/about': 'About',
  '/500': '500',
  '/404': '404'
}

const locales = new Set(['en', 'pt'])

export const router: Router<any> = async request => {
  const { path, query } = request
  const name = path === '/' ? 'home' : removeSlash(path)
  let locale = locales.has(query.locale) ? query.locale : undefined

  if (name === 'home' && !locale) {
    locale = 'en'
  }

  const resolved = {
    name: locale ? `${name}.${locale}` : name,
    data: { menu },
    status: 200
  }
  return pack(resolved, path)
}
