import React, { useContext, useEffect } from 'react'
import { NavLink as NavReactRouterLink, useLocation } from 'react-router-dom'

import { locationFromProps } from '../utils/location'
import { PagesContext } from './Router'

type ReactRouterLinkType = typeof NavReactRouterLink

export const NavLink: ReactRouterLinkType = ({ children, to, ...rest }) => {
  const pages = useContext(PagesContext)
  const currentLocation = useLocation()

  useEffect(
    () => { pages.prefetch(locationFromProps(to, currentLocation)) },
    [currentLocation]
  )

  return (
    <NavReactRouterLink to={to} {...rest}>
      { children }
    </NavReactRouterLink>
  )
}
