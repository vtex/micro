/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Fragment, useContext } from 'react'
import { useLocation } from 'react-router-dom'

import { Serializable } from '@vtex/micro-core'

import { MicroRouterContext } from './Router/Router'

export interface Page<T extends Serializable = any> {
  name: string
  path: string
  data: T
}

export type RouterResolvedEntry<T> = {
  path: string
  data: T
}

export const isPage = (obj: any): obj is Page =>
  typeof obj.name === 'string' && typeof obj.path === 'string'

export const FetchCurrentPage: React.SFC = ({ children }) => {
  const router = useContext(MicroRouterContext)
  const location = useLocation()

  React.useEffect(() => {
    router.preloadPage(location)
  }, [location, router])

  return <Fragment>{children}</Fragment>
}
