import { join } from '../utils/path'
import { Plugins } from './package'
import { Plugin } from './plugin'
import { Project } from './project'

export interface CompilerOptions<T> {
  plugins: T[]
  project: Project
  target: keyof Plugins
}

export class Compiler<T extends Plugin> {
  protected plugins: T[]
  public dist: string
  public project: Project

  constructor ({ project, target, plugins }: CompilerOptions<T>) {
    this.project = project
    this.plugins = plugins
    this.dist = join(this.project.dist, target)
  }
}
