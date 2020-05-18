import { Plugins } from '../lib/package'
import { OnAssemble } from './onAssemble'
import { OnBuild } from './onBuild'
import { OnRequest } from './onRequest'

export * from './onAssemble/modules/cacheGroups'

const plugins: Plugins = {
  onRequest: OnRequest,
  onAssemble: OnAssemble,
  onBuild: OnBuild
}

export default plugins
