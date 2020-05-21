import { Project, PublicPaths } from '@vtex/micro'
import { PosixFS, ZipOpenFS } from '@yarnpkg/fslib'
import { getLibzipSync } from '@yarnpkg/libzip'
import assert from 'assert'
import { createReadStream } from 'fs-extra'
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
    react: 'https://unpkg.com/es-react@16.12.0/react.js',
    'react-dom': 'https://unpkg.com/es-react@16.12.0/react-dom.js',
    'react-is': 'https://unpkg.com/es-react@16.12.0/react-is.js',
    exenv: 'https://unpkg.com/exenv-es6@1.0.0/dist/index.js',
    '@loadable/component': 'https://unpkg.com/@loadable/component@5.12.0/dist/loadable.esm.js',
    'hoist-non-react-statics': 'https://unpkg.com/hoist-non-react-statics-x@3.3.2/dist/hoist-non-react-statics-x.esm.js',
    '@babel/runtime/helpers/esm/objectWithoutPropertiesLoose': 'https://unpkg.com/@babel/runtime@7.9.6/helpers/esm/objectWithoutPropertiesLoose.js',
    '@babel/runtime/helpers/esm/extends': 'https://unpkg.com/@babel/runtime@7.9.6/helpers/esm/extends.js',
    '@babel/runtime/helpers/esm/assertThisInitialized': 'https://unpkg.com/@babel/runtime@7.9.6/helpers/esm/assertThisInitialized.js',
    '@babel/runtime/helpers/esm/inheritsLoose': 'https://unpkg.com/@babel/runtime@7.9.6/helpers/esm/inheritsLoose.js',

    'vtex-tachyons/tachyons.css': '/assets/simple/vtex-tachyons/tachyons.css',
    '@vtex/micro': '/assets/simple/@vtex/micro/components/index.js',
    '@vtex/micro/': '/assets/simple/@vtex/micro/components',
    '@vtex/micro-react': '/assets/simple/@vtex/micro-react/components/index.js',
    '@vtex/micro-react/': '/assets/simple/@vtex/micro-react/components'
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
    return createReadStream(asset, { encoding: 'utf-8' })
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

      if (path.includes('sw/index.js')) {
        res.setHeader('service-worker-allowed', '/')
      }

      res.status(200)
      stream.pipe(res)
    } catch (err) {
      res.status(404)
      res.send(null)
      console.error(err)
    }
  }
}
