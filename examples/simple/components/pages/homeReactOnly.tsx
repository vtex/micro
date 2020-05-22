import loadable from '@loadable/component'
import React, { Fragment } from 'react'

import AboveTheFold from '../aboveTheFold'
import { Loading } from '../loading'
import { LinkServer } from '../header'

const BelowTheFold = loadable(() => import(
  /* webpackChunkName: "BelowTheFold" */
  /* webpackPreload: true */
  '../belowTheFold'
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
      <AboveTheFold menu={menu} Link={LinkServer}/>
      <BelowTheFold fallback={<Loading/>}/>
    </Fragment>
  )
}

export default Page
