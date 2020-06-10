import { LifeCycle } from './project'

export interface HookOptions {
  target: LifeCycle
}

export abstract class Hook {
  public target: LifeCycle

  constructor({ target }: HookOptions) {
    this.target = target
  }
}
