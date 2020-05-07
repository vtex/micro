import { ChunkExtractor } from '@loadable/server'
import { Project, ResolvedEntry } from '@vtex/micro'
import { Build, nodeJSTarget, webNewTarget } from '@vtex/micro-builder'
import { join } from 'path'

import { publicPathFromProject, PublicPaths } from './publicPath'

export class Extractor {
  private _extractors: Record<string, ChunkExtractor> | null = null
  private publicPath: PublicPaths
  public assetsPath: Record<string, string>
  public resolvedEntry: ResolvedEntry = {
    entry: 'main',
    context: null,
    status: 200,
    path: '/',
  }

  constructor(
    public build: Build,
    public project: Project,
    publicPath?: PublicPaths

  ) {
    this.assetsPath = {
      [webNewTarget]: join(this.project.root, this.build.buildDir, webNewTarget),
      [nodeJSTarget]: join(this.project.root, this.build.buildDir, nodeJSTarget),
    }
    this.publicPath = publicPath || publicPathFromProject(this.project)
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
          publicPath: this.publicPath.assets,
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

  public requirePage = () => this.extractors[nodeJSTarget].requireEntrypoint()

  public collectChunks = (element: JSX.Element) => this.extractors[webNewTarget].collectChunks(element)

  public getScriptTags = () => {
    const { path, entry } = this.resolvedEntry

    let scriptTags = this.extractors[webNewTarget].getScriptTags()

    const shouldChangePublicPath = this.build.buildConfig.publicPath.path !== this.publicPath.assets
    if (shouldChangePublicPath) {
      scriptTags = `<script type="application/javascript">${this.build.buildConfig.publicPath.variable} = "${this.publicPath.assets}"</script>\n` + scriptTags
    }

    return scriptTags
  }

  public getLinkTags = () => {
    const { path, entry } = this.resolvedEntry
    let linkTags = this.extractors[webNewTarget].getLinkTags()

    if (path && entry) {
      linkTags += `\n<link data-chunk="${entry}" rel="preload" as="fetch" href="${join(this.publicPath.navigation, path)}" crossorigin="anonymous">`
    }

    return linkTags
  }

  public getStyleTags = () => this.extractors[webNewTarget].getStyleTags()

  public getBodyTags = (body: string) => `<div id="micro">${body}</div>`

  public getStatsForTarget = (target: string) => this.build.webpack.stats?.children?.find(
    ({ name }) => name === target
  )
}