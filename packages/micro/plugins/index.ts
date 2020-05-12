import { Plugins } from '../utils/package'
import { PagesBuilder } from './assemble/pages'

const plugins: Plugins = {
  assemble: {
    pages: new PagesBuilder()
  }
}

export default plugins
