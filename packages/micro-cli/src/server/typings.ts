import { ParameterizedContext } from 'koa'
import { Stats } from 'webpack'

import { Features } from './middlewares/features'
import { Project } from '../project'

interface RequestState {
  stats: Stats.ToJsonOutput
  features: Features
  project: Project
}

export interface Context extends ParameterizedContext<RequestState> {}
