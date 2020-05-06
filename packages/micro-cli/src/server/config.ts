import { Project } from './../project'

export const PUBLIC_PATH_VAR = 'window.publicPath'

export class MicroServerConfig {
  constructor(
    private project: Project
  ) {}

  get publicPath () {
    const { name, version } = this.project.manifest
    return `/assets/${name}/${version}/`
  }

  getScriptTags () {
    return `<script type="application/javascript">${PUBLIC_PATH_VAR} = "${this.publicPath}"</script>`
  }
}