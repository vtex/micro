import { Project, PublicPaths } from '@vtex/micro'
import { PosixFS, ZipOpenFS } from '@yarnpkg/fslib'
import { getLibzipSync } from '@yarnpkg/libzip'
import assert from 'assert'
import { createReadStream, pathExists } from 'fs-extra'
import mime from 'mime-types'
import { basename, dirname, extname, join } from 'path'
import pnp from 'pnpapi'

import { Req, Res } from '../typings'

const libzip = getLibzipSync()

// This will transparently open zip archives
const zipOpenFs = new ZipOpenFS({ libzip })

// This will convert all paths into a Posix variant, required for cross-platform compatibility
const crossFs = new PosixFS(zipOpenFs)

interface ImportMap {
  imports: Record<string, string>
}

export const importMap: ImportMap = {
  imports: {
    react: 'https://cdn.pika.dev/react@^16.13.1',
    'react-dom': 'https://cdn.pika.dev/react-dom@^16.13.1',
    '@loadable/component': 'https://cdn.pika.dev/@loadable/component@^5.12.0',
    'react-router': 'https://cdn.pika.dev/react-router@^5.2.0',
    'react-router-dom': 'https://cdn.pika.dev/react-router-dom@^5.2.0',
    history: 'https://cdn.pika.dev/history@^4.10.1',
    exenv: 'https://cdn.pika.dev/exenv@^1.2.2',
    'react-in-viewport': 'https://cdn.pika.dev/react-in-viewport@^1.0.0-alpha.11',

    'vtex-tachyons/tachyons.css': '/assets/simple/vtex-tachyons/tachyons.css',
    '@vtex/micro': '/assets/simple/@vtex/micro/components/index.js',
    '@vtex/micro/': '/assets/simple/@vtex/micro/components',
    '@vtex/micro-react': '/assets/simple/@vtex/micro-react/components/index.js',
    '@vtex/micro-react/': '/assets/simple/@vtex/micro-react/components',
    '@vtex/micro-react-router': '/assets/simple/@vtex/micro-react-router/components/index.js',
    '@vtex/micro-react-router/': '/assets/simple/@vtex/micro-react-router/components'
  }
}

const resolveBundleAssets = (assetsRootPath: string, path: string) => {
  const asset = join(assetsRootPath, path)
  return createReadStream(asset, { encoding: 'utf-8' })
}

const removeEndingSlash = (x: string) => x.endsWith('/') ? x.substring(0, x.length - 1) : x

const resolveES6Assets = async (assetsRootPath: string, path: string, publicPaths: PublicPaths) => {
  const maybeModule = Object.keys(importMap.imports).find(
    k => `${publicPaths.assets}${path}`.includes(importMap.imports[k])
  )

  // this is a relative import
  if (!maybeModule) {
    const asset = join(assetsRootPath, path)

    if (await pathExists(asset)) {
      return createReadStream(asset, { encoding: 'utf-8' })
    }

    // It was a default import, let's add a `/index.js` in the end so we find the file
    const defaultImport = join(asset.replace('.js', ''), 'index.js')
    return createReadStream(defaultImport, { encoding: 'utf-8' })
  }

  // this is a yarn related import, lets try to resolve it

  const module = removeEndingSlash(maybeModule)
  const [issuer, ...rest] = path.split(module)

  // let's try to resolve the request as a normal path request
  const unqualified = pnp.resolveToUnqualified(module, issuer) || ''
  const depPath = join(unqualified, ...rest)
  if (await crossFs.existsPromise(depPath)) {
    return crossFs.createReadStream(depPath, { encoding: 'utf-8' })
  }

  // now we should try resolving the request as an es6 module
  const packageJsonPath = pnp.resolveRequest(`${module}/package.json`, issuer) || ''
  const packageJson = await crossFs.readJsonPromise(packageJsonPath)
  assert(packageJson.module, '💣 The package should contain a module locator for es6')
  const rootPathES6 = dirname(join(dirname(packageJsonPath), packageJson.module))
  const joined = join(rootPathES6, ...rest)
  if (await crossFs.existsPromise(joined)) {
    return crossFs.createReadStream(joined, { encoding: 'utf-8' })
  }

  // maybe it's a default import ?
  const defaultImport = join(joined.replace('.js', ''), 'index.js')
  if (await crossFs.existsPromise(defaultImport)) {
    return crossFs.createReadStream(joined, { encoding: 'utf-8' })
  }

  throw new Error('not found')
}

export const middleware = (project: Project, publicPaths: PublicPaths) => {
  const assetsRootPath = process.env.NODE_ENV === 'production'
    ? join(project.dist, 'onAssemble/webnew')
    : join(project.dist, 'onBuild/es6')

  return async (req: Req, res: Res) => {
    try {
      const rootPath = req.path.startsWith(publicPaths.assets)
        ? publicPaths.assets
        : '/'
      const rawPath = req.path.replace(rootPath, '')
      const extension = extname(rawPath) ? '' : '.js'
      const path = rawPath + extension

      // Set correctly the MIME type of the object
      const contentType = mime.contentType(basename(path))
      if (contentType) {
        res.set('content-type', contentType)
      }

      const stream = process.env.NODE_ENV === 'production'
        ? resolveBundleAssets(assetsRootPath, path)
        : await resolveES6Assets(assetsRootPath, path, publicPaths)

      res.status(200)
      stream.pipe(res)
    } catch (err) {
      res.status(404)
      res.send(null)
      console.error(err)
    }
  }
}
