import { join } from 'path'

import { Hooks } from './package/base'
import { Hook } from './hook'
import { Project } from './project'

export interface CompilerOptions<T> {
  plugins: T[]
  project: Project
  target: keyof Hooks
}

export class Compiler<T extends Hook> {
  protected plugins: T[]
  public dist: string
  public project: Project

  constructor({ project, target, plugins }: CompilerOptions<T>) {
    this.project = project
    this.plugins = plugins
    this.dist = join(this.project.dist, target)
  }
}
