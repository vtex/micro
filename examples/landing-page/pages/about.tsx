import { LoadMicroComponent } from '@vtex/micro-react/components'
import { withRouter } from '@vtex/micro-router/components'

import { AsyncPages } from '../components/asyncPages'
import About from '../components/pages/about'

export default LoadMicroComponent(withRouter(About, AsyncPages))
