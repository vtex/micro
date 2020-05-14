import { pathExists } from 'fs-extra'
import { join } from 'path'

const ensureProject = async (path: string) => {
  const exists = await pathExists(join(path, 'package.json'))
  if (!exists) {
    throw new Error(`${path} needs to point to a valid micro project`)
  }
}

const pickFromArgv = (argv: string[], target: string) => {
  const index = argv.findIndex(x => x === target)
  if (index > -1 && index < argv.length - 1) {
    return argv[index + 1]
  } else if (index === argv.length - 1) {
    return true
  }
  return null
}

export const parseOptions = async () => {
  const projectPath = pickFromArgv(process.argv, '--project')
  const production = !pickFromArgv(process.argv, '--dev')
  const serve = pickFromArgv(process.argv, '--serve')
  const build = pickFromArgv(process.argv, '--build')

  const fullPath = typeof projectPath === 'string' && join(process.cwd(), projectPath)
  if (fullPath) {
    await ensureProject(fullPath)
  }

  if (typeof fullPath === 'string') {
    return {
      projectPath: fullPath,
      production,
      serve,
      build
    }
  }

  console.log('Usage: micro-cli --project <path/to/project/folder> options\n\n Options:\n   --dev: enable dev builds')
  throw new Error('Invalid Usage')
}
