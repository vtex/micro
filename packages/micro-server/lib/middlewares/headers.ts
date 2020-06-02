import { Next, Req, Res } from '../typings';

export const middleware = (req: Req, res: Res, next: Next) => {
  try {
    res.set('cache-control', 'max-age=1200, public, immutable');
    next();
  } catch (err) {
    res.set('cache-control', 'max-age=10, public');
    throw err;
  }
};
