import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server'
import { OnRequestFrameworkPlugin, OnRequestPluginOptions } from '@vtex/micro'
import { join } from 'path'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

import { withAppContainerTags } from '../../components/container'
import { withRuntimeTags } from '../../components/runtime'
import { CJSChunkExtractor, Extractor } from './cjsChunkExtractor'

export default class OnRequest extends OnRequestFrameworkPlugin<JSX.Element> {
  public extractor: Extractor

  constructor (options: OnRequestPluginOptions) {
    super(options)
    if (this.options.lifecycleTarget === 'onAssemble') {
      this.extractor = new ChunkExtractor({
        entrypoints: [options.page.name],
        publicPath: options.publicPaths.assets,
        stats: options.stats
      }) as any // TODO: fix this as any
    } else {
      this.extractor = new CJSChunkExtractor()
    }
  }

  public renderToString = (element: JSX.Element | null) => {
    let ssr = ''
    if (element) {
      ssr = renderToString(createElement(ChunkExtractorManager, {
        extractor: this.extractor,
        children: element
      } as any)) // TODO: fix this as any
    }
    return withAppContainerTags(ssr)
  }

  public requireEntrypoint = (): JSX.Element => {
    const { page: { data, name } } = this.options
    const locator = join(this.options.assetsDist.nodejs, 'pages', name)
    const { default: App } = require(locator)
    // TODO: Figure out a way to the error come from the router
    return createElement(App, { data, error: null } as any)
  }

  public getScriptTags = () => {
    let tags = ''
    tags += withRuntimeTags({ publicPaths: this.options.publicPaths })
    tags += this.extractor.getScriptTags()
    return tags
  }

  public getStyleTags = () => {
    return this.extractor!.getStyleTags()
  }

  public getLinkTags = () => {
    return this.extractor!.getLinkTags()
  }

  public getMetaTags = () => ''
}
