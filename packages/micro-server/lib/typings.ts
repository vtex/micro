import { ResolvedPage } from '@vtex/micro-core/components'
import { ServeCompiler } from '@vtex/micro-core/lib'
import express, { NextFunction, Request, Response } from 'express'
import { Stats } from 'webpack'

interface Locals {
  compiler: ServeCompiler<unknown>,
  route: {
    page: ResolvedPage<any>
    path: string
  },
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
