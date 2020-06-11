import loadable from '@loadable/component'
import React from 'react'

import {
  FormattedMessage,
  IntlProvider,
} from '@vtex/micro-plugin-react-intl/components'
import { Link, NavLink } from '@vtex/micro-plugin-react-router/components'

import { Layout } from '../components/layout'
import { Loading } from '../components/loading'
import { PlaceHolder } from '../components/placeholder'
import messages from '../messages/en.json'

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
    <IntlProvider messages={messages} locale="en">
      <Layout menu={menu} NavLink={NavLink} Link={Link}>
        <PlaceHolder />
        <FormattedMessage id="greeting" />
        <BelowTheFold fallback={<Loading />} />
      </Layout>
    </IntlProvider>
  )
}

export default Page
