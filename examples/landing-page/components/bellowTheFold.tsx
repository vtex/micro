import 'uikit/dist/css/uikit.css'
import './a.css'

import React, { Fragment } from 'react'

import { MoreContent } from './moreContent'

const App: React.SFC = () => {
  return (
    <Fragment>
      <hr className="uk-divider-icon" />
      <MoreContent />
      <MoreContent />
    </Fragment>
  )
}

export default App
