const active: Record<string, Promise<any>> = {}

const cleanUp = (key: string) => <T>(result: T) => {
  delete active[key]
  return result
}

export const inflight = <T>(key: string, doFly: () => Promise<T>): Promise<T> => {
  if (!active[key]) {
    const clean = cleanUp(key)
    active[key] = doFly()
      .then(clean)
      .catch(e => {
        clean(e)
        throw e
      })
  }
  return active[key]
}
