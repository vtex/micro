import loadable from '@loadable/component'
import { FormattedMessage } from '@vtex/micro-plugin-react-intl'
import { Link, NavLink } from '@vtex/micro-plugin-react-router'
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
      <FormattedMessage id="greeting" />
      <BelowTheFold fallback={<Loading />} />
    </Layout>
  )
}

export default Page
