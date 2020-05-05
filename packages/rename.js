const glob = require('glob')
const { join } = require('path')
const { move }= require('fs-extra')

const main = async () => {
  const cwd = join(process.cwd(), process.argv[process.argv.length - 1])

  console.log({cwd})

  const files = glob.sync('!(node_modules)/**/*.js', { nodir: true, cwd })
  const fullPaths = files.map(file => join(cwd, file))

  for (const file of fullPaths) {
    const to = file.replace('.js', '.tsx')
    await move(file, to)
  }
}

main()
