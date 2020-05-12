import { join } from 'path'

import { Folder } from '../package'
import { Plugin } from '../plugin'
import { Project } from '../project'

export interface CompilerOptions {
  project: Project
  target: Folder
}

export class Compiler<T extends Plugin> {
  protected dist: string
  protected project: Project
  protected plugins: T[]

  constructor ({ project, target }: CompilerOptions) {
    this.project = project
    this.plugins = project.resolvePlugins(target) as T[]
    this.dist = join(this.project.dist, target)
  }
}
