import babelJest from 'babel-jest'

module.exports = babelJest.createTransformer({
  presets: [
    require.resolve('@babel/preset-env'),
    // require.resolve('@babel/preset-react'),
    require.resolve('@babel/preset-typescript'),
  ],
  plugins: [
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-transform-runtime'),
  ],
  babelrc: false,
  configFile: false,
})
