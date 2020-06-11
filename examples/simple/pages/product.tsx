import loadable from '@loadable/component'
import React from 'react'

import { Link, NavLink } from '@vtex/micro-plugin-react-router/components'

import { Layout } from '../components/layout'
import { Loading } from '../components/loading'
import { PlaceHolder } from '../components/placeholder'

const BelowTheFold = loadable(
  () =>
    import(
      /* webpackChunkName: "BelowTheFold" */
      /* webpackPreload: true */
      '../components/hugeComponent1'
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
      <PlaceHolder />
      <BelowTheFold fallback={<Loading />} />
    </Layout>
  )
}

export default Page
