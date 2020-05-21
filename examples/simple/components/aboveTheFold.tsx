import React from 'react'

import { Grid } from './grid'
import Layout from './layout'

interface Props {
  menu: Record<string, string>
}

const AboveTheFold: React.SFC<Props> = ({ menu }) => (
  <Layout menu={menu}>
    <Grid />
  </Layout>
)

export default AboveTheFold
