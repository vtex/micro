import path from 'path'

module.exports = {
  process(_: string, filename: string) {
    const assetFilename = JSON.stringify(path.basename(filename))

    if (filename.match(/\.svg$/)) {
      return `module.exports = {
        __esModule: true,
        default: ${assetFilename},
        ReactComponent: () => ${assetFilename},
      };`
    }

    return `module.exports = ${assetFilename};`
  },
}
