import { ChunkExtractor } from '@loadable/server'
import { Project, ResolvedEntry } from '@vtex/micro'
import { Build, nodeJSTarget, webNewTarget } from '@vtex/micro-builder'
import { PageData, PublicPaths, Runtime } from '@vtex/micro-react'
import { join } from 'path'
import React from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Stats } from 'webpack'

import { publicPathFromProject } from './publicPath'

interface RequiredComponent {
  default: React.ComponentType
}

export class Extractor {
  private _extractors: Record<string, ChunkExtractor> | null = null
  public publicPaths: PublicPaths
  public assetsPath: Record<string, string>
  public resolvedEntry: ResolvedEntry<any> = {
    entry: 'main',
    context: null,
    status: 200,
    path: '/'
  }

  constructor (
    public build: Build,
    public project: Project,
    publicPath?: PublicPaths,
    public runtime = new Runtime()
  ) {
    this.assetsPath = {
      [webNewTarget]: join(this.project.root, this.build.buildDir, webNewTarget),
      [nodeJSTarget]: join(this.project.root, this.build.buildDir, nodeJSTarget)
    }
    this.publicPaths = publicPath || publicPathFromProject(this.project)

    this.runtime.setRuntime({
      paths: this.publicPaths
    })
  }

  get extractors () {
    if (!this._extractors) {
      if (!this.resolvedEntry) {
        throw new Error('💣 You need a page to extract something from')
      }

      const webNewStats = this.getStatsForTarget(webNewTarget)
      const nodeJSStats = this.getStatsForTarget(nodeJSTarget)

      if (!webNewStats || !nodeJSStats) {
        throw new Error('💣 Could not find (nodejs|web-new) build from webpack in statsJSON')
      }
      this._extractors = {
        [webNewTarget]: new ChunkExtractor({
          entrypoints: [this.resolvedEntry.entry],
          publicPath: this.publicPaths.assets,
          stats: webNewStats!
        }),
        [nodeJSTarget]: new ChunkExtractor({
          entrypoints: [this.resolvedEntry.entry],
          outputPath: this.assetsPath[nodeJSTarget],
          stats: nodeJSStats!
        })
      }
    }
    return this._extractors
  }

  public requirePage = () => this.extractors[nodeJSTarget].requireEntrypoint() as RequiredComponent

  public collectChunks = (element: JSX.Element) => this.extractors[webNewTarget].collectChunks(element)

  public getScriptTags = () => {
    let scriptTags = this.extractors[webNewTarget].getScriptTags()
    scriptTags = this.runtime.getScriptTags() + '\n' + scriptTags

    const shouldChangePublicPath = this.build.buildConfig.publicPath.path !== this.publicPaths.assets
    if (shouldChangePublicPath) {
      scriptTags = this.getPublicPathScriptTag() + '\n' + scriptTags
    }

    return scriptTags
  }

  public getLinkTags = () => {
    let linkTags = this.extractors[webNewTarget].getLinkTags()

    const { path, entry } = this.resolvedEntry
    if (path && entry) {
      linkTags = linkTags + '\n' + new PageData().getLinkTags({ entry, path, publicPaths: this.publicPaths })
    }

    return linkTags
  }

  public getStyleTags = () => this.extractors[webNewTarget].getStyleTags()

  public getBodyTags = (body: string) => this.runtime.wrapContainer(body)

  public getStatsForTarget = (target: string) => this.build.webpack.stats?.children?.find(
    ({ name }) => name === target
  )

  public getPublicPathScriptTag = () => `<script type="application/javascript">${this.build.buildConfig.publicPath.variable}="${this.publicPaths.assets}"</script>`
}
