import { join } from 'path'

import { outputJSON } from 'fs-extra'

import { ensureDist } from '../../common/project'
import { run } from '../../common/webpack'
import { BUILD } from '../../constants'
import { getBundleCompiler } from './common'

const lifecycle = 'bundle'

interface Options {
  dev?: boolean
}

const main = async (options: Options) => {
  const compiler = await getBundleCompiler(options)

  const configs = await Promise.all([
    compiler.getWebpackConfig('web'),
    compiler.getWebpackConfig('web-legacy'),
  ])

  await ensureDist(lifecycle, compiler.dist)

  for (const page of Object.keys(configs[0].entry ?? {})) {
    console.log(`📄 [${lifecycle}]: Page found: ${page}`)
  }

  const statsJSON = await run(configs, lifecycle)

  const dist = join(compiler.dist, BUILD)
  console.log(
    `🦄 [${lifecycle}]: Persisting Build on ${dist.replace(process.cwd(), '')}`
  )
  await outputJSON(dist, statsJSON, { spaces: 2 })
}

export default main
