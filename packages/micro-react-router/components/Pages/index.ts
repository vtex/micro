/* eslint-disable @typescript-eslint/no-unused-vars */
import { RuntimeData } from '@vtex/micro-react'
import { LocationDescriptorObject } from 'history'

export interface Page {
  entrypoint: string
  path: string
  context: any
}

export const isPage = (obj: any): obj is Page =>
  typeof obj.entrypoint === 'string' &&
  typeof obj.path === 'string'

export type OnPageFetched = (pages: Page[]) => void

export abstract class PagesManager {
  protected runtime: RuntimeData | undefined
  protected onPageFetched: OnPageFetched | undefined

  public initialize (
    runtime: RuntimeData,
    onPageFetched: OnPageFetched,
    _initalPage?: Page
  ) {
    this.runtime = runtime
    this.onPageFetched = onPageFetched
  }

  public async prefetch (_: LocationDescriptorObject) {
    throw new Error('💣 Prefetch Page Not Implemented')
  }

  public async fetch (_: LocationDescriptorObject) {
    throw new Error('💣 Fetch Page Not Implemented')
  }
}
