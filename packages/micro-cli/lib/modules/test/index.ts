import { startTests } from './script'

const main = () => {
  const args = process.argv.slice(2)

  startTests(...args.slice(1))
}

export default main
