import { Req, Res } from '../typings'

export const middleware = async (req: Req, res: Res) => {
  const {
    locals: {
      route: {
        page: { data, status }
      }
    }
  } = res

  res.set('content-type', 'application/json')
  res.status(status)
  res.send(data)
}
