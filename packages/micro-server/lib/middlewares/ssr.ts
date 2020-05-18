import { OnRequestCompiler } from '@vtex/micro'

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
<div id="__MICRO_REACT_RUNTIME__" type="application/json">{"assets": "/assets", "data": "/api"}</div>
<div id="root"></div>
<script defer src="https://unpkg.com/es-module-shims"></script>
<script type="importmap-shim">
{
  "imports": {
    "react": "https://unpkg.com/es-react@16.12.0/react.js",
    "react-dom": "https://unpkg.com/es-react@16.12.0/react-dom.js",
    "react-is": "https://unpkg.com/es-react@16.12.0/react-is.js",
    "@vtex/micro/": "/assets/@vtex/micro",
    "@vtex/micro": "/assets/@vtex/micro/index.js",
    "@vtex/micro-react/": "/assets/@vtex/micro-react",
    "@vtex/micro-react": "/assets/@vtex/micro-react/index.js",
    "@loadable/component": "https://unpkg.com/@loadable/component@5.12.0/dist/loadable.esm.js",
    "exenv": "https://unpkg.com/exenv-es6@1.0.0/dist/index.js",
    "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose": "https://unpkg.com/@babel/runtime@7.9.6/helpers/esm/objectWithoutPropertiesLoose.js",
    "@babel/runtime/helpers/esm/extends": "https://unpkg.com/@babel/runtime@7.9.6/helpers/esm/extends.js",
    "@babel/runtime/helpers/esm/assertThisInitialized": "https://unpkg.com/@babel/runtime@7.9.6/helpers/esm/assertThisInitialized.js",
    "@babel/runtime/helpers/esm/inheritsLoose": "https://unpkg.com/@babel/runtime@7.9.6/helpers/esm/inheritsLoose.js",
    "hoist-non-react-statics": "https://unpkg.com/hoist-non-react-statics-x@3.3.2/dist/hoist-non-react-statics-x.esm.js"
  }
}
</script>
<script id="__LOADABLE_REQUIRED_CHUNKS__">[]</script>
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
