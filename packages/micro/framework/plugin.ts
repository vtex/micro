import { Plugins } from './package'

export interface PluginOptions {
  target: keyof Plugins
}

export abstract class Plugin {
  public target: keyof Plugins

  constructor ({ target }: PluginOptions) {
    this.target = target
  }
}
