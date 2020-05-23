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
    name: path === '/' ? 'home' : removeSlash(path),
    data: { menu },
    status: 200
  }

  // in reactOnly page we don't need to add the router bloatware
  if (resolved.name === 'reactOnly') {
    return resolved
  }

  // Now we could add a path template in here as well. like so
  // return pack(resolved, '/:someting')

  return pack(resolved, path)
}

export default router
