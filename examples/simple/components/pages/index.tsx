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
  console.log(data)
  return (
    <Layout>
      <BellowTheFold fallback={<div className="uk-position-center" uk-spinner="ratio: 2"> loading ... </div>}/>
    </Layout>
  )
}

export default Page
