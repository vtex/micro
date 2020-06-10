export const slugify = (str: string) =>
  str.replace(/@/g, '__at__').replace(/\//g, '__').replace(/-/g, '_')
