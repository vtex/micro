import 'uikit/dist/css/uikit.css'

import React, { Fragment } from 'react'
import loadable from '@loadable/component'
import { loadMicroComponent } from 'micro/loaders'

import AboveTheFold from '../components/aboveTheFold'

const LoadBellowTheFold = () => import(
  /* webpackChunkName: "BellowTheFold" */
  /* webpackPreload: true */
  '../components/bellowTheFold'
)

const App: React.SFC = () => {
  const BellowTheFold = loadable(LoadBellowTheFold)

  return (
    <Fragment>
      <AboveTheFold />
      <BellowTheFold fallback={<div>loading...</div>}/>
    </Fragment>
  )
}

export default loadMicroComponent(App)
