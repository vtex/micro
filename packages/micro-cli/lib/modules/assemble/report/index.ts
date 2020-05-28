import open from 'open'

const target = 'onAssemble'

const main = async () => {
  console.log(`🦄 Starting ${target} report`)

  open('http://webpack.github.io/analyse/')
}

export default main
