import { inspect } from 'util'

import PrettyError from 'pretty-error'

const pe = new PrettyError()

export const prettyLog = (...args: any) => {
  args.forEach((a: any) => console.log(inspect(a, false, 100, true)))
}

export const prettyError = (...args: any) => {
  args.forEach((a: any) => console.error(pe.render(a)))
}
