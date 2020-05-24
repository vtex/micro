import 'vtex-tachyons/tachyons.css'

import { LoadMicroComponent } from '@vtex/micro-react'
import { withRouter } from '@vtex/micro-react-router'

import { AsyncImport } from '../components/asyncPages'
import Page from '../components/pages/home'

export default LoadMicroComponent(withRouter(Page, AsyncImport))
