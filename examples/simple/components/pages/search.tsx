import 'uikit/dist/css/uikit.css'

import loadable from '@loadable/component'
import React, { Fragment } from 'react'

import Layout from '../Layout'

const BellowTheFold = loadable(() => import(
  /* webpackChunkName: "BellowTheFold" */
  /* webpackPreload: true */
  '../bellowTheFold'
), { ssr: false })

interface Props {
  context: any
}

const Page: React.SFC<Props> = ({ context }) => {
  return (
    <Layout>
      <BellowTheFold fallback={<div>loading...</div>}/>
    </Layout>
  )
}

export default Page
