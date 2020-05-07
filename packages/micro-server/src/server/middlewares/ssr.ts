import { Next } from 'koa'
import React, { createElement } from 'react'
import { renderToString } from 'react-dom/server'

import { Extractor } from '../../extractor'
import { Context } from '../typings'

const ok = (
  server: Extractor,
  body: string,
) => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="${server.project.manifest.name}@${server.project.manifest.version}">
<meta charset='utf-8'>
${server.getLinkTags()}
${server.getStyleTags()}
</head>
<body>
${server.getBodyTags(body)}
${server.getScriptTags()}
</body>
</html>
`

;(global as any).react = React

export const middleware = async (ctx: Context, next: Next) => {
  const { 
    state: { 
      server,
      features: { disableSSR },
    } 
  } = ctx
  const {
    status,
    context
  } = server.resolvedEntry
  let body = ''
  
  if (!disableSSR) {
    const { 
      default: App
    } = server.requirePage()

    body = renderToString(server.collectChunks(createElement(App, context))) 
  }

  ctx.body = ok(server, body)
  ctx.status = status

  await next()
}
