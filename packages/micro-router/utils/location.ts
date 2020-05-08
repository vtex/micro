// Code Copied from https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/modules/utils/locationUtils.js
import { createLocation, Location, LocationDescriptorObject } from 'history'
import { LinkProps } from 'react-router-dom'

const resolveToLocation = (to: LinkProps['to'], currentLocation: Location) =>
  typeof to === "function" ? to(currentLocation) : to;

const normalizeToLocation = (to: string | LocationDescriptorObject, currentLocation: Location) => {
  return typeof to === "string"
    ? createLocation(to, null, undefined, currentLocation)
    : to
}

export const locationFromProps = (to: LinkProps['to'], currentLocation: Location) => normalizeToLocation(
  resolveToLocation(to, currentLocation),
  currentLocation
)
