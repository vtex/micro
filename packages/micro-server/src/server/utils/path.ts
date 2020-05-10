import { Req } from '../typings'

export const pathFromRequest = (req: Req, rootPath: string = '') => req.path.replace(rootPath, '/')
