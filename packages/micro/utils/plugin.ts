import { Folder } from './package'

export interface PluginOptions {
  target: Folder
}

export abstract class Plugin {
  public target: Folder

  constructor ({ target }: PluginOptions) {
    this.target = target
  }
}
