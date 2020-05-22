import { OnRequestCompiler } from '@vtex/micro'
import pretty from 'pretty'

import { featuresFromReq } from '../features'
import express, { Next, Req, Res } from '../typings'
import { importMap } from './assets'

const ok = (
  compiler: OnRequestCompiler<unknown>,
  body: string
) => `<!DOCTYPE html>
<html>
<head>
${compiler.getMetaTags()}
${compiler.getLinkTags()}
${compiler.getStyleTags()}
</head>
<body>
${body}
${compiler.getScriptTags()}
</body>
</html>
`

// ;(global as any).React = React
// ;(global as any).ReactRouterDom = ReactRouterDom

export const middleware = (req: Req, res: Res, next: Next) => {
  const { locals: { compiler, route: { page: { status } } } } = res
  const { disableSSR } = featuresFromReq(req)

  const body = compiler.renderToString(disableSSR)
  const html = ok(compiler, body)

  res.status(status)
  res.send(html)

  // const {
  //   default: App
  // } = server.requirePage()

  // const AppElement = createElement(App, { context } as any)
  // const WithRouter = createElement(StaticRouter, { children: AppElement, location: path } as any)

  // body = renderToString(server.collectChunks(WithRouter))

  next()
}

const okSSR = (
  compiler: OnRequestCompiler<unknown>,
  body: string
) => `<!DOCTYPE html>
<html>
<head>
${compiler.getMetaTags()}
${compiler.getLinkTags()}
${compiler.getStyleTags()}
</head>
<body>
<script type="importmap-shim">${JSON.stringify(importMap)}</script>
${compiler.getScriptTags()}
${body}
</body>
</html>
`

export const devSSR = (req: Req, res: Res) => {
  const { locals: { route: { page: { status } } } } = res
  const { disableSSR } = featuresFromReq(req)
  const compiler = res.locals.compiler

  const body = compiler.renderToString(disableSSR)
  const html = pretty(okSSR(compiler, body))

  res.status(status)
  res.send(html)
}
