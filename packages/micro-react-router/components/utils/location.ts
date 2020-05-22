// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createLocation, Location, LocationDescriptorObject } from 'history'
import ReactRouter from 'react-router-dom'

// Code Copied from https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/modules/utils/locationUtils.js
const resolveToLocation = (to: ReactRouter.LinkProps['to'], currentLocation: Location) =>
  typeof to === 'function' ? to(currentLocation) : to

const normalizeToLocation = (to: string | LocationDescriptorObject, currentLocation: Location): LocationDescriptorObject => {
  return typeof to === 'string'
    ? createLocation(to, null, undefined, currentLocation)
    : to
}

export const locationFromProps = (to: ReactRouter.LinkProps['to'], currentLocation: Location): LocationDescriptorObject => normalizeToLocation(
  resolveToLocation(to, currentLocation),
  currentLocation
)
