import * as LoadableComponent from '@loadable/component'
import { ChunkExtractor } from '@loadable/server'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { renderToString } from 'react-dom/server'
import { Stats } from 'webpack'

import { RenderFrameworkHook, RenderHookOptions } from '@vtex/micro-core'

import { withAppContainerTags } from '../../components/container'
import { withPageDataTags } from '../../components/data'
import { withRuntimeTags } from '../../components/runtime'

global.React = React
;(global as any).ReactDOM = ReactDOM
;(global as any).LoadableComponent = LoadableComponent

export default class Render extends RenderFrameworkHook<JSX.Element> {
  public webExtractor: ChunkExtractor | null = null
  public nodeExtractor: ChunkExtractor | null = null

  constructor(options: RenderHookOptions) {
    super(options)

    if (!this.options.stats?.children) {
      return
    }

    let webStats: Stats | null = null
    let nodeStats: Stats | null = null
    for (const child of options.stats.children) {
      switch (child.name) {
        case 'web-legacy':
        case 'web':
          webStats = child
          break
        case 'pages':
          nodeStats = child
          break
        case 'components':
        case 'route':
        case 'render':
          break
        default:
          throw new Error('💣 Stats name not expected')
      }
    }

    if (webStats) {
      this.webExtractor = new ChunkExtractor({
        entrypoints: ['index'],
        publicPath: options.publicPaths.assets,
        stats: webStats!,
      })
    }

    if (nodeStats) {
      this.nodeExtractor = new ChunkExtractor({
        entrypoints: ['index'],
        stats: nodeStats!,
      })
    }
  }

  public render = (element: JSX.Element) => element

  public renderToString = (element: JSX.Element | null) => {
    let ssr = ''
    if (element) {
      const wrapped = this.webExtractor
        ? this.webExtractor.collectChunks(element)
        : element
      ssr = renderToString(wrapped)
    }
    return withAppContainerTags(ssr)
  }

  public requireEntrypoint = (): JSX.Element => {
    const {
      project,
      page: { name, data },
    } = this.options

    this.nodeExtractor!.requireEntrypoint()

    const { default: Page } = (global as any)[
      `${project.root.toString()}/pages`
    ]

    // TODO: Figure out a way to the error come from the router
    return React.createElement(Page, { name, data, error: null } as any)
  }

  public getScriptTags = () => {
    const { publicPaths, page } = this.options
    const tags: string[] = []
    tags.push(withRuntimeTags({ publicPaths, page }))
    tags.push(this.webExtractor?.getScriptTags() ?? '')
    return tags.join('\n')
  }

  public getStyleTags = () => {
    // if (typeof (this.webExtractor as any).getMainAssets === 'function') {
    //   const assets = (this.webExtractor as any).getMainAssets('style')
    //   return assets
    //     .map(({ path, chunk }: { path: string; chunk: string }) => {
    //       const content = readFileSync(path)
    //       return `<style data-chunk="${chunk}" rel="stylesheet">${content}</style>`
    //     })
    //     .join('\n')
    // }
    // return ''
    return this.webExtractor?.getStyleTags() ?? ''
  }

  public getLinkTags = () => {
    const {
      page: { name, data },
      publicPaths: { data: rootPath },
      path,
    } = this.options
    const tagsNoCSS = this.webExtractor?.getLinkTags()
    // .split('\n')
    // .filter((x) => !x.includes('as="style"'))
    // .join('\n')
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
