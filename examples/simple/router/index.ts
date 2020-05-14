import { Router } from '@vtex/micro/framework'

const removeSlash = (x: string) => x.startsWith('/') ? x.slice(1) : x

const router: Router = async (request, pages) => {
  const { path } = request
  return {
    name: path === '/' ? 'index' : removeSlash(path),
    data: { hello: 'world' },
    status: 200
  }
}

export default router
