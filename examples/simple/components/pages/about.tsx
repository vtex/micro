import loadable from '@loadable/component'
import React from 'react'

import Layout from '../layout'

const BellowTheFold = loadable(() => import(
  /* webpackChunkName: "AboveTheFold" */
  /* webpackPreload: true */
  '../belowTheFold'
), { ssr: false })

const Page: React.SFC = () => {
  return (
    <Layout>
      <BellowTheFold />
    </Layout>
  )
}
export default Page
