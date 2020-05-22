import { OnRequestCompiler, ResolvedPage } from '@vtex/micro'
import express, { NextFunction, Request, Response } from 'express'
import { Stats } from 'webpack'

interface Locals {
  compiler: OnRequestCompiler<unknown>,
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
