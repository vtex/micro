import { ChunkExtractor } from '@loadable/server'
import { Next } from 'koa'
import { join } from 'path'
import React, { createElement } from 'react'
import { renderToString } from 'react-dom/server'

import { name, version } from '../../../package.json'
import { target as nodeJSTarget } from '../../build/webpack/nodejs'
import { target as webNewTarget } from '../../build/webpack/web-new'
import { Context } from '../typings'
import { MICRO_BUILD_DIR } from './../../constants'
import { MicroServerConfig } from '../config'

(global as any).react = React

const ok = (
  extractor: ChunkExtractor, 
  server: MicroServerConfig,
  body: string,
) => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="${name}@${version}">
<meta charset='utf-8'>
${extractor.getLinkTags()}
${extractor.getStyleTags()}
</head>
<body>
<div id="micro">${body}</div>
${server.getScriptTags()}
${extractor.getScriptTags()}
</body>
</html>
`

;(global as any).window = {}

export const middleware = async (ctx: Context, next: Next) => {
  const { 
    state: { 
      server,
      stats: { children }, 
      features: { disableSSR, page },
      project: { root }
    } 
  } = ctx
  const webNewStats = children?.find(({ name }) => name === webNewTarget)
  const nodeJSStats = children?.find(({ name }) => name === nodeJSTarget)

  if (!webNewStats || !nodeJSStats) {
    throw new Error('Could not find (nodejs|web-new) build from webpack in statsJSON')
  }

  const webNewExtractor = new ChunkExtractor({
    entrypoints: [page],
    publicPath: server.assetsBasePath,
	  stats: webNewStats
  })

  const nodeJSExtractor = new ChunkExtractor({
    entrypoints: [page],
    outputPath: join(root, MICRO_BUILD_DIR, nodeJSTarget),
    stats: nodeJSStats
  })
  
  const { 
    default: App
  } = nodeJSExtractor.requireEntrypoint()

  const body = !disableSSR 
    ? renderToString(webNewExtractor.collectChunks(createElement(App))) 
    : ''

  ctx.body = ok(webNewExtractor, server, body)

  await next()
}
