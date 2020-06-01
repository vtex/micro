import loadable from '@loadable/component'
import { NavLink, Link } from '@vtex/micro-react-router'
import React from 'react'

import { Layout } from '../layout'
import { Loading } from '../loading'
import { PlaceHolder } from '../placeholder'

const BelowTheFold = loadable(
  () =>
    import(
      /* webpackChunkName: "BelowTheFold" */
      /* webpackPreload: true */
      '../hugeComponent1'
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
