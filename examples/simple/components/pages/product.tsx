import loadable from '@loadable/component'
import { NavLink } from '@vtex/micro-react-router'
import React, { Fragment } from 'react'

import AboveTheFold from '../aboveTheFold'
import { Loading } from '../loading'

const BelowTheFold = loadable(() => import(
  /* webpackChunkName: "BellowTheFold" */
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
      <AboveTheFold menu={menu} Link={NavLink}/>
      <BelowTheFold fallback={<Loading/>}/>
    </Fragment>
  )
}

export default Page
