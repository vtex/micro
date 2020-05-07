import { ParameterizedContext } from 'koa'

import { Features } from './features'
import { Extractor } from '../extractor'

interface RequestState {
  features: Features
  server: Extractor
}

export interface Context extends ParameterizedContext<RequestState> {}
