import { Plugins } from '@vtex/micro/framework'

import { OnAssemble } from './onAssemble'
import { OnRequest } from './onRequest'

const plugins: Plugins = {
  onAssemble: OnAssemble,
  onRequest: OnRequest
}

export default plugins
