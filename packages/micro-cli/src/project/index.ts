import { loadUserConfig, UserConfig } from './userConfig'
import { loadManifest, Manifest } from './manifest'
import { resolveModules } from './modules'

interface Options {
  projectPath: string
}

export class Project {
  public loaded: boolean = false
  public root: string
  public modules: string[] = []
  public manifest: Manifest = {} as Manifest
  public userConfig: UserConfig | null = null

  constructor({ projectPath }: Options) {
    this.root = projectPath
  }

  public load = async () => {
    this.manifest = await loadManifest(this.root)
    this.userConfig = await loadUserConfig(this.root)
    this.modules = await resolveModules(this.root, this.manifest)
    this.loaded = true
  }
}

export const loadProject = async (options: Options): Promise<Project> => {
  const project = new Project(options)
  await project.load()
  return project
}