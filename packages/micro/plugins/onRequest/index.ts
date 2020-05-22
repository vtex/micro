import { withPageDataTags } from '../../components/data'
import { externalPublicPathVariable } from '../../components/publicPaths'
import { OnRequestPlugin } from '../../lib/lifecycles/onRequest'

// Some dependencies think they have access to this variable. Webpack
// has a plugin for adding this to the bundles, however we need to
// add this while using es6 only
export const setupEnvVar = (options: OnRequestPlugin<unknown>['options']) =>
`<script>
window.process = {
  env: {
    NODE_ENV: "${options.mode}"
  }
}
</script>`

export const getModuleImportTag = (options: OnRequestPlugin<unknown>['options']) =>
`<script type="module-shim">
import "${options.publicPaths.assets}pages/${options.page.name}.js";
</script>`

export default class OnRequest extends OnRequestPlugin<unknown> {
  public getScriptTags = () => {
    if (this.options.lifecycleTarget === 'onAssemble') {
      return `<script type="application/javascript">${externalPublicPathVariable}="${this.options.publicPaths.assets}"</script>`
    }
    if (this.options.lifecycleTarget === 'onBuild') {
      return '' +
      setupEnvVar(this.options) +
      getModuleImportTag(this.options) +
      '<script src="https://unpkg.com/es-module-shims"></script>' // TODO: Remove this once chrome supports import maps
    }
    return ''
  }

  public getStyleTags = () => ''

  public getBodyTags = () => ''

  public getLinkTags = () => {
    const { page: { name, data }, publicPaths: { data: dataRootPath }, path } = this.options
    return withPageDataTags(name, data, dataRootPath, path)
  }

  public getMetaTags = () => metaTags
}

const metaTags =
`<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="micro@1.x">
<meta charset='utf-8'>`
