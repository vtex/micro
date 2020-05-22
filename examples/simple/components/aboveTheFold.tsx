import React from 'react'

import { Grid } from './grid'
import { HeaderProps } from './header'
import { Layout } from './layout'

type Props = HeaderProps

const AboveTheFold: React.SFC<Props> = ({ menu, Link }) => (
  <Layout menu={menu} Link={Link}>
    <Grid />
  </Layout>
)

export default AboveTheFold
