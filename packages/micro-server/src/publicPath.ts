import { Project } from '@vtex/micro'
import { PublicPaths } from '@vtex/micro-react'

export const publicPathFromProject = (project: Project): PublicPaths => {
  const { 
    manifest: { name, version },
  } = project

  return {
    assets: `/assets/${name}/${version}/`,
    entry: `/entry/${name}/${version}/`,
    context: `/context/${name}/${version}/`,
  }
}
