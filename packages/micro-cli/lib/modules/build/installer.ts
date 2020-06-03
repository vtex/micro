import { join } from 'path'

import { BuildCompiler } from '@vtex/micro-core/lib'
import { outputJSON } from 'fs-extra'
import * as snowpack from 'snowpack'

import { lifecycle } from './builder'

export const SNOWPACK_CONFIG_FILE = 'snowpack.config.json'

export const installWebModules = async (compiler: BuildCompiler) => {
  console.log(`🦄 [${lifecycle}]: Installing web_modules via Snowpack`)

  const snowpackConfig = await compiler.getSnowpackConfig()
  const snowpackConfigPath = join(compiler.getDist('es6'), SNOWPACK_CONFIG_FILE)

  await outputJSON(snowpackConfigPath, snowpackConfig)

  await snowpack.cli(['--config', snowpackConfigPath])
}
