import React, { Fragment } from 'react'

import { Header, HeaderProps } from './header'

type Props = HeaderProps

export const Layout: React.SFC<Props> = ({ menu, children, Link }) => (
  <Fragment>
    <Header menu={menu} Link={Link}/>
    { children }
  </Fragment>
)
