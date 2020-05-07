import { Project } from '@vtex/micro'

export interface PublicPaths {
  assets: string
  entry: string
  navigation: string
}

export const publicPathFromProject = (project: Project): PublicPaths => {
  const { 
    manifest: { name, version },
  } = project

  return {
    assets: `/assets/${name}/${version}/`,
    entry: `/entry/${name}/${version}/`,
    navigation: `/navigation/${name}/${version}/`,
  }
}
