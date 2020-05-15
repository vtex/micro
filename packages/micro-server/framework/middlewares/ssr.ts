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

const okSSR = ({ page, publicPaths }: any) => `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="micro@1.x">
<meta charset='utf-8'>
</head>
<body>
<script defer src="https://unpkg.com/es-module-shims"></script>
<script type="importmap-shim">
{
  "imports": {
    "react": "https://unpkg.com/es-react/dev/react.js",
    "react-dom": "https://unpkg.com/es-react/dev/react-dom.js",
    "@vtex/micro": "/assets/@vtex/micro",
    "@vtex/micro-react": "/assets/@vtex/micro-react"
  }
}
</script>
<script type="module-shim">
  import '/assets/pages/${page.name}.js';
</script>
</body>
</html>
`
// <script async type="module">
// "use strict";
// import * as React from "react"
// </script>
// <script nomodule>window.alert("Your Browser is not compatible with Micro Development toolset. Please use Chrome lastest")</script>

export const devSSR = (req: Req, res: Res) => {
  const { locals: { route: { page: { status } } } } = res
  // const { disableSSR } = featuresFromReq(req)
  const compiler = res.locals.compiler as any

  // const body = compiler.renderToString(disableSSR)
  const html = okSSR(compiler.options)

  res.status(status)
  res.send(html)
}
