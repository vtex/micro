import loadable from '@loadable/component'
import React from 'react'

import Layout from '../layout'

const BellowTheFold = loadable(() => import(
  /* webpackChunkName: "BellowTheFold" */
  /* webpackPreload: true */
  '../belowTheFold'
), { ssr: false })

interface Props {
  context: any
}

const Page: React.SFC<Props> = ({ data }) => {
  return (
    <Layout>
      <BellowTheFold fallback={<div>loading...</div>}/>
    </Layout>
  )
}

export default Page
