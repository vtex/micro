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

(global as any).react = React

const ok = (extractor: ChunkExtractor, body: string) => `
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
${extractor.getScriptTags()}
</body>
</html>
`

export const middleware = async (ctx: Context, next: Next) => {
  const { 
    state: { 
      stats: { children }, 
      features: { disableSSR },
      project: { root }
    } 
  } = ctx
  const webNewStats = children?.find(({ name }) => name === webNewTarget)
  const nodeJSStats = children?.find(({ name }) => name === nodeJSTarget)

  if (!webNewStats || !nodeJSStats) {
    throw new Error('Could not find (nodejs|web-new) build from webpack in statsJSON')
  }

  const entrypoints = 'main'

  const webNewExtractor = new ChunkExtractor({
	  entrypoints,
	  stats: webNewStats
  })

  const nodeJSExtractor = new ChunkExtractor({
    entrypoints, 
    outputPath: join(root, MICRO_BUILD_DIR, nodeJSTarget),
    stats: nodeJSStats
  })
  
  const { 
    default: App
  } = nodeJSExtractor.requireEntrypoint()

  const body = !disableSSR 
    ? renderToString(webNewExtractor.collectChunks(createElement(App))) 
    : ''

  ctx.body = ok(webNewExtractor, body)

  await next()
}
