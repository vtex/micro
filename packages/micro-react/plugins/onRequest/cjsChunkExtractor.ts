export interface Extractor {
  addChunk: (chunk: string) => void
  getScriptTags: () => string
  getStyleTags: () => string
  getLinkTags: () => string
}

// TODO: We should figure out a way to preload the script tags are we require them
export class CJSChunkExtractor implements Extractor {
  protected chunks: Set<string> = new Set()

  public addChunk = (chunk: string) => {
    if (!this.chunks.has(chunk)) {
      this.chunks.add(chunk)
    }
  }

  public getScriptTags = () => '<script id="__LOADABLE_REQUIRED_CHUNKS__">[]</script>'
  public getStyleTags = () => ''
  public getLinkTags = () => ''
}
