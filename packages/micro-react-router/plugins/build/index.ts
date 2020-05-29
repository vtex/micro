import { Alias, BuildPlugin, packageToAlias } from '@vtex/micro-core'
import { aliases } from '../aliases'

export default class OnBuild extends BuildPlugin {
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
