export const once = <T extends (...args: any) => any>(fn: T) => {
  let called = false
  let ret: ReturnType<T> | null = null

  return (...args: Parameters<T>): ReturnType<T> => {
    if (called) {
      return ret as ReturnType<T>
    }
    called = true
    ret = fn(...args as any)
    return ret as ReturnType<T>
  }
}
