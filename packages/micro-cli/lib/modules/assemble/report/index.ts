import open from 'open'

import { error } from '../../../common/error'

const target = 'onAssemble'

const main = async () => {
  console.log(`🦄 Starting ${target} report`)

  open('http://webpack.github.io/analyse/')
}

export default error(main)
