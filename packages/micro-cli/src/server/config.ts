import { ASSETS_PATH } from '../constants'

export const PUBLIC_PATH_VAR = 'window.publicPath'

export class MicroServerConfig {
  constructor(
    public assetsBasePath: string = ASSETS_PATH
  ) {}

  getScriptTags () {
    return `<script type="application/javascript">${PUBLIC_PATH_VAR} = "${this.assetsBasePath}"</script>`
  }
}