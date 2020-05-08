export const DEFAULT_BUILD_CONFIG = {
  publicPath: {
    variable: 'window.publicPath',
    path: '/assets/'
  },
  runtime: {
    name: 'micro-runtime',
    test: /react$|react-dom|react-router|\@loadable/
  },
  framework: {
    name: 'micro-framework',
    test: /@vtex\/micro/
  }
}

export const BUILD_STATE_FILE = 'build.state.json'

export const MICRO_BUILD_DIR = '.micro'
