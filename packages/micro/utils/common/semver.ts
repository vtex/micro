interface Semver {
  major: number
  minor: number
  patch: number
  pre?: string
}

export const parse = (version: string): Semver => {
  const [major, minor, ...patchAndPre] = version.split('.')
  const [patch, pre] = patchAndPre.join('.').split('-')
  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    pre
  }
}

export const format = ({ major, minor, patch, pre }: Semver) =>
  `${major.toString()}.${minor.toString()}.${patch.toString}${pre ? `-${pre}` : ''}`
