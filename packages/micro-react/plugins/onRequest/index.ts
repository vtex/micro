import { ChunkExtractor } from '@loadable/server'
import { OnRequestFrameworkPlugin, OnRequestPluginOptions } from '@vtex/micro'
import { join } from 'path'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

import { withAppContainerTags } from '../../components/container'
import { withRuntimeTags } from '../../components/runtime'

export default class OnRequest extends OnRequestFrameworkPlugin<JSX.Element> {
  public extractor: ChunkExtractor | null = null

  constructor (options: OnRequestPluginOptions) {
    super(options)
    if (this.options.lifecycleTarget === 'onAssemble') {
      this.extractor = new ChunkExtractor({
        entrypoints: [options.page.name],
        publicPath: options.publicPaths.assets,
        stats: options.stats
      })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public renderToString = (element: JSX.Element | null) => {
    let ssr = ''
    let App = element
    if (this.options.lifecycleTarget === 'onAssemble' && element) {
      App = this.extractor!.collectChunks(element)
    }
    if (App) {
      ssr = renderToString(App)
    }
    return withAppContainerTags(ssr)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public requireEntrypoint = (): JSX.Element => {
    const { page: { data, name } } = this.options
    const locator = join(this.options.assetsDist.nodejs, 'pages', name)
    const { default: App } = require(locator)
    // TODO: Figure out a way to the error come from the router
    return createElement(App, { data, error: null } as any)
  }

  public getScriptTags = () => {
    let tags = withRuntimeTags({ publicPaths: this.options.publicPaths })
    if (this.options.lifecycleTarget === 'onAssemble') {
      tags += this.extractor!.getScriptTags()
    }
    if (this.options.lifecycleTarget === 'onBuild') {
      // Inject a false script to trick @loadable/components in SSR with es6 modules
      tags += '<script id="__LOADABLE_REQUIRED_CHUNKS__">[]</script>'
    }
    return tags
  }

  public getStyleTags = () => {
    if (this.options.lifecycleTarget === 'onAssemble') {
      return this.extractor!.getStyleTags()
    }
    return ''
  }

  public getLinkTags = () => {
    if (this.options.lifecycleTarget === 'onAssemble') {
      return this.extractor!.getLinkTags()
    }
    return ''
  }

  public getMetaTags = () => ''
}
