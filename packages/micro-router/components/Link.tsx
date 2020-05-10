import React, { useContext, useEffect } from 'react'
import { Link as ReactRouterLink, useLocation } from 'react-router-dom'

import { locationFromProps } from '../utils/location'
import { PagesContext } from './Router'

type ReactRouterLinkType = typeof ReactRouterLink

export const Link: ReactRouterLinkType = ({ children, to, ...rest }) => {
  const pages = useContext(PagesContext)
  const currentLocation = useLocation()

  useEffect(
    () => { pages.prefetch(locationFromProps(to, currentLocation)) },
    [currentLocation]
  )

  return (
    <ReactRouterLink to={to} {...rest}>
      { children }
    </ReactRouterLink>
  )
}
