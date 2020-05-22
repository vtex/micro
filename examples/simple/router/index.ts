import { Router } from '@vtex/micro'
import { pack } from '@vtex/micro-react-router'

const removeSlash = (x: string) => x.startsWith('/') ? x.slice(1) : x

const menu = {
  '/': 'Home',
  '/about': 'About',
  '/product': 'Product',
  '/500': '500',
  '/404': '404',
  '/search': 'Search',
  '/reactOnly': 'React Only'
}

const router: Router<any> = async request => {
  const { path } = request
  const resolved = {
    name: path === '/' ? 'index' : removeSlash(path),
    data: { menu },
    status: 200
  }

  // in reactOnly page we don't need to add the router bloatware
  if (resolved.name === 'reactOnly') {
    return resolved
  }

  return pack(resolved, path)
}

export default router
