import 'uikit/dist/css/uikit.css'

import React, { Fragment } from 'react'
import loadable from '@loadable/component'
import { LoadMicroComponent } from '@vtex/micro-react'

import BellowTheFold from '../components/bellowTheFold'

const AboveTheFold = loadable(() => import(
  /* webpackChunkName: "AboveTheFold" */
  /* webpackPreload: true */
  '../components/aboveTheFold'
), { ssr: false })

const App: React.SFC = () => {

  return (
    <Fragment>
      <BellowTheFold />
      <AboveTheFold fallback={<div>loading...</div>}/>
    </Fragment>
  )
}

export default LoadMicroComponent(App)
