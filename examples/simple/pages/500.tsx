import 'vtex-tachyons/tachyons.css'

import { LoadMicroComponent } from '@vtex/micro-plugin-react'
import { withRouter } from '@vtex/micro-plugin-react-router'

import { AsyncImport } from '../components/asyncPages'
import Page from '../components/pages/500'

export default LoadMicroComponent(withRouter(Page, AsyncImport))
