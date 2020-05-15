import { Plugins } from '../framework/package'
import { OnAssemble } from './onAssemble'
import { OnRequest } from './onRequest'

export * from './onAssemble/modules/cacheGroups'

const plugins: Plugins = {
  onRequest: OnRequest,
  onAssemble: OnAssemble
}

export default plugins
