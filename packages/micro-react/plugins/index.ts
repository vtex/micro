import { Plugins } from '@vtex/micro'

import { OnBuild } from './onBuild'
import { OnAssemble } from './onAssemble'
import { OnRequest } from './onRequest'

const plugins: Plugins = {
  onAssemble: OnAssemble,
  onRequest: OnRequest,
  onBuild: OnBuild
}

export default plugins
