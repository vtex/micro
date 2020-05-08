import { LoadMicroComponent } from '@vtex/micro-react/components'
import { withRouter } from '@vtex/micro-router/components'

import { AsyncPages } from '../components/asyncPages'
import { withUIKit } from '../components/loadUIKitIcons'
import Page from '../components/pages/about'

export default LoadMicroComponent(withUIKit(withRouter(Page, AsyncPages)))
