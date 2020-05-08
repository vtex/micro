import React, { Fragment } from 'react'

import Footer from './Footer'
import Header from './Header'

const Layout: React.SFC = ({ children }) => (
  <Fragment>
    <Header />
    { children }
    <Footer />
  </Fragment>
)

export default Layout
