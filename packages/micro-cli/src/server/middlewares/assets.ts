import { createReadStream } from 'fs'
import { Next } from 'koa'
import { join } from 'path'
import { Stats } from 'webpack'

import { target as webNewTarget } from '../../build/webpack/web-new'
import { MICRO_BUILD_DIR } from '../../constants'
import { Context } from '../typings'

const delay = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const mimeTypeByExtensions = {
  'js': 'application/javascript',
  'css': 'text/css',
  'svg': 'image/svg+xml'
}

const extensionToMimeType = (ext: keyof typeof mimeTypeByExtensions) => `${mimeTypeByExtensions[ext]}; charset=utf-8`

const isAssetCritical = (asset: string, entrypoint: string, webNewStats: Stats.ToJsonOutput) => 
  webNewStats.entrypoints?.[entrypoint]?.assets.includes(asset)

export const middleware = async (ctx: Context, next: Next) => {
  const { 
    state: { 
      stats: { children },
      features: { delayNonCriticalAssets, delayCriticalAssets, page },
      project: { root }
    }, 
    params 
  } = ctx
  const webNewStats = children?.find(({ name }) => name === 'web-new')

  if (!webNewStats) {
    throw new Error('Could not find nodejs build from webpack in statsJSON')
  }

  const { asset: assetPath } = params as { asset: string }

  if (!assetPath) {
    throw new Error('You need to pass an asset to fetch')
  }

  // Delay for showcasing features
  const isCritical = isAssetCritical(assetPath, page, webNewStats)
  if (isCritical && typeof delayCriticalAssets === 'number') {
    console.log('Delay !!', delayCriticalAssets, 'ms')
    await delay(delayCriticalAssets)
  } else if (!isCritical && typeof delayNonCriticalAssets === 'number') {
    console.log('Delay !!', delayNonCriticalAssets, 'ms')
    await delay(delayNonCriticalAssets)
  }

  // Set correctly the MIME type of the object
  const splitted = assetPath.split('.')
  const extension = splitted[splitted.length-1]
  if (extension === 'js' || extension === 'css' || extension === 'svg') {
    const mimeType = extensionToMimeType(extension)
    ctx.set('content-type', mimeType)
  }
  
  const asset = join(root, MICRO_BUILD_DIR, webNewTarget, assetPath)
  const stream = createReadStream(asset, { 
    encoding: 'utf-8',
  })
  ctx.body = stream

  return
}