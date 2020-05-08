import 'uikit/dist/css/uikit.css'

import loadable from '@loadable/component'
import React, { Fragment } from 'react'

import BellowTheFold from '../bellowTheFold'

const AboveTheFold = loadable(() => import(
  /* webpackChunkName: "AboveTheFold" */
  /* webpackPreload: true */
  '../aboveTheFold'
), { ssr: false })

const Page: React.SFC = () => {
  return (
    <Fragment>
      <BellowTheFold />
      <AboveTheFold fallback={<div>loading...</div>}/>
    </Fragment>
  )
}
export default Page
