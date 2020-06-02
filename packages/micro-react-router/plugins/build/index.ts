import { Alias, BuildPlugin, packageToAlias } from '@vtex/micro-core/lib'

import { aliases } from '../aliases'

export default class Build extends BuildPlugin {
  public getAliases = async (previous: Alias[]): Promise<Alias[]> => {
    const modules = await Promise.all(aliases.map(
      a => packageToAlias(a, require.resolve)
    ))
    return [
      ...previous,
      ...modules
    ]
  }
}
