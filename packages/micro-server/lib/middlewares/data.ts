import { Req, Res } from '../typings'

export const middleware = async (req: Req, res: Res) => {
  const {
    locals: {
      route: {
        page: { data, status }
      }
    }
  } = res

  res.type('json')
  res.status(status).send(data)
}
