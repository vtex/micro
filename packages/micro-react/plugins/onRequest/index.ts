import { ChunkExtractor } from '@loadable/server'
import {
  getStatsForTarget,
  OnRequestConfigOptions,
  OnRequestFrameworkPlugin
} from '@vtex/micro'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

import { withAppContainerTags } from '../../components/container'
import { withRuntimeTags } from '../../components/runtime'

export class OnRequest extends OnRequestFrameworkPlugin<JSX.Element> {
  public extractors: Record<'nodejs' | 'webnew', ChunkExtractor>

  constructor (options: OnRequestConfigOptions) {
    super(options)
    this.extractors = {
      nodejs: new ChunkExtractor({
        entrypoints: [options.page.name],
        outputPath: options.assetsDist.nodejs,
        stats: getStatsForTarget('nodejs', options.stats)!
      }),
      webnew: new ChunkExtractor({
        entrypoints: [options.page.name],
        publicPath: options.publicPaths.assets,
        stats: getStatsForTarget('webnew', options.stats)!
      })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public renderToString = (element: JSX.Element | null) => {
    let ssr = ''
    if (element) {
      ssr = renderToString(this.extractors.webnew.collectChunks(element))
    }
    return withAppContainerTags(ssr)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public requireEntrypoint = (): JSX.Element => {
    const { default: App } = this.extractors.nodejs.requireEntrypoint()
    const { page: { data } } = this.options
    return createElement(App, { data } as any)
  }

  public getScriptTags = () =>
    this.extractors.webnew.getScriptTags() + '\n' +
    withRuntimeTags({ publicPaths: this.options.publicPaths })

  public getStyleTags = () => this.extractors.webnew.getStyleTags()

  public getLinkTags = () => this.extractors.webnew.getLinkTags()

  public getMetaTags = () => ''
}
