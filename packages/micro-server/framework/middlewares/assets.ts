import { PublicPaths } from '@vtex/micro'
import { Project } from '@vtex/micro/framework'
import { createReadStream } from 'fs'
import mime from 'mime-types'
import { basename, join } from 'path'

import { Req, Res } from '../typings'

export const middleware = (project: Project, publicPaths: PublicPaths) => {
  const assetsRootPath = process.env.NODE_ENV === 'production'
    ? join(project.dist, 'onAssemble/webnew')
    : join(project.dist, 'onBuild')

  return async (req: Req, res: Res) => {
    try {
      const rootPath = req.path.startsWith(publicPaths.assets)
        ? publicPaths.assets
        : '/'
      let path = req.path.replace(rootPath, '/')

      if (path.includes('@vtex/micro-react')) {
        path = '../../../../packages/micro-react/dist/components/index.js'
      }

      // Set correctly the MIME type of the object
      const contentType = mime.contentType(basename(path))
      if (contentType) {
        res.set('content-type', contentType)
      }

      const asset = join(assetsRootPath, path)
      const stream = createReadStream(asset, { encoding: 'utf-8' })
      res.status(200)
      stream.pipe(res)
    } catch (err) {
      console.error(err)
      res.status(500)
    }
  }
}
