import express from 'express'
import { Extractor } from '../extractor'
import { Features } from './features'

interface Locals {
  features: Features
  server: Extractor
}

export type Res = Omit<express.Response, 'locals'> & {
  locals: Locals
}

export type Req = express.Request
export type Next = express.NextFunction
