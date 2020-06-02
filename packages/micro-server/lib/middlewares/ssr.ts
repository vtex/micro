import { PublicPaths, ServeCompiler } from '@vtex/micro-core/lib';
import { pathExists, readJson } from 'fs-extra';
import { join } from 'path';
import pretty from 'pretty';

import { featuresFromReq } from '../features';
import { Req, Res } from '../typings';

const ok = (
  compiler: ServeCompiler<unknown>,
  body: string
) => `<!DOCTYPE html>
<html>
<head>
${compiler.getMetaTags()}
${compiler.getLinkTags()}
${compiler.getStyleTags()}
</head>
<body>
${body}
${compiler.getScriptTags()}
</body>
</html>
`;

export const middleware = (req: Req, res: Res) => {
  const { locals: { compiler, route: { page: { status } } } } = res;
  const { disableSSR } = featuresFromReq(req);

  const body = compiler.renderToString(disableSSR);
  const html = ok(compiler, body);

  res.status(status).send(html);
};

interface ImportMap {
  imports: Record<string, string>
  scopes: Record<string, string>
}

const okSSR = (
  compiler: ServeCompiler<unknown>,
  body: string,
  importMap: ImportMap
) => `<!DOCTYPE html>
<html>
<head>
${compiler.getMetaTags()}
${compiler.getLinkTags()}
${compiler.getStyleTags()}
</head>
<body>
<script type="importmap-shim">${JSON.stringify(importMap)}</script>
${compiler.getScriptTags()}
${body}
</body>
</html>
`;

const readImportMap = async (compiler: ServeCompiler<unknown>) => {
  const importMapPath = join(compiler.dist, '..', 'build', 'es6', 'import-map.json');
  const exists = await pathExists(importMapPath);
  if (exists) {
    return readJson(importMapPath);
  }
  console.error('😐 Could not find import map. Is everything ok ?');
};

const scopeImportMapToPublicPath = ({ assets }: PublicPaths) => (importMap: ImportMap) => ({
  ...importMap,
  imports: {
    ...Object.keys(importMap.imports || {}).reduce(
      (acc, ref) => {
        acc[ref] = join(assets, importMap.imports[ref]);
        return acc;
      },
      {} as Record<string, string>
    )
  }
});

export const devSSR = (publicPaths: PublicPaths) => {
  const scopeImportMaps = scopeImportMapToPublicPath(publicPaths);

  return async (req: Req, res: Res) => {
    const { locals: { route: { page: { status } } } } = res;
    const { disableSSR } = featuresFromReq(req);
    const compiler = res.locals.compiler;

    const importMapPromise = readImportMap(compiler).then(scopeImportMaps);
    const body = compiler.renderToString(disableSSR);
    const html = pretty(okSSR(compiler, body, await importMapPromise));

    res.type('html');
    res.status(status).send(html);
  };
};
