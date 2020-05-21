import { Router } from '@vtex/micro'

const removeSlash = (x: string) => x.startsWith('/') ? x.slice(1) : x

const menu = {
  '/': 'Home',
  '/about': 'About',
  '/product': 'Product',
  '/department': 'Deparment',
  '/department/category': 'Cartegory',
  '/brand': 'Brand'
}

const router: Router = async (request, pages) => {
  const { path } = request
  return {
    name: path === '/' ? 'index' : removeSlash(path),
    data: { menu },
    status: 200
  }
}

export default router
