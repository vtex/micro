import { LoadMicroComponent } from '@vtex/micro-react/components'
import { withRouter } from '@vtex/micro-router/components'

import { AsyncPages } from '../components/asyncPages'
import Index from '../components/pages'

export default LoadMicroComponent(withRouter(Index, AsyncPages))
