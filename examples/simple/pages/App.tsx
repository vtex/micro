import loadable from '@loadable/component'
import React from 'react'

import { load } from '@vtex/micro-plugin-react'

interface Props {
  name: string
  data: any
}

const AsyncPage = loadable<Props>(({ name }) => import(
  /* webpackExclude: /App.tsx$/ */
  `./${name}`
))

const Page: React.SFC<Props> = ({ name, data }) => {
  return (
    <React.Fragment>
      <div>Something wrong is not right</div>
      <AsyncPage name={name} data={data} fallback={<div>really?</div>} />
    </React.Fragment>
  )
}

export default load(Page)
