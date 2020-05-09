import { join, RuntimeData } from '@vtex/micro-react'
import { LocationDescriptorObject } from 'history'
import inflight from 'promise-inflight'

import { isPage, OnPageFetched, Page, PagesManager } from './index'

export class Pages extends PagesManager {
  public pages: Page[] = []

  public initialize = (
    runtime: RuntimeData,
    onPageFetched: OnPageFetched,
    initalPage?: Page
  ) => {
    this.runtime = runtime
    this.onPageFetched = onPageFetched

    const loaded = this.pageLoaded(initalPage.path)
    if (!loaded) {
      this.pages = [initalPage]
    }
  }

  public prefetch = async (location: LocationDescriptorObject) => {
    this.fetch(location)
  }

  public fetch = async (location: LocationDescriptorObject) => {
    const loaded = this.pageLoaded(location.pathname) 
    if (!loaded) {
      await this.fetchAndUpdate(location)
    }
  }

  protected pageLoaded = (path: string) => {
    const found = this.pages.find(x => x.path === path)
    return !!found
  }
  
  protected async fetchAndUpdate (location: LocationDescriptorObject): Promise<any> {
    const path = this.locationToPath(location)
    return inflight(path, async () => {
      const response = await fetch(path)
      const page = await response.json()
      if (isPage(page)) {
        this.pages = this.pages.concat(page)
        this.onPageFetched(this.pages)
      } else {
        throw new Error(`💣 Fetched location was not a valid page: ${location.pathname}`)
      }
    })
  }

  protected locationToPath = (location: LocationDescriptorObject) => {
    if (typeof location.pathname !== 'string') {
      throw new Error('💣 You need a pathname for fecthing a page')
    }
    return join(this.runtime.paths.context, location.pathname)
  }
}
