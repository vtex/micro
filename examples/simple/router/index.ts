import { Router } from '@vtex/micro'
import { pack } from '@vtex/micro-react-router'

const removeSlash = (x: string) => x.startsWith('/') ? x.slice(1) : x

const menu = {
  '/': 'Home',
  '/about': 'About',
  '/500': '500',
  '/404': '404'
}

const router: Router<any> = async request => {
  const { path } = request
  const resolved = {
    name: path === '/' ? 'home' : removeSlash(path),
    data: { menu },
    status: 200
  }

  return pack(resolved, path)
}

export default router
