import 'uikit/dist/css/uikit.css'

import loadable from '@loadable/component'
import { LoadMicroComponent, canUseDOM } from '@vtex/micro-react'
import React, { Fragment } from 'react'

import AboveTheFold from '../components/aboveTheFold'

const BellowTheFold = loadable(() => import(
  /* webpackChunkName: "BellowTheFold" */
  /* webpackPreload: true */
  '../components/bellowTheFold'
), { ssr: false })

const App: React.SFC = () => {
  
  if (canUseDOM) {
    console.log('fetching')
    fetch('/navigation/landing-page/1.0.0/')
  }


  return (
    <Fragment>
      <AboveTheFold />
      <BellowTheFold fallback={<div>loading...</div>}/>
    </Fragment>
  )
}

export default LoadMicroComponent(App)
