const removeEndingSlash = (x: string) => x.endsWith('/') ? x.slice(0, x.length - 1) : x

export const join = (...args: string[]) => args.reduce(
  (acc, cur) => `${removeEndingSlash(acc)}${cur}`,
  ''
)
