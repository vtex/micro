import express from 'express'
import { Stats } from 'webpack'
import { Extractor } from '../extractor'
import { Features } from './features'

interface Locals {
  features: Features
  server: Extractor
  webpackStats?: {
    stats: Stats[]
  }
}

export type Res = Omit<express.Response, 'locals'> & {
  locals: Locals
}

export type Req = express.Request
export type Next = express.NextFunction
