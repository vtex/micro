import { Serializable } from '@vtex/micro-core/components';
import {
  isResolvedPage,
  isResolvedRedirect,
  Project,
  PublicPaths,
  Router
} from '@vtex/micro-core/lib';
import assert from 'assert';

import { Next, Req, Res } from '../typings';

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

let router: Router<Serializable> | null = null;
const getRouter = async (project: Project) => {
  if (mode === 'development') {
    return project.getRouter();
  }

  if (router === null) {
    const r = await project.getRouter();
    assert(typeof r === 'function', '💣 No router found for package');
    console.log('🐙 [router]: Found router config');
    router = r;
  }

  return router;
};

export const middleware = async (project: Project, publicPaths: PublicPaths) => {
  return async (req: Req, res: Res, next: Next) => {
    const router = await getRouter(project);
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
