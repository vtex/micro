import { Next, Req, Res } from '../typings'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import express from 'express'

export const middleware = (req: Req, res: Res, next: Next) => {
  try {
    res.set('cache-control', 'max-age=1200, public')
    next()
  } catch (err) {
    res.set('cache-control', 'max-age=10, public')
    throw err
  }
}
