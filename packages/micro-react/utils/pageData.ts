import { PublicPaths } from '@vtex/micro-react'
import { canUseDOM } from 'exenv'
import { join } from './path'

interface LinkTagsOptions {
  entry: string
  path: string
  publicPaths: PublicPaths
}

export class PageData {
  public id = '__MICRO_PAGE_DATA__'

  constructor() {}

  public fetch () {
    if (!canUseDOM) {
      throw new Error('💣 PageData fetch can only be run on the browser')
    }

    let maybeDataPath
    const dataElement = document.getElementById(this.id)
    if (typeof (dataElement as any)?.href === 'string') {
      maybeDataPath = (dataElement as any)?.href
      return fetch(maybeDataPath)
        .then(res => res.json())
    }
    
    return null
  }

  public getLinkTags ({
    entry,
    path,
    publicPaths,
  }: LinkTagsOptions) {
    return `<link id="${this.id}" data-chunk="${entry}" rel="preload" as="fetch" href="${join(publicPaths.context, path)}" crossorigin="anonymous">`
  }
}