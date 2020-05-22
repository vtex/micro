import chalk from 'chalk'

export const error = <T extends (...args: any) => Promise<any>>(fn: T) => async (...args: Parameters<T>): Promise<ReturnType<T>> => {
  try {
    return await fn(...args as any)
  } catch (error) {
    console.log(chalk.red('💣 Something went wrong'), error)
    throw error
  }
}
