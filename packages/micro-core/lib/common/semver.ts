interface Semver {
  major: number
  minor: number
  patch: number
  pre?: string
}

export const parse = (version: string): Semver => {
  const v = version.replace(/\^|~/g, '');
  const [major, minor, ...patchAndPre] = v.split('.');
  const [patch, pre] = patchAndPre.join('.').split('-');
  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    pre
  };
};

export const format = ({ major, minor, patch, pre }: Semver) =>
  `${major.toString()}.${minor.toString()}.${patch.toString}${pre ? `-${pre}` : ''}`;

// TODO: improve this to a real regex
export const isSemver = (x: any): x is Semver => typeof x === 'string';
