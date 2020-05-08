import { RuntimeData } from '@vtex/micro-react'
import { LocationDescriptorObject } from 'history'

import { PagesManager } from './index'

export class Pages extends PagesManager {
  public async prefetch (location: LocationDescriptorObject) {
    throw new Error('💣 Prefetch Page Not Allowed in SSR')
  }

  public async fetch(location: LocationDescriptorObject) {
    throw new Error('💣 Prefetch Page Not Allowed in SSR')
  }
}
