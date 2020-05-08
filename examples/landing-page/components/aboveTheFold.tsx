import React, { Fragment } from 'react'

import { Grid } from './grid'
import NavBar from './navbar'

const App: React.SFC = () => (
  <Fragment>
    <NavBar />
    <Grid />
  </Fragment>
)

export default App
