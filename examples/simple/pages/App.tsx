import loadable from '@loadable/component'

import { load } from '@vtex/micro-plugin-react'

interface Props {
  name: string
  data: any
}

const AsyncPage = loadable<Props>(({ name }) =>
  import(
    /* webpackExclude: /App.tsx$/ */
    `./${name}`
  )
)

export default load(AsyncPage)
