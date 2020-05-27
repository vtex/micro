import { ImportMap, OnRequestCompiler } from '@vtex/micro'
import pretty from 'pretty'

import { featuresFromReq } from '../features'
import { Req, Res } from '../typings'

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

export const middleware = (req: Req, res: Res) => {
  const { locals: { compiler, route: { page: { status } } } } = res
  const { disableSSR } = featuresFromReq(req)

  const body = compiler.renderToString(disableSSR)
  const html = ok(compiler, body)

  res.status(status).send(html)
}

const okSSR = (
  compiler: OnRequestCompiler<unknown>,
  body: string,
  importMap: ImportMap
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

export const devSSR = (importMap: ImportMap) => {
  return (req: Req, res: Res) => {
    const { locals: { route: { page: { status } } } } = res
    const { disableSSR } = featuresFromReq(req)
    const compiler = res.locals.compiler

    const body = compiler.renderToString(disableSSR)
    const html = pretty(okSSR(compiler, body, importMap))

    res.type('html')
    res.status(status).send(html)
  }
}
