import React, { useContext, Fragment } from 'react'
import { useLocation } from 'react-router-dom'

import { PagesContext } from './Router'

export const FetchCurrentPage: React.SFC = ({ children }) => {
  const pagesManager = useContext(PagesContext)
  const location = useLocation()

  pagesManager.fetch(location)

  return (
    <Fragment>
      {children}
    </Fragment>
  )
}