export const SERVER_PORT = Number.parseInt(process.env.PORT ?? '3000', 10)

export const HOST = 'http://localhost'

export const BUILD = 'webpack.stats.json'

export const PUBLIC_PATHS = {
  assets: '/assets/',
  data: '/api/',
}

export const MAX_RESPAWNS = 3

export const DEFAULT_DEV_DEPENDENCIES = [
  '@types/jest',
  '@vtex/prettier-config',
  'eslint',
  'eslint-config-vtex',
  'prettier',
  'typescript',
]
