import { startTests } from './script'

const main = () => {
  /**
   * Using process.argv here instead of the object used when
   * main() is called because it enables us to pass these args
   * as they are to Jest. That way we don't need to replicate
   * Jest's API.
   */
  const args = process.argv.slice(2)

  startTests(...args.slice(1))
}

export default main
