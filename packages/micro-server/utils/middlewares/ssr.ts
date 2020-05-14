import { OnRequestCompiler } from '@vtex/micro/framework'

import { featuresFromReq } from '../features'
import express, { Next, Req, Res } from '../typings'

const ok = (
  compiler: OnRequestCompiler<unknown>,
  body: string
) => `
<!DOCTYPE html>
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
