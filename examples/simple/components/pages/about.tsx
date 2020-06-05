import loadable from '@loadable/component'
import { Link, NavLink } from '@vtex/micro-plugin-react-router'
import React from 'react'

import Huge from '../hugeComponent1'
import { Layout } from '../layout'
import { Loading } from '../loading'

const BelowTheFold = loadable(
  () =>
    import(
      /* webpackChunkName: "BelowTheFold" */
      /* webpackPreload: true */
      '../hugeComponent2'
    ),
  { ssr: false }
)

interface Props {
  data: {
    menu: Record<string, string>
  }
  error: any
}

const Page: React.SFC<Props> = ({ data }) => {
  const { menu } = data
  return (
    <Layout menu={menu} NavLink={NavLink} Link={Link}>
      <Huge />
      <BelowTheFold fallback={<Loading />} />
    </Layout>
  )
}

export default Page
