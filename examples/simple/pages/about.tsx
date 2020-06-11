import loadable from '@loadable/component'
import React from 'react'

import { Link, NavLink } from '@vtex/micro-plugin-react-router/components'

import Huge from '../components/hugeComponent1'
import { Layout } from '../components/layout'
import { Loading } from '../components/loading'

const BelowTheFold = loadable(
  () =>
    import(
      /* webpackChunkName: "BelowTheFold" */
      /* webpackPreload: true */
      '../components/hugeComponent2'
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
