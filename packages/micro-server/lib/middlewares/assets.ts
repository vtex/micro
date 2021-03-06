import assert from 'assert'
import { basename, extname, join } from 'path'

import { createReadStream, pathExists } from 'fs-extra'
import mime from 'mime-types'

import { Project, PublicPaths } from '@vtex/micro-core'

import { Req, Res } from '../typings'

export const middleware = (project: Project, publicPaths: PublicPaths) => {
  const assetsRootPath =
    process.env.NODE_ENV === 'production'
      ? join(project.dist, 'bundle/web')
      : join(project.dist, 'build/web')

  return async (req: Req, res: Res) => {
    try {
      const rootPath = req.path.startsWith(publicPaths.assets)
        ? publicPaths.assets
        : '/'
      const rawPath = req.path.replace(rootPath, '')
      const extension = extname(rawPath) ? '' : '.js'
      const path = rawPath + extension

      // Set correctly the MIME type of the object
      const contentType = mime.contentType(basename(path))
      if (contentType) {
        res.set('content-type', contentType)
      }

      const assetPath = join(assetsRootPath, path)

      const assetExists = await pathExists(assetPath)
      assert(assetExists, `💣 Could not find asset: ${assetPath}`)

      const stream = createReadStream(assetPath, { encoding: 'utf-8' })

      res.statusCode = 200
      stream.pipe(res)
    } catch (err) {
      res.status(404).send(null)
      console.error(err)
    }
  }
}
