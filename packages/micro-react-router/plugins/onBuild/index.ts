import { Alias, OnBuildPlugin, packageToAlias } from '@vtex/micro'
import { aliases } from '../aliases'

export default class OnBuild extends OnBuildPlugin {
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
