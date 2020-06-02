export const pick = <T, K extends keyof T>(obj: T, keys: K[]) => keys.reduce(
  (acc, key) => {
    acc[key] = obj[key]
    return acc
  },
  {} as Pick<T, K>
)
