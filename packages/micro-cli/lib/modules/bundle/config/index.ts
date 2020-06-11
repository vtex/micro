import { prettyLog } from '../../../common/print'
import { getBundleCompiler } from '../common'

interface Options {
  dev?: boolean
}

const main = async (options: Options) => {
  const compiler = await getBundleCompiler(options)
  const configs = await Promise.all([
    compiler.getWebpackConfig('web'),
    compiler.getWebpackConfig('web-legacy'),
  ])

  prettyLog(configs)
}

export default main
