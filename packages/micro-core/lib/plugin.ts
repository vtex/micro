import { LifeCycle } from './project';

export interface PluginOptions {
  target: LifeCycle
}

export abstract class Plugin {
  public target: LifeCycle

  constructor ({ target }: PluginOptions) {
    this.target = target;
  }
}
