import { Req, Res } from '../typings'

export const middleware = async (req: Req, res: Res) => {
  const {
    locals: { server: { resolvedEntry } }
  } = res

  if (!resolvedEntry) {
    throw new Error('💣 Something went wrong while navigating')
  }

  const { context } = resolvedEntry

  res.status(200)
  res.send(context)
}
