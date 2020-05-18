import { Project, PublicPaths } from '@vtex/micro'
import { createReadStream } from 'fs'
import mime from 'mime-types'
import { basename, join } from 'path'

import { Req, Res } from '../typings'

export const middleware = (project: Project, publicPaths: PublicPaths) => {
  const assetsRootPath = process.env.NODE_ENV === 'production'
    ? join(project.dist, 'onAssemble/webnew')
    : join(project.dist, 'onBuild/es6')

  return async (req: Req, res: Res) => {
    try {
      const rootPath = req.path.startsWith(publicPaths.assets)
        ? publicPaths.assets
        : '/'
      let path = req.path.replace(rootPath, '/')

      console.log({path, req: req.path})

      // if (path === '/@vtex/micro-react') {
      //   path = path.replace('/@vtex/micro-react', '../../../../../packages/micro-react/.micro/onBuild/es6/components/index.js')
      // } else 
      if (path.includes('@vtex/micro-react')) {
        path = path.replace('/@vtex/micro-react', '../../../../../packages/micro-react/.micro/onBuild/es6/components')
      }

      // if (path === '/@vtex/micro') {
      //   path = path.replace('/@vtex/micro', '../../../../../packages/micro/.micro/onBuild/es6/components/index.js')
      // } else 
      if (path.includes('@vtex/micro')) {
        path = path.replace('/@vtex/micro', '../../../../../packages/micro/.micro/onBuild/es6/components')
      }

      if (!path.endsWith('.js')) {
        path += '.js'
      }

      // Set correctly the MIME type of the object
      const contentType = mime.contentType(basename(path))
      if (contentType) {
        res.set('content-type', contentType)
      }

      const asset = join(assetsRootPath, path)

      console.log({ asset })

      const stream = createReadStream(asset, { encoding: 'utf-8' })
      res.status(200)
      stream.pipe(res)
    } catch (err) {
      console.error(err)
      res.status(500)
    }
  }
}
