import { webNewTarget } from '@vtex/micro-builder'
import { createReadStream } from 'fs'
import mime from 'mime-types'
import { join } from 'path'

import { Req, Res } from '../typings'

export const middleware = async (req: Req, res: Res) => {
  const { locals: { server } } = res
  const { params } = req
  const webNewStats = server.build.webpack.stats?.children?.find(({ name }) => name === 'web-new')

  if (!webNewStats) {
    throw new Error('Could not find nodejs build from webpack in statsJSON')
  }

  const { asset: assetPath } = params as { asset: string }

  if (!assetPath) {
    throw new Error('You need to pass an asset to fetch')
  }

  // Set correctly the MIME type of the object
  const contentType = mime.contentType(assetPath)
  if (contentType) {
    res.set('content-type', contentType)
  }

  const asset = join(server.assetsPath[webNewTarget], assetPath)
  const stream = createReadStream(asset, {
    encoding: 'utf-8'
  })
  stream.pipe(res)
}
