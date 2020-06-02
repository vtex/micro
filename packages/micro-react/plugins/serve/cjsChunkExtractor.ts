import { HtmlPlugin } from '@vtex/micro-core/lib'

export interface Extractor {
  addChunk: (chunk: string) => void
  getScriptTags: () => string
  getStyleTags: () => string
  getLinkTags: () => string
}

// Some dependencies think they have access to this variable. Webpack
// has a plugin for adding this to the bundles, however we need to
// add this while using es6 only
const setupEnvVar = (options: HtmlPlugin<unknown>['options']) =>
`<script>
window.process = {
  env: {
    NODE_ENV: "${options.mode}"
  }
}
</script>`

const getModuleImportTag = (options: HtmlPlugin<unknown>['options']) =>
`<script type="module-shim">
import "${options.publicPaths.assets}pages/${options.page.name}.js";
</script>`

// TODO: We should figure out a way to preload the script tags are we require them
export class CJSChunkExtractor implements Extractor {
  protected chunks: Set<string> = new Set()

  constructor (
    public options: HtmlPlugin<unknown>['options']
  ) {}

  public addChunk = (chunk: string) => {
    if (!this.chunks.has(chunk)) {
      this.chunks.add(chunk)
    }
  }

  public getScriptTags = () =>
    '<script id="__LOADABLE_REQUIRED_CHUNKS__">[]</script>' +
    setupEnvVar(this.options) +
    getModuleImportTag(this.options) +
    '<script src="https://unpkg.com/es-module-shims"></script>' // TODO: Remove this once chrome supports import maps

  public getStyleTags = () => ''
  public getLinkTags = () => ''
}
