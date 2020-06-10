import pretty from 'pretty'

import { RenderCompiler } from '@vtex/micro-core'

import { featuresFromReq } from '../features'
import { Req, Res } from '../typings'

const htmlTemplate = (
  compiler: RenderCompiler<unknown>,
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

export const middleware = (req: Req, res: Res) => {
  const {
    locals: {
      compiler,
      route: {
        page: { status },
      },
    },
  } = res
  const { disableSSR } = featuresFromReq(req)

  const body = compiler.renderToString(disableSSR)
  const html = htmlTemplate(compiler, body)

  res.type('html')
  res.status(status).send(html)
}

export const devSSR = async (req: Req, res: Res) => {
  const {
    locals: {
      route: {
        page: { status },
      },
    },
  } = res
  const { disableSSR } = featuresFromReq(req)
  const { compiler } = res.locals

  const body = compiler.renderToString(disableSSR)
  const html = pretty(htmlTemplate(compiler, body))

  res.type('html')
  res.status(status).send(html)
}
