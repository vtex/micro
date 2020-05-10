import React, { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import ReactRouterDom, { StaticRouter } from 'react-router-dom'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import express from 'express'

import { Extractor } from '../../extractor'
import { Next, Req, Res } from '../typings'
import { pathFromRequest } from './../utils/path'

const ok = (
  server: Extractor,
  body: string
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

;(global as any).React = React
;(global as any).ReactRouterDom = ReactRouterDom

export const middleware = (req: Req, res: Res, next: Next) => {
  const {
    locals: {
      server,
      features: { disableSSR }
    }
  } = res
  const {
    status,
    context
  } = server.resolvedEntry
  let body = ''

  if (!disableSSR) {
    const {
      default: App
    } = server.requirePage()

    const AppElement = createElement(App, { context } as any)
    const WithRouter = createElement(StaticRouter, { children: AppElement, location: pathFromRequest(req) } as any)

    body = renderToString(server.collectChunks(WithRouter))
  }

  res.status(status)
  res.send(ok(server, body))

  next()
}
