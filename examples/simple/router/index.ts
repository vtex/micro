import { Router } from '@vtex/micro'

const removeSlash = (x: string) => x.startsWith('/') ? x.slice(1) : x

const router: Router = async (request, pages) => {
  const { path } = request
  return {
    name: path === '/' ? 'index' : removeSlash(path),
    data: { productName: 'asddfgdffg' },
    status: 200
  }
}

export default router
