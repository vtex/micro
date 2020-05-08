import 'uikit/dist/css/uikit.css'

import loadable from '@loadable/component'
import React, { Fragment } from 'react'

import Layout from '../Layout'

const BellowTheFold = loadable(() => import(
  /* webpackChunkName: "AboveTheFold" */
  /* webpackPreload: true */
  '../bellowTheFold'
), { ssr: false })

const Page: React.SFC = () => {
  return (
    <Layout>
      <BellowTheFold />
    </Layout>
  )
}
export default Page
