import { Plugins } from '@vtex/micro'

import { PagesBuilder } from './pages'

const plugins: Plugins = {
  assemble: {
    pages: new PagesBuilder()
  }
}

export default plugins
