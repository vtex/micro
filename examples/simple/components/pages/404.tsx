import React, { Fragment } from 'react'

import Layout from '../layout'

interface Props {
  data: any
}

const Page: React.SFC<Props> = () => {
  return (
    <Layout>
      <Fragment>
        <div className="uk-text-center uk-text-large uk-text-light">
          404 | Page Not Found
        </div>
      </Fragment>
    </Layout>
  )
}

export default Page
