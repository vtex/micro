import 'vtex-tachyons/tachyons.css'

import loadable from '@loadable/component'
import { LoadMicroComponent } from '@vtex/micro-react'
import React, { Fragment } from 'react'

import AboveTheFold from '../components/aboveTheFold'
import { Loading } from '../components/loading'

const BelowTheFold = loadable(() => import(
  /* webpackChunkName: "BellowTheFold" */
  /* webpackPreload: true */
  '../components/belowTheFold'
), { ssr: false })

interface Props {
  data: {
    menu: Record<string, string>
  }
  error: any
}

const Page: React.SFC<Props> = ({ data }) => {
  const { menu } = data
  return (
    <Fragment>
      <AboveTheFold menu={menu} />
      <BelowTheFold fallback={<Loading/>}/>
    </Fragment>
  )
}

export default LoadMicroComponent(Page)
