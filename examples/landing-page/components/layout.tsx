import React, { Fragment } from 'react'

import { Grid } from './grid'
import NavBar from './navbar'

const Layout: React.SFC = ({ children }) => (
  <Fragment>
    <NavBar />
    { children }
  </Fragment>
)

export default Layout
