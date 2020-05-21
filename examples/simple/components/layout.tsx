import React, { Fragment } from 'react'

import { Header } from './Header'

interface Props {
  menu: Record<string, string>
}

const Layout: React.SFC<Props> = ({ menu, children }) => (
  <Fragment>
    <Header menu={menu}/>
    { children }
  </Fragment>
)

export default Layout
