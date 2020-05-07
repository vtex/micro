export const DEFAULT_BUILD_CONFIG = {
  publicPath: {
    variable: 'window.publicPath',
    path: '/assets/'
  },
  runtime: {
    name: 'micro-react',
    test: /react$|react-dom|\@loadable/
  }
}

export const BUILD_STATE_FILE = 'build.state.json'

export const MICRO_BUILD_DIR = '.micro'
