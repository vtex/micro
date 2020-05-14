import { Project } from '@vtex/micro/framework'
import { createReadStream } from 'fs'
import mime from 'mime-types'
import { join } from 'path'

import { Req, Res } from '../typings'

export const middleware = (project: Project) => {
  const assetsRootPath = join(project.dist, 'onAssemble/webnew')

  return async (req: Req, res: Res) => {
    const { params } = req
    const { asset: assetPath } = params as { asset: string }

    if (!assetPath) {
      throw new Error('You need to pass an asset to fetch')
    }

    // Set correctly the MIME type of the object
    const contentType = mime.contentType(assetPath)
    if (contentType) {
      res.set('content-type', contentType)
    }

    const asset = join(assetsRootPath, assetPath)
    const stream = createReadStream(asset, { encoding: 'utf-8' })
    res.status(200)
    stream.pipe(res)
  }
}
