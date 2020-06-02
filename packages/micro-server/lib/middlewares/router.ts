import {
  isResolvedPage,
  isResolvedRedirect,
  Project,
  PublicPaths
} from '@vtex/micro-core/lib';
import assert from 'assert';

import { Next, Req, Res } from '../typings';

export const middleware = async (project: Project, publicPaths: PublicPaths) => {
  const router = await project.getRouter();

  assert(typeof router === 'function', '💣 No router found for package');
  console.log('🐙 [router]: Found router config');

  return async (req: Req, res: Res, next: Next) => {
    const rootPath = req.path.startsWith(publicPaths!.data)
      ? publicPaths!.data
      : '/';
    const path = req.path.replace(rootPath, '/');

    const page = await router({ path, query: req.query as Record<string, string> }, {});

    if (isResolvedRedirect(page)) {
      res.redirect(page.status, page.location);
      return;
    }

    if (isResolvedPage(page)) {
      res.locals.route = { page, path };
      return next();
    }

    throw new Error(`💣 Entry not resolved for path ${path}`);
  };
};
