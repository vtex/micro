import { join, RuntimeData } from '@vtex/micro-react'
import { LocationDescriptorObject } from 'history'

import { isPage, OnPageFetched, Page, PagesManager } from '.'

export class Pages extends PagesManager {
  public pages: Page[] = []

  public initialize (
    runtime: RuntimeData,
    onPageFetched: OnPageFetched,
    initalPage?: Page
  ) {
    this.runtime = runtime
    this.onPageFetched = onPageFetched

    const loaded = this.pageLoaded(initalPage.path)
    if (!loaded) {
      this.pages = [initalPage]
    }
  }

  public async prefetch (location: LocationDescriptorObject) {
    this.fetch(location)
  }

  public async fetch (location: LocationDescriptorObject) {
    const loaded = this.pageLoaded(location.pathname) 
    if (!loaded) {
      const page = await this.doFetch(location)
      if (isPage(page)) {
        this.pages = this.pages.concat(page)
        this.onPageFetched(this.pages)
      }
    }
  }

  protected pageLoaded (path: string) {
    return this.pages.find(x => x.path === path)!!
  }
  
  protected async doFetch (location: LocationDescriptorObject): Promise<any> {
    const response = await fetch(this.locationToPath(location))
    return response.json()
  }

  protected locationToPath (location: LocationDescriptorObject) {
    if (typeof location.pathname !== 'string') {
      throw new Error('💣 You need a pathname for fecthing a page')
    }
    return join(this.runtime.paths.context, location.pathname)
  }
}
