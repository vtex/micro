import { Project, PublicPaths } from '@vtex/micro'
import { PosixFS, ZipOpenFS } from '@yarnpkg/fslib'
import { getLibzipSync } from '@yarnpkg/libzip'
import assert from 'assert'
import { createReadStream, pathExists } from 'fs-extra'
import mime from 'mime-types'
import { basename, extname, join } from 'path'
import pnp from 'pnpapi'

import { Req, Res } from '../typings'

const libzip = getLibzipSync()

// This will transparently open zip archives
const zipOpenFs = new ZipOpenFS({ libzip })

// This will convert all paths into a Posix variant, required for cross-platform compatibility
const crossFs = new PosixFS(zipOpenFs)

const resolveBundleAssets = (assetsRootPath: string, path: string) => {
  const asset = join(assetsRootPath, path)
  return createReadStream(asset, { encoding: 'utf-8' })
}

const resolveES6Assets = async (assetsRootPath: string, path: string) => {
  const relativeImport = join(assetsRootPath, path)
  if (await pathExists(relativeImport)) {
    return createReadStream(relativeImport, { encoding: 'utf-8' })
  }

  // Maybe this was a default import ?
  const relativeDefaultImport = join(relativeImport.replace('.js', ''), 'index.js')
  if (await pathExists(relativeDefaultImport)) {
    return createReadStream(relativeDefaultImport, { encoding: 'utf-8' })
  }

  // It's a module. Let's resolve it using PnP API
  const [issuer, rest] = path.split('__imports__')
  const splitted = rest.slice(1).split('/')
  const module = splitted[0].startsWith('@') ? splitted.slice(0, 2).join('/') : splitted[0]
  const filepath = rest.replace(module, '')

  // Let's first read the package json so we read the module property
  const unqualified = pnp.resolveToUnqualified(module, issuer) || ''
  const packageJSONPath = join(unqualified, 'package.json')
  const packageJSON = await crossFs.readJsonPromise(packageJSONPath)

  // Let's just try a module relative import at first
  const moduleRelativeImport = join(unqualified, filepath)
  if (await pathExists(moduleRelativeImport)) {
    return createReadStream(moduleRelativeImport, { encoding: 'utf-8' })
  }

  assert(packageJSON.module, `💣 The package should contain a module locator for es6 packages. Maybe package ${module} is not compatbile with Micro 😞`)

  // Now let's try to resolve the path
  const moduleSplitted = packageJSON.module.split('/')
  const dist = moduleSplitted.slice(0, moduleSplitted.length - 1).join('/')
  const moduleImport = join(unqualified, dist, filepath)
  if (await crossFs.existsPromise(moduleImport)) {
    return crossFs.createReadStream(moduleImport, { encoding: 'utf-8' })
  }

  // Maybe this was a default import ?
  const moduleDefaultImport = join(moduleImport.replace('.js', ''), 'index.js')
  if (await pathExists(moduleDefaultImport)) {
    return createReadStream(moduleDefaultImport, { encoding: 'utf-8' })
  }

  throw new Error(`💣 Asset Not Found: ${path}`)
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
        : await resolveES6Assets(assetsRootPath, path)

      res.statusCode = 200
      stream.pipe(res)
    } catch (err) {
      res.status(404).send(null)
      console.error(err)
    }
  }
}
