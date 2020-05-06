import '../components/publicPath'
import 'uikit/dist/css/uikit.css'

import loadable from '@loadable/component'
import { LoadMicroComponent } from '@vtex/micro-react'
import React, { Fragment } from 'react'

import AboveTheFold from '../components/aboveTheFold'

const BellowTheFold = loadable(() => import(
  /* webpackChunkName: "BellowTheFold" */
  /* webpackPreload: true */
  '../components/bellowTheFold'
), { ssr: false })

const App: React.SFC = () => {

  return (
    <Fragment>
      <AboveTheFold />
      <BellowTheFold fallback={<div>loading...</div>}/>
    </Fragment>
  )
}

export default LoadMicroComponent(App)
