const removeEndingSlash = (x: string) =>
  x.endsWith('/') ? x.slice(0, x.length - 1) : x

const ensureStartingSlash = (x: string) =>
  x.startsWith('/') || x === '' ? x : `/${x}`

export const join = (...args: string[]) =>
  args.reduce(
    (acc, cur) => `${removeEndingSlash(acc)}${ensureStartingSlash(cur)}`,
    ''
  )
