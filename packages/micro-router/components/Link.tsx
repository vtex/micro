import React, { useContext, useEffect } from 'react'
import { Link as ReactRouterLink, useLocation } from 'react-router-dom'

import { locationFromProps } from '../utils/location'
import { Router } from './Router'

type ReactRouterLinkType = typeof ReactRouterLink

export const Link: ReactRouterLinkType = ({ children, to, ...rest }) => {
  const { prefetchPage } = useContext(Router)
  const currentLocation = useLocation()
  
  useEffect(() => { 
    const prefetchLocation = locationFromProps(to, currentLocation)
    prefetchPage(prefetchLocation) 
  }, [currentLocation])

  return (
    <ReactRouterLink to={to} {...rest}>
      { children }
    </ReactRouterLink>
  )
}
