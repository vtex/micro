import { OnRequestCompiler, ResolvedPage } from '@vtex/micro/framework'
import express, { NextFunction, Request, Response } from 'express'
import { Stats } from 'webpack'

interface Locals {
  compiler: OnRequestCompiler<unknown>,
  route: {
    page: ResolvedPage
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
