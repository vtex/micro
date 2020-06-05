import express, { NextFunction, Request, Response } from 'express'
import { Stats } from 'webpack'

import { ResolvedPage } from '@vtex/micro-core/components'
import { HtmlCompiler } from '@vtex/micro-core/lib'

interface Locals {
  compiler: HtmlCompiler<unknown>
  route: {
    page: ResolvedPage<any>
    path: string
  }
  webpackStats?: {
    stats: Stats[]
  }
}

export type Res = Omit<Response, 'locals'> & {
  locals: Locals
}

export type Req = Request

export type Next = NextFunction

export default express
