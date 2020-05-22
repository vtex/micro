import 'vtex-tachyons/tachyons.css'

import { LoadMicroComponent } from '@vtex/micro-react'
import { withRouter } from '@vtex/micro-react-router'

import Page from '../components/pages/500'
import { AsyncPages } from '../components/asyncPages'

export default LoadMicroComponent(withRouter(Page, AsyncPages))
