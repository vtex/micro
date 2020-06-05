import { join } from 'path'

import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server'
import { readFileSync } from 'fs-extra'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

import { HtmlFrameworkPlugin, HtmlPluginOptions } from '@vtex/micro-core'

import { withAppContainerTags } from '../../components/container'
import { withPageDataTags } from '../../components/data'
import { withRuntimeTags } from '../../components/runtime'
import { CJSChunkExtractor, Extractor } from './cjsChunkExtractor'

class Html extends HtmlFrameworkPlugin<JSX.Element> {
  public extractor: Extractor

  constructor(options: HtmlPluginOptions) {
    super(options)
    if (this.options.lifecycleTarget === 'bundle') {
      this.extractor = new ChunkExtractor({
        entrypoints: [options.page.name],
        publicPath: options.publicPaths.assets,
        stats: options.stats,
      }) as any // TODO: fix this as any
    } else {
      this.extractor = new CJSChunkExtractor(options)
    }
  }

  public renderToString = (element: JSX.Element | null) => {
    let ssr = ''
    if (element) {
      ssr = renderToString(
        createElement(ChunkExtractorManager, {
          extractor: this.extractor,
          children: element,
        } as any)
      ) // TODO: fix this as any
    }
    return withAppContainerTags(ssr)
  }

  public requireEntrypoint = (): JSX.Element => {
    const {
      page: { data, name },
    } = this.options
    const locator = join(this.options.assetsDist.nodejs, 'pages', name)
    const { default: App } = require(locator)
    // TODO: Figure out a way to the error come from the router
    return createElement(App, { data, error: null } as any)
  }

  public getScriptTags = () => {
    const { publicPaths } = this.options
    const tags: string[] = []
    tags.push(withRuntimeTags({ publicPaths }))
    tags.push(this.extractor.getScriptTags())
    return tags.join('\n')
  }

  public getStyleTags = () => {
    if (typeof (this.extractor as any).getMainAssets === 'function') {
      const assets = (this.extractor as any).getMainAssets('style')
      return assets
        .map(({ path, chunk }: { path: string; chunk: string }) => {
          const content = readFileSync(path)
          return `<style data-chunk="${chunk}" rel="stylesheet">${content}</style>`
        })
        .join('\n')
    }
    return ''
    // return this.extractor.getStyleTags()
  }

  public getLinkTags = () => {
    const {
      page: { name, data },
      publicPaths: { data: rootPath },
      path,
    } = this.options
    const tagsNoCSS = this.extractor!.getLinkTags()
      .split('\n')
      .filter((x) => !x.includes('as="style"'))
      .join('\n')
    const dataTags = withPageDataTags({ name, data, rootPath, path })
    return [tagsNoCSS, dataTags].join('\n')
    // return [
    //   dataTags,
    //   this.extractor.getLinkTags()
    // ].join('\n')
  }

  public getMetaTags = () =>
    [
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      '<meta name="generator" content="micro@1.x">',
      "<meta charset='utf-8'>",
    ].join('\n')
}

export default {
  html: Html,
}