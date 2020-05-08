import '../components/loadUIKitIcons'

import { LoadMicroComponent } from '@vtex/micro-react/components'
import { withRouter } from '@vtex/micro-router/components'

import { AsyncPages } from '../components/asyncPages'
import Page from '../components/pages/404'
import { withUIKit } from '../components/loadUIKitIcons'

export default LoadMicroComponent(withUIKit(withRouter(Page, AsyncPages)))
