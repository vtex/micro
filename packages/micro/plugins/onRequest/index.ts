import {
  externalPublicPathVariable
} from '../../framework/lifecycle/onAssemble'
import { OnRequestPlugin } from '../../framework/lifecycle/onRequest'
import { withPageDataTags } from '../../utils/data'

export class OnRequest extends OnRequestPlugin<unknown> {
  public getScriptTags = () =>
    `<script type="application/javascript">${externalPublicPathVariable}="${this.options.publicPaths.assets}"</script>`

  public getStyleTags = () => ''

  public getBodyTags = () => ''

  public getLinkTags = () => {
    const { page: { name, data }, publicPaths: { data: dataRootPath }, path } = this.options
    return withPageDataTags(name, data, dataRootPath, path)
  }

  public getMetaTags = () => metaTags
}

const metaTags = `
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="micro@1.x">
<meta charset='utf-8'>`.slice(1)
