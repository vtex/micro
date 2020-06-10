import { NextFunction, Request, Response } from 'express'

import { HtmlCompiler, ResolvedPage } from '@vtex/micro-core'

interface Locals {
  compiler: HtmlCompiler<unknown>
  route: {
    page: ResolvedPage<any>
    path: string
  }
  webpack?: {
    devMiddleware: any
  }
}

export type Res = Omit<Response, 'locals'> & {
  locals: Locals
}

export type Req = Request

export type Next = NextFunction
