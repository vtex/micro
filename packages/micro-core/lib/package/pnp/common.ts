import pnp from 'pnpapi'

export const getLocatorFromPackageInWorkspace = (name: string) => {
  const locators = (pnp as any).getDependencyTreeRoots() // TODO: improve typings
  return locators.find((l: any) => l.name === name)
}
