import { help } from 'findhelp'

import { tree } from './tree'

export default async () => {
  console.log(help(tree, { name: 'micro' }))
}
