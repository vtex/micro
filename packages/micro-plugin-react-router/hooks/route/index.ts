import {
  isResolvedPage,
  MicroRequest,
  Resolved,
  RouterHook,
} from '@vtex/micro-core'

import { pack } from '../../components/utils/page'

export default class Router extends RouterHook {
  public route = async (resolved: Resolved<any>, request: MicroRequest) => {
    const { path } = request

    // We should only pack if the resolved route is a page so far, so we don't
    // pack redirects
    if (isResolvedPage(resolved)) {
      return pack(resolved, path)
    }

    return resolved
  }
}
