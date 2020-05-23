import loadable from '@loadable/component'
import React, { Fragment } from 'react'

import { Header, HeaderProps } from './header'
import { Loading } from './loading'

const Footer = loadable(() => import(
  /* webpackChunkName: "Footer" */
  './footer'
))

type Props = HeaderProps

export const Layout: React.SFC<Props> = ({ menu, children, Link }) => (
  <Fragment>
    <Header menu={menu} Link={Link}/>
    { children }
    <Footer fallback={<Loading/>} />
  </Fragment>
)
