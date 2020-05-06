import { ParameterizedContext } from 'koa'
import { Stats } from 'webpack'

import { Project } from '../project'
import { MicroServerConfig } from './config'
import { Features } from './middlewares/features'

interface RequestState {
  stats: Stats.ToJsonOutput
  features: Features
  project: Project
  server: MicroServerConfig
}

export interface Context extends ParameterizedContext<RequestState> {}
