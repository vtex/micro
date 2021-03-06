import loadable from '@loadable/component'

import { load } from '@vtex/micro-plugin-react/components'
import { withRouter } from '@vtex/micro-plugin-react-router/components'

interface Props {
  name: string
  data: any
}

const AsyncPage = loadable<Props>(({ name }) =>
  import(
    /* webpackExclude: /index.ts$/ */
    `./${name}`
  )
)

export default load(withRouter(AsyncPage))
